import { Box, Button, Flex, Image, Select, useToast } from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { MdImageSearch } from "react-icons/md";
import { useSelector } from "react-redux";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { db } from "src/firebase";
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
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import styled from "styled-components";
import { HiExternalLink } from "react-icons/hi";
import { FaUser } from "react-icons/fa";
import { imageResize, dataURLtoFile } from "@component/hooks/useImgResize";
import { ListUl } from "./insa/UserList";
import { MdOutlineDateRange } from "react-icons/md";
import axios from "axios";
import AddLunchPop from "./popup/AddLunchPop";
import ReportList from "./report/ReportList";
import RuleList from "./rule/RuleList";
import WorkList from "./work/WorkList";
import SignBoardList from "./board/SignBoardList";
import Schedule from "../../pages/schedule";
export const MainWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  header {
    width: 100%;
    height: 250px;
    background: #ddd;
    position: relative;
    .bg_balck {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      transition: all 0.2s;
    }
    .bg_img {
      position: absolute;
      left: 0;
      top: 0;
    }
    .btn_bg_modify {
      transition: all 0.2s;
      padding: 0;
      opacity: 0;
      z-index: -1;
      position: absolute;
      right: 0;
      bottom: 20px;
      input {
        width: 0;
        height: 0;
        position: absolute;
        opacity: 0;
        z-index: -1;
      }
      label {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 12px;
      }
      &:hover {
        background: #ccc;
      }
    }
    .content_box {
      position: relative;
      height: 100%;
    }
    &:hover .btn_bg_modify {
      opacity: 1;
      z-index: 10;
    }
  }
  .content_box {
    position: relative;
    margin: 0 auto;
    width: 100%;
    max-width: 1400px;
    &.con {
      min-height: 300px;
      padding-left: 260px;
      padding-bottom: 100px;
    }
  }
  .profile_box {
    position: absolute;
    width: 190px;
    left: 1rem;
    top: -30px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    h3 {
      font-size: 20px;
      margin-top: 10px;
    }
    .btn_modify {
      padding: 0;
      margin-top: 10px;
      a {
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 1rem;
      }
    }

    .attend_list {
      margin-top: 15px;
      li {
        margin-bottom: 3px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
  .profile_img {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    overflow: hidden;
    background: #eee;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 8px rgb(0 0 0 / 50%);
  }
  .none_img {
    font-size: 95px;
    color: #bbb;
  }

  h2.title {
    font-size: 1rem;
    font-weight: 600;
    .rest_dayoff {
      font-size: 13px;
      font-weight: 400;
    }
  }

  .divide {
    width: 100%;
    height: 1px;
    margin: 2.5rem 0;
    background: #f1f1f1;
  }

  .hitmap_box {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 5px;
    margin-top: 1rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    overflow: hidden;
    .react-calendar-heatmap {
      min-width: 900px;
    }
    .react-calendar-heatmap text {
      font-size: 9px;
      fill: #555;
    }
  }
  .type_info {
    display: flex;
    justify-content: flex-end;
    margin-top: -25px;
    flex-wrap: wrap;
    li {
      margin: 0 0 4px 4px;
      width: 90px;
      text-align: center;
      color: #fff;
      font-size: 12px;
      padding: 5px;
      border-radius: 4px;
    }
  }
  .all_off {
    background: #319795;
  }
  .am_off {
    background: #3182ce;
  }
  .pm_off {
    background: #dd6b20;
  }

  .react-calendar-heatmap-week rect {
    rx: 2;
  }

  .board_type_0 {
    background: #319795;
  }
  .board_type_1 {
    background: #3182ce;
  }
  .board_type_2 {
    background: #2f855a;
  }
  .board_type_3 {
    background: #00b5d8;
  }
  .board_type_4 {
    background: #38a169;
  }
  .board_type_5 {
    background: #d69e2e;
  }
  .react-calendar-heatmap {
    .color-empty {
      fill: #f1f1f1;
    }
    .color-github-1 {
      fill: #3182ce;
    }
    .color-github-2 {
      fill: #dd6b20;
    }
    .color-github-3 {
      fill: #319795;
    }

    .board_type_0 {
      fill: #319795;
    }
    .board_type_1 {
      fill: #3182ce;
    }
    .board_type_2 {
      fill: #718096;
    }
    .board_type_3 {
      fill: #00b5d8;
    }
    .board_type_4 {
      fill: #38a169;
    }
    .board_type_5 {
      fill: #d69e2e;
    }
  }

  .sun-editor-editable table td,
  .sun-editor-editable table th {
    padding: 10px 1rem;
  }

  @media screen and (max-width: 1024px) {
    header {
      height: 150px;
    }
    .content_box.con {
      padding: 0 1rem 3rem 1rem;
    }
    .profile_box {
      position: relative;
      width: 100%;
      top: 0;
      padding: 1rem 1rem 1rem 0;
      margin-bottom: 10px;
      align-items: center;
      h3 {
        margin: 0 1rem 0 0;
      }
    }
    .profile_img {
      width: 50px;
      height: 50px;
      box-shadow: 0 0 5px rgb(0 0 0 / 50%);
      margin-right: 10px;
    }
    .none_img {
      font-size: 28px;
    }
    .type_info {
      li {
        width: auto;
        padding: 5px 10px;
      }
    }
  }
  .header_bg_box {
    cursor: pointer;
    transition: all 0.5s;
    .bg_balck {
      transition: all 0.5s;
    }
    &.on {
      .bg_balck {
        opacity: 0;
      }
      height: 500px;
    }
  }
`;

export const HitmapOver = styled.div`
  position: absolute;
  left: ${(props) => `${props.pos.x}px` || 0};
  top: ${(props) => `${props.pos.y}px` || 0};
  transform: translate(-100%, -100%);
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 5px 1rem;
`;

const HitmapDetail = styled(ListUl)`
  padding: 1rem;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box {
    flex: 0;
  }
  h3.title {
    font-size: 1rem;
    margin-left: 5px;
    display: flex;
    align-items: center;
    svg {
      margin-right: 7px;
    }
  }
  .header {
    height: auto;
    padding: 1rem 0;
    background: none;
    color: #333;
    border-bottom: 1px solid #ededed;
    li {
      border-right: 1px solid #ddd;
      color: #888;
      &:last-child {
        border: 0;
      }
    }
  }
  .body {
    margin-top: 10px;
    li {
      border-bottom: 1px solid #ededed;

      padding: 0.5rem 0;
      font-size: 12px;
      &:last-child {
        border: 0;
      }
    }
    .box {
      border: 0;
      height: auto;
      border-right: 1px solid #ededed;
      &:last-child {
        border: 0;
      }
    }
  }
`;

export default function Main() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const toast = useToast();
  const ranBgIdx = Math.floor(Math.random() * (60 - 1) + 1);
  const [headerImg, setHeaderImg] = useState(
    `https://shop.editt.co.kr/_upload/_groupware/bg/${ranBgIdx}.jpg`
  );

  const [curDate, setCurDate] = useState(new Date());
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  useEffect(() => {
    setStartDate(format(subMonths(curDate, 11), "yyyy-MM-dd"));
    setEndDate(format(addMonths(curDate, 1), "yyyy-MM-dd"));
    return () => {};
  }, [curDate]);

  const [dayOffList, setDayOffList] = useState([]);
  const [boardList, setBoardList] = useState([]);
  const [boardType, setBoardType] = useState([]);
  useEffect(() => {
    if (userInfo?.mainBgUrl) {
      setHeaderImg(userInfo.mainBgUrl);
    }

    const dayoffRef = query(
      ref(db, `dayoff/list`),
      orderByKey(),
      startAt(format(subMonths(curDate, 11), "yyyyMMdd")),
      endAt(format(addMonths(curDate, 1), "yyyyMMdd"))
    );

    const boardTypeRef = query(ref(db, `board/type_list`));

    const getMyList = async () => {
      const getBoardType = await get(boardTypeRef).then((data) => {
        const type = data.val();
        let arr = [];
        let i = 0;
        for (const key in type) {
          let obj = {
            title: type[key].title,
            uid: type[key].uid,
            type: i,
          };
          i++;
          arr.push(obj);
        }
        return arr;
      });
      setBoardType(getBoardType);

      const getDayoff = await get(dayoffRef).then((data) => {
        let arr = [];
        for (const mon in data.val()) {
          const month = data.val()[mon];
          for (const key in month) {
            if (userInfo?.uid === month[key].userUid) {
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
          };
          return obj;
        });
        return arr;
      });
      const boardRef = query(
        ref(db, `board/list`),
        orderByChild("dateMonth"),
        startAt(format(subMonths(curDate, 11), "yyyyMM")),
        endAt(format(addMonths(curDate, 1), "yyyyMM"))
      );
      const getBoardList = await get(boardRef).then((data) => {
        let arr = [];
        const list = data.val();
        for (const key in list) {
          if (list[key].writer_uid === userInfo?.uid) {
            getBoardType.forEach((type) => {
              if (list[key].type === type.uid) {
                list[key].type = type.type;
                list[key].typeName = type.title;
              }
            });
            let sameDate = arr.findIndex(
              (el) => el.date === format(new Date(list[key].date), "yyyy-MM-dd")
            );
            if (sameDate > -1) {
              arr[sameDate].list.push({
                type: list[key].type,
                typeName: list[key].typeName,
                manager: list[key].manager,
                subject: list[key].subject,
              });
            } else {
              let obj = {
                date: format(new Date(list[key].date), "yyyy-MM-dd"),
                list: [
                  {
                    type: list[key].type,
                    typeName: list[key].typeName,
                    manager: list[key].manager,
                    subject: list[key].subject,
                  },
                ],
              };
              arr.push(obj);
            }
          }
        }
        arr = arr.map((el) => {
          getBoardType.forEach((type) => {
            if (el.type === type.uid) {
              el.type = type.type;
              el.typeName = type.title;
            }
          });
          return el;
        });
        return arr;
      });
      console.log(getDayoff);
      setDayOffList(getDayoff);
      setBoardList(getBoardList);
    };
    getMyList();
  }, [userInfo]);

  const [currentDayoff, setCurrentDayoff] = useState();
  const [currentBoard, setCurrentBoard] = useState();
  const [tooltipPos, setTooltipPos] = useState();
  const onCurrentDayoff = async (e) => {
    setCurrentDayoff(e);
  };
  const onTooltip = (e, val, type) => {
    if (val) {
      let pos = {
        x: e.target.getBoundingClientRect().x,
        y: window.pageYOffset + e.target.getBoundingClientRect().y,
      };
      if (type === "dayoff") {
        setCurrentDayoff(val);
      }
      if (type === "board") {
        setCurrentBoard(val);
      }
      setTooltipPos(pos);
    } else {
      setCurrentDayoff("");
      setCurrentBoard("");
      setTooltipPos("");
    }
  };

  const [hitmapListData, setHitmapListData] = useState();
  const onCurrentHitmap = (val) => {
    if (val) {
      setHitmapListData(val);
    } else {
      setHitmapListData("");
    }
    return;
  };

  //백그라운드 설정
  const storage = getStorage();
  const onMainBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      file.type !== "image/gif" &&
      file.type !== "image/png" &&
      file.type !== "image/jpeg"
    ) {
      toast({
        description: "지원하지않는 형식 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    const resizeImg = await imageResize(file, 2000).then((img) => {
      return img;
    });
    const newFile = dataURLtoFile(resizeImg, file.name);
    const storageRef = sRef(storage, `user/background/maninBg`);
    const url = await uploadBytes(storageRef, newFile).then((snapshot) => {
      const downloadUrl = getDownloadURL(snapshot.ref);
      return downloadUrl;
    });
    update(ref(db, `user/${userInfo.uid}`), {
      mainBgUrl: url,
    }).then(() => {
      setHeaderImg(url);
    });
  };

  const bgRef = useRef();
  const onBgToggle = () => {
    if (bgRef.current.classList.contains("on")) {
      bgRef.current.classList.remove("on");
    } else {
      bgRef.current.classList.add("on");
    }
  };

  //모바일 체크
  const Mobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  //아이피 체크
  const getIpAdress = async () => {
    return true;
    if (Mobile()) {
      alert("모바일에서는 체크 불가");
      return;
    }
    const check = await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_ip_adress",
      })
      .then((res) => {
        const ip = res.data.ip;
        const ipArr = res.data.array;
        if (!ip) {
          return;
        }

        if (ipArr.includes(ip)) {
          return true;
        } else {
          return false;
        }
      });
    if (check) {
      return true;
    } else {
      return false;
    }
  };

  //점심탄력 팝업
  const [isAddLunchPop, setisAddLunchPop] = useState(false);
  const closeAddLunchPop = () => {
    setisAddLunchPop(false);
  };

  //출퇴근 체크
  const [attendList, setAttendList] = useState();

  const submitAddAtend = (type, addLunch) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "add_attend_in",
        type,
        mem_uid: userInfo.uid,
        manager: userInfo.manager_uid,
        attend_time: userInfo.attendTime,
        add_lunch: addLunch,
      })
      .then((res) => {
        if (res.data?.already) {
          alert("출근 체크는 하루 한번 가능 합니다.");
          return;
        }
        if (res.data?.update) {
          alert("퇴근 시간이 업데이트 되었습니다.");
          getAttentList();
          return;
        }
        if (type == "1") {
          alert("출근 체크 되었습니다.");
        }
        if (type == "2") {
          alert("퇴근 체크 되었습니다.");
        }
        getAttentList();
      });
  };

  const onAttentCheck = async (type) => {
    const ipCheck = await getIpAdress();
    if (!ipCheck) {
      alert("유효한 ip가 아닙니다.");
      return;
    }

    if (type == 1 && userInfo.uid == "MklXsOiU5zUYQ5H9PK2T4kWuQkA3") {
      setisAddLunchPop(true);
      return;
    }

    submitAddAtend(type);
  };

  useEffect(() => {
    getAttentList();
    getIpAdress();
  }, [userInfo]);

  const getAttentList = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_attend_list",
        mem_uid: userInfo?.uid,
      })
      .then((res) => {
        if (res) {
          setAttendList(res.data?.list);
        }
      });
  };

  return (
    <>
      <MainWrapper>
        <header
          className="header_bg_box"
          ref={bgRef}
          onClick={onBgToggle}
          style={{
            background: `url(${headerImg}) no-repeat center center/cover`,
          }}
        >
          <div className="bg_balck"></div>
          <div className="content_box">
            <Button className="btn_bg_modify">
              <input
                type="file"
                id="bg_input"
                onInput={onMainBg}
                accept="image/*"
              />
              <label htmlFor="bg_input">
                <MdImageSearch style={{ fontSize: "20px" }} />
              </label>
            </Button>
          </div>
        </header>
        <div className="content_box con">
          <div className="profile_box">
            <div className="profile_img">
              {userInfo && userInfo.profile ? (
                <div
                  style={{
                    background: `url(${userInfo.profile}) no-repeat center center/cover`,
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <FaUser className="none_img" />
              )}
            </div>
            <h3>{userInfo && userInfo.name}</h3>
            <Button variant="outline" className="btn_modify" size="sm">
              <Link href="/mypage">정보 수정하기</Link>
            </Button>

            <Flex gap={2} mt={3}>
              <Button
                colorScheme="blue"
                variant="solid"
                onClick={() => onAttentCheck(1)}
              >
                출근체크
              </Button>
              <Button onClick={() => onAttentCheck(2)}>퇴근체크</Button>
            </Flex>
            <ul className="attend_list">
              {attendList &&
                attendList.map((el) => (
                  <>
                    <li>
                      <span>{el.type == 1 ? "출근" : "퇴근"}</span>
                      <span>{el.date_regis}</span>
                    </li>
                  </>
                ))}
            </ul>
          </div>

          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <h2 className="title">프로젝트 & 유지보수</h2>
            <Link href="/work">
              <a className="link">
                <Flex alignItems="center">
                  more
                  <HiExternalLink
                    style={{ marginTop: "4px", marginLeft: "4px" }}
                  />
                </Flex>
              </a>
            </Link>
          </Flex>

          <WorkList main={true} />

          <div className="divide"></div>

          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <h2 className="title">스케쥴표(연차)</h2>
            <Link href="/schedule">
              <a className="link">
                <Flex alignItems="center">
                  more
                  <HiExternalLink
                    style={{ marginTop: "4px", marginLeft: "4px" }}
                  />
                </Flex>
              </a>
            </Link>
          </Flex>

          <Schedule main={true} />

          <div className="divide"></div>

          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <h2 className="title">지출결의서(요청)</h2>
            <Link href="/board/wait">
              <a className="link">
                <Flex alignItems="center">
                  more
                  <HiExternalLink
                    style={{ marginTop: "4px", marginLeft: "4px" }}
                  />
                </Flex>
              </a>
            </Link>
          </Flex>

          <SignBoardList main={true} />

          <div className="divide"></div>

          <Flex gap={6}>
            <Box width={{ base: "100%", lg: "50%" }}>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <h2 className="title">업무보고</h2>
                <Link href="/report">
                  <a className="link">
                    <Flex alignItems="center">
                      more
                      <HiExternalLink
                        style={{ marginTop: "4px", marginLeft: "4px" }}
                      />
                    </Flex>
                  </a>
                </Link>
              </Flex>

              <ReportList main={true} />
            </Box>

            <Box width={{ base: "100%", lg: "50%" }}>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <h2 className="title">운영 & 규정</h2>
                <Link href="/rule">
                  <a className="link">
                    <Flex alignItems="center">
                      more
                      <HiExternalLink
                        style={{ marginTop: "4px", marginLeft: "4px" }}
                      />
                    </Flex>
                  </a>
                </Link>
              </Flex>

              <RuleList main={true} />
            </Box>
          </Flex>
          <div className="divide"></div>

          <Flex justifyContent="space-between" alignItems="center">
            <h2 className="title">
              연차내역{" "}
              <span className="rest_dayoff">
                (남은연차 :{" "}
                {userInfo?.dayoff ? `${userInfo.dayoff} 개` : "0 개"})
              </span>
            </h2>
            <Link href="/schedule">
              <a className="link">
                <Flex alignItems="center">
                  more
                  <HiExternalLink
                    style={{ marginTop: "4px", marginLeft: "4px" }}
                  />
                </Flex>
              </a>
            </Link>
          </Flex>
          <div className="hitmap_box">
            <CalendarHeatmap
              gutterSize={2}
              startDate={format(subMonths(curDate, 11), "yyyy-MM-dd")}
              endDate={format(addMonths(curDate, 1), "yyyy-MM-dd")}
              values={dayOffList}
              classForValue={(value) => {
                if (!value) {
                  return "color-empty";
                }
                return `color-github-${value.type}`;
              }}
              onMouseOver={(e, value) => {
                onTooltip(e, value, "dayoff");
              }}
              showWeekdayLabels={true}
            />
            <ul className="type_info">
              <li className="am_off">오전반차</li>
              <li className="pm_off">오후반차</li>
              <li className="all_off">연차</li>
            </ul>
          </div>
          <div className="divide"></div>
          <Flex justifyContent="space-between" alignItems="center">
            <h2 className="title">결재내역</h2>
            <Link href="/board/list">
              <a className="link">
                <Flex alignItems="center">
                  more
                  <HiExternalLink
                    style={{ marginTop: "4px", marginLeft: "4px" }}
                  />
                </Flex>
              </a>
            </Link>
          </Flex>
          <div className="hitmap_box">
            <CalendarHeatmap
              gutterSize={2}
              startDate={format(subMonths(curDate, 11), "yyyy-MM-dd")}
              endDate={format(addMonths(curDate, 1), "yyyy-MM-dd")}
              values={boardList}
              classForValue={(value) => {
                if (!value) {
                  return "color-empty";
                } else {
                  return `board_type_${value.list[0].type} link`;
                }
              }}
              onMouseOver={(e, value) => {
                onTooltip(e, value, "board");
              }}
              onClick={(value) => onCurrentHitmap(value)}
              showWeekdayLabels={true}
            />
            <ul className="type_info">
              {boardType &&
                boardType.map((el, idx) => (
                  <>
                    <li key={idx} className={`board_type_${idx}`}>
                      {el.title}
                    </li>
                  </>
                ))}
            </ul>
          </div>
          {hitmapListData && (
            <HitmapDetail>
              <h3 className="title">
                <MdOutlineDateRange />
                {hitmapListData.date}
              </h3>
              <ul className="header">
                <li className="box">제목</li>
                <li className="box">유형</li>
                <li className="box">결재자</li>
              </ul>
              <ul className="body">
                {hitmapListData.list.map((el, idx) => (
                  <li key={idx}>
                    <span className="box">{el.subject}</span>
                    <span className="box">{el.typeName}</span>
                    <span className="box">
                      {el.manager.map((list, idx) => {
                        if (el.manager.length == idx + 1) {
                          return <>{list.name}</>;
                        } else {
                          return <>{list.name}, </>;
                        }
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </HitmapDetail>
          )}
        </div>
        {currentDayoff && (
          <HitmapOver pos={tooltipPos} data={currentDayoff}>
            <p>{currentDayoff.subject}</p>
            <p>{currentDayoff.date}</p>
            <p>{currentDayoff.offType}</p>
          </HitmapOver>
        )}
        {currentBoard && (
          <HitmapOver pos={tooltipPos} data={currentBoard}>
            <p>
              {currentBoard.list[0].subject}
              {currentBoard.list.length > 1 &&
                ` 외 ${currentBoard.list.length - 1} 건`}
            </p>
            <p>{currentBoard.date}</p>
            <p>{currentBoard.list[0].typeName}</p>
          </HitmapOver>
        )}
        {isAddLunchPop && (
          <AddLunchPop
            submitAddAtend={submitAddAtend}
            closePop={closeAddLunchPop}
          />
        )}
      </MainWrapper>
    </>
  );
}
