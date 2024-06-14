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
import ManagerListPop from "./ManagerListPop";
import useGetUser from "@component/hooks/getUserDb";
import { Input } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { comma } from "../CommonFunc";

const SignBoardLi = styled(BoardLi)`
  li {
    .name {
      max-width: 120px;
      flex: 1;
    }
    .subject {
      flex: 1;
    }
    .date {
      max-width: 120px;
      flex: 1;
    }
    .type {
      width: 150px;
    }
  }
  .body {
    .subject {
      justify-content: flex-start;
      padding: 0 1rem;
    }
    .income {
      color: #c53030;
      font-weight: 600;
    }
    .spend {
      color: #2b6cb0;
      font-weight: 600;
    }
  }
  @media screen and (max-width: 1024px) {
    li {
      min-width: 1000px;
    }
  }
`;

export default function SignBoardList({ stateType, main }) {
  useGetUser();
  const router = useRouter();
  const userInfo = useSelector((state) => state.user.currentUser);
  const userAll = useSelector((state) => state.user.allUser);
  const [boardList, setBoardList] = useState();
  const [searchDate, setSearchDate] = useState(new Date());

  const [typeState, setTypeState] = useState();
  useEffect(() => {
    get(ref(db, `board/type_list`)).then((data) => {
      setTypeState(data.val());
    });
  }, []);

  useEffect(() => {
    const formatDate = format(searchDate, "yyyyMM");
    let listRef;
    if (stateType === "ing") {
      listRef = query(
        ref(db, `board/list`),
        orderByChild("state"),
        equalTo(stateType)
      );
    } else {
      listRef = query(
        ref(db, `board/list`),
        orderByChild("dateMonth"),
        equalTo(formatDate)
      );
    }
    onValue(listRef, (el) => {
      if (userInfo && userAll) {
        let listArr = [];
        for (const key in el.val()) {
          let mg_list = [];
          mg_list = el.val()[key].manager.map((el) => el.uid);
          let writer = userAll.find(
            (user) => user.uid === el.val()[key].writer_uid
          );
          let viewCheck;
          if (stateType === "ing") {
            viewCheck =
              el.val()[key].nextManager.uid === userInfo.uid ||
              el.val()[key].writer_uid === userInfo.uid;
          } else {
            viewCheck =
              mg_list.includes(userInfo.uid) ||
              el.val()[key].writer_uid === userInfo.uid;
          }
          if (viewCheck) {
            let obj = {
              ...el.val()[key],
              uid: key,
              writer,
              date: format(el.val()[key].timestamp, "yyyyMM"),
              date_: el.val()[key].date || "",
            };
            listArr.push(obj);
          }
        }
        listArr = listArr.filter((el) => el.state === stateType);
        listArr = listArr.sort((a, b) => {
          return (
            format(new Date(b.date_), "yyyyMMdd") -
            format(new Date(a.date_), "yyyyMMdd")
          );
        });
        if (main) {
          listArr = listArr.slice(0, 5);
        }
        setBoardList(listArr);
      }
    });
    return () => {
      off(listRef);
    };
  }, [userInfo, searchDate, userAll, stateType]);

  const [listData, setListData] = useState();
  const [isConfirmPop, setIsConfirmPop] = useState(false);
  const closePopup = () => {
    setListData("");
    setIsConfirmPop(false);
  };

  const handleMonth = (e) => {
    const date = new Date(e.target.value);
    setSearchDate(date);
  };

  return (
    <>
      {stateType === "finish" && (
        <Input
          type="month"
          width="160px"
          mb={5}
          onChange={handleMonth}
          value={format(searchDate, "yyyy-MM")}
          max={format(new Date(), "yyyy-MM")}
        />
      )}
      <SignBoardLi>
        <li className="header">
          <span className="state">상태</span>
          <span className="type">유형</span>
          <span className="subject">제목</span>
          <span className="income">소득</span>
          <span className="spend">지출</span>
          <span className="name">작성자</span>
          <span className="date">결재일</span>
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
              <span className="type">
                {typeState && typeState[el.type].title}
              </span>
              <Link href={`/board/view?id=${el.uid}`}>
                <span className="subject link">{el.subject}</span>
              </Link>
              <span className="income">{comma(el.income)}</span>
              <span className="spend">{comma(el.spend)}</span>
              <span className="name">{el?.writer.name}</span>
              <span className="date">{el?.date_}</span>
              <span className="date">
                {format(new Date(el.timestamp), "yyyy-MM-dd")}
              </span>
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
