import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
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
import { CommonForm } from "pages/setting";
import axios from "axios";
import styled from "styled-components";
import { CommonPopup } from "../insa/UserDayoffPop";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

const MessageReplyPopBox = styled(CommonPopup)`
  .con_box {
    width: 90%;
    max-width: 600px;
  }
`;

export default function MeessageReplyPop({
  msgData,
  closeReplyPop,
  closeMessagePop,
  onRender,
}) {
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const [editorState, setEditorState] = useState();

  const handleEditor = (value) => {
    setEditorState(value);
  };

  function onSubmit(values) {
    values = {
      ...values,
      recipient: JSON.stringify([msgData.writer]),
      writer: userInfo.uid,
      content: editorState,
    };
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_message_list",
        ...values,
      })
      .then((res) => {
        toast({
          description: "쪽지를 보냈습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        closeReplyPop();
        if (closeMessagePop) {
          closeMessagePop();
        }
        if (onRender) {
          onRender();
        }
      });
  }

  return (
    <MessageReplyPopBox>
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
                  <FormLabel className="label">제목</FormLabel>
                  <Input
                    {...register("title", {
                      required: "제목 필수항목 입니다.",
                    })}
                  />
                </div>
                <FormErrorMessage>
                  {errors.title && errors.title.message}
                </FormErrorMessage>
              </FormControl>

              {!userInfo.partner && (
                <FormControl isInvalid={errors.manager} className="row_section">
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="manager">
                      받는사람
                    </FormLabel>
                    {msgData.name}({msgData.rank})
                  </div>
                </FormControl>
              )}

              <Editor
                height="200px"
                initTypeCon=" "
                handleEditor={handleEditor}
              />

              {/* submit */}
              <Flex mt={4} justifyContent="center">
                <Button onClick={closeReplyPop} width={150} mr={2} size="md">
                  취소
                </Button>
                <Button
                  mb={2}
                  width={150}
                  size="md"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  보내기
                  {isSubmitting}
                </Button>
              </Flex>
              {/* submit */}
            </Flex>
          </Flex>
        </CommonForm>
      </div>
      <div className="bg" onClick={closeReplyPop}></div>
    </MessageReplyPopBox>
  );
}
