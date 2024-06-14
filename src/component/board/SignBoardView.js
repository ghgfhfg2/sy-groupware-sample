import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Button,
  Flex,
  FormLabel,
  Stack,
  Box,
  useRadioGroup,
  useToast,
  Image,
} from "@chakra-ui/react";

import { db } from "src/firebase";
import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  query,
  orderByChild,
  remove,
} from "firebase/database";
import {
  getStorage,
  listAll,
  ref as sRef,
  deleteObject,
} from "firebase/storage";
import { format, getMonth, getDate } from "date-fns";
import styled from "styled-components";
import shortid from "shortid";
import ko from "date-fns/locale/ko";
import { CommonForm } from "pages/setting";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@component/board/Editor"), {
  ssr: false,
});
import Link from "next/link";
import { comma } from "@component/CommonFunc";
import { CommonPopup } from "@component/insa/UserModifyPop";

const OpinionPopBox = styled(CommonPopup)`
  .con_box {
    width: 100%;
    max-width: 700px;
  }
`;

const BoardView = styled(CommonForm)`
  .img_list {
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
    .img {
      display: flex;
      align-items: center;
      max-width: 100px;
      margin-bottom: 1rem;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
      &::after {
        content: "+";
        font-size: 30px;
        font-weight: bold;
        position: absolute;
        background: rgba(255, 255, 255, 0.8);
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: all 0.2s;
      }
      &:hover::after {
        opacity: 1;
      }
      img {
        max-width: 100%;
      }
      &.on {
        max-width: 100%;
        &:hover::after {
          opacity: 0;
        }
      }
    }
  }
  .spend {
    color: #c53030;
    font-weight: 600;
    font-size: 1rem;
  }
  .income {
    color: #2b6cb0;
    font-weight: 600;
    font-size: 1rem;
  }
`;

