import BoardList, { BoardLi } from "@component/BoardList";
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
} from "firebase/database";
import shortid from "shortid";
import { format } from "date-fns";
import styled from "styled-components";
import FinishPop from "@component/schedule/FinishPop";
import None from "@component/None";
import { Input } from "@chakra-ui/react";

const FinishList = styled(BoardLi)`
  li {
    .name {
      max-width: 150px;
      flex: 1;
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

export default function Finish() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [searchDate, setSearchDate] = useState(new Date());
  const [finishList, setFinishList] = useState();
  useEffect(() => {
    const listRef = query(
      ref(db, `dayoff/finish`),
      orderByKey(),
      equalTo(format(searchDate, "yyyyMM"))
    );
    onValue(listRef, (data) => {
      let listArr = [];
      data.forEach((el) => {
        for (const key in el.val()) {
          let obj = {
            ...el.val()[key],
            date: format(new Date(el.val()[key].timestamp), "yyyy-MM-dd"),
          };
          listArr.push(obj);
        }
      });
      listArr = listArr.filter((el) => {
        const mgList = el.manager.map((el) => el.id);
        return mgList.includes(userInfo?.uid) || el.userUid === userInfo?.uid;
      });
      setFinishList(listArr);
    });
    return () => {
      off(listRef);
    };
  }, [userInfo, searchDate]);

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
      <BoardList>
        <FinishList>
          <li className="header">
            <span className="name">이름</span>
            <span className="subject">제목</span>
            <span className="date">작성일</span>
          </li>
          {finishList &&
            finishList.map((el) => (
              <li key={shortid()}>
                <span className="name">{el.userName}</span>
                <span className="subject">
                  <button type="button" onClick={() => onList(el)}>
                    {el.subject}
                  </button>
                </span>
                <span className="date">{el.date}</span>
              </li>
            ))}
          {finishList?.length === 0 && <None />}
        </FinishList>
      </BoardList>
      {listData && isConfirmPop && (
        <FinishPop
          listData={listData}
          userInfo={userInfo}
          closePopup={closePopup}
        />
      )}
    </>
  );
}
