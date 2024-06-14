import React, { useState, useEffect, useRef } from "react";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Select,
  Button,
  Flex,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { CommonPopup } from "@component/insa/UserModifyPop";
import styled from "styled-components";
const AddLunchPopBox = styled(CommonPopup)`
  .con_box {
    width: 300px;
    h2 {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: 600;
    }
  }
`;

export default function AddLunchPop({ closePop, submitAddAtend }) {
  const [selectTime, setSelectTime] = useState();

  const [addLunchVal, setAddLunchVal] = useState();
  const onChangeSelect = (e) => {
    setAddLunchVal(e.target.value);
  };

  useEffect(() => {
    const curTime = "" + new Date().getHours() + new Date().getMinutes();
    let arr;
    if (curTime <= 900) {
      arr = [
        { val: 0, tit: "없음" },
        { val: 15, tit: "15분" },
        { val: 30, tit: "30분" },
        { val: 45, tit: "45분" },
        { val: 60, tit: "1시간" },
      ];
    }
    if (curTime > 900 && curTime <= 915) {
      arr = [
        { val: 0, tit: "없음" },
        { val: 15, tit: "15분" },
        { val: 30, tit: "30분" },
        { val: 45, tit: "45분" },
      ];
    }
    if (curTime > 915 && curTime <= 930) {
      arr = [
        { val: 0, tit: "없음" },
        { val: 15, tit: "15분" },
        { val: 30, tit: "30분" },
      ];
    }
    if (curTime > 930 && curTime <= 945) {
      arr = [
        { val: 0, tit: "없음" },
        { val: 15, tit: "15분" },
      ];
    }
    if (curTime > 945) {
      arr = [{ val: 0, tit: "없음" }];
    }
    setSelectTime(arr);
  }, []);

  const onSubmitAddLunch = () => {
    submitAddAtend(1, addLunchVal);
  };

  return (
    <AddLunchPopBox>
      <div className="con_box">
        <h2>점심 탄력 체크</h2>
        <Select onChange={onChangeSelect}>
          {selectTime &&
            selectTime.map((el) => (
              <>
                <option value={el.val}>{el.tit}</option>
              </>
            ))}
        </Select>
        <Flex justifyContent="center">
          <Button
            onClick={onSubmitAddLunch}
            width="100%"
            colorScheme="blue"
            mt={3}
          >
            확인
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closePop}></div>
    </AddLunchPopBox>
  );
}
