import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import useGetUser from "@component/hooks/getUserDb";
import { AttendUserList } from "@component/insa/AttendEach";
import { format, getMonth, getDate } from "date-fns";
import moment from "moment";
import { Button, Skeleton, Stack, Text, useToast } from "@chakra-ui/react";
const ReportEachBox = styled.div`
  display: flex;
  flex-direction: column;
  .select_week {
    display: flex;
    margin-bottom: 1rem;
    input {
      padding: 7px 10px;
      border-radius: 5px;
      border: 1px solid #ddd;
    }
  }
  .report_list_box {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    dl {
      &:hover {
        background: #f9f9f9;
      }
      padding: 1rem;
      border-top: 1px solid #ddd;
      dt {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        .date {
          color: #888;
        }
        h2 {
          font-size: 1rem;
          font-weight: 600;
        }
      }
    }
  }
`;

const None = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #888;
`;

export default function ReportEach() {
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
  const [reportData, setReportData] = useState();
  const [selectUser, setSelectUser] = useState(userInfo?.uid);

  const [viewbleUserList, setViewable] = useState();
  useEffect(() => {
    const userList = userAll?.filter((el) => {
      return (
        el.uid === userInfo.uid ||
        el.manager_uid === userInfo.uid ||
        userInfo.uid === "otoentmIBsMUPuRp5as5hCLbS0W2"
      );
    });
    setViewable(userList);
  }, [userAll, userInfo]);

  const convertToWeek = (isoWeek) => {
    const start = moment(isoWeek).format("yyyy-MM-DD");
    const end = moment(start).add(6, "day").format("yyyy-MM-DD");
    const dateObj = {
      start,
      end,
      isoWeek,
    };
    return dateObj;
  };
  const onSubWeek = (isoWeek) => {
    let subWeek = moment(isoWeek).subtract(7, "day");
    subWeek = moment(subWeek).format("yyyy") + "-W" + moment(subWeek).isoWeek();
    return subWeek;
  };
  const curWeekNum = moment().isoWeek();
  const curIsoWeek = `${moment().format("yyyy")}-W${curWeekNum}`;
  const initWeek = convertToWeek(curIsoWeek);
  const [curWeek, setCurWeek] = useState(initWeek);
  const [prevWeek, setPrevWeek] = useState();

  const onChangeWeek = (e) => {
    let val = e.target.value;
    console.log(val);
    const obj = convertToWeek(val);
    setCurWeek({
      ...obj,
    });
  };
  const onSelectUser = (uid) => {
    setSelectUser(uid);
  };
  useEffect(() => {
    const subIsoWeek = onSubWeek(curWeek.isoWeek);
    setPrevWeek(subIsoWeek);
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_report_each",
        mem_uid: selectUser,
        start: curWeek.start,
        end: curWeek.end,
      })
      .then((res) => {
        if (!res.data) {
          setReportData("");
          return;
        }
        setReportData(res.data.list);
      });
  }, [selectUser, curWeek]);

  const [isLoading, setIsLoading] = useState(false);

  const onSubWeekView = async () => {
    setIsLoading(true);
    const subWeek = convertToWeek(prevWeek);
    await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_report_each",
        mem_uid: selectUser,
        start: subWeek.start,
        end: subWeek.end,
      })
      .then((res) => {
        if (!res.data) {
          toast({
            description: "해당 주에 작성된 업무보고가 없습니다.",
            status: "info",
            duration: 1000,
            isClosable: false,
          });
        }
        let newData = [...reportData];
        newData.push(...res.data.list);
        setPrevWeek(onSubWeek(prevWeek));
        setReportData(newData);
        setIsLoading(false);
      });
  };

  return (
    <ReportEachBox>
      <div className="select_week">
        <input type="week" onChange={onChangeWeek} defaultValue={curIsoWeek} />
      </div>
      <AttendUserList>
        {viewbleUserList &&
          viewbleUserList.map((el) => {
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
      <div className="report_list_box">
        {reportData ? (
          <>
            {reportData.map((el) => (
              <>
                <dl>
                  <dt>
                    <h2>{el.title}</h2>
                    <span className="date">
                      {el.date_regis.substring(0, 10)}
                    </span>
                  </dt>
                  <dd>
                    <div dangerouslySetInnerHTML={{ __html: el.content }}></div>
                  </dd>
                </dl>
              </>
            ))}
          </>
        ) : (
          <>
            <None>작성된 업무일지가 없습니다.</None>
          </>
        )}
        {isLoading && (
          <>
            <Stack>
              <Skeleton height="30px" />
              <Skeleton height="30px" />
              <Skeleton height="30px" />
            </Stack>
          </>
        )}
      </div>
      <Button mt={5} onClick={onSubWeekView}>
        더보기
        <Text fontSize={12}>
          ({prevWeek?.split("-")[0]}년 {prevWeek?.split("-")[1].substring(1)}
          번째 주)
        </Text>
      </Button>
    </ReportEachBox>
  );
}
