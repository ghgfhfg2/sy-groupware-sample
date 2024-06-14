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
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function ReportWrite() {
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

  const submitReport = (values) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_report_list",
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

            <Editor initTypeCon=" " handleEditor={handleEditor} />

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

export default ReportWrite;
