import React, { useState, useEffect } from "react";
import { db } from "src/firebase";
import {
  ref,
  off,
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
import { format, addMonths, subMonths, add, sub } from "date-fns";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import {
  isSameMonth,
  isSameDay,
  addDays,
  parse,
  getDay,
  isSunday,
} from "date-fns";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import styled from "styled-components";
import { el } from "date-fns/locale";
import Loading from "../../src/component/Loading";
import { Flex } from "@chakra-ui/react";
import axios from "axios";

export const ScheduleCalendar = styled.div`
  .header {
    height: 50px;
    margin-bottom: 20px;
    button {
      display: flex;
      height: 100%;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      border-radius: 5px;
      border: 1px solid #1a365d;
      &:hover {
        background: #1a365d;
        color: #fff;
      }
    }
    .current_date {
      font-size: 18px;
      font-weight: 600;
    }
  }
  .row {
    display: flex;
    flex: 1;
  }
  .col {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .days {
    background: #1a365d;
    color: #fff;
    border-radius: 5px;
    font-size: 1rem;
    padding: 0.5rem;
    margin-bottom: 10px;
  }
  .body {
    .col {
      height: 110px;
      border: 1px solid #ddd;
      margin-left: -1px;
      margin-top: -1px;
      position: relative;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 15px;
      overflow: auto;
    }
    .disabled {
      background: #f1f1f1;
      color: #999;
    }
    .selected {
      border: 1px solid #38b2ac;
      z-index: 1;
    }
    .valid {
      &.sunday,
      &.holiday {
        background: #ffefef;
      }
      &.sunday .num {
        color: #e53e3e;
        font-weight: 600;
      }
      &.holiday .num {
        color: #e53e3e;
        font-weight: 600;
        .date_name {
          font-size: 12px;
          margin-left: 3px;
        }
      }
    }
    .valid:hover {
      background: #f9f9f9;
    }
    .dayoff_list {
      opacity: 0;
      display: flex;
      flex-wrap: wrap;
      animation: fadeIn 0.2s 0.1s forwards;
      li {
        padding: 5px;
        font-size: 11px;
        color: #fff;
        margin: 2px;
        border-radius: 3px;
      }
    }
  }
  .type_info {
    display: flex;
    margin-bottom: 15px;
    li {
      margin-right: 4px;
      width: 70px;
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

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  @media screen and (max-width: 1024px) {
    .body {
      .row {
        flex-direction: column;
        .disabled {
          display: none;
        }
      }
    }
  }
`;

export const RenderHeader = ({ currentMonth, prevMonth, nextMonth }) => {
  const prevM = format(subMonths(currentMonth, 1), "M");
  const nextM = format(addMonths(currentMonth, 1), "M");
  return (
    <div className="header row">
      <button type="button" onClick={prevMonth}>
        <MdArrowBackIos style={{ marginRight: "4px" }} />
        {prevM}월
      </button>
      <div className="col">
        <span className="current_date">
          {format(currentMonth, "yyyy")}년&nbsp;
          {format(currentMonth, "M")}월
        </span>
      </div>
      <button type="button" onClick={nextMonth}>
        {nextM}월<MdArrowForwardIos style={{ marginLeft: "4px" }} />
      </button>
    </div>
  );
};

const RenderDays = () => {
  const days = [];
  const date = ["일", "월", "화", "수", "목", "금", "토"];

  for (let i = 0; i < 7; i++) {
    days.push(
      <div className="col" key={i}>
        {date[i]}
      </div>
    );
  }

  return <div className="days row">{days}</div>;
};

const RenderCells = ({
  currentMonth,
  selectedDate,
  dayoffList,
  onDateClick,
  restDeList,
  main,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  let startDate = startOfWeek(monthStart);
  let endDate = endOfWeek(monthEnd);
  if (main) {
    startDate = startOfWeek(currentMonth);
    endDate = endOfWeek(add(startDate, { days: 7 }));
  }

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const isHoliday = (list, date) => {
    if (!list) {
      return;
    }
    let res;
    if (Array.isArray(list)) {
      res = list.find(
        (el) => Number(String(el.locdate).substring(6, 8)) == date
      );
    } else {
      if (Number(String(list.locdate).substring(6, 8)) == date) {
        res = list;
      }
    }
    return res;
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;

      let holiday;
      if (isSameMonth(day, monthStart)) {
        holiday = isHoliday(restDeList, formattedDate);
      }
      days.push(
        <div
          className={`col ani__fade_in custom__scroll_bar cell ${
            !isSameMonth(day, monthStart) && !main
              ? "disabled"
              : isSameDay(day, selectedDate)
              ? "selected"
              : format(currentMonth, "M") !== format(day, "M")
              ? "not-valid"
              : "valid"
          } ${isSunday(day) ? "sunday" : ""}
            ${holiday ? "holiday" : ""}      
          `}
          key={day}
          onClick={() => onDateClick(cloneDay)}
        >
          <span
            className={
              format(currentMonth, "M") !== format(day, "M")
                ? "text not-valid"
                : "num"
            }
          >
            {formattedDate}
            <span className="date_name">
              {holiday && ` ${holiday.dateName}`}
            </span>
            <ul className="dayoff_list">
              {dayoffList &&
                dayoffList[formattedDate] &&
                dayoffList[formattedDate].map((el) => {
                  if (isSameMonth(day, monthStart) || main) {
                    return (
                      <>
                        <li
                          className={
                            el.offType === "연차"
                              ? "all_off"
                              : el.offType === "오전반차"
                              ? "am_off"
                              : el.offType === "오후반차"
                              ? "pm_off"
                              : ""
                          }
                        >
                          {el.userName}
                        </li>
                      </>
                    );
                  }
                })}
            </ul>
          </span>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="row" key={day}>
        {days}
      </div>
    );
    days = [];
  }
  return <div className="body">{rows}</div>;
};

function Schedule({ main }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isMonthLoading, setIsMonthLoading] = useState(false);

  const [restDeList, setrestDeList] = useState();
  const [dayoffList, setDayoffList] = useState();
  useEffect(() => {
    let startDate = format(new Date(currentMonth), "yyyyMM") + "01";
    let endDate = format(new Date(currentMonth), "yyyyMM") + "31";
    if (main) {
      startDate = format(startOfWeek(currentMonth), "yyyyMMdd");
      endDate = format(add(currentMonth, { days: 13 }), "yyyyMMdd");
    }

    const curYear = format(new Date(currentMonth), "yyyy");
    const curMonth = format(new Date(currentMonth), "MM");
    const RestDeInfoUrl = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${curYear}&solMonth=${curMonth}&ServiceKey=OSeR%2BiY89%2FobvrUM6TW7sB0xmJYF8e4lC8dyxpewmdE5pUOOvPovA1slxvX258F%2FNEl%2F34pHxQr0duB9kgkBUA%3D%3D`; /*URL*/

    axios.get(RestDeInfoUrl).then((res) => {
      let resList = res.data.response.body.items.item;
      if (resList && Array.isArray(resList)) {
        resList.map((el) => {
          if (String(el.locdate).substring(4, 8) == "0101") {
            el.dateName = "신정";
          }
          if (String(el.locdate).substring(4, 8) == "1225") {
            el.dateName = "성탄절";
          }
          return el;
        });
      } else if (resList) {
        if (String(resList.locdate).substring(4, 8) == "1225") {
          resList.dateName = "성탄절";
        }
        if (String(resList.locdate).substring(4, 8) == "0101") {
          resList.dateName = "신정";
        }
      }
      setrestDeList(resList);
    });

    const listRef = query(
      ref(db, `dayoff/list`),
      orderByKey(),
      startAt(startDate),
      endAt(endDate)
    );
    onValue(listRef, (data) => {
      if (!data.size) {
        setDayoffList();
      }
      let listObj = {};
      data.forEach((el) => {
        for (const key in el.val()) {
          let value = el.val()[key];
          value.month = value.date.split("-")[1];
          let date = value.date.split("-")[2];
          date = Number(date);

          listObj[date] = listObj[date] ? [...listObj[date], value] : [value];
        }
      });
      setDayoffList(listObj);
    });
    return () => {
      off(listRef);
    };
  }, [currentMonth]);

  const prevMonth = () => {
    setIsMonthLoading(true);
    setCurrentMonth(subMonths(currentMonth, 1));
    setTimeout(() => {
      setIsMonthLoading(false);
    }, 100);
  };
  const nextMonth = () => {
    setIsMonthLoading(true);
    setCurrentMonth(addMonths(currentMonth, 1));
    setTimeout(() => {
      setIsMonthLoading(false);
    }, 100);
  };
  const onDateClick = (day) => {
    return;
    setSelectedDate(day);
  };
  return (
    <ScheduleCalendar>
      {!main && (
        <>
          <ul className="type_info">
            <li className="am_off">오전반차</li>
            <li className="pm_off">오후반차</li>
            <li className="all_off">연차</li>
          </ul>
          <RenderHeader
            currentMonth={currentMonth}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
          />
        </>
      )}
      <RenderDays />
      {!isMonthLoading ? (
        <RenderCells
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          dayoffList={dayoffList}
          restDeList={restDeList}
          onDateClick={onDateClick}
          main={main}
        />
      ) : (
        <RenderCells
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          main={main}
        />
      )}
    </ScheduleCalendar>
  );
}

export default Schedule;
