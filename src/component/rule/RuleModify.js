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
  Select,
} from "@chakra-ui/react";
import { BsListCheck } from "react-icons/bs";
import SelectManagerPop from "@component/popup/SelectManagerPop";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import { useEffect } from "react";
import Link from "next/link";
import UploadBox from "@component/UploadBox";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function RuleModify() {
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

  const [cateList, setCateList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_rule_category",
      })
      .then((res) => {
        setCateList(res.data.list);
      });
  }, []);

  const [initData, setInitData] = useState();
  const [initUpload, setInitUpload] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_rule_view",
        uid: router.query.uid,
      })
      .then((res) => {
        const resData = res.data.rule;
        if (resData.writer !== userInfo?.uid) {
          toast({
            description: "다른 작성자의 글은 수정 할 수 없습니다.",
            status: "error",
            duration: 1000,
            isClosable: false,
          });
          router.push("/rule");
        }
        let imgArr;
        if (resData.images) {
          imgArr = JSON.parse(resData.images);
          imgArr = imgArr.map((el) => {
            el = resData.upload + el;
            return el;
          });
          setInitUpload(imgArr);
        }
        setInitData(resData);
      });
  }, []);

  const submitRule = (values) => {
    values.title = values.title || initData.title;
    values.content = values.content || initData.content;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_rule_list",
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
        router.push("/rule");
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

    submitRule(values);
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

  const removeInitFile = (img) => {
    const agree = confirm("이미지가 즉시 삭제 됩니다.\n삭제 하시겠습니까?");
    if (!agree) return;
    const newInit = initUpload.filter((el) => el != img);
    const jsonArr = newInit.length > 1 ? JSON.stringify(newInit) : "";

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_work_img",
        img,
        images: jsonArr,
        uid: viewData.uid,
      })
      .then((res) => {
        toast({
          description: "삭제되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      });
    setInitUpload(newInit);
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
            <FormControl className="row_section" isInvalid={errors.category}>
              <div className="row_box">
                <FormLabel className="label">카테고리</FormLabel>
                {initData && initData.category && (
                  <Select
                    defaultValue={initData.category}
                    width={200}
                    {...register("category", {
                      required: "카테고리는 필수항목 입니다.",
                    })}
                  >
                    <option value="">카테고리 선택</option>
                    {cateList?.map((el) => (
                      <>
                        <option value={el.title}>{el.title}</option>
                      </>
                    ))}
                  </Select>
                )}
              </div>
              <FormErrorMessage>
                {errors.category && errors.category.message}
              </FormErrorMessage>
            </FormControl>
            {initData && (
              <>
                <Editor
                  initTypeCon={initData.content}
                  handleEditor={handleEditor}
                />
                <Flex mt={4} width="100%">
                  <UploadBox
                    onAddUpload={onAddUpload}
                    uploadList={uploadList}
                    initUpload={initUpload}
                    removeFile={removeFile}
                    removeInitFile={removeInitFile}
                  />
                </Flex>
              </>
            )}

            {/* submit */}
            <Flex mt={4} gap={2} justifyContent="center">
              <Link href="/rule">
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

export default RuleModify;
