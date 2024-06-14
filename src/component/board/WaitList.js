import { BoardLi } from "@component/BoardList";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "src/firebase";
import {
  ref,
  onValue,
  remove,
  get,
  off,
  update,
  query,
  startAt,
  endAt,
  orderByKey,
  equalTo,
  orderByChild,
} from "firebase/database";
import shortid from "shortid";
import { format } from "date-fns";
import styled from "styled-components";
import FinishPop from "@component/schedule/FinishPop";
import None from "@component/None";
import Link from "next/link";
import useGetUser from "@component/hooks/getUserDb";

const SignBoardLi = styled(BoardLi)`
  li {
    .name {
      max-width: 150px;
      flex: 1;
    }
    .subject {
      flex: 1;
    }
    .date {
      max-width: 150px;
      flex: 1;
    }
  }
  .body {
    .subject {
      justify-content: flex-start;
      padding: 0 1rem;
    }
  }
`;

export default function SignBoardList() {
  useGetUser();
  const userInfo = useSelector((state) => state.user.currentUser);
  const userAll = useSelector((state) => state.user.allUser);
  const [boardList, setBoardList] = useState();
  useEffect(() => {
    const listRef = query(
      ref(db, `board/list`),
      orderByChild("state"),
      equalTo("ing")
    );
    onValue(listRef, (el) => {
      if (userInfo && userAll) {
        let listArr = [];
        for (const key in el.val()) {
          let mg_list = [];
          mg_list = el.val()[key].manager.map((el) => el.uid);
          let writer = userAll.find(
            (user) => user.uid === el.val()[key].writer_uid
          );
          if (
            mg_list.includes(userInfo.uid) ||
            el.val()[key].writer_uid === userInfo.uid
          ) {
            let obj = {
              ...el.val()[key],
              uid: key,
              writer,
              date: format(el.val()[key].timestamp, "yyyyMM"),
              date_: format(el.val()[key].timestamp, "yyyy-MM-dd"),
            };
            listArr.push(obj);
          }
        }
        listArr = listArr.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        setBoardList(listArr);
      }
    });
    return () => {
      off(listRef);
    };
  }, [userInfo, userAll]);

  const [listData, setListData] = useState();
  const [isConfirmPop, setIsConfirmPop] = useState(false);
  const closePopup = () => {
    setListData("");
    setIsConfirmPop(false);
  };

  return (
    <>
      <SignBoardLi>
        <li className="header">
          <span className="state">상태</span>
          <span className="subject">제목</span>
          <span className="name">작성자</span>
          <span className="date">작성일</span>
        </li>
        {boardList &&
          boardList.map((el) => (
            <li className="body" key={shortid()}>
              <span className="state">
                {el.state === "ing"
                  ? "결재대기"
                  : el.state === "finish"
                  ? "결재완료"
                  : ""}
              </span>
              <Link href={`/board/view?id=${el.uid}&date=${el.date}`}>
                <span className="subject link">{el.subject}</span>
              </Link>
              <span className="date">{el?.writer.name}</span>
              <span className="date">{el.date_}</span>
            </li>
          ))}
        {boardList?.length === 0 && <None />}
      </SignBoardLi>
      {listData && isConfirmPop && (
        <FinishPop listData={listData} closePopup={closePopup} />
      )}
    </>
  );
}
