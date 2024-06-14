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
import RuleCatePop from "@component/rule/RuleCatePop";
import UploadBox from "@component/UploadBox";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function RuleWrite() {
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

  const [render, setRender] = useState(false);
  const [cateList, setCateList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_rule_category",
      })
      .then((res) => {
        setCateList(res.data?.list);
      });
  }, [render]);
  const onRender = () => {
    setRender(!render);
  };

  const submitRule = (values) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_rule_list",
        ...values,
      })
      .then((res) => {
        console.log(res);
        const formData = new FormData();
        uploadList.forEach((el, idx) => {
          formData.append(`file_${idx}`, el);
        });
        formData.append("uid", `${res.data.uid}`);
        formData.append("folder", `rule`);
        axios
          .post(
            process.env.NEXT_PUBLIC_API_URL + "/groupware_upload.php",
            formData,
            {
              headers: {
                "Contest-Type": "multipart/form-data",
              },
            }
          )
          .then((res) => {
            console.log(res);
            toast({
              description: "저장되었습니다.",
              status: "success",
              duration: 1000,
              isClosable: false,
            });
            router.push("/rule");
          });
      });
  };

  const [editorState, setEditorState] = useState();

  const handleEditor = (value) => {
    setEditorState(value);
  };

  const onSubmit = async (values) => {
    values = {
      ...values,
      writer: userInfo.uid,
      content: editorState,
    };

    submitRule(values);
  };

  //카테고리 관리
  const [isCatePop, setIsCatePop] = useState(false);
  const onCatePop = () => {
    setIsCatePop(true);
  };
  const closeCatePop = () => {
    setIsCatePop(false);
  };

  //파일 첨부
  const [uploadList, setUploadList] = useState([]);
  const onAddUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 4194304) {
      toast({
        description: "첨부파일 최대용량은 4MB 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      e.target.value = null;
      return;
    } else {
      const newList = [...uploadList, file];
      setUploadList(newList);
      e.target.value = null;
    }
  };
  const removeFile = (uid) => {
    let newFileList = uploadList;
    newFileList = newFileList.filter((el) => {
      return el.lastModified !== uid;
    });
    setUploadList(newFileList);
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
                  {cateList?.map((el) => (
                    <>
                      <option>{el.title}</option>
                    </>
                  ))}
                </Select>
                <Button onClick={onCatePop} ml={2}>
                  카테고리 관리
                </Button>
              </div>
              <FormErrorMessage>
                {errors.category && errors.category.message}
              </FormErrorMessage>
            </FormControl>

            <Editor initTypeCon=" " handleEditor={handleEditor} />

            <Flex mt={4} width="100%">
              <UploadBox
                onAddUpload={onAddUpload}
                uploadList={uploadList}
                removeFile={removeFile}
              />
            </Flex>

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
      {isCatePop && (
        <RuleCatePop
          onRender={onRender}
          cateList={cateList}
          closeCatePop={closeCatePop}
        />
      )}
    </>
  );
}

export default RuleWrite;
