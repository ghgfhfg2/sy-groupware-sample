import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
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
import useGetUser from "@component/hooks/getUserDb";
import axios from "axios";
import styled from "styled-components";
import WorkPop from "@component/work/WorkPop";
import WorkResigPop from "@component/work/WorkResigPop";
import CateStatePop from "@component/work/CateStatePop";
import CateStateListPop from "./CateStateListPop";
import { IoMdRefresh } from "react-icons/io";
import Refresh from "@component/Refresh";

const MenuStructure = styled.div`
  margin-top: 20px;
  border: 1px solid #555;
  border-width: 2px 0;
  * {
    box-sizing: border-box;
  }
  .wid_1 {
    width: 220px;
  }
  .wid_2 {
    width: 130px;
  }
  .wid_3 {
    width: 160px;
  }
  .header {
    display: flex;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    & > span {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      padding: 10px;
    }
  }
  .tit_box {
    padding: 10px;
  }
  li {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid #ddd;
    &:last-child {
      border-bottom: 0;
    }
  }
  .depth_2 {
    & > li > .tit_box {
      display: flex;
      font-weight: 600;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #ddd;
    }
  }
  .depth_3 {
    width: 100%;
    li {
      &:hover {
        background: #f9f9f9;
      }
      .tit_box {
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #ddd;
        &.state {
          flex-direction: column;
        }
      }
    }
  }
  .mb_box {
    display: none;
  }
  @media all and (max-width: 1024px) {
    .mb_scroll {
      width: 100%;
      overflow: auto;
    }
    .wid_1 {
      width: 150px;
    }
    .wid_2 {
      width: auto;
      min-width: 70px;
      padding: 0 5px;
    }
    .header {
      width: 850px;
    }
    .depth_2 {
      width: 850px;
    }
  }
`;

