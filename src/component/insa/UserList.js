import React, { useState, useEffect } from "react";
import { db } from "src/firebase";
import { ref, get, onValue } from "firebase/database";
import useGetUser from "@component/hooks/getUserDb";
import styled from "styled-components";
import { Button } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import InsaSkeleton from "@component/insa/InsaSkeleton";
import UserModifyPop from "@component/insa/UserModifyPop";
import { format } from "date-fns";
import { RiArrowUpDownFill } from "react-icons/ri";
import { AiOutlineSetting } from "react-icons/ai";
import UserDayoffPop from "./UserDayoffPop";
import DayoffHistoryPop from "@component/insa/DayoffHistoryPop";
import None from "../None";

export const ListUl = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  > ul {
    display: flex;
  }
  .link {
    cursor: pointer;
    &:hover {
      font-weight: bold;
    }
  }
  .header {
    height: 55px;
    background: var(--p-color);
    color: #fff;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }
  .body {
    flex-direction: column;
    > li {
      display: flex;
      align-items: center;
    }
    .box {
      height: 50px;
      border-bottom: 1px solid #eaeaea;
      &.dayoff {
        display: flex;
        button {
          margin-left: 10px;
        }
      }
    }
  }
  .box {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    &.num {
      flex: 70px 0;
    }
    &.dayoff_history {
      width: 100px;
    }
  }
  @media screen and (max-width: 1024px) {
    overflow: auto;
    padding-bottom: 15px;
  }
`;

export default function UserList() {
  const getUserInfo = useGetUser();
  const partList = getUserInfo[1]?.partList;
  const rankList = getUserInfo[1]?.rankList;

  const [userData, setUserData] = useState();
  const userInfo = useSelector((state) => state.user.currentUser);
  let userAll = useSelector((state) => state.user.allUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isModifyPop, setIsModifyPop] = useState(false);

  const onUserModify = async (uid) => {
    const dbRef = ref(db, `user/${uid}`);
    const getUser = await get(dbRef);
    let user = {
      ...getUser.val(),
    };
    setUserData(user);
    setIsModifyPop(true);
  };
  const closeUserModify = () => {
    setUserData("");
    setIsModifyPop(false);
  };

  const [adminCheck, setAdminCheck] = useState(false);
  const [userAllState, setUserAllState] = useState();
  const [managerList, setManagerList] = useState();

  const [render, setRender] = useState(false);
  const onRender = () => {
    setRender(!render);
  };

  useEffect(() => {
    if (userAll) {
      let userAllArr;
      userAllArr = userAll.map((el) => {
        let user = userAll.find((li) => {
          return el.manager_uid === li.uid;
        });
        if (user) {
          el.manager_uid = user;
        }
        return el;
      });

      userAll.sort((a, b) => {
        return a["timestamp"] - b["timestamp"];
      });

      setUserAllState(userAll);
      if (userInfo?.authority && userInfo.authority.includes("admin")) {
        setAdminCheck(true);
      }
      setIsLoading(true);

      let managerArr = [];
      userAll.map((el) => {
        if (el.manager == "1") {
          managerArr.push(el);
        }
      });
      setManagerList(managerArr);
    } else {
      setIsLoading("empty");
    }
  }, [userAll, userInfo, render]);

  const [sortState, setSortState] = useState();
  const onSort = (type) => {
    let sortObj = {
      type,
      sort: "asc",
    };
    if (sortState?.sort === "asc") {
      sortObj.sort = "desc";
    } else if (sortState?.sort === "desc") {
      sortObj.sort = "asc";
    }
    setSortState(sortObj);
    userAll = userAll.sort((a, b) => {
      if (sortObj.sort === "asc") {
        return b[type] - a[type];
      } else {
        return a[type] - b[type];
      }
    });
    setUserAllState(userAll);
  };

  //연차관리.
  const [isDayoffPop, setIsDayoffPop] = useState(false);
  const [isDayoffHistoryPop, setIsDayoffHistoryPop] = useState(false);
  const onDayoffPop = async (uid, dayoff, type) => {
    if (type == "history") {
      setUserData({ uid, dayoff });
      setIsDayoffHistoryPop(true);
    } else {
      const dbRef = ref(db, `user/${uid}`);
      const getUser = await get(dbRef);
      let user = {
        ...getUser.val(),
      };
      setUserData(user);
      setIsDayoffPop(true);
    }
  };
  const closeDayoffPop = () => {
    setUserData("");
    setIsDayoffPop(false);
    setIsDayoffHistoryPop(false);
  };

  return (
    <>
      {isLoading === true ? (
        <>
          <ListUl>
            <ul className="header" style={{ minWidth: "1000px" }}>
              <li className="box name">이름</li>
              <li className="box part">부서</li>
              <li className="box rank">직급</li>
              <li className="box call">전화번호</li>
              <li className="box call">전화번호2</li>
              <li className="box manager">담당자</li>
              <li className="box email">이메일</li>
              <li className="box date">
                입사일
                <button>
                  <RiArrowUpDownFill
                    onClick={() => {
                      onSort("timestamp");
                    }}
                    style={{ marginLeft: "5px", fontSize: "1.1rem" }}
                  />
                </button>
              </li>
              <li className="box dayoff_history">연차내역</li>
              {adminCheck && (
                <>
                  <li className="box dayoff">남은연차</li>
                  <li className="box setting"></li>
                </>
              )}
            </ul>
            <ul className="body" style={{ minWidth: "1000px" }}>
              {userAllState &&
                userAllState.map((el) => (
                  <>
                    <li key={el.uid}>
                      <span className="box name">{el.name}</span>
                      <span className="box part">{el.part}</span>
                      <span className="box rank">{el.rank}</span>
                      <span className="box call">{el.call}</span>
                      <span className="box call">{el.call2}</span>
                      <span className="box manager">
                        {el.manager_uid && (
                          <>
                            {el.manager_uid.name} ({el.manager_uid.rank})
                          </>
                        )}
                      </span>
                      <span className="box email">{el.email}</span>
                      <span className="box date">
                        {el.date && format(new Date(el.date), "yyyy-MM-dd")}
                      </span>
                      <span className="box dayoff_history">
                        {adminCheck ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => {
                                onDayoffPop(el.uid, el.dayoff, "history");
                              }}
                            >
                              내역보기
                            </Button>
                          </>
                        ) : (
                          <>
                            {el.uid == userInfo?.uid && (
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => {
                                  onDayoffPop(el.uid, el.dayoff, "history");
                                }}
                              >
                                내역보기
                              </Button>
                            )}
                          </>
                        )}
                      </span>
                      {adminCheck && (
                        <>
                          <span className="box dayoff">
                            {el.dayoff ? `${el.dayoff}일` : "0일"}

                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => {
                                onDayoffPop(el.uid);
                              }}
                            >
                              <AiOutlineSetting />
                            </Button>
                          </span>
                          <div className="box setting">
                            <Button
                              size="sm"
                              onClick={() => {
                                onUserModify(el.uid);
                              }}
                            >
                              관리
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  </>
                ))}
            </ul>
          </ListUl>
          {userData && isModifyPop && (
            <UserModifyPop
              managerList={managerList}
              userData={userData}
              partList={partList}
              rankList={rankList}
              onRender={onRender}
              closeUserModify={closeUserModify}
            />
          )}
          {userData && isDayoffPop && (
            <UserDayoffPop
              userData={userData}
              onRender={onRender}
              closeDayoffPop={closeDayoffPop}
            />
          )}
          {userData && isDayoffHistoryPop && (
            <DayoffHistoryPop
              userData={userData}
              closeDayoffPop={closeDayoffPop}
            />
          )}
        </>
      ) : isLoading === "empty" ? (
        <>
          <ListUl>
            <ul className="header" style={{ minWidth: "1000px" }}>
              <li className="box name">이름</li>
              <li className="box part">부서</li>
              <li className="box rank">직급</li>
              <li className="box call">전화번호</li>
              <li className="box call">전화번호2</li>
              <li className="box manager">담당자</li>
              <li className="box email">이메일</li>
              <li className="box date">
                입사일
                <button>
                  <RiArrowUpDownFill
                    onClick={() => {
                      onSort("timestamp");
                    }}
                    style={{ marginLeft: "5px", fontSize: "1.1rem" }}
                  />
                </button>
              </li>
              <li className="box dayoff_history">연차내역</li>
              {adminCheck && (
                <>
                  <li className="box dayoff">남은연차</li>
                  <li className="box setting"></li>
                </>
              )}
            </ul>
            <ul className="body" style={{ minWidth: "1000px" }}>
              <li>
                <None txt={"직원 정보가 없습니다."} />
              </li>
            </ul>
          </ListUl>
        </>
      ) : (
        <>
          <InsaSkeleton />
        </>
      )}
    </>
  );
}
