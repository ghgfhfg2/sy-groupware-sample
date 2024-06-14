import { useEffect, useState } from "react";
import { format, subYears } from "date-fns";
import { CommonPopup } from "@component/insa/UserDayoffPop";
import { db } from "src/firebase";
import {
  get,
  set,
  ref,
  query,
  orderByKey,
  startAt,
  update,
  off,
  onValue,
} from "firebase/database";
import { BoardLi } from "@component/BoardList";
import styled from "styled-components";
import { Flex } from "@chakra-ui/react";
const DayOffHistoryPopBox = styled(CommonPopup)`
  .con_box {
    height: auto;
    min-width: 450px;
  }
`;
const DayOffHistory = styled(BoardLi)`
  li {
    span {
      width: auto;
      min-width: 100px;
      padding: 0 10px;
    }
  }
  .reason {
    flex-shrink: 0;
    width: 200px;
  }
  .day {
    font-weight: 600;
    &.plus {
      color: #e53e3e;
    }
    &.minus {
      color: #4299e1;
    }
  }
`;

export default function DayoffHistoryPop({ userData, closeDayoffPop }) {
  const [dayoffList, setDayoffList] = useState();
  useEffect(() => {
    const curDate = new Date();
    const firstDate = subYears(curDate, 1);
    const firstFormat = format(firstDate, "yyyyMMdd");

    let useRef = query(
      ref(db, `dayoff/list`),
      orderByKey(),
      startAt(firstFormat)
    );
    onValue(useRef, (data) => {
      let arr = [];
      for (const key in data.val()) {
        const yaarData = data.val()[key];
        for (const uid in yaarData) {
          if (yaarData[uid].userUid == userData.uid) {
            arr.push(yaarData[uid]);
          }
        }
      }
      arr.sort((a, b) => a.timestamp - b.timestamp);
      setDayoffList(arr);
    });
    return () => {
      off(useRef);
    };
  }, []);
  return (
    <>
      {dayoffList && (
        <DayOffHistoryPopBox>
          <div className="con_box">
            <Flex
              justifyContent="center"
              pl={2}
              pr={2}
              mb={2}
              fontSize={15}
              fontWeight={600}
            >
              {dayoffList[0] && (
                <span>[{dayoffList[0].name}]님의 연차내역</span>
              )}
            </Flex>
            <DayOffHistory>
              <li className="header">
                <span className="reason">사유</span>
                <span className="off_type">유형</span>
                <span className="day">기간</span>
                <span className="date">결재일</span>
              </li>
              {dayoffList &&
                dayoffList.map((el, idx) => (
                  <li key={idx} className="body">
                    <span className="reason">{el.reason}</span>
                    <span className="off_type">{el?.offType}</span>
                    <span
                      className={`day ${
                        el.offType == "추가" ? "plus" : "minus"
                      }`}
                    >
                      {el?.day}
                    </span>
                    <span className="date">{el.date}</span>
                  </li>
                ))}
            </DayOffHistory>
            {userData.dayoff >= 0 && (
              <Flex
                justifyContent="flex-end"
                pr={2}
                mt={2}
                fontSize={15}
                fontWeight={600}
              >
                <span>남은 연차 : {userData.dayoff || 0}</span>
              </Flex>
            )}
          </div>
          <div className="bg" onClick={closeDayoffPop}></div>
        </DayOffHistoryPopBox>
      )}
    </>
  );
}