export default function Structure() {
  const cateState = ["대기", "진행", "완료"];

  const router = useRouter();
  useGetUser();
  const toast = useToast();

  const userAll = useSelector((state) => state.user.allUser);
  const userInfo = useSelector((state) => state.user.currentUser);

  //카테고리
  const [cateUid1, setCateUid1] = useState();
  const [cateUid2, setCateUid2] = useState();
  const [cateUid3, setCateUid3] = useState();

  //가겨온 카테고리 가공
  const CateDataProcessing = (initArray) => {
    if (!initArray) {
      return;
    }
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
      if (d3.manager) {
        const manager_eddit = [];
        const manager_partner = [];
        const managerArr = JSON.parse(d3.manager);
        managerArr.forEach((el) => {
          if (el === userInfo?.uid) {
            d3.isManager = true;
          }
          userAll?.forEach((user) => {
            if (user.uid === el) {
              if (user.partner) {
                manager_partner.push(user);
              } else {
                manager_eddit.push(user);
              }
            }
          });
        });
        d3.manager_eddit = manager_eddit;
        d3.manager_partner = manager_partner;
      }
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
        //el.sub.sort((a, b) => a.depth.split("_")[1] - b.depth.split("_")[1]);
        el.sub.sort((a, b) => a.order_num - b.order_num);
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

  const [render, setRender] = useState(false);
  const [cateList, setCateList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_cate_work",
      })
      .then((res) => {
        const listData = CateDataProcessing(res.data.cate);
        setCateList(listData);
      });
  }, [render]);

  useEffect(() => {
    if (!cateList) return;
    if (cateUid1) {
      onChangeCate(cateUid1.uid, 1);
      return;
    }
    if (userInfo?.partner) {
      onChangeCate(userInfo.project, 1);
    }
  }, [cateList]);

  //리스트 팝업
  const [isWorkPop, setIsWorkPop] = useState(false);
  const [selectWorkInfo, setSelectWorkInfo] = useState();

  const onPopWorkList = (state, depth) => {
    setIsWorkPop(true);
    setSelectWorkInfo({ state, depth });
  };
  const closeDayoffPop = () => {
    setIsWorkPop(false);
    setSelectWorkInfo("");
  };

  //글작성 팝업
  const [isWorkRegisPop, setIsWorkRegisPop] = useState(false);
  const onPopWorkRegis = (depth) => {
    setIsWorkRegisPop(true);
    setSelectWorkInfo(depth);
  };
  const closeRegisPop = () => {
    setIsWorkRegisPop(false);
    setSelectWorkInfo("");
  };
  const closeRender = () => {
    setIsWorkRegisPop(false);
    setSelectWorkInfo("");
    setRender(!render);
  };

  //카테고리 상태 변경 팝업
  const [isCateStatePop, setIsCateStatePop] = useState(false);
  const [selectCateInfo, setSelectCateInfo] = useState();

  const onCateStatePop = (data) => {
    setIsCateStatePop(true);
    setSelectCateInfo(data);
  };
  const closeCatePop = () => {
    setIsCateStatePop(false);
    setSelectCateInfo("");
  };
  const reRender = () => {
    setRender(!render);
  };

  //카테고리 상태 변경 내역 팝업
  const [isStateListPop, setIsStateListPop] = useState(false);
  const onCateStateListPop = (data) => {
    setSelectCateInfo(data);
    setIsStateListPop(true);
  };
  const closeCateListPop = () => {
    setIsStateListPop(false);
    setSelectCateInfo("");
  };

  //담당자 추가
  const onJoinManager = (uid) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "add_cate_manager",
        uid,
        user: userInfo.uid,
      })
      .then((res) => {
        if (res.data?.is) {
          toast({
            description: "이미 담당자에 추가 되어있습니다.",
            status: "info",
            duration: 1000,
            isClosable: false,
          });
          return;
        }
        toast({
          description: "담당자로 추가 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        reRender();
      });
  };

  //담당자 제외
  const onOutManager = (uid) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_cate_manager",
        uid,
        user: userInfo.uid,
      })
      .then((res) => {
        console.log(res);
        toast({
          description: "담당자에서 제외 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        reRender();
      });
  };

  return (
    <>
      <Flex>
        {userInfo && !userInfo.partner && (
          <Select mr={2} width={250} onChange={(e) => onChangeCate(e, 1)}>
            <option value="">프로젝트 선택</option>
            {cateList &&
              cateList.map((el) => (
                <>
                  <option key={el.uid} value={el.uid}>
                    {el.title}
                  </option>
                </>
              ))}
          </Select>
        )}
        <Refresh reRender={reRender} />
      </Flex>

      {selectCateDepth2 && (
        <MenuStructure>
          <div className="mb_scroll">
            <div className="header">
              <span className="wid_1">카테고리1</span>
              <span className="wid_1">카테고리2</span>
              <span className="wid_1">진행상황</span>
              <span className="wid_2">미완료</span>
              <span className="wid_2">완료</span>
              <span className="wid_2">글등록</span>
              <span className="wid_2" style={{ textAlign: "center" }}>
                담당자
                <br />
              </span>
              <span className="wid_2" style={{ textAlign: "center" }}>
                담당자
                <br />({cateList[0].title})
              </span>
              <span className="wid_2">담당자 지정</span>
            </div>
            <ul className="depth_2">
              {selectCateDepth2.map((list) => (
                <>
                  <li key={list.uid}>
                    <div className="tit_box wid_1">
                      <span className="tit open">
                        <span className="ic"></span>
                        {list.title}
                      </span>
                    </div>
                    <ul data-depth={list.depth} className="depth_3 on">
                      {list.sub &&
                        list.sub.map((list2) => (
                          <>
                            <li key={list2.uid}>
                              <div className="tit_box wid_1">
                                <span className="tit">{list2.title}</span>
                              </div>
                              <div className="tit_box wid_1">
                                {cateState[list2.state]}
                                <Button
                                  size="sm"
                                  ml={2}
                                  onClick={() => onCateStatePop(list2)}
                                >
                                  변경
                                </Button>
                                <Button
                                  size="sm"
                                  ml={1}
                                  onClick={() => onCateStateListPop(list2)}
                                >
                                  내역
                                </Button>
                              </div>
                              <div className="tit_box wid_2 state">
                                {list2.work?.state_1 && (
                                  <>
                                    <button
                                      style={{ fontWeight: 600 }}
                                      onClick={() =>
                                        onPopWorkList(1, list2.depth)
                                      }
                                    >
                                      {list2.work.state_1.length} 건
                                    </button>
                                    {list2.work?.state_3 && (
                                      <>수정요청 {list2.work.state_3.length}</>
                                    )}
                                    {list2.work?.state_4 && (
                                      <>확인요청 {list2.work.state_4.length}</>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="tit_box wid_2">
                                {list2.work?.state_2 && (
                                  <button
                                    style={{ fontWeight: 600 }}
                                    onClick={() =>
                                      onPopWorkList(2, list2.depth)
                                    }
                                  >
                                    {list2.work.state_2.length} 건
                                  </button>
                                )}
                              </div>
                              <div className="tit_box wid_2">
                                <Button
                                  onClick={() => onPopWorkRegis(list2.depth)}
                                  size="sm"
                                  colorScheme="blue"
                                >
                                  글등록
                                </Button>
                              </div>
                              <div
                                className="tit_box wid_2"
                                style={{ flexWrap: "wrap" }}
                              >
                                {list2.manager_eddit &&
                                  list2.manager_eddit.map((mng, idx) => {
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
                              </div>
                              <div
                                className="tit_box wid_2"
                                style={{ flexWrap: "wrap" }}
                              >
                                {list2.manager_partner &&
                                  list2.manager_partner.map((mng, idx) => {
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
                              </div>
                              <div className="tit_box wid_2">
                                {list2.isManager ? (
                                  <Button
                                    onClick={() => onOutManager(list2.uid)}
                                    size="sm"
                                    colorScheme="red"
                                  >
                                    담당제외
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => onJoinManager(list2.uid)}
                                    size="sm"
                                    colorScheme="blue"
                                  >
                                    담당추가
                                  </Button>
                                )}
                              </div>
                            </li>
                          </>
                        ))}
                    </ul>
                  </li>
                </>
              ))}
            </ul>
          </div>
        </MenuStructure>
      )}
      {isWorkPop && (
        <WorkPop
          selectWorkInfo={selectWorkInfo}
          closeDayoffPop={closeDayoffPop}
        />
      )}
      {isWorkRegisPop && (
        <WorkResigPop
          selectWorkInfo={selectWorkInfo}
          closeRegisPop={closeRegisPop}
          closeRender={closeRender}
        />
      )}

      {isCateStatePop && (
        <>
          <CateStatePop
            selectCateInfo={selectCateInfo}
            closeCatePop={closeCatePop}
            reRender={reRender}
          />
        </>
      )}

      {isStateListPop && (
        <>
          <CateStateListPop
            selectCateInfo={selectCateInfo}
            closeCateListPop={closeCateListPop}
          />
        </>
      )}
    </>
  );
}
