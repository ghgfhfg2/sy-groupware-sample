import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BoardLi } from "@component/BoardList";
import { Button, Flex, Input } from "@chakra-ui/react";
import { db } from "src/firebase";
import {
  ref,
  set,
  update,
  remove,
  query,
  orderByValue,
  orderByChild,
  equalTo,
  runTransaction,
  onValue,
  orderByKey,
  startAt,
  endAt,
} from "firebase/database";
import styled from "styled-components";
import { format } from "date-fns";
const DayoffLi = styled(BoardLi)`
  li {
    span {
      flex: 1;
    }
    .type {
      flex: 0 100px;
    }
    .date {
      flex: 0 150px;
    }
    .day {
      flex: 0 100px;
    }
    .rest {
      flex: 0 100px;
    }
  }
`;

export default function MyDayoff() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [searchDate, setSearchDate] = useState(new Date());

  const [dayoffList, setDayoffList] = useState();
  useEffect(() => {
    if (userInfo) {
      const startDate = format(searchDate, "yyyyMM") + "01";
      const endDate = format(searchDate, "yyyyMM") + "31";
      const dayoffRef = query(
        ref(db, `dayoff/list`),
        orderByKey(),
        startAt(startDate),
        endAt(endDate)
      );
      onValue(dayoffRef, (data) => {
        let arr = [];
        data.forEach((el) => {
          for (const key in el.val()) {
            arr.push(el.val()[key]);
          }
        });
        arr.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        arr = arr.filter(el=>el.userUid === userInfo?.uid)
        setDayoffList(arr);
      });
    }
  }, [userInfo, searchDate]);

  const handleMonth = (e) => {
    const date = new Date(e.target.value);
    setSearchDate(date);
  };
  return (
    <>
      <Input
        type="month"
        width="160px"
        mb={5}
        onChange={handleMonth}
        value={format(searchDate, "yyyy-MM")}
        max={format(new Date(), "yyyy-MM")}
      />
      <DayoffLi>
        <li className="header">
          <span className="subject">제목</span>
          <span className="reason">사유</span>
          <span className="type">유형</span>
          <span className="date">날짜</span>
          <span className="date">작성일</span>
          <span className="day">일수</span>
          <span className="rest">남은연차</span>
        </li>
        {dayoffList &&
          dayoffList.map((el, idx) => (
            <>
              <li>
                <span className="subject">{el.subject}</span>
                <span className="reason">{el.reason}</span>
                <span className="type">{el.offType}</span>
                <span className="date">{el.date}</span>
                <span className="date">
                  {format(el.timestamp, "yyyy-MM-dd")}
                </span>
                <span className="day">{el.day}</span>
                <span className="rest">{el.restDayoff}</span>
              </li>
            </>
          ))}
      </DayoffLi>
    </>
  );
}
