import { useEffect, useState } from "react";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Select,
  Button,
  Flex,
  FormLabel,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { db } from "src/firebase";
import { get, set, ref, update } from "firebase/database";
import { useDispatch } from "react-redux";
import { updateAllUser } from "@redux/actions/user_action";
import styled from "styled-components";
import shortid from "shortid";
import { format } from "date-fns";

export const CommonPopup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  animation: fadeIn 0.2s forwards;
  opacity: 0;
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  .bg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.25);
  }
  .con_box {
    border-radius: 10px;
    background: #fff;
    height: 90vh;
    overflow: auto;
    max-height: 600px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
    padding: 1rem;
    transform: translateY(30px);
    z-index: 10;
    animation: fadeUp 0.2s forwards;
  }
  @keyframes fadeUp {
    to {
      transform: translateY(0);
    }
  }
`;

export default function UserDayoffPop({ userData, closeDayoffPop, onRender }) {
  const toast = useToast();
  const dispatch = useDispatch();
  const [userPartRank, setUserPartRank] = useState();
  useEffect(() => {
    get(ref(db, `admin/setting`)).then((data) => {
      const adminSet = data.val();
      let obj = { part: "", rank: "" };
      adminSet.part &&
        adminSet.part.forEach((el) => {
          if (userData.part === el.uid) {
            obj.part = el.name;
          }
        });
      adminSet.rank &&
        adminSet.rank.forEach((el) => {
          if (userData.rank === el.uid) {
            obj.rank = el.name;
          }
        });
      setUserPartRank(obj);
    });
  }, []);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  function onSubmit(values) {
    if (!values.modiType) {
      toast({
        description: "증감을 선택해 주세요.",
        status: "info",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    let newUserData = { ...userData };

    if (values.modiType === "1") {
      newUserData.dayoff = Number(newUserData.dayoff || 0) + Number(values.day);
    } else {
      newUserData.dayoff = Number(newUserData.dayoff || 0) - Number(values.day);
    }
    if (newUserData.dayoff < 0) {
      toast({
        description: "휴가는 0개 미만이 될 수 없습니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }

    const date = format(new Date(), "yyyy-MM-dd");
    values.date = date;
    values.manager = "";
    values.subject = "관리자 수정";
    values.timestamp = new Date().getTime();
    values.uid = "";
    values.name = newUserData.name;
    values.userUid = newUserData.uid;
    values.offType = values.modiType === "1" ? "추가" : "삭감";
    values.restDayoff = newUserData.dayoff || values.day;

    newUserData.date = date;
    newUserData.part = userPartRank.part;
    newUserData.rank = userPartRank.rank;

    return new Promise((resolve) => {
      set(
        ref(
          db,
          `dayoff/list/${format(new Date(), "yyyyMMdd")}/${shortid.generate()}`
        ),
        {
          ...values,
        }
      );
      update(ref(db, `user/${userData.uid}`), {
        dayoff: Number(newUserData.dayoff),
      })
        .then(() => {
          dispatch(updateAllUser(newUserData));
          toast({
            description: "수정 되었습니다.",
            status: "success",
            duration: 1000,
            isClosable: false,
          });
          closeDayoffPop();
          onRender();
          resolve();
        })
        .catch((error) => {
          console.error(error);
          resolve();
        });
    });
  }

  return (
    <CommonPopup>
      <div className="con_box">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex justifyContent="center" marginTop={3}>
            <Flex
              maxWidth={400}
              width="100%"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              {userPartRank && (
                <Text fontSize="md">{`${userData.name}(${userPartRank.part})`}</Text>
              )}
              <FormControl>
                <Flex justifyContent="flex-end" alignItems="center">
                  <FormLabel style={{ flexShrink: "0", marginBottom: "0" }}>
                    남은연차
                  </FormLabel>
                  {userData.dayoff} 개
                </Flex>
              </FormControl>

              <Flex>
                <FormControl mr={2} isInvalid={errors.modiType}>
                  <Select placeholder="증감선택" {...register("modiType")}>
                    <option value="1">추가</option>
                    <option value="2">감소</option>
                  </Select>
                </FormControl>
                <FormControl isInvalid={errors.day}>
                  <Input
                    type="number"
                    step={0.5}
                    textAlign="right"
                    placeholder="수정할 연차 수"
                    {...register("day")}
                  />
                </FormControl>
              </Flex>

              <FormControl isInvalid={errors.reason}>
                <Flex alignItems="center">
                  <Input
                    type="text"
                    placeholder="사유"
                    {...register("reason")}
                  />
                </Flex>
              </FormControl>

              <Flex mt={4} width="100%" justifyContent="center">
                <Button
                  mb={2}
                  width="100%"
                  colorScheme="blue"
                  variant="outline"
                  mr={2}
                  isLoading={isSubmitting}
                  onClick={closeDayoffPop}
                >
                  취소
                  {isSubmitting}
                </Button>
                <Button
                  mb={2}
                  width="100%"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  수정
                  {isSubmitting}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </form>
      </div>
      <div className="bg" onClick={closeDayoffPop}></div>
    </CommonPopup>
  );
}
