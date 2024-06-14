import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { BoardLi } from "@component/BoardList";
import { getFormatDate } from "@component/CommonFunc";
import { format } from "date-fns";
import shortid from "shortid";
import None from "@component/None";
import styled from "styled-components";
import axios from "axios";
import useGetUser from "@component/hooks/getUserDb";
import { Pagenation } from "../Pagenation";
import Link from "next/link";
import { Button, Flex, Input, useToast } from "@chakra-ui/react";
import ExAttendPop from "@component/insa/ExAttendPop";

export const AttendStateList = styled.ul`
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
  li {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 7px 10px;
    &.state_1 {
      background: #ddd;
      color: #fff;
    }
    &.state_2 {
      background: #1a365d;
      border-color: #1a365d;
      color: #fff;
    }
    &.state_3 {
      background: #333;
      border-color: #333;
      color: #fff;
    }
    &.state_4 {
      background: #ffc0bd;
      border-color: #ffc0bd;
    }
  }
`;

const AttendBoardList = styled(BoardLi)`
  li {
    .date {
      width: 150px;
      flex-shrink: 0;
    }
    &.under {
      background: #ffc0bd;
    }
  }
`;

export default function Attend() {
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  const today = getFormatDate(new Date());
  const [curDate, setCurDate] = useState(today.full_);
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);

  const [attendList, setAttendList] = useState();
  const [userStateList, setUserStateList] = useState();

  const onChangeDate = (e) => {
    setCurDate(e.target.value);
  };

  const getAttendList = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "attend_all_list",
        date: curDate,
      })
      .then((res) => {
        const initState = userAll?.map((el) => {
          el.state = 1;
          return el;
        });
        setUserStateList(initState);
        setAttendList("");
        if (!res.data.list) return;
        const list = res.data.list.map((el) => {
          const user = userAll?.find((user) => el.mem_uid == user.uid);
          el.date_regis = el.date_regis.split(" ")[1].substr(0, 5);
          el = {
            ...user,
            ...el,
          };
          if (el.work_time) {
            //7시간 근무 체크
            const hour = el.work_time.substr(0, 2);
            if (hour < 7 && el.ex_state == 0) {
              el.isUnder = true;
            }
          }
          return el;
        });
        let userState = userAll?.map((el) => {
          const user = list.filter((user) => user.mem_uid == el.uid);
          el.state = 1;
          if (user.find((el) => el.type == "1")) el.state = 2;
          if (user.find((el) => el.type == "2")) el.state = 3;
          return el;
        });
        userState = userState?.filter((el) => !el.hidden);
        setUserStateList(userState);
        setAttendList(list);
      });
  };

  const [render, setRender] = useState(false);
  const onRender = () => {
    setRender(!render);
  };
  useEffect(() => {
    getAttendList();
  }, [render, curDate]);

  const [isExAttendPop, setIsExAttendPop] = useState(false);
  const [selectUser, setSelectUser] = useState();
  //예외처리 팝업
  const onExAttendPop = (data) => {
    setSelectUser(data);
    setIsExAttendPop(true);
  };
  const closeExAttendPop = () => {
    setIsExAttendPop(false);
  };

  const cancelExAttend = (data) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_attend_ex",
        uid: data.uid,
        state: "0",
      })
      .then((res) => {
        console.log(res);
        toast({
          description: "예외처리가 취소 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        closeExAttendPop();
        onRender();
      });
  };

  return (
    <>
      <Flex mb={3}>
        <Input
          id="date"
          type="date"
          defaultValue={today.full_}
          style={{ width: "150px", marginBottom: "10px", marginRight: "10px" }}
          placeholder="날짜"
          onChange={onChangeDate}
        />
        <AttendStateList>
          <li className="state_1">미출근</li>
          <li className="state_2">출근</li>
          <li className="state_3">퇴근</li>
          <li>* 괄호 안은 출근 예정 시간</li>
          <li className="state_4">근무시간 부족</li>
        </AttendStateList>
      </Flex>
      <AttendStateList>
        {userStateList &&
          userStateList.map((el) => (
            <li key={el.uid} className={`state_${el.state}`}>
              {el.name} ({el.attendTime})
            </li>
          ))}
      </AttendStateList>
      <AttendBoardList>
        <li className="header">
          <span className="name">이름</span>
          <span className="date">예정시간</span>
          <span className="date">점심탄력</span>
          <span className="date">출근시간</span>
          <span className="date">퇴근시간</span>
          <span className="date">근무시간</span>
          <span className="date">비고</span>
          {userInfo && userInfo.authority?.indexOf("admin") > -1 && (
            <span className="date">관리</span>
          )}
        </li>
        {attendList ? (
          attendList.map((el) => (
            <>
              <li key={el.uid} className={el.isUnder && "under"}>
                <span>{el.name}</span>
                <span className="date">{el.attend_time}</span>
                <span className="date">
                  {el.add_lunch ? `${el.add_lunch}분` : ""}
                </span>
                <span className="date">{el.type == 1 && el.date_regis}</span>
                <span className="date">{el.type == 2 && el.date_regis}</span>
                <span className="date">{el.work_time}</span>
                <span className="date">{el.ex_comment}</span>
                {el.type == 2 &&
                  userInfo &&
                  userInfo.authority?.indexOf("admin") > -1 && (
                    <span className="date">
                      {el.ex_state == 0 && (
                        <Button size="sm" onClick={() => onExAttendPop(el)}>
                          예외처리
                        </Button>
                      )}
                      {el.ex_state == 1 && (
                        <Button
                          ml={2}
                          size="sm"
                          colorScheme="red"
                          onClick={() => cancelExAttend(el)}
                        >
                          예외처리 취소
                        </Button>
                      )}
                    </span>
                  )}
              </li>
            </>
          ))
        ) : (
          <None />
        )}
      </AttendBoardList>
      {isExAttendPop && (
        <ExAttendPop
          curDate={curDate}
          attendData={selectUser}
          closeExAttendPop={closeExAttendPop}
          onRender={onRender}
        />
      )}
    </>
  );
}