export default function SignBoardView() {
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  const router = useRouter();
  const storage = getStorage();
  const queryPath = `${router.query.id}`;

  const {
    setValue,
    watch,
    getValues,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const watchRadio = watch("type");
  const watchTitle = watch("subject");
  const [editorState, setEditorState] = useState();

  const [insertHtml, setInsertHtml] = useState();
  const [initTypeCon, setInitTypeCon] = useState();
  useEffect(() => {
    const listRef = query(ref(db, `board/list/${queryPath}`));
    onValue(listRef, (data) => {
      if (data.val()) {
        if (data.val().subject) {
          setValue("subject", data.val().subject);
        }
        setInitTypeCon(data.val());
      }
    });
    return () => {
      off(listRef);
    };
  }, []);

  const handleEditor = (value) => {
    setEditorState(value);
  };
  const onSubmit = (values) => {
    let editCon = editorState || initTypeCon.editor || "";

    return new Promise((resolve) => {
      let uid = router.query.id || shortid.generate();
      let obj = {
        ...values,
        editor: editCon,
        timestamp: new Date().getTime(),
        writer_uid: userInfo.uid,
        manager: userInfo.manager_uid || "",
        uid,
      };
      const listRef = ref(db, `board/list/${uid}`);
      update(listRef, {
        ...obj,
      }).then(() => {
        toast({
          description: "저장되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        router.push("/board/list");
      });
      resolve();
    });
  };

  const [isSignLoading, setIsSignLoading] = useState(false);
  //결재
  const onSign = () => {
    const opinion = getValues("opinion");
    setIsSignLoading(true);
    let newEditor = initTypeCon.editor;
    initTypeCon.manager.forEach((el, idx) => {
      if (el.uid === userInfo.uid) {
        let start = newEditor.indexOf(`<!-- add_start_${idx + 1} -->`);
        let end = newEditor.indexOf(`<!-- add_end_${idx + 1} -->`);
        newEditor = [
          newEditor.slice(0, start + 37),
          `<div class="stamp">${el.name}</div>`,
          newEditor.slice(end),
        ].join("");
      }
    });

    const curIdx = initTypeCon.manager.findIndex(
      (el) => el.uid === userInfo.uid
    );
    update(ref(db, `board/list/${queryPath}`), {
      editor: newEditor,
      nextManager: initTypeCon.manager[curIdx + 1] || "",
      cancelManager: initTypeCon.manager[curIdx],
      state: initTypeCon.manager[curIdx + 1] ? "ing" : "finish",
      opinion,
    })
      .then(() => {
        if (!initTypeCon.manager[curIdx + 1] && initTypeCon.writeOption.price) {
          update(ref(db, `stats/price/${queryPath}`), {
            date: initTypeCon.date,
            dateMonth: initTypeCon.dateMonth,
            subject: initTypeCon.subject,
            income: Number(initTypeCon.income),
            spend: Number(initTypeCon.spend),
            opinion,
          });
        }
      })
      .then(() => {
        toast({
          description: "결재 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        setInsertHtml(newEditor);
        setEditorState(newEditor);
        setIsSignLoading(false);
        closeOpinionPop();
      });
  };

  //결재취소
  const onSignCancel = () => {
    const idx = initTypeCon.manager.findIndex((el) => el.uid === userInfo.uid);
    let newEditor = initTypeCon.editor;
    let start = newEditor.indexOf(`<!-- add_start_${idx + 1} -->`);
    let end = newEditor.indexOf(`<!-- add_end_${idx + 1} -->`);
    newEditor = [
      newEditor.slice(0, start + 37),
      `${userInfo.name}`,
      newEditor.slice(end),
    ].join("");

    update(ref(db, `board/list/${queryPath}`), {
      editor: newEditor,
      nextManager: initTypeCon.manager[idx],
      cancelManager: idx > 0 ? initTypeCon.manager[idx - 1] : "",
      state: "ing",
    })
      .then(() => {
        if (initTypeCon.writeOption.price) {
          get(ref(db, `stats/price/${queryPath}`)).then((data) => {
            if (data.val()) {
              remove(ref(db, `stats/price/${queryPath}`));
            }
          });
        }
      })
      .then(() => {
        toast({
          description: "결재가 취소되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        setInsertHtml(newEditor);
        setEditorState(newEditor);
      });
  };

  //글 삭제
  const onRemove = () => {
    const removeRef = ref(db, `board/list/${queryPath}`);
    const removeSref = sRef(storage, `board/list/${queryPath}`);
    listAll(removeSref).then((data) => {
      data.items.map((img) => {
        deleteObject(img);
      });
    });
    remove(removeRef).then(() => {
      toast({
        description: "삭제 되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
      router.push("/board/wait");
    });
  };

  const imgRef = useRef([]);
  //이미지 확대
  const onImage = (idx) => {
    const target = imgRef.current[idx];
    const onCheck = target.classList.value.indexOf("on");
    imgRef.current.map((el) => {
      el.classList.remove("on");
    });
    onCheck === -1 && target.classList.add("on");
  };

  const [isOpinionPop, setIsOpinionPop] = useState(false);

  //결재의견 팝업
  const OpinionPop = () => {
    return (
      <>
        <OpinionPopBox>
          <div className="con_box">
            <Flex justifyContent="center" marginTop={3}>
              <Flex
                maxWidth={700}
                width="100%"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <FormControl isInvalid={errors.opinion}>
                  <Input
                    type="text"
                    placeholder="결재의견"
                    {...register("opinion")}
                  />
                </FormControl>
                <Flex mt={4} width="100%" justifyContent="center">
                  <Button
                    mr={2}
                    width="100%"
                    maxWidth={150}
                    variant="outline"
                    colorScheme="blue"
                    isLoading={isSignLoading}
                    onClick={closeOpinionPop}
                  >
                    취소
                  </Button>
                  <Button
                    width="100%"
                    maxWidth={150}
                    colorScheme="blue"
                    isLoading={isSignLoading}
                    onClick={onSign}
                  >
                    결재
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </div>
          <div className="bg" onClick={closeOpinionPop}></div>
        </OpinionPopBox>
      </>
    );
  };

  const onOpinionPop = () => {
    setIsOpinionPop(true);
  };

  const closeOpinionPop = () => {
    setIsOpinionPop(false);
  };

  return (
    <BoardView style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
      {isOpinionPop && <OpinionPop />}
      <Flex mb={5} width="100%" justifyContent="center">
        {initTypeCon?.nextManager.uid === userInfo?.uid && (
          <Button
            width="150px"
            size="lg"
            ml={2}
            colorScheme="blue"
            onClick={onOpinionPop}
          >
            결재
          </Button>
        )}
        {initTypeCon && initTypeCon.cancelManager?.uid === userInfo?.uid && (
          <Button
            width="150px"
            size="lg"
            ml={2}
            colorScheme="red"
            isLoading={isSignLoading}
            onClick={onSignCancel}
          >
            결재취소
          </Button>
        )}
        {initTypeCon &&
          !initTypeCon.cancelManager &&
          initTypeCon.writer_uid === userInfo?.uid && (
            <Button
              width="150px"
              size="lg"
              ml={2}
              colorScheme="red"
              isLoading={isSignLoading}
              onClick={onRemove}
            >
              삭제
            </Button>
          )}
        <Link href="/board/wait">
          <Button width="150px" size="lg" colorScheme="blue" ml={2}>
            대기목록
          </Button>
        </Link>
        <Link href="/board/list">
          <Button width="150px" size="lg" colorScheme="blue" ml={2}>
            완료목록
          </Button>
        </Link>
      </Flex>
      <Flex>
        <Flex width="100%" flexDirection="column" gap={5}>
          <FormControl isInvalid={errors.title}>
            <div className="row_box">
              <FormLabel className="label" htmlFor="subject">
                * 제목
              </FormLabel>
              <Input
                id="subject"
                readOnly
                className="sm"
                {...register("subject", {
                  required: "제목은 필수항목 입니다.",
                })}
              />
            </div>
            <FormErrorMessage>
              {errors.subject && errors.subject.message}
            </FormErrorMessage>
          </FormControl>
          {initTypeCon?.income && (
            <>
              <FormControl>
                <div className="row_box">
                  <FormLabel className="label">소득금액</FormLabel>
                  <span className="income">{`${comma(
                    initTypeCon.income
                  )}원`}</span>
                </div>
              </FormControl>
            </>
          )}
          {initTypeCon?.spend && (
            <>
              <FormControl>
                <div className="row_box">
                  <FormLabel className="label">지출금액</FormLabel>
                  <span className="spend">{`${comma(
                    initTypeCon.spend
                  )}원`}</span>
                </div>
              </FormControl>
            </>
          )}
          {initTypeCon && initTypeCon.writeOption?.date && (
            <>
              <FormControl>
                <div className="row_box">
                  <FormLabel className="label" htmlFor="date">
                    날짜
                  </FormLabel>
                  <Input
                    id="date"
                    type="date"
                    readOnly
                    className="xs"
                    defaultValue={initTypeCon.date}
                    {...register("date")}
                  />
                </div>
              </FormControl>
            </>
          )}
          {initTypeCon && initTypeCon.editor ? (
            <>
              <Editor
                disable={true}
                initTypeCon={initTypeCon.editor}
                insertHtml={insertHtml}
                handleEditor={handleEditor}
              />
            </>
          ) : (
            <Editor handleEditor={handleEditor} />
          )}

          {initTypeCon?.imgUrl && (
            <>
              <FormControl>
                <div className="row_box">
                  <FormLabel className="label">첨부 이미지</FormLabel>
                  <div className="img_list">
                    {initTypeCon?.imgUrl.map((el, idx) => (
                      <>
                        <div
                          className="img"
                          onClick={() => onImage(idx)}
                          ref={(el) => (imgRef.current[idx] = el)}
                        >
                          <Image key={idx} alt="" src={el} />
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              </FormControl>
            </>
          )}
          <Flex mt={4} width="100%" justifyContent="center">
            {/* <Button
              width="150px"
              size="lg"
              colorScheme="blue"
              isLoading={isSubmitting}
              type="submit"
            >
              저장
            </Button> */}
            {initTypeCon?.nextManager.uid === userInfo?.uid && (
              <Button
                width="150px"
                size="lg"
                ml={2}
                colorScheme="blue"
                onClick={onOpinionPop}
              >
                결재
              </Button>
            )}
            {initTypeCon &&
              initTypeCon.cancelManager?.uid === userInfo?.uid && (
                <Button
                  width="150px"
                  size="lg"
                  ml={2}
                  colorScheme="red"
                  isLoading={isSignLoading}
                  onClick={onSignCancel}
                >
                  결재취소
                </Button>
              )}
            {initTypeCon &&
              !initTypeCon.cancelManager &&
              initTypeCon.writer_uid === userInfo?.uid && (
                <Button
                  width="150px"
                  size="lg"
                  ml={2}
                  colorScheme="red"
                  isLoading={isSignLoading}
                  onClick={onRemove}
                >
                  삭제
                </Button>
              )}
            <Link href="/board/wait">
              <Button width="150px" size="lg" colorScheme="blue" ml={2}>
                대기목록
              </Button>
            </Link>
            <Link href="/board/list">
              <Button width="150px" size="lg" colorScheme="blue" ml={2}>
                완료목록
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </BoardView>
  );
}
