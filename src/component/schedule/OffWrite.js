import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Button,
  Flex,
  FormLabel,
  HStack,
  Box,
  useRadioGroup,
  useToast,
} from "@chakra-ui/react";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { db } from "src/firebase";
import { ref, set, get } from "firebase/database";
import { format, getMonth, getDate } from "date-fns";
import RadioCard from "@component/RadioCard";
import styled from "styled-components";
import shortid from "shortid";
import ko from "date-fns/locale/ko";
import { CommonForm } from "pages/setting";
import ManagerListPop from "@component/board/ManagerListPop";
import useGetUser from "@component/hooks/getUserDb";
import { onSendAlert } from "../hooks/sendAlertFunc";

export const DayOffList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  li {
    &.header {
      background: #1a365d;
      border-radius: 5px;
      color: #1d4044;
      border: 0;
    }
    &.footer {
      border: 0;
    }
    display: flex;
    border-bottom: 1px solid #e1e1e1;
    span {
      display: flex;
      justify-content: center;
      width: 100px;
      padding: 10px 0;
    }
    .btn {
      margin-left: auto;
    }
  }
`;

const DayOffAdd = styled.div`
  .radio_date_box {
    display: flex;
    label {
      margin-right: 7px;
    }
    .date_box {
      display: flex;
    }
  }
  @media screen and (max-width: 1024px) {
    .radio_date_box {
      flex-direction: column;
      .date_box {
        margin-top: 10px;
      }
    }
  }
