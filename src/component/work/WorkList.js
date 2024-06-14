import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { BoardLi } from "@component/BoardList";
import { format } from "date-fns";
import shortid from "shortid";
import None from "@component/None";
import styled from "styled-components";
import axios from "axios";
import useGetUser from "@component/hooks/getUserDb";
import { Pagenation } from "../Pagenation";
import Link from "next/link";
import { Button, Flex, Select, useToast } from "@chakra-ui/react";
import { StepComponent } from "@component/work/WorkPop";
import { IoMdTimer } from "react-icons/io";
import { stateText } from "@component/work/WorkView";
import Refresh from "@component/Refresh";
import NameComponent from "../NameComponent";

export const WorkBoardList = styled(BoardLi)`
  li {
    .cate {
      width: 130px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      display: block;
      line-height: 48px;
      text-align: center;
      padding: 0 5px;
    }
    &.header {
      .subject {
        justify-content: center;
      }
    }
    .name {
      max-width: 150px;
      flex: 1;
    }
    .manager {
      flex: 1;
      max-width: 200px;
      span {
        width: auto;
      }
    }
    .subject {
      flex: 1;
      justify-content: flex-start;
      padding: 0 1rem;
    }
    .date {
      max-width: 150px;
      flex: 1;
    }
    &.body {
      .date {
        color: #888;
      }
      .subject {
        font-weight: 600;
      }
    }
  }
  @media all and (max-width: 640px) {
    overflow: auto;
    li {
      width: 600px;
    }
  }
`;

const WorkTopSelect = styled.div`
  @media all and (max-width: 640px) {
    .wrap {
      flex-direction: column;
    }
    .state {
      margin-top: 10px;
    }
  }
`;

export default function WorkList({ main }) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const toast = useToast();

  const router = useRouter();
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
  const [listData, setListData] = useState();
  const curPage = router.query["p"] || 1;

  const limit = main ? 5 : 20;
  const [totalPage, setTotalPage] = useState();
  const getWorkList = (page, state, project) => {
    if (!userInfo) return;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_work_list",
        page,
        limit,
        state,
        project,
        depth: userInfo.project_depth || "",
      })
      .then((res) => {
        const total = res.data.total;
        setTotalPage(total);
        const list = res.data.list?.map((el) => {
          const findUser = userAll?.find((user) => el.writer === user.uid);
          const manager = [];
          if (el.manager) {
            const managerArr = JSON.parse(el.manager);
            managerArr.forEach((el) => {
              manager.push(userAll?.find((user) => el === user.uid));
            });
          }
          el.cate_1 = JSON.parse(el.cate_1);
          el.cate_2 = el.cate_2 ? JSON.parse(el.cate_2) : "";
          el.cate_3 = el.cate_3 ? JSON.parse(el.cate_3) : "";
          return {
            ...findUser,
            ...el,
            manager,
          };
        });
        setListData(list);
      });
  };

  const [projectList, setProjectList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_project_list",
      })
      .then((res) => {
        setProjectList(res.data.project);
      });
  }, []);

  const [render, setRender] = useState(false);
  const reRender = () => {
    setRender(!render);
  };

  // const refreshTime = 100;
  // const [refreshTimer, setRefreshTimer] = useState(refreshTime);
  // const rerender = () => {
  //   setRender(!render);
  //   setRefreshTimer(refreshTime);
  //   toast({
  //     description: "새로고침 되었습니다.",
  //     status: "success",
  //     duration: 1000,
  //     isClosable: false,
  //   });
  // };

  // //자동 새로고침
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setRefreshTimer((time) => {
  //       return time - 1;
  //     });
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);
  // useEffect(() => {
  //   if (refreshTimer < 1) {
  //     setRefreshTimer(refreshTime);
  //     rerender();
  //   } else {
  //     return;
  //   }
  // }, [refreshTimer]);

  //상태 필터
  const [curState, setCurState] = useState("ndone");
  const filterState = (state) => {
    setCurState(state);
    getWorkList(1, state);
  };

  //프로젝트 필터
  const [curProject, setCurProject] = useState();
  const onFilterProject = (e) => {
    setCurProject(e.target.value);
    getWorkList(1, "", e.target.value);
  };

  useEffect(() => {
    getWorkList(curPage, curState, curProject);
  }, [userAll, curPage, userInfo, render]);

  return (
    <>
      {!main && (
        <WorkTopSelect>
          <Flex className="wrap" gap={2}>
            {projectList && (
              <>
                <Select onChange={onFilterProject} width={200}>
                  <option value="" key="-1">
                    전체 프로젝트
                  </option>
                  {projectList.map((el) => (
                    <option value={el.uid} key={el.uid}>
                      {el.title}
                    </option>
                  ))}
                </Select>
              </>
            )}
            {stateText && (
              <>
                <Flex className="state" mb={3} gap={2}>
                  <Button
                    colorScheme={curState ? "gray" : "blue"}
                    onClick={() => filterState()}
                  >
                    전체
                  </Button>
                  <Button
                    colorScheme={curState == "ndone" ? "blue" : "gray"}
                    onClick={() => filterState("ndone")}
                  >
                    미완료 전체
                  </Button>
                  {stateText.map((el) => (
                    <Button
                      colorScheme={curState == el.state ? "blue" : "gray"}
                      key={el.state}
                      onClick={() => filterState(el.state)}
                    >
                      {el.txt}
                    </Button>
                  ))}
                  {projectList && (
                    // <>
                    //   <Button
                    //     width={refreshTimer < 100 ? 145 : 120}
                    //     colorScheme="blue"
                    //     onClick={rerender}
                    //   >
                    //     <IoMdTimer />
                    //     새로고침{refreshTimer < 100 && <>({refreshTimer})</>}
                    //   </Button>
                    // </>
                    <Refresh reRender={reRender} />
                  )}
                </Flex>
              </>
            )}
          </Flex>
        </WorkTopSelect>
      )}
      <WorkBoardList>
        <li className="header">
          {!main && <span>번호</span>}
          <span>상태</span>
          <span className="cate">프로젝트</span>
          {!main && (
            <>
              <span className="cate">카테고리1</span>
              <span className="cate">카테고리2</span>
            </>
          )}
          <span className="subject">제목</span>
          <span className="name">작성자</span>
          <span className="manager">담당자</span>
          <span className="date">작성일</span>
        </li>
        {listData &&
          listData.map((el) => (
            <li className="body" key={shortid()}>
              {!main && <span>{el.uid}</span>}
              <StepComponent>
                <span className={`state state_${el.state}`}>
                  {stateText[el.state - 1].txt}
                </span>
              </StepComponent>
              <span className="cate">{el.cate_1.title}</span>
              {!main && (
                <>
                  <span className="cate">{el.cate_2.title}</span>
                  <span className="cate">{el.cate_3.title}</span>
                </>
              )}
              <span className="subject">
                <Link
                  href={{
                    pathname: "/work/view",
                    query: { uid: el.uid },
                  }}
                >
                  {el.title}
                </Link>
                {el.reply_cnt > 0 && (
                  <span style={{ marginLeft: "4px", width: "auto" }}>
                    ({el.reply_cnt})
                  </span>
                )}
              </span>
              <span className="name">
                <NameComponent name={el.name} user={el} />
              </span>
              <span className="manager">
                {el.manager.map((mng, idx) => {
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
              <span className="date">
                {format(new Date(el.date_regis), "yyyy-MM-dd")}
              </span>
            </li>
          ))}
        {!listData && <None />}
      </WorkBoardList>
      {!main && (
        <Pagenation total={totalPage} current={curPage} viewPage={10} />
      )}
    </>
  );
}
