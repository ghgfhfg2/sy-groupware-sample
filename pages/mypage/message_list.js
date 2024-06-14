import React, { useState } from "react";
import { useRouter } from "next/router";
import MessageList from "@component/mypage/MessageList";
import { Tab, TabIndicator, TabList, Tabs } from "@chakra-ui/react";
import MessageSendList from "@component/mypage/MessageSendList";

export default function Message_list() {
  const router = useRouter();
  const onChangeType = (e) => {
    router.push(`/mypage/message_list?type=${e + 1}`);
  };
  return (
    <>
      <Tabs
        onChange={onChangeType}
        position="relative"
        variant="soft-rounded"
        colorScheme="blue"
        mb={7}
        defaultIndex={router.query.type - 1}
      >
        <TabList>
          <Tab _selected={{ color: "white", bg: "blue.500" }}>받은쪽지</Tab>
          <Tab _selected={{ color: "white", bg: "blue.500" }}>보낸쪽지</Tab>
        </TabList>
      </Tabs>
      {router.query.type == 1 ? <MessageList /> : <MessageSendList />}
    </>
  );
}
