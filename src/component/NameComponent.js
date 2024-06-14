import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import styled from "styled-components";
import MeessageReplyPop from "./mypage/MessageReplyPop";
const NameBox = styled.div`
  position: relative;
  .pop_body {
    width: auto;
  }
`;

export default function NameComponent({ name, user }) {
  const [msgData, setMsgData] = useState();
  useEffect(() => {
    setMsgData({
      ...user,
      writer: user.writer,
    });
  }, []);

  const [isMessagePop, setIsMessagePop] = useState(false);
  const onMessagePop = () => {
    setIsMessagePop(true);
  };
  const closeReplyPop = () => {
    setIsMessagePop(false);
  };
  return (
    <>
      <NameBox>
        <Popover>
          <PopoverTrigger>
            <button type="button">{name}</button>
          </PopoverTrigger>
          <PopoverContent className="pop_body">
            <PopoverArrow />
            <PopoverBody>
              <button type="button" onClick={onMessagePop}>
                쪽지 보내기
              </button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </NameBox>
      {isMessagePop && (
        <MeessageReplyPop msgData={msgData} closeReplyPop={closeReplyPop} />
      )}
    </>
  );
}
