import BoardList, { BoardLi } from "@component/BoardList";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "src/firebase";
import {
  ref,
  onValue,
  remove,
  get,
  off,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import shortid from "shortid";
import { format, setDate } from "date-fns";
import styled from "styled-components";
import ConfirmPop from "@component/schedule/ConfirmPop";
import None from "@component/None";
import { updateDayoffCount } from "@redux/actions/counter_action";

const ReadyList = styled(BoardLi)`
  li {
    &.header {
      .subject {
        justify-content: center;
      }
    }
    .name {
      max-width: 150px;
      flex: 1;
    }
    .reason {
      flex: 1;
      max-width: 200px;
    }
    .subject {
      flex: 1;
      justify-content: flex-start;
      padding: 0 1rem;
    }
    .date {
      max-width: 150px;
      flex: 1;
    }
  }
`;

export default function SignReady() {
  const dispatch = useDispatch();
  const counterCheck = useSelector((state) => state.counter.dayoffCheck);
  const userInfo = useSelector((state) => state.user.currentUser);
  const [readyList, setReadyList] = useState();
  const [render, setRender] = useState(false);
  const onRender = () => {
    setRender(!render);
  };

  useEffect(() => {
    let listRef;
    listRef = query(ref(db, `dayoff/temp`));
    onValue(listRef, (data) => {
      let listArr = [];
      data.forEach((el) => {
        let daySum = 0;
        el.val().list.forEach((li) => {
          daySum += li.day;
        });
        let obj = {
          ...el.val(),
          uid: el.key,
          daySum,
        };
        listArr.push(obj);
      });
      listArr = listArr.filter((el) => {
        let mg_list = el.manager.map((mg) => mg.id);
        return mg_list.includes(userInfo?.uid) || el.userUid === userInfo?.uid;
      });
      setReadyList(listArr);
      dispatch(updateDayoffCount(listArr.length));
    });
    return () => {
      off(listRef);
    };
  }, [userInfo, render]);

  const [listData, setListData] = useState();
  const [isConfirmPop, setIsConfirmPop] = useState(false);
  const onList = (list) => {
    setListData(list);
    setIsConfirmPop(true);
  };
  const closePopup = () => {
    setListData("");
    setIsConfirmPop(false);
  };

  return (
    <>
      <ReadyList>
        <li className="header">
          <span className="name">이름</span>
          <span className="subject">제목</span>
          <span className="reason">사유</span>
          <span className="date">작성일</span>
        </li>
        {readyList &&
          readyList.map((el) => (
            <li key={shortid()}>
              <span className="name">{el.userName}</span>
              <span className="subject">
                <button type="button" onClick={() => onList(el)}>
                  {el.subject}
                </button>
              </span>
              <span className="reason">{el.reason}</span>
              <span className="date">
                {format(new Date(el.timestamp), "yyyy-MM-dd")}
              </span>
            </li>
          ))}
        {readyList?.length === 0 && <None />}
      </ReadyList>
      {listData && isConfirmPop && (
        <ConfirmPop
          userInfo={userInfo}
          listData={listData}
          closePopup={closePopup}
          onRender={onRender}
        />
      )}
    </>
  );
}
