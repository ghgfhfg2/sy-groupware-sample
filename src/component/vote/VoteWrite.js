import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { CommonForm } from "pages/setting";
import { useForm } from "react-hook-form";
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Button,
  Input,
  Box,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  Select,
} from "@chakra-ui/react";
import { BsListCheck } from "react-icons/bs";
import SelectManagerPop from "@component/popup/SelectManagerPop";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";

export default function VoteWrite() {
  const router = useRouter();
  useGetUser();
  const toast = useToast();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();
  const userAll = useSelector((state) => state.user.allUser);
  const userInfo = useSelector((state) => state.user.currentUser);

  const onSubmit = async (values) => {
    values = {
      ...values,
      mem_uid: userInfo.uid,
    };
    regisVote(values);
  };

  const regisVote = async (values) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_vote_list",
        ...values,
      })
      .then((res) => {
        console.log(res);
      });
  };
  return (
    <>
      <CommonForm onSubmit={handleSubmit(onSubmit)}>
        <Flex marginTop={5}>
          <Flex width="100%" flexDirection="column" alignItems="center" gap={2}>
            <FormControl className="row_section" isInvalid={errors.title}>
              <div className="row_box">
                <FormLabel className="label">제목</FormLabel>
                <Input
                  {...register("title", {
                    required: "제목은 필수항목 입니다.",
                  })}
                />
              </div>
              <FormErrorMessage>
                {errors.title && errors.title.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl className="row_section" isInvalid={errors.category}>
              <div className="row_box">
                <FormLabel className="label">카테고리</FormLabel>
                <Select
                  width={200}
                  {...register("category", {
                    required: "카테고리는 필수항목 입니다.",
                  })}
                >
                  <option value="">카테고리 선택</option>
                  <option value="점심">점심</option>
                  <option value="회식">회식</option>
                  <option value="기타">기타</option>
                </Select>
              </div>
              <FormErrorMessage>
                {errors.category && errors.category.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl className="row_section">
              <div className="row_box">
                <FormLabel className="label">마감시간</FormLabel>
                <Input
                  type="time"
                  placeholder="분"
                  width={150}
                  {...register("limit_time")}
                />
                <Box ml={3}>※ 입력시간에 종료. 미입력시 무한대</Box>
              </div>
            </FormControl>
            <FormControl className="row_section">
              <div className="row_box">
                <FormLabel className="label">공개여부</FormLabel>
                <RadioGroup defaultValue="1">
                  <Stack direction="row">
                    <Radio {...register("secret")} value="1">
                      비공개
                    </Radio>
                    <Radio {...register("secret")} value="2">
                      공개
                    </Radio>
                  </Stack>
                </RadioGroup>
              </div>
            </FormControl>

            {/* submit */}
            <Flex
              width="150px"
              mt={4}
              flexDirection="column"
              justifyContent="center"
            >
              <Button
                mb={2}
                width="100%"
                size="lg"
                colorScheme="blue"
                isLoading={isSubmitting}
                type="submit"
              >
                저장
                {isSubmitting}
              </Button>
            </Flex>
            {/* submit */}
          </Flex>
        </Flex>
      </CommonForm>
    </>
  );
}
