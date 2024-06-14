import { useEffect, useState } from "react";
import { BoardLi } from "@component/BoardList";
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
  orderByChild,
  orderByValue,
} from "firebase/database";
import shortid from "shortid";
import { format, addMonths, subYears } from "date-fns";
import styled from "styled-components";
import None from "@component/None";
import Link from "next/link";
import { Button, Flex, Input, useToast } from "@chakra-ui/react";
import { comma } from "../CommonFunc";
import PaymentRegistPop from "./PaymentRegistPop";
import ComConfirm from "../popup/Confirm";
import PaymentLogPop from "./PaymentLogPop";

const PaymentLi = styled(BoardLi)`
  li {
    .name {
      max-width: 120px;
      flex: 1;
    }
    .subject {
      flex: 1;
    }
    .date {
      max-width: 120px;
      flex: 1;
    }
    .type {
      width: 150px;
    }
  }
  .body {
    height: auto;
    align-items: center;
    padding: 0.7rem 0;
    .subject {
      justify-content: flex-start;
      padding: 0 1rem;
    }
    .income {
      color: #c53030;
      font-weight: 600;
    }
    .spend {
      color: #2b6cb0;
      font-weight: 600;
    }
  }
  @media screen and (max-width: 1024px) {
    overflow: auto;
    width: 100%;
    li {
      min-width: 650px;
    }
  }
`;

export default function PaymentList() {
  const toast = useToast();
  const [boardList, setBoardList] = useState([]);

  useEffect(() => {
    const pRef = ref(db, `regular/list`);
    onValue(pRef, (data) => {
      let arr = [];
      const list = data.val();
      for (const key in list) {
        list[key].uid = key;
        arr.push(list[key]);
      }
      setBoardList(arr);
    });

    return () => {
      off(pRef);
    };
  }, []);

  const [isPaymentPop, setIsPaymentPop] = useState(false);
  const [isPaymentModiPop, setIsPaymentModiPop] = useState(false);
  const [paymentData, setPaymentData] = useState();
  const onPaymentPop = (uid) => {
    if (uid.target) {
      setIsPaymentPop(true);
      return;
    }
    const curData = boardList.filter((el) => el.uid === uid);
    setPaymentData(curData[0]);
    setIsPaymentModiPop(true);
  };
  const closePaymentPop = () => {
    setIsPaymentPop(false);
    setIsPaymentModiPop(false);
  };

  const onRemove = (uid) => {
    const pRef = ref(db, `regular/list/${uid}`);
    const lRef = ref(db, `regular/log/${uid}`);
    remove(pRef).then(() => {
      remove(lRef);
      toast({
        description: "삭제 되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
    });
  };

  //로그팝업
  const [logData, setLogData] = useState();
  const [isLogPop, setisLogPop] = useState(false);
  const onLogPop = (uid) => {
    const starDate = format(subYears(new Date(), 1), "yyyyMM");
    const lRef = query(
      ref(db, `regular/log/${uid}`),
      orderByValue("dateMonth"),
      startAt(starDate)
    );
    onValue(lRef, (data) => {
      const list = data.val();
      let arr = [];
      for (const key in list) {
        arr.push(list[key]);
      }
      setLogData(arr);
    });
    setisLogPop(true);
  };
  const closeLogPop = () => {
    setisLogPop(false);
  };

  return (
    <>
      <PaymentLi>
        <li className="header">
          <span className="subject">제목</span>
          <span className="income">소득</span>
          <span className="spend">지출</span>
          <span className="date">최근 결재</span>
          <span className="date">결재일</span>
          <span></span>
        </li>
        {boardList &&
          boardList.map((el) => (
            <li className="body" key={shortid()}>
              <span className="subject link" onClick={() => onLogPop(el.uid)}>
                {el.subject}
              </span>
              <span className="income">{comma(el.income)}</span>
              <span className="spend">{comma(el.spend)}</span>
              <span className="date">{el.lastPayment}</span>
              <span className="date">{el?.date}</span>
              <span>
                <Flex flexDirection="column">
                  <Button
                    mb={2}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => onPaymentPop(el.uid)}
                  >
                    수정
                  </Button>
                  <ComConfirm
                    btnTxt="삭제"
                    color="red"
                    desc="삭제 하시겠습니까?"
                    closeTxt="취소"
                    submitTxt="삭제"
                    submit={onRemove}
                    submitProps={el.uid}
                  />
                </Flex>
              </span>
            </li>
          ))}
        {boardList?.length === 0 && <None />}
      </PaymentLi>
      <Flex mt={5} justifyContent="flex-end">
        <Button colorScheme="blue" onClick={onPaymentPop}>
          등록
        </Button>
      </Flex>
      {isPaymentPop && <PaymentRegistPop closePop={closePaymentPop} />}
      {isPaymentModiPop && paymentData && (
        <PaymentRegistPop initValue={paymentData} closePop={closePaymentPop} />
      )}
      {isLogPop && logData && (
        <PaymentLogPop logData={logData} closePop={closeLogPop} />
      )}
    </>
  );
}
