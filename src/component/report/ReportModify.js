import { useState } from "react";
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
} from "@chakra-ui/react";
import { BsListCheck } from "react-icons/bs";
import SelectManagerPop from "@component/popup/SelectManagerPop";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import { useEffect } from "react";
import Link from "next/link";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function ReportModify() {
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

  const [initData, setInitData] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_report_view",
        uid: router.query.uid,
      })
      .then((res) => {
        if (res.data.report.writer !== userInfo?.uid) {
          toast({
            description: "다른 작성자의 글은 수정 할 수 없습니다.",
            status: "error",
            duration: 1000,
            isClosable: false,
          });
          router.push("/report");
        }
        setInitData(res.data.report);
      });
  }, []);

  const submitReport = (values) => {
    values.title = values.title || initData.title;
    values.content = values.content || initData.content;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_report_list",
        uid: router.query.uid,
        ...values,
      })
      .then((res) => {
        toast({
          description: "저장되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        router.push("/report");
      });
  };

  const [editorState, setEditorState] = useState();

  const handleEditor = (value) => {
    setEditorState(value);
  };

  const onSubmit = async (values) => {
    values = {
      ...values,
      manager: userInfo.manager_uid,
      writer: userInfo.uid,
      content: editorState,
    };

    submitReport(values);
  };
  return (
    <>
      <CommonForm onSubmit={handleSubmit(onSubmit)}>
        <Flex marginTop={5}>
          <Flex width="100%" flexDirection="column" alignItems="center" gap={2}>
            <FormControl className="row_section" isInvalid={errors.title}>
              <div className="row_box">
                <FormLabel className="label">제목</FormLabel>
                <Input defaultValue={initData?.title} {...register("title")} />
              </div>
              <FormErrorMessage>
                {errors.title && errors.title.message}
              </FormErrorMessage>
            </FormControl>
            {initData && (
              <Editor
                initTypeCon={initData.content}
                handleEditor={handleEditor}
              />
            )}

            {/* submit */}
            <Flex mt={4} gap={2} justifyContent="center">
              <Link href="/report">
                <Button width={120}>목록</Button>
              </Link>
              <Button
                mb={2}
                width={120}
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

export default ReportModify;
