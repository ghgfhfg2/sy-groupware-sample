import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { CommonPopup } from "@component/insa/UserDayoffPop";
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
  Textarea,
} from "@chakra-ui/react";
export const CateStatePopBox = styled(CommonPopup)`
  .con_box {
    height: auto;
    padding: 30px 20px;
    min-width: 400px;
  }
`;

export default function InfoModifyPop({
  selectInfoData,
  closeModifyPop,
  onRender,
}) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const toast = useToast();

  const [title, setTitle] = useState(selectInfoData.title);
  const onChangeTitle = (e) => {
    setTitle(e.target.value);
  };

  const [content, setContent] = useState(selectInfoData.content);
  const onChangeContent = (e) => {
    setContent(e.target.value);
  };

  const omSubmit = () => {
    const replaceCon = content.replace(/(?:\r\n|\r|\n)/g, "<br>");
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_project_info",
        title,
        content: replaceCon,
        writer: userInfo.uid,
        uid: selectInfoData.uid,
      })
      .then((res) => {
        toast({
          description: "상태가 변경 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        closeModifyPop();
        onRender();
      });
  };

  return (
    <CateStatePopBox>
      <div className="con_box">
        <Input
          placeholder="항목"
          onChange={onChangeTitle}
          value={title}
          mb={2}
          defaultValue={selectInfoData.title}
        />
        <Textarea
          placeholder="내용"
          onChange={onChangeContent}
          value={content}
          defaultValue={selectInfoData.content}
        />
        <Flex justifyContent="center" mt={3}>
          <Button mr={2} onClick={closeModifyPop}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={omSubmit}>
            변경
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closeModifyPop}></div>
    </CateStatePopBox>
  );
}
