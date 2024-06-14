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
import UploadBox from "@component/UploadBox";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function WorkModify() {
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
  const [isManagerPop, setIsManagerPop] = useState(false);

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
        console.log(res);
        toast({
          description: "삭제되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      });
    setInitUpload(newInit);
  };

  //카테고리
  const [cateUid1, setCateUid1] = useState();
  const [cateUid2, setCateUid2] = useState();
  const [cateUid3, setCateUid3] = useState();

  const CateDataProcessing = (initArray) => {
    let depthArr2 = [];
    let depthArr3 = [];

    let cateArr = [];

    initArray.forEach((el) => {
      const depth = el.depth.split("_");
      if (depth.length == 1) {
        cateArr.push(el);
      }
      if (depth.length == 2) {
        depthArr2.push(el);
      }
      if (depth.length == 3) {
        depthArr3.push(el);
      }
    });

    cateArr.sort((a, b) => a.depth - b.depth);

    depthArr3.forEach((d3) => {
      const idx = depthArr2.findIndex(
        (d2) =>
          d2.depth.split("_")[0] == d3.depth.split("_")[0] &&
          d2.depth.split("_")[1] == d3.depth.split("_")[1]
      );
      if (depthArr2[idx].sub) {
        depthArr2[idx].sub.push(d3);
      } else {
        depthArr2[idx].sub = [d3];
      }
    });

    depthArr2.forEach((d2) => {
      if (d2.sub) {
        d2.sub.sort((a, b) => a.depth.split("_")[2] - b.depth.split("_")[2]);
      }
      const idx = cateArr.findIndex(
        (d1) => d1.depth.split("_")[0] == d2.depth.split("_")[0]
      );
      if (cateArr[idx].sub) {
        cateArr[idx].sub.push(d2);
      } else {
        cateArr[idx].sub = [d2];
      }
    });

    cateArr.forEach((el) => {
      if (el.sub) {
        el.sub.sort((a, b) => a.depth.split("_")[1] - b.depth.split("_")[1]);
      }
    });
    return cateArr;
  };

  //카테고리 선택
  const [selectCateDepth2, setSelectCateDepth2] = useState();
  const [selectCateDepth3, setSelectCateDepth3] = useState();

  const onChangeCate = (e, depth) => {
    let uid = e.target.value;

    if (depth == 1) {
      setSelectCateDepth2("");
      setSelectCateDepth3("");
      setCateUid2("");
      setCateUid3("");
      if (uid) {
        for (let i = 0; i < cateList.length; i++) {
          if (cateList[i].uid == uid && cateList[i].sub) {
            setCateUid1(cateList[i]);
            setSelectCateDepth2(cateList[i].sub);
          }
        }
      } else {
        setCateUid1("");
      }
    } else if (depth == 2) {
      if (uid) {
        for (let i = 0; i < selectCateDepth2.length; i++) {
          if (selectCateDepth2[i].uid == uid && selectCateDepth2[i].sub) {
            setSelectCateDepth3(selectCateDepth2[i].sub);
            setCateUid2(selectCateDepth2[i]);
            setCateUid3("");
          }
        }
      } else {
        setCateUid2("");
        setCateUid3("");
        setSelectCateDepth3("");
      }
    } else {
      if (uid) {
        for (let i = 0; i < selectCateDepth3.length; i++) {
          if (selectCateDepth3[i].uid == uid) {
            setCateUid3(selectCateDepth3[i]);
          }
        }
      } else {
        setCateUid3("");
      }
    }
  };

  const [cateList, setCateList] = useState();
  useEffect(() => {
    axios &&
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
          a: "get_cate_list",
        })
        .then((res) => {
          const cate = res.data.cate;
          const list = CateDataProcessing(cate);
          setCateList(list);
        });
  }, []);

  const [viewData, setViewData] = useState();
  const [initUpload, setInitUpload] = useState();
  useEffect(() => {
    if (!cateList) return;
    const uid = router.query.uid;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_work_view",
        uid,
      })
      .then((res) => {
        const resData = res.data.work;
        resData.cate_1 = resData.cate_1 ? JSON.parse(resData.cate_1) : "";
        resData.cate_2 = resData.cate_2 ? JSON.parse(resData.cate_2) : "";
        resData.cate_3 = resData.cate_3 ? JSON.parse(resData.cate_3) : "";
        const writer = userAll?.find((user) => resData.writer === user.uid);
        const managerArr = resData.manager ? JSON.parse(resData.manager) : [];

        let temp;
        for (let i = 0; i < cateList.length; i++) {
          if (cateList[i].uid == resData.cate_1.uid && cateList[i].sub) {
            setCateUid1(cateList[i]);
            temp = cateList[i].sub;
            setSelectCateDepth2(cateList[i].sub);
          }
        }

        let temp2;
        if (resData.cate_2) {
          for (let i = 0; i < temp.length; i++) {
            if (temp[i].uid == resData.cate_2.uid && temp[i].sub) {
              temp2 = temp[i].sub;
              setSelectCateDepth3(temp[i].sub);
              setCateUid2(temp[i]);
            }
          }
        }

        if (resData.cate_3) {
          for (let i = 0; i < temp2.length; i++) {
            if (temp2[i].uid == resData.cate_3.uid) {
              setCateUid3(temp2[i]);
            }
          }
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
        setViewData({
          ...writer,
          ...resData,
          manager: managerArr,
        });
      });
  }, [cateList]);

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

  //유형
  const [typeRadio, setTypeRadio] = useState(viewData?.type);

  const submitWork = (values) => {
    values.content = editorState || viewData.content;
    values.type = typeRadio || viewData.type;
    values.title = values.title || viewData.title;
    values.manager = values.manager || viewData.manager;

    values.cate_1 = JSON.stringify({
      uid: cateUid1.uid,
      title: cateUid1.title,
      depth: cateUid1.depth,
    });
    values.cate_2 = cateUid2
      ? JSON.stringify({
          uid: cateUid2.uid,
          title: cateUid2.title,
          depth: cateUid2.depth,
        })
      : "";
    values.cate_3 = cateUid3
      ? JSON.stringify({
          uid: cateUid3.uid,
          title: cateUid3.title,
          depth: cateUid3.depth,
        })
      : "";

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_work_list",
        uid: router.query.uid,
        ...values,
      })
      .then((res) => {
        const formData = new FormData();
        uploadList.forEach((el, idx) => {
          formData.append(`file_${idx}`, el);
        });
        formData.append("uid", `${router.query.uid}`);
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
            toast({
              description: "저장되었습니다.",
              status: "success",
              duration: 1000,
              isClosable: false,
            });
            router.push("/work");
          });
      });
  };

  const [editorState, setEditorState] = useState();

  const handleEditor = (value) => {
    setEditorState(value);
  };

  const onSubmit = async (values) => {
    if (!values.title) {
      toast({
        description: "제목은 필수 사항 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (!typeRadio && !viewData.type) {
      toast({
        description: "유형을 지정해 주세요.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (!selectUser && !viewData.manager) {
      toast({
        description: "담당자를 지정해 주세요.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }

    values.content = values.content || viewData.content;
    values.type = typeRadio || viewData.type;
    values.title = values.title || viewData.title;
    values.manager = selectUser || viewData.manager;

    values = {
      ...values,
      manager: JSON.stringify(values.manager),
      writer: userInfo.uid,
    };

    submitWork(values);
  };

  return (
    <>
      {viewData && (
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
                    defaultValue={viewData?.title}
                    {...register("title")}
                  />
                </div>
                <FormErrorMessage>
                  {errors.title && errors.title.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel className="label">카테고리</FormLabel>
                  <Select width={250} onChange={(e) => onChangeCate(e, 1)}>
                    <option key={cateUid1.uid} value={cateUid1.uid}>
                      {cateUid1.title}
                    </option>
                  </Select>
                  {selectCateDepth2 && (
                    <Select
                      width={250}
                      ml={2}
                      onChange={(e) => onChangeCate(e, 2)}
                    >
                      <option value="">[{cateUid1.title}] 카테고리 선택</option>
                      {selectCateDepth2.map((el) => (
                        <option
                          key={el.uid}
                          value={el.uid}
                          selected={cateUid2?.uid == el.uid && true}
                        >
                          {el.title}
                        </option>
                      ))}
                    </Select>
                  )}
                  {selectCateDepth3 && (
                    <Select
                      width={250}
                      ml={2}
                      onChange={(e) => onChangeCate(e, 3)}
                    >
                      <option value="">[{cateUid2.title}] 카테고리 선택</option>
                      {selectCateDepth3.map((el) => (
                        <option
                          key={el.uid}
                          value={el.uid}
                          selected={cateUid3?.uid == el.uid && true}
                        >
                          {el.title}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </FormControl>

              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel className="label">유형</FormLabel>
                  <RadioGroup
                    onChange={setTypeRadio}
                    value={typeRadio || viewData.type}
                  >
                    <Stack direction="row">
                      <Radio value="1">프로젝트</Radio>
                      <Radio value="2">기능개발</Radio>
                      <Radio value="3">오류수정</Radio>
                    </Stack>
                  </RadioGroup>
                </div>
              </FormControl>
              <FormControl isInvalid={errors.manager} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="manager">
                    담당자
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
                              <>
                                <li>
                                  {el.name}
                                  {el.rank && `(${el.rank})`}
                                  {el.part && `- ${el.part}`}
                                </li>
                              </>
                            );
                          } else if (viewData.manager.includes(el.uid)) {
                            return (
                              <>
                                <li>
                                  {el.name}
                                  {el.rank && `(${el.rank})`}
                                  {el.part && `- ${el.part}`}
                                </li>
                              </>
                            );
                          }
                        })}
                    </ul>
                  </Box>
                </div>
              </FormControl>
              {viewData && (
                <>
                  <Editor
                    initTypeCon={viewData.content || " "}
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
      )}

      {isManagerPop && userAll && (
        <SelectManagerPop
          userData={userAll}
          closeManagerPop={closeManagerPop}
          onSelectManager={onSelectManager}
          selectUser={selectUser || viewData.manager}
          isManagerPop={isManagerPop}
        />
      )}
    </>
  );
}

export default WorkModify;
