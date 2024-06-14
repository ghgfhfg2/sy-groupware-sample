import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { CommonForm } from "pages/setting";
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { CommonPopup } from "../insa/UserModifyPop";
import { ListUl } from "../insa/UserList";
import styled from "styled-components";

const CateUl = styled(ListUl)`
  width: 100%;
  .body {
    margin-top: 10px;
    gap: 10px;
    li {
      gap: 5px;
    }
  }
  .box {
    &.num {
      flex: 65px 0;
      text-align: center;
    }
  }
`;

export default function RuleCatePop({ cateList, onRender, closeCatePop }) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const {
    handleSubmit,
    register,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const titleWatch = watch("title");
  const toast = useToast();
  const cateRef = useRef();

  const onSubmit = (values) => {
    const list = cateRef.current.querySelectorAll("li");
    let listArr = [];
    list.forEach((el) => {
      const gid = el.querySelector("input[name=gid]").value;
      const title = el.querySelector("input[name=title]").value;
      const uid = el.dataset.uid;
      let obj = {
        uid,
        gid,
        title,
      };
      listArr.push(obj);
    });
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_rule_category",
        listArr,
      })
      .then((res) => {
        toast({
          description: "카테고리가 수정 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      });
  };
  const onAddRuleCate = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_rule_category",
        title: titleWatch,
      })
      .then((res) => {
        resetField("title");
        onRender();
        toast({
          description: "카테고리가 추가 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      });
  };
  const onRemoveCate = (uid) => {
    const agree = confirm("삭제 하시겠습니까?");
    if (!agree) return;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_rule_category",
        uid,
      })
      .then((res) => {
        onRender();
        toast({
          description: "카테고리가 삭제 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      });
  };
  return (
    <>
      <CommonPopup>
        <div className="con_box">
          <CommonForm onSubmit={handleSubmit(onSubmit)}>
            <Flex marginTop={5}>
              <Flex
                width="100%"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <FormControl className="row_section" isInvalid={errors.title}>
                  <div className="row_box">
                    <Input {...register("title")} placeholder="카테고리명" />
                    <Button onClick={onAddRuleCate} ml={2}>
                      추가
                    </Button>
                  </div>
                  <FormErrorMessage>
                    {errors.title && errors.title.message}
                  </FormErrorMessage>
                </FormControl>
                <CateUl>
                  <ul className="header">
                    <li className="box num">순서</li>
                    <li className="box name">이름</li>
                  </ul>
                  <ul className="body" ref={cateRef}>
                    {cateList?.map((el) => (
                      <>
                        <li data-uid={el.uid}>
                          <Input
                            name="gid"
                            className="box num"
                            defaultValue={el.gid}
                            width={70}
                          />
                          <Input
                            name="title"
                            className="box name"
                            defaultValue={el.title}
                          />
                          <Button onClick={() => onRemoveCate(el.uid)}>
                            삭제
                          </Button>
                        </li>
                      </>
                    ))}
                  </ul>
                </CateUl>

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
        </div>
        <div className="bg" onClick={closeCatePop}></div>
      </CommonPopup>
    </>
  );
}
