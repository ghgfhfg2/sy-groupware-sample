import React, { useState, useEffect } from "react";
import { Button, Flex, Input, useToast } from "@chakra-ui/react";
import { CommonPopup } from "@component/insa/UserModifyPop";
import styled from "styled-components";
import axios from "axios";

export default function ExAttendPop({
  attendData,
  closeExAttendPop,
  curDate,
  onRender,
}) {
  const toast = useToast();
  const [exInput, setExInput] = useState();
  const onChangeInput = (e) => {
    setExInput(e.target.value);
  };
  const onSubmitEx = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_attend_ex",
        uid: attendData.uid,
        comment: exInput,
        state: "1",
      })
      .then((res) => {
        toast({
          description: "예외처리 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        onRender();
        closeExAttendPop();
      });
  };
  return (
    <CommonPopup>
      <div className="con_box">
        <h2 className="title">
          {curDate} {attendData.name}의 예외처리
        </h2>
        <Input width={300} placeholder="예외사유" onChange={onChangeInput} />
        <Flex justifyContent="center" mt={3}>
          <Button colorScheme="blue" width="50%" onClick={onSubmitEx}>
            확인
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closeExAttendPop}></div>
    </CommonPopup>
  );
}
