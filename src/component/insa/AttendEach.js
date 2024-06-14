import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import { db } from "src/firebase";
import useGetUser from "@component/hooks/getUserDb";
import {
  ref,
  set,
  get,
  onValue,
  off,
  query,
  update,
  orderByChild,
  equalTo,
  orderByValue,
  startAt,
  orderByKey,
  endAt,
} from "firebase/database";
import {
  Button,
  Flex,
  Radio,
  RadioGroup,
  Tab,
  TabIndicator,
  TabList,
  Tabs,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addYears,
  subYears,
} from "date-fns";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { MainWrapper, HitmapOver } from "@component/Main";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { ScheduleCalendar } from "../../../pages/schedule";
import Loading from "../Loading";
import { AttendStateList } from "@component/insa/Attend";

const AttendEachComponent = styled.div`
  max-width: 1400px;
`;

export const AttendUserList = styled(AttendStateList)`
  li {
    cursor: pointer;
    &.on {
      background: #319795;
      border-color: #319795;
      color: #fff;
    }
  }
`;
const AttendEachWrap = styled(MainWrapper)`
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 5px;
  .loading_box {
    height: 300px;
    display: flex;
    align-items: center;
  }
  .hitmap_box {
    border: 0;
    padding: 0;
    margin: 0;
    align-items: flex-start;
    overflow: auto;
    .react-calendar-heatmap text {
      font-size: 7px;
    }
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* 인터넷 익스플로러 */
    scrollbar-width: none; /* 파이어폭스 */
  }
  .react-calendar-heatmap {
    .work {
      &.off_1 {
        fill: #3182ce;
      }
      &.off_2 {
        fill: #dd6b20;
      }
      &.off_3 {
        fill: #319795;
      }
      &.basic {
        fill: #48bb78;
      }
      &.under {
        fill: #e53e3e;
      }
      &.error {
        fill: #ecc94b;
      }
      &.holiday {
        fill: #feb2b2;
      }
      &.late {
        fill: #1a202c;
      }
    }
  }
  .holiday {
    background: #feb2b2;
  }
  .basic {
    background: #48bb78;
  }
  .error {
    background: #ecc94b;
  }
  .under {
    background: #e53e3e;
  }
  .late {
    background: #1a202c;
  }
`;

