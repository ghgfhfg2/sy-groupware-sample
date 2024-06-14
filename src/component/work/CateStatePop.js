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
} from "@chakra-ui/react";
export const CateStatePopBox = styled(CommonPopup)`
  .con_box {
    height: auto;
    padding: 30px 20px;
    min-width: 400px;
  }
`;

export default function CateStatePop({
  selectCateInfo,
  closeCatePop,
  reRender,
}) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const toast = useToast();
  const [cateState, setCateState] = useState();
  const onChangeCateState = (e) => {
    setCateState(e);
  };

  const [comment, setComment] = useState();
  const onChangeComment = (e) => {
    setComment(e.target.value);
  };

  const submitCateState = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_cate_state",
        state: cateState,
        comment,
        writer: userInfo.uid,
        cuid: selectCateInfo.uid,
      })
      .then((res) => {
        toast({
          description: "상태가 변경 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        closeCatePop();
        reRender();
      });
  };

  return (
    <CateStatePopBox>
      <div className="con_box">
        <Flex justifyContent="center" mb={4}>
          <Text fontSize="lg">[{selectCateInfo.title}] 카테고리 상태변경</Text>
        </Flex>
        <RadioGroup
          defaultValue={selectCateInfo.state}
          mb={3}
          onChange={onChangeCateState}
          value={cateState}
        >
          <Stack direction="row" justifyContent="center" gap={3}>
            <Radio
              isDisabled={selectCateInfo.state == 0 ? true : false}
              value="0"
            >
              대기
            </Radio>
            <Radio
              isDisabled={selectCateInfo.state == 1 ? true : false}
              value="1"
            >
              진행
            </Radio>
            <Radio
              isDisabled={selectCateInfo.state == 2 ? true : false}
              value="2"
            >
              완료
            </Radio>
          </Stack>
        </RadioGroup>
        <Flex>
          <Input
            placeholder="의견"
            onChange={onChangeComment}
            value={comment}
          />
        </Flex>
        <Flex justifyContent="center" mt={3}>
          <Button mr={2} onClick={closeCatePop}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={submitCateState}>
            변경
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closeCatePop}></div>
    </CateStatePopBox>
  );
}
