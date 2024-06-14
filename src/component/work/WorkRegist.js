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
import SelectManagerPop from "@component/popup/SelectManagerPop";
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import UploadBox from "@component/UploadBox";
import { onSendAlert } from "../hooks/sendAlertFunc";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});

function WorkRegist({ selectWorkInfo, closeRender }) {
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
    let uid;
    if (typeof e == "string") {
      uid = e;
    } else {
      uid = e.target.value;
    }
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
  const [totalCate, setTotalCate] = useState();
  useEffect(() => {
    axios &&
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
          a: "get_cate_list",
        })
        .then((res) => {
          const cate = res.data.cate;
          if (!cate) {
            return;
          }
          setTotalCate(cate);
          const list = CateDataProcessing(cate);
          setCateList(list);
        });
  }, []);

  useEffect(() => {
    if (selectWorkInfo && totalCate) {
      let depth = selectWorkInfo.split("_");
      let obj = {
        depth_1: depth[0],
        depth_2: `${depth[0]}_${depth[1]}`,
        depth_3: `${depth[0]}_${depth[1]}_${depth[2]}`,
      };

      totalCate.forEach((el) => {
        if (el.depth == obj.depth_1) {
          setCateUid1(el);
        }
        if (el.depth == obj.depth_2) {
          setCateUid2(el);
        }
        if (el.depth == obj.depth_3) {
          setCateUid3(el);
        }
      });
    }
  }, [totalCate]);

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
  const [typeRadio, setTypeRadio] = useState();

  const submitWork = (values) => {
    if (!cateUid3) {
      toast({
        description: "하위 카테고리가 지정되지 않았습니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
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
    values.depth = cateUid3.depth;
    values.project = cateUid1.uid;

    //알림 유저 필터
    const userFilter = userAll.filter((el) => {
      return !el.hidden && !el.partner;
    });
    const userUidList = userFilter.map((el) => el.uid);
    //알림 보내기
    onSendAlert(userUidList, "work");

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_work_list",
        ...values,
      })
      .then((res) => {
        const formData = new FormData();
        uploadList.forEach((el, idx) => {
          formData.append(`file_${idx}`, el);
        });
        formData.append("uid", `${res.data.uid}`);
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

            if (selectWorkInfo) {
              //팝업일때
              closeRender();
            } else {
              router.push("/work");
            }
          });
      });
  };

  const [editorState, setEditorState] = useState();

  const handleEditor = (value) => {
    setEditorState(value);
  };

  const onSubmit = async (values) => {
    if (!cateUid1) {
      toast({
        description: "카테고리를 지정해 주세요.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (!typeRadio) {
      toast({
        description: "유형을 지정해 주세요.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }

    values = {
      ...values,
      type: typeRadio,
      manager: JSON.stringify(selectUser),
      writer: userInfo.uid,
      content: editorState,
    };

    submitWork(values);
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
                    required: "제목 필수항목 입니다.",
                  })}
                />
              </div>
              <FormErrorMessage>
                {errors.title && errors.title.message}
              </FormErrorMessage>
            </FormControl>
            {selectWorkInfo ? (
              <>
                <FormControl className="row_section">
                  <div className="row_box">
                    <FormLabel className="label">카테고리</FormLabel>
                    {cateUid1?.title}
                    <Text ml={1} mr={1}>
                      &gt;
                    </Text>
                    {cateUid2?.title}
                    <Text ml={1} mr={1}>
                      &gt;
                    </Text>
                    {cateUid3?.title}
                  </div>
                </FormControl>
              </>
            ) : (
              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel className="label">카테고리</FormLabel>
                  <Select width={250} onChange={(e) => onChangeCate(e, 1)}>
                    <option value="">프로젝트 선택</option>
                    {cateList &&
                      cateList.map((el) => (
                        <option key={el.uid} value={el.uid}>
                          {el.title}
                        </option>
                      ))}
                  </Select>
                  {selectCateDepth2 && (
                    <Select
                      width={250}
                      ml={2}
                      onChange={(e) => onChangeCate(e, 2)}
                    >
                      <option value="">[{cateUid1.title}] 카테고리 선택</option>
                      {selectCateDepth2.map((el) => (
                        <option key={el.uid} value={el.uid}>
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
                        <option key={el.uid} value={el.uid}>
                          {el.title}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </FormControl>
            )}

            <FormControl className="row_section">
              <div className="row_box">
                <FormLabel className="label">유형</FormLabel>
                <RadioGroup onChange={setTypeRadio} value={typeRadio}>
                  <Stack direction="row">
                    <Radio value="1">프로젝트</Radio>
                    <Radio value="2">기능개발</Radio>
                    <Radio value="3">오류수정</Radio>
                  </Stack>
                </RadioGroup>
              </div>
            </FormControl>
            {!userInfo.partner && (
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

      {isManagerPop && userAll && (
        <SelectManagerPop
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

export default WorkRegist;