export default function AttendEach() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [curDate, setCurDate] = useState(new Date());
  const [attendList, setAttendList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectUser, setSelectUser] = useState(userInfo?.uid);
  const onSelectUser = (uid) => {
    setSelectUser(uid);
  };

  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
  useEffect(() => {
    const getAttendList = async () => {
      if (!selectUser) return;
      setIsLoading(true);

      //연차내역 가져오기
      const dayoffRef = query(
        ref(db, `dayoff/list`),
        orderByKey(),
        startAt(format(subMonths(curDate, 11), "yyyyMMdd")),
        endAt(format(addMonths(curDate, 1), "yyyyMMdd"))
      );
      const getDayoff = await get(dayoffRef).then((data) => {
        let arr = [];
        for (const mon in data.val()) {
          const month = data.val()[mon];
          for (const key in month) {
            if (selectUser === month[key].userUid && month[key].uid) {
              arr.push(month[key]);
            }
          }
        }
        arr = arr.map((el) => {
          let typeVal = 0;
          if (el.offType === "오전반차") {
            typeVal = 1;
          }
          if (el.offType === "오후반차") {
            typeVal = 2;
          }
          if (el.offType === "연차") {
            typeVal = 3;
          }
          let obj = {
            ...el,
            type: typeVal,
            offType: el.offType,
            subject: el.offType,
          };
          return obj;
        });
        return arr;
      });

      //출퇴근 1년치 가져오기
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
          a: "get_attend_year",
          mem_uid: selectUser,
          year: curDate.getFullYear(),
        })
        .then((res) => {
          if (!res.data || !res.data.list) {
            setIsLoading(false);
            return;
          }
          const list = res.data.list;
          let temp = [];
          let newList = [];
          let obj = {};
          list.forEach((el) => {
            const dateKey = el.date_regis.substring(0, 10);
            if (!temp[dateKey]) {
              if (obj) {
                if (obj.attend_in) {
                  let inTime = Number(
                    obj.attend_in.substring(11, 16).split(":").join("")
                  );
                  if (inTime >= 1001) {
                    obj.late = true;
                  }
                }
                newList.push(obj);
                obj = {};
              }
              temp[dateKey] = [el];
              const attend_in = temp[dateKey].find((el) => el.type == "1");
              const attend_out = temp[dateKey].find((el) => el.type == "2");
              obj = {
                attend_in: attend_in?.date_regis,
                date: dateKey,
                error: true,
                subject: `출근 : ${
                  attend_in ? attend_in?.date_regis.substring(11, 16) : ""
                }<br />퇴근 : ${
                  attend_out ? attend_out?.date_regis.substring(11, 16) : ""
                }`,
              };
            } else {
              temp[dateKey].push(el);
              const attend_in = temp[dateKey].find((el) => el.type == "1");
              const attend_out = temp[dateKey].find((el) => el.type == "2");
              obj = {
                attend_in: attend_in?.date_regis,
                work_time: attend_out?.work_time,
                ex_state: el.ex_state,
                date: dateKey,
                erorr: false,
                subject: `출근 : ${attend_in?.date_regis.substring(
                  11,
                  16
                )}<br />퇴근 : ${attend_out?.date_regis.substring(11, 16)}
                ${el.ex_comment ? `<br />비고 : ${el.ex_comment}` : ""}
                `,
              };
              obj.under =
                Number(obj.work_time?.split(":")[0]) < 7 && obj.ex_state == 0
                  ? "under"
                  : "basic";
            }
          });
          //연차 합치기
          getDayoff.forEach((el) => {
            const offIdx = newList.indexOf((li) => li.date == el.date);
            if (offIdx > -1) {
              newList[idx].dayoff = el.offType;
            } else {
              newList.push(el);
            }
          });

          //공휴일 합치기
          // const RestDeInfoUrl = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${curDate.getFullYear()}&ServiceKey=OSeR%2BiY89%2FobvrUM6TW7sB0xmJYF8e4lC8dyxpewmdE5pUOOvPovA1slxvX258F%2FNEl%2F34pHxQr0duB9kgkBUA%3D%3D`; /*URL*/
          // const restListArr = axios.get(RestDeInfoUrl).then((res) => {
          //   let resList = res.data.response.body.items.item;
          //   if (resList && Array.isArray(resList)) {
          //     resList.map((el) => {
          //       if (String(el.locdate).substring(4, 8) == "0101") {
          //         el.dateName = "신정";
          //       }
          //       if (String(el.locdate).substring(4, 8) == "1225") {
          //         el.dateName = "성탄절";
          //       }
          //       const strDate = String(el.locdate);
          //       el.date = `${strDate.substring(0, 4)}-${strDate.substring(
          //         4,
          //         6
          //       )}-${strDate.substring(6, 8)}`;
          //       el.subject = el.dateName;
          //       return el;
          //     });
          //   } else if (resList) {
          //     if (String(resList.locdate).substring(4, 8) == "1225") {
          //       resList.dateName = "성탄절";
          //     }
          //     if (String(resList.locdate).substring(4, 8) == "0101") {
          //       resList.dateName = "신정";
          //     }
          //   }
          //   resList.forEach((el) => {
          //     newList.push(el);
          //   });
          // });

          setIsLoading(false);
          setAttendList(newList);
        });
    };
    getAttendList();
  }, [curDate, selectUser]);

  //캘린더 툴팁
  const [currentAttend, setCurrentAttend] = useState();
  const [tooltipPos, setTooltipPos] = useState();
  const onTooltip = (e, val, type) => {
    if (val) {
      let pos = {
        x: e.target.getBoundingClientRect().x,
        y: window.pageYOffset + e.target.getBoundingClientRect().y,
      };
      if (type === "attend") {
        setCurrentAttend(val);
      }
      setTooltipPos(pos);
    } else {
      setCurrentAttend("");
      setTooltipPos("");
    }
  };

  const prevYear = () => {
    setCurDate(subYears(curDate, 1));
  };
  const nextYear = () => {
    setCurDate(addYears(curDate, 1));
  };

  return (
    <>
      <AttendEachComponent>
        <ScheduleCalendar>
          <div className="header row">
            <button type="button" onClick={prevYear}>
              <MdArrowBackIos style={{ marginRight: "4px" }} />
              {subYears(curDate, 1).getFullYear()}년
            </button>
            <div className="col">
              <span className="current_date">{format(curDate, "yyyy")}년</span>
            </div>
            <button type="button" onClick={nextYear}>
              {addYears(curDate, 1).getFullYear()}년
              <MdArrowForwardIos style={{ marginLeft: "4px" }} />
            </button>
          </div>
          {userInfo &&
            userInfo.authority &&
            userInfo.authority.indexOf("admin") > -1 && (
              <AttendUserList>
                {userAll &&
                  userAll.map((el) => {
                    if (!el.hidden) {
                      return (
                        <li
                          className={selectUser == el.uid ? "on" : ""}
                          key={el.uid}
                          onClick={() => onSelectUser(el.uid)}
                        >
                          {el.name}
                        </li>
                      );
                    }
                  })}
              </AttendUserList>
            )}
        </ScheduleCalendar>
        {isLoading ? (
          <>
            <AttendEachWrap>
              <div className="loading_box">
                <Loading />
              </div>
            </AttendEachWrap>
          </>
        ) : (
          <AttendEachWrap>
            <div className="hitmap_box">
              <CalendarHeatmap
                gutterSize={2}
                startDate={`${format(subYears(curDate, 1), "yyyy")}-12-31`}
                endDate={`${format(curDate, "yyyy")}-12-31`}
                values={attendList}
                classForValue={(value) => {
                  if (!value) {
                    return "color-empty";
                  }
                  let addClassName = "";
                  addClassName += value.error ? " error" : "";
                  addClassName += value.under ? value.under : "";
                  addClassName += value.offType ? `off_${value.type}` : "";
                  addClassName += value.isHoliday ? `holiday` : "";
                  addClassName += value.late ? ` late` : "";
                  return `work ${addClassName}`;
                }}
                onMouseOver={(e, value) => {
                  onTooltip(e, value, "attend");
                }}
                showWeekdayLabels={true}
              />
            </div>
            <Flex width="100%" justifyContent="space-between">
              <ul className="type_info">
                <li className="am_off">오전반차</li>
                <li className="pm_off">오후반차</li>
                <li className="all_off">연차</li>
                {/* <li className="holiday">공휴일</li> */}
              </ul>
              <ul className="type_info">
                <li className="basic">정상출근</li>
                <li className="error">비정상 체크</li>
                <li className="under">근무시간 부족</li>
                <li className="late">지각(10시 초과)</li>
              </ul>
            </Flex>
            {currentAttend && (
              <HitmapOver pos={tooltipPos} data={currentAttend}>
                <p>{currentAttend.date}</p>
                <p
                  dangerouslySetInnerHTML={{ __html: currentAttend.subject }}
                ></p>
              </HitmapOver>
            )}
          </AttendEachWrap>
        )}
      </AttendEachComponent>
    </>
  );
}
