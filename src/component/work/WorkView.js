import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import styled from "styled-components";
import axios from "axios";
import useGetUser from "@component/hooks/getUserDb";
import StepBox from "@component/work/StepBox";
import { Button, Flex, Textarea, useToast } from "@chakra-ui/react";
import Link from "next/link";

export const WorkViewBox = styled.div`
  dt {
    padding: 15px;
    border-bottom: 1px solid #ddd;
    border-top: 2px solid #555;
    font-size: 16px;
    font-weight: 600;
  }
  dd {
    padding: 15px;
    display: flex;
    gap: 50px;
    border-bottom: 1px solid #ddd;
  }
  .box {
    .tit {
      font-weight: 600;
    }
  }
  .reply_list {
    width: 100%;
    li {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      &:last-child {
        border: 0;
      }
      .name {
        font-weight: 600;
        margin-right: 5px;
      }
      .date {
        font-size: 12px;
        color: #888;
      }
      .comment {
        margin-top: 5px;
      }
    }
  }
`;

export const stateText = [
  { txt: "대기", state: 1 },
  { txt: "접수", state: 2 },
  { txt: "진행", state: 3 },
  {
    txt: "수정요청",
    state: 4,
    info: "요청자가 -> 담당자 에게 보내는 요청 입니다.",
  },
  {
    txt: "확인요청",
    state: 5,
    info: "담당자가 -> 요청자 에게 보내는 요청 입니다.",
  },
  { txt: "확인완료", state: 6 },
  { txt: "완료", state: 7 },
];

export default function WorkView() {
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  const router = useRouter();
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
  const [viewData, setViewData] = useState();
  const [render, setRender] = useState(true);

  const [stateData, setStateData] = useState();

  const [replyList, setReplyList] = useState();
  useEffect(() => {
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
        const manager = [];
        if (resData.manager) {
          const managerArr = JSON.parse(resData.manager);
          managerArr.forEach((el) => {
            manager.push(userAll?.find((user) => el === user.uid));
          });
        }
        resData.images = JSON.parse(resData.images);
        setViewData({
          ...writer,
          ...resData,
          manager,
        });
      });

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_work_state",
        ruid: router.query.uid,
      })
      .then((res) => {
        let history = res.data?.history;
        if (!history) return;
        history = history.map((el) => {
          el.stateTxt = stateText[el.state - 1].txt;
          const writer = userAll?.find((user) => {
            return el.writer === user.uid;
          });
          el.writer = writer;
          return el;
        });
        setStateData(history);
      });

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_work_reply",
        wuid: router.query.uid,
      })
      .then((res) => {
        if (!res.data?.reply) return;
        const list = res.data.reply.map((el) => {
          const writer = userAll?.find((user) => el.writer === user.uid);
          el.writer = writer;
          return el;
        });
        setReplyList(list);
      });
  }, [userAll, render]);

  const onRender = () => {
    setRender(!render);
  };

  const onWorkRemove = () => {
    const agree = confirm("삭제 하시겠습니까?");
    if (!agree) return;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_work_list",
        uid: router.query.uid,
      })
      .then((res) => {
        toast({
          description: "삭제되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        router.push("/work");
      });
  };

  //댓글
  const [reply, setReply] = useState();
  const onChangeReply = (e) => {
    setReply(e.target.value);
  };

  const onSubmitReply = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_work_reply",
        uid: router.query.uid,
        writer: userInfo.uid,
        comment: reply,
      })
      .then((res) => {
        toast({
          description: "댓글을 추가 했습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        onRender();
        setReply("");
      });
  };

  const onRemoveReply = (uid) => {
    const agree = confirm("삭제 하시겠습니까?");
    if (!agree) return;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_work_reply",
        uid,
      })
      .then((res) => {
        toast({
          description: "댓글을 삭제 했습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        onRender();
      });
  };

  return (
    <>
      {viewData && (
        <>
          <WorkViewBox>
            <dl>
              <dt>{viewData.title}</dt>
              <dd>
                <StepBox
                  stateText={stateText}
                  stateData={stateData}
                  step={viewData.state}
                  onRender={onRender}
                />
              </dd>
              <dd>
                <div className="box">
                  <span className="tit">프로젝트 : </span>
                  <span className="con">{viewData.cate_1.title}</span>
                </div>
                {viewData.cate_2.title && (
                  <div className="box">
                    <span className="tit">카테고리1 : </span>
                    <span className="con">{viewData.cate_2.title}</span>
                  </div>
                )}
                {viewData.cate_3.title && (
                  <div className="box">
                    <span className="tit">카테고리2 : </span>
                    <span className="con">{viewData.cate_3.title}</span>
                  </div>
                )}
              </dd>
              <dd>
                <div className="box">
                  <span className="tit">작성자 : </span>
                  <span className="con">{viewData.name}</span>
                </div>
                <div className="box">
                  <span className="tit">담당자 : </span>
                  <span className="con">
                    {viewData.manager.map((mng, idx) => {
                      let comma = "";
                      if (idx != 0) {
                        comma = ", ";
                      }
                      return (
                        <>
                          <span>
                            {comma}
                            {mng?.name}
                          </span>
                        </>
                      );
                    })}
                  </span>
                </div>
                <div className="box">
                  <span className="tit">작성일 : </span>
                  <span className="con">{viewData.date_regis}</span>
                </div>
              </dd>
              <dd>
                <div
                  dangerouslySetInnerHTML={{ __html: viewData.content }}
                ></div>
                <Flex flexDirection="column" alignItems="flex-start" gap={1}>
                  {viewData.images &&
                    viewData.images.map((el) => (
                      <>
                        <img
                          src={`https://shop.editt.co.kr/_upload/_groupware/work/${el}`}
                        />
                      </>
                    ))}
                </Flex>
              </dd>
              <dd>
                {replyList && (
                  <>
                    <ul className="reply_list">
                      {replyList.map((el) => (
                        <li key={el.uid}>
                          <div className="name_box">
                            <span className="name">{el?.writer?.name}</span>
                            <span className="date">{el.date_regis}</span>
                            {el?.writer?.uid == userInfo?.uid && (
                              <Button
                                onClick={() => onRemoveReply(el.uid)}
                                ml={2}
                                colorScheme="red"
                                size="xs"
                              >
                                삭제
                              </Button>
                            )}
                          </div>
                          <div className="comment">{el.comment}</div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </dd>
              <dd>
                <Flex alignItems="stretch" width="100%">
                  <Textarea
                    value={reply}
                    onChange={onChangeReply}
                    style={{ flex: "1" }}
                  />
                  <Button
                    onClick={onSubmitReply}
                    height="auto"
                    colorScheme="blue"
                    ml={2}
                  >
                    댓글추가
                  </Button>
                </Flex>
              </dd>
            </dl>
          </WorkViewBox>
          <Flex mt={3}>
            {viewData.writer == userInfo?.uid && (
              <>
                <Button
                  mr={1}
                  colorScheme="red"
                  onClick={() => onWorkRemove(viewData.uid)}
                >
                  삭제
                </Button>
                <Link
                  href={{
                    pathname: "/work/modify",
                    query: { uid: viewData.uid },
                  }}
                >
                  <Button mr={1}>수정</Button>
                </Link>
              </>
            )}
            <Link href="/work">
              <Button colorScheme="blue">목록</Button>
            </Link>
          </Flex>
        </>
      )}
    </>
  );
}
