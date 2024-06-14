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
import { useForm } from "react-hook-form";
import { db } from "src/firebase";
import { ref, set, update } from "firebase/database";
import { useDispatch } from "react-redux";
import { CommonPopup } from "../insa/UserModifyPop";
import { comma, numberToKorean } from "@component/CommonFunc";
import styled from "styled-components";
import shortid from "shortid";
import { BoardLi } from "@component/BoardList";
import { format } from "date-fns";
const PaymentPopup = styled(CommonPopup)`
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export default function PaymentAlertPop({ closePop, regularList }) {
  const toast = useToast();

  const onPayment = (el) => {
    const pRef = ref(
      db,
      `stats/price/${format(new Date(), "yyyyMMdd")}${shortid.generate()}`
    );
    const obj = {
      ...el,
      dateMonth: format(new Date(), "yyyyMM"),
    };
    const uid = obj.uid;
    delete obj.uid;
    const logRef = ref(
      db,
      `regular/log/${uid}/${format(
        new Date(),
        "yyyyMMdd"
      )}${shortid.generate()}`
    );
    set(logRef, {
      ...obj,
    });
    update(ref(db, `regular/list/${uid}`), {
      lastPayment: obj.dateMonth,
    })
      .then(() => {
        set(logRef, {
          ...obj,
        });
        set(pRef, {
          ...obj,
        });
      })
      .then(() => {
        toast({
          description: "결재처리 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      });
  };

  return (
    <>
      <PaymentPopup>
        <div className="con_box" style={{ width: "100%", maxWidth: "400px" }}>
          <h2 className="title">정기결제</h2>
          <BoardLi>
            <li className="header">
              <span>제목</span>
              <span>소득</span>
              <span>지출</span>
              <span></span>
            </li>
            {regularList &&
              regularList.map((el, idx) => (
                <li key={idx}>
                  <span>{el.subject}</span>
                  <span>{comma(el.income)}</span>
                  <span>{comma(el.spend)}</span>
                  <span>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => onPayment(el)}
                    >
                      결재
                    </Button>
                  </span>
                </li>
              ))}
          </BoardLi>
        </div>
        <div className="bg" onClick={closePop}></div>
      </PaymentPopup>
    </>
  );
}
