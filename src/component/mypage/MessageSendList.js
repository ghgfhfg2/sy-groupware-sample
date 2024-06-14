import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
register("ko", koLocale);
const MessageBoardList = styled(WorkBoardList)`
  .body {
    .subject {
      cursor: pointer;
      font-weight: 600;
      color: #222;
    }
  }
`;

export default function MessageSendList() {
  const router = useRouter();
  const toast = useToast();
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
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
        a: "get_send_message_list",
        mem_uid: userInfo.uid,
        page: curPage,
      })
      .then((res) => {
        if (!res.data) return;
        const total = res.data.total;
        setTotalPage(total);
        const list = res.data.list?.map((el) => {
          const findUser = userAll?.find((user) => el.writer === user.uid);
          const readUser = el.read_state ? JSON.parse(el.read_state) : [];
          const recipiArr = JSON.parse(el.recipient);
          let readCheck = [];
          let nonReadCheck = [];
          let readCount = [readUser.length, recipiArr.length];
          recipiArr.forEach((el2) => {
            const user = userAll?.find((u) => u.uid == el2);
            if (readUser && readUser.find((e) => e == el2)) {
              readCheck.push(user);
            } else {
              nonReadCheck.push(user);
            }
          });
          return {
            ...findUser,
            readCheck,
            nonReadCheck,
            readCount,
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

  const closeMessagePop = () => {
    setisMessagePop(false);
  };

  return (
    <>
      <MessageBoardList>
        <li className="header">
          <span>번호</span>
          <span className="name">상태</span>
          <span className="subject">제목</span>
          <span className="date">보낸시간</span>
        </li>
        {listData &&
          listData.map((el, idx) => {
            const num = listData.length - idx;
            return (
              <li className="body" key={el.uid}>
                <span>{num}</span>
                <span className="date">
                  {el.readCount[1] == el.readCount[0] ? (
                    <>모두읽음</>
                  ) : (
                    <>
                      {el.readCount[0]}/{el.readCount[1]} 읽음
                    </>
                  )}
                </span>
                <span onClick={() => onMessageViewPop(el)} className="subject">
                  {el.title}
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
          msgData={msgData}
          readOnly={true}
          closeMessagePop={closeMessagePop}
          onRender={onRender}
        />
      )}
    </>
  );
}
