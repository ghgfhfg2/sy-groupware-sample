import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateNonRead } from "@redux/actions/counter_action";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import styled from "styled-components";
import { Pagenation } from "../Pagenation";
import { WorkBoardList } from "@component/work/WorkList";
import { useRouter } from "next/router";
import None from "@component/None";
import MessageViewPop from "./MessageViewPop";
import { format, register } from "timeago.js";
import koLocale from "timeago.js/lib/lang/ko";
import MeessageReplyPop from "./MessageReplyPop";
import NameComponent from "@component/NameComponent";
import { onReadAlert } from "../hooks/sendAlertFunc";
register("ko", koLocale);
const MessageBoardList = styled(WorkBoardList)`
  .body {
    .subject {
      cursor: pointer;
      font-weight: 600;
      color: #222;
      &.read {
        color: #888;
      }
    }
  }
`;

export default function MessageList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
  const nonRead = useSelector((state) => state.counter.nonRead);
  const userInfo = useSelector((state) => state.user.currentUser);
  const [listData, setListData] = useState();

  const curPage = router.query["p"] || 1;
  const [totalPage, setTotalPage] = useState();

  const [render, setRender] = useState(false);
  const onRender = () => {
    setRender(!render);
  };
  useEffect(() => {
    if (!userInfo) return;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_message_list",
        mem_uid: userInfo.uid,
        page: curPage,
      })
      .then((res) => {
        if (!res.data) return;
        const total = res.data.total;
        setTotalPage(total);
        const list = res.data.list?.map((el) => {
          const findUser = userAll?.find((user) => el.writer === user.uid);
          return {
            ...findUser,
            ...el,
          };
        });
        setListData(list);
      });
  }, [userInfo, render]);

  const [isMessagePop, setisMessagePop] = useState(false);
  const [msgData, setMsgData] = useState();
  const onMessageViewPop = (data) => {
    const user = userAll.find((el) => el.uid == data.writer);
    const viewCon = {
      ...user,
      ...data,
    };
    setMsgData(viewCon);
    setisMessagePop(true);
  };

  const readMessage = (uid, mem_uid) => {
    let isAlerady = false;
    let new_read_state;
    const newList = listData.map((el) => {
      if (el.uid == uid) {
        if (el.read_state.indexOf(mem_uid) > -1) {
          isAlerady = true;
        } else {
          el.read_state = el.read_state
            ? [...JSON.parse(el.read_state), mem_uid]
            : [mem_uid];
          new_read_state = JSON.stringify(el.read_state);
          const newNonRead = 1 * nonRead - 1;
          dispatch(updateNonRead(newNonRead));
        }
      }
      return el;
    });
    if (isAlerady) return;
    setListData(newList);
    axios.post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
      a: "update_message_state",
      uid,
      read_state: new_read_state,
    });
  };

  const closeMessagePop = () => {
    setisMessagePop(false);
  };

  const [isReplyPop, setIsReplyPop] = useState(false);
  const onReplyPop = () => {
    setIsReplyPop(true);
  };
  const closeReplyPop = () => {
    setIsReplyPop(false);
  };

  return (
    <>
      <MessageBoardList>
        <li className="header">
          <span>번호</span>
          <span className="name">상태</span>
          <span className="subject">제목</span>
          <span className="name">보낸사람</span>
          <span className="date">보낸시간</span>
        </li>
        {listData &&
          listData.map((el, idx) => {
            const num = listData.length - idx;
            return (
              <li className="body" key={el.uid}>
                <span>{num}</span>
                <span className="date">
                  {el.read_state.indexOf(userInfo?.uid) > -1
                    ? "읽음"
                    : "미확인"}
                </span>
                <span
                  onClick={() => onMessageViewPop(el)}
                  className={`${
                    el.read_state.indexOf(userInfo?.uid) > -1
                      ? "subject read"
                      : "subject"
                  }`}
                >
                  {el.title}
                </span>
                <span className="name">
                  <NameComponent name={el.name} user={el} />
                </span>
                <span className="date">{format(el.date_regis, "ko")}</span>
              </li>
            );
          })}
        {listData?.length === 0 && <None />}
      </MessageBoardList>
      <Pagenation
        type="report"
        total={totalPage}
        current={curPage}
        viewPage={10}
      />
      {isMessagePop && (
        <MessageViewPop
          onReplyPop={onReplyPop}
          msgData={msgData}
          readMessage={readMessage}
          closeMessagePop={closeMessagePop}
        />
      )}
      {isReplyPop && (
        <MeessageReplyPop
          msgData={msgData}
          closeReplyPop={closeReplyPop}
          closeMessagePop={closeMessagePop}
          onRender={onRender}
        />
      )}
    </>
  );
}
