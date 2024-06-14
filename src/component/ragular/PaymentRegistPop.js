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
import { numberToKorean } from "@component/CommonFunc";
import styled from "styled-components";
import shortid from "shortid";
const PaymentPopup = styled(CommonPopup)`
  .row_box {
    display: flex;
    align-items: center;
    .price {
      flex-shrink: 0;
      margin-left: 5px;
      color: #858585;
    }
  }
`;

export default function PaymentRegistPop({ closePop, initValue }) {
  const incomeRef = useRef();
  const spendRef = useRef();
  const toast = useToast();

  const {
    setValue,
    watch,
    handleSubmit,
    getValues,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const watchPrice = watch(["income", "spend"]);
  useEffect(() => {
    const income = watchPrice[0];
    const spend = watchPrice[1];
    if (income > 10000000000) {
      setValue("income", 10000000000);
    }
    if (spend > 10000000000) {
      setValue("spend", 10000000000);
    }
    const formatIncome = numberToKorean(income);
    const formatSpend = numberToKorean(spend);
    incomeRef.current.innerText = formatIncome ? `${formatIncome}원` : null;
    spendRef.current.innerText = formatSpend ? `${formatSpend}원` : null;
  }, [watchPrice]);

  function onSubmit(values) {
    const pRef = ref(db, `regular/list/${shortid.generate()}`);
    set(pRef, {
      ...values,
    }).then(() => {
      toast({
        description: "등록되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
      closePop();
    });
  }

  const onModify = () => {
    const pRef = ref(db, `regular/list/${initValue.uid}`);
    let obj = {
      date: getValues("date"),
      income: getValues("income"),
      spend: getValues("spend"),
      subject: getValues("subject"),
    };
    update(pRef, {
      ...obj,
    }).then(() => {
      toast({
        description: "수정되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
      closePop();
    });
  };

  return (
    <>
      <PaymentPopup>
        <div className="con_box" style={{ width: "100%", maxWidth: "400px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex justifyContent="center" marginTop={3}>
              <Flex
                maxWidth={400}
                width="100%"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <FormControl isInvalid={errors.subject}>
                  <Input
                    type="text"
                    defaultValue={initValue?.subject}
                    placeholder="제목"
                    {...register("subject", {
                      required: "제목은 필수항목 입니다.",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.subject && errors.subject.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.date}>
                  <Input
                    id="date"
                    type="date"
                    placeholder="날짜"
                    defaultValue={initValue?.date}
                    register={register}
                    {...register("date", {
                      required: "날짜는 필수항목 입니다.",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.date && errors.date.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl>
                  <div className="row_box">
                    <Input
                      id="income"
                      type="number"
                      defaultValue={initValue?.income}
                      placeholder="소득금액"
                      {...register("income")}
                    />
                    <div className="price" ref={incomeRef}></div>
                  </div>
                </FormControl>
                <FormControl>
                  <div className="row_box">
                    <Input
                      id="spend"
                      type="number"
                      defaultValue={initValue?.spend}
                      placeholder="지출금액"
                      {...register("spend")}
                    />
                    <div className="price" ref={spendRef}></div>
                  </div>
                </FormControl>
                <Flex
                  mt={4}
                  width="100%"
                  flexDirection="column"
                  justifyContent="center"
                >
                  {initValue ? (
                    <>
                      <Button
                        mb={2}
                        width="100%"
                        colorScheme="blue"
                        isLoading={isSubmitting}
                        onClick={onModify}
                      >
                        수정
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        mb={2}
                        width="100%"
                        colorScheme="blue"
                        isLoading={isSubmitting}
                        type="submit"
                      >
                        등록
                      </Button>
                    </>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </form>
        </div>
        <div className="bg" onClick={closePop}></div>
      </PaymentPopup>
    </>
  );
}
