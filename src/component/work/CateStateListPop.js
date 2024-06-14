import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { CommonPopup } from "@component/insa/UserDayoffPop";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import {
  Button,
  Flex,
  Input,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Text,
} from "@chakra-ui/react";
import { BoardLi } from "@component/BoardList";
const CateStateListPopBox = styled(CommonPopup)`
  .con_box {
    height: auto;
    padding: 30px 20px;
    min-width: 400px;
  }
`;
const CateStateListBox = styled(BoardLi)`
  .date {
    flex-shrink: 0;
    width: 180px;
  }
  .body {
    .date {
      font-size: 12px;
      color: #888;
    }
  }
`;

export default function CateStateListPop({ closeCateListPop, selectCateInfo }) {
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);

  const cateState = ["대기", "진행", "완료"];
  const [stateList, setStateList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_cate_state",
        cuid: selectCateInfo.uid,
      })
      .then((res) => {
        if (!res.data?.history) return;
        const list = res.data.history?.map((el) => {
          const findUser = userAll?.find((user) => el.writer === user.uid);
          return {
            ...findUser,
            ...el,
          };
        });
        setStateList(list);
      });
  }, []);

  return (
    <CateStateListPopBox>
      <div className="con_box">
        <CateStateListBox>
          <li className="header">
            <span className="state">상태</span>
            <span className="comment">코멘트</span>
            <span className="name">작성자</span>
            <span className="date">작성일</span>
          </li>
          {stateList &&
            stateList.map((el) => (
              <li className="body" key={el.uid}>
                <span className="state">{cateState[el.state]}</span>
                <span className="comment">{el.comment}</span>
                <span className="name">{el.name}</span>
                <span className="date">{el.date_regis}</span>
              </li>
            ))}
        </CateStateListBox>
      </div>
      <div className="bg" onClick={closeCateListPop}></div>
    </CateStateListPopBox>
  );
}