`;

export default function OffWrite({ userInfo, userAll }) {
  const toast = useToast();
  const router = useRouter();
  const {
    setValue,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const [offType, setOffType] = useState();
  const options = ["연차", "오전반차", "오후반차"];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "offType",
    onChange: setOffType,
  });

  const group = getRootProps();

  const [selectDate, setSelectDate] = useState(new Date());

  const [offList, setOffList] = useState([]);
  const [totalDay, setTotalDay] = useState();

  const [userData, setUserData] = useState();
  useEffect(() => {
    if (userInfo && userAll) {
      let user = userAll.find((el) => {
        return el.uid === userInfo.manager_uid;
      });
      let obj = {
        ...userInfo,
        manager_uid: user || "",
      };
      setUserData(obj);
    }
  }, [userInfo, userAll]);

  const onAddDayoff = () => {
    let overlapDate = false;
    offList.forEach((el) => {
      if (el.date === format(new Date(selectDate), "yyyy-MM-dd")) {
        overlapDate = true;
      }
    });
    if (overlapDate) {
      toast({
        description: "이미 추가된 날짜 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (!offType) {
      toast({
        description: "유형을 선택해 주세요",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    let obj = {
      offType,
      date: format(new Date(selectDate), "yyyy-MM-dd"),
      timestamp: new Date().getTime(),
      day: offType === "연차" ? 1 : 0.5,
    };
    setOffList([...offList, obj]);
  };

  const onRemoveDayOff = (time) => {
    let newList = offList.filter((el) => {
      if (el.timestamp != time) {
        return el;
      }
    });
    setOffList(newList);
  };

  useEffect(() => {
    let sum =
      offList &&
      offList.reduce((acc, cur) => {
        return acc + cur.day;
      }, 0);
    setTotalDay(sum);
  }, [offList]);

  const onSubmit = (values) => {
    get(ref(db, `user/${userInfo.uid.trim()}/dayoff`))
      .then((data) => {
        if (data.val() < totalDay) {
          alert("휴가가 부족합니다.");
          return false;
        }
        return true;
      })
      .then((res) => {
        if (res) {
          return new Promise((resolve) => {
            if (offList.length < 1) {
              toast({
                description: "휴가리스트를 추가해 주세요",
                status: "error",
                duration: 1000,
                isClosable: false,
              });
              resolve();
              return;
            }
            const uid = shortid.generate();
            set(ref(db, `dayoff/temp/${uid}/`), {
              subject: values.subject,
              reason: values.reason,
              userUid: userInfo.uid,
              userName: userInfo.name,
              manager: checkManagerList,
              nextManager: checkManagerList[0],
              cancelManager: "",
              timestamp: new Date().getTime(),
              list: offList,
            })
              .then(() => {
                toast({
                  description: "제출완료 되었습니다.",
                  status: "success",
                  duration: 1000,
                  isClosable: false,
                });
                let alertUserList = checkManagerList.map((el) => el.id);
                onSendAlert(alertUserList, "dayoff");
              })
              .then(() => {
                onFormInit();
                router.push("/schedule/sign_ready");
              })
              .catch((error) => {
                console.error(error);
              });
          });
        }
      });
    return;
  };

  const onFormInit = () => {
    setOffList([]);
    setValue("subject", "");
    setValue("reason", "");
  };

  //결재자 선택
  const [managerList, setManagerList] = useState();
  const [checkManagerList, setCheckManagerList] = useState();
  useEffect(() => {
    if (userAll) {
      let list = userAll.filter((el) => el.manager === 1);
      setManagerList(list);
    }
  }, [userAll]);
  const [isManagerPop, setIsManagerPop] = useState(false);
  const onManagerPop = () => {
    setIsManagerPop(true);
  };
  const closeManagerPop = () => {
    setIsManagerPop(false);
  };
  const onSelectManager = (checkedItems) => {
    let newList = checkedItems.sort((a, b) => {
      return a.value - b.value;
    });
    setCheckManagerList(newList);
    let val = newList.map((el) => el.name).join(",");
    setValue("manager", val);
    closeManagerPop();
  };

  return (
    <>
      {isManagerPop && managerList && (
        <ManagerListPop
          userData={managerList}
          closeManagerPop={closeManagerPop}
          onSelectManager={onSelectManager}
          isManagerPop={isManagerPop}
        />
      )}
      {userData && (
        <CommonForm style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
          <Flex>
            <Flex width="100%" flexDirection="column" gap={2}>
              <FormControl isInvalid={errors.subject}>
                <div className="row_box">
                  <FormLabel className="label" htmlFor="subject">
                    제목
                  </FormLabel>
                  <Input
                    id="subject"
                    className="lg"
                    placeholder="* 제목"
                    {...register("subject", {
                      required: "제목은 필수항목 입니다.",
                    })}
                  />
                </div>
                <FormErrorMessage>
                  {errors.subject && errors.subject.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.reason}>
                <div className="row_box">
                  <FormLabel className="label" htmlFor="reason">
                    사유
                  </FormLabel>
                  <Input
                    id="reason"
                    placeholder="사유"
                    {...register("reason")}
                  />
                </div>
                <FormErrorMessage>
                  {errors.reason && errors.reason.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.manager}>
                <div className="row_box">
                  <FormLabel className="label" htmlFor="reason">
                    담당자
                  </FormLabel>
                  <Input
                    id="manager"
                    placeholder="결재자"
                    value={
                      checkManagerList && checkManagerList.map((el) => el.name)
                    }
                    readOnly
                    className="xs"
                    {...register("manager", {
                      required: "담당자는 필수항목 입니다.",
                    })}
                  />
                  <div className="manager_sel_btn_box">
                    <Button colorScheme="blue" onClick={onManagerPop} ml={2}>
                      결재자 선택
                    </Button>
                  </div>
                </div>
                <FormErrorMessage>
                  {errors.manager && errors.manager.message}
                </FormErrorMessage>
              </FormControl>

              <div className="row_box">
                <FormLabel className="label" htmlFor="reason">
                  남은연차
                </FormLabel>
                {userInfo?.dayoff ? `${userInfo.dayoff}개` : `0개`}
              </div>

              <div className="row_box">
                <FormLabel className="label" htmlFor="type"></FormLabel>
                <DayOffAdd className="lg" {...group}>
                  <div className="radio_date_box">
                    <Flex>
                      {options.map((value) => {
                        const radio = getRadioProps({ value });
                        return (
                          <RadioCard key={value} {...radio}>
                            {value}
                          </RadioCard>
                        );
                      })}
                    </Flex>
                    <div className="date_box">
                      <Box mr={2}>
                        <DatePicker
                          style={{ width: "100px" }}
                          selected={selectDate}
                          onChange={(date) => setSelectDate(date)}
                          locale={ko}
                          dateFormat="yyyy.MM.dd (eee)"
                          showPopperArrow={false}
                          customInput={<Input />}
                        />
                      </Box>
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={onAddDayoff}
                      >
                        <Box fontSize="14px">추가</Box>
                        <AiOutlinePlus />
                      </Button>
                    </div>
                  </div>
                  {offList?.length > 0 && (
                    <DayOffList>
                      <li className="header">
                        <span className="type">유형</span>
                        <span className="date">날짜</span>
                        <span className="day">일수</span>
                        <span className="btn"></span>
                      </li>
                      {offList.map((el) => (
                        <>
                          <li>
                            <span className="type">{el.offType}</span>
                            <span className="date">{el.date}</span>
                            <span className="day">{el.day}</span>
                            <span className="btn">
                              <Button
                                size="xs"
                                onClick={() => onRemoveDayOff(el.timestamp)}
                                colorScheme="blue"
                                variant="outline"
                              >
                                <AiOutlineDelete fontSize="1rem" /> 삭제
                              </Button>
                            </span>
                          </li>
                        </>
                      ))}
                      <li className="footer">
                        <span>합계일수</span>
                        <span></span>
                        <span>{totalDay}</span>
                      </li>
                    </DayOffList>
                  )}
                </DayOffAdd>
              </div>
              <Flex mt={4} width="100%" justifyContent="center">
                <Button
                  width="150px"
                  size="lg"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  제출
                  {isSubmitting}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </CommonForm>
      )}
    </>
  );
}
