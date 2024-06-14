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
  Text,
} from "@chakra-ui/react";
import { BsListCheck } from "react-icons/bs";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import UploadBox from "@component/UploadBox";
import SearchUserPop from "@component/popup/SearchUserPop";
import { onSendAlert } from "@component/hooks/sendAlertFunc";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function MessageWrite({ selectWorkInfo }) {
  const router = useRouter();
  useGetUser();
  const toast = useToast();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const userAll = useSelector((state) => state.user.allUser);
  const userInfo = useSelector((state) => state.user.currentUser);
  const [isManagerPop, setIsManagerPop] = useState(false);

  const onManagerPop = () => {
    setIsManagerPop(true);
  };
  const closeManagerPop = () => {
    setIsManagerPop(false);
  };

  const [selectUser, setSelectUser] = useState();
  const onSelectManager = (checkedItems) => {
    setSelectUser(checkedItems);
    closeManagerPop();
  };

  const onResetForm = () => {
    reset();
    handleEditor("");
    setSelectUser("");
    document.querySelector(".se-wrapper-wysiwyg").innerHTML = "<p></p>";
    setEditorState("");
  };

  const submitWork = (values) => {
    const list = JSON.parse(values.recipient);
    onSendAlert(list, "message");
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
        onResetForm();
      });
  };

  const [editorState, setEditorState] = useState();

  const handleEditor = (value) => {
    setEditorState(value);
  };

  const onSubmit = async (values) => {
    values = {
      ...values,
      recipient: JSON.stringify(selectUser),
      writer: userInfo.uid,
      content: editorState,
    };
    submitWork(values);
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
                  <Box size="lg">
                    <Button onClick={onManagerPop} colorScheme="blue">
                      편집
                      <BsListCheck style={{ marginLeft: "5px" }} />
                    </Button>
                    <ul className="manager_list">
                      {userAll &&
                        userAll.map((el) => {
                          if (selectUser?.includes(el.uid)) {
                            return (
                              <li>
                                {el.name}
                                {el.rank && `(${el.rank})`}
                                {el.part && `- ${el.part}`}
                              </li>
                            );
                          }
                        })}
                    </ul>
                  </Box>
                </div>
              </FormControl>
            )}

            <Editor
              height={selectWorkInfo ? "300px" : ""}
              initTypeCon=" "
              handleEditor={handleEditor}
            />

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

      {isManagerPop && userAll && (
        <SearchUserPop
          userData={userAll}
          closeManagerPop={closeManagerPop}
          onSelectManager={onSelectManager}
          selectUser={selectUser}
          isManagerPop={isManagerPop}
        />
      )}
    </>
  );
}

export default MessageWrite;
