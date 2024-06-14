import React, { useEffect, useState } from "react";
import { Button, Flex, Box, useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "src/firebase";
import {
  ref,
  set,
  get,
  update,
  remove,
  runTransaction,
} from "firebase/database";
import { CommonPopup } from "@component/insa/UserModifyPop";
import { DayOffList } from "@component/schedule/OffWrite";
import styled from "styled-components";
import shortid from "shortid";
import { format } from "date-fns";
import Confirm from "@component/popup/Confirm";

export const ConfirmPopup = styled(CommonPopup)`
  .con_box {
    width: 100%;
    max-width: 500px;
  }
  span.day {
    margin-left: auto;
  }
  h2 {
    font-size: 1.4rem;
    text-align: center;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .info_box {
    display: flex;
    justify-content: space-between;
  }

  .manager_list {
    font-size: 13px;
    display: flex;
    align-items: center;
    li {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 70px;
      border: 1px solid #ddd;
      margin-left: -1px;
      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }
      .title {
        height: 30px;
        border-bottom: 1px solid #ddd;
      }
      .sign {
        height: auto;
        height: 65px;
        display: flex;
        justify-content: center;
        align-items: center;
        .check {
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid #9c4221;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          color: #9c4221;
          position: relative;
          &::before {
            content: "";
            display: block;
            width: 87%;
            height: 87%;
            position: absolute;
            border: 1px solid #9b2c2c;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
          }
        }
      }
    }
  }
`;

export default function ConfirmPop({
  listData,
  userInfo,
  closePopup,
  onRender,
}) {
  const dispatch = useDispatch();
  const toast = useToast();

  const [ownCheck, setOwnCheck] = useState(false);
  useEffect(() => {
    if (listData.userUid === userInfo.uid) {
      setOwnCheck(true);
    }
  }, []);

  //결재자 콤포넌트
  const Manager = () => {
    let addSignList;
    addSignList = listData.manager.map((el) => {
      if (el.value <= listData.cancelManager.value) {
        el.sign = true;
      } else {
        el.sign = false;
      }
      return el;
    });
    return (
      <ul className="manager_list">
        {addSignList.map((el, idx) => (
          <li key={idx}>
            <div className="title">결재자{idx + 1}</div>
            <div className="sign">
              {el.sign ? (
                <span className="check">{el.name}</span>
              ) : (
                <span className="ready">{el.name}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const onSubmit = async () => {
    const checkIdx = listData.manager.findIndex(
      (el) => el.id === listData.nextManager.id
    );
    const userRef = ref(db, `user/${listData.userUid.trim()}`);
    const restDayoff = await get(userRef).then((data) => {
      return data.val().dayoff;
    });
    const newDayoff = restDayoff - listData.daySum;

    if (newDayoff < 0) {
      toast({
        description: "휴가가 부족합니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    } else {
      update(userRef, { dayoff: newDayoff })
        .then(() => {
          //결재처리
          return new Promise((resolve) => {
            let finishDate = format(listData.timestamp, "yyyyMM");
            if (listData.manager[checkIdx + 1]) {
              update(ref(db, `dayoff/temp/${listData.uid}`), {
                cancelManager: listData.manager[checkIdx],
                nextManager: listData.manager[checkIdx + 1],
              }).then(() => {
                toast({
                  description: "결재처리 되었습니다.",
                  status: "success",
                  duration: 1000,
                  isClosable: false,
                });
                closePopup();
                resolve();
              });
            } else {
              let restDayoff = newDayoff;
              listData.list.forEach((el) => {
                let d = el.date.split("-").join("");
                restDayoff -= el.day;
                update(ref(db, `dayoff/list/${d}/${shortid.generate()}`), {
                  ...el,
                  uid: listData.uid,
                  userName: listData.userName,
                  userUid: listData.userUid,
                  manager: listData.manager,
                  reason: listData.reason,
                  subject: listData.subject,
                  restDayoff,
                })
                  .then(() => {
                    update(
                      ref(db, `dayoff/finish/${finishDate}/${listData.uid}`),
                      {
                        ...listData,
                        cancelManager: listData.manager[checkIdx],
                        nextManager: "",
                      }
                    );
                  })
                  .then(() => {
                    remove(ref(db, `dayoff/temp/${listData.uid}`));
                  })
                  .catch((error) => {
                    console.error(error);
                    return;
                  });
              });
              toast({
                description: "결재처리 되었습니다.",
                status: "success",
                duration: 1000,
                isClosable: false,
              });
              onRender();
              closePopup();
              resolve();
            }
          });
          //결재처리
        })
        .catch((error) => {
          console.error(error);
          resolve();
        });
    }
  };

  const onCancel = () => {
    const curIdx = listData.manager.findIndex((el) => el.id === userInfo.uid);
    update(ref(db, `dayoff/temp/${listData.uid}`), {
      ...listData,
      nextManager: listData.cancelManager,
      cancelManager: listData.manager[curIdx - 1] || "",
    }).then(() => {
      toast({
        description: "결제취소 되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
      closePopup();
    });
  };

  const onRemove = (uid) => {
    remove(ref(db, `dayoff/temp/${uid}`)).then(() => {
      toast({
        description: "삭제되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    });
    closePopup();
    return;
  };

  return (
    <>
      <ConfirmPopup>
        <div className="con_box">
          <h2>{listData.subject}</h2>
          <div className="info_box">
            <ul className="manager_list">
              <li>
                <div className="title">작성자</div>
                <div className="sign">{listData.userName}</div>
              </li>
            </ul>
            <Manager />
          </div>
          <DayOffList>
            <li className="header">
              <span className="type">유형</span>
              <span className="date">날짜</span>
              <span className="day">일수</span>
            </li>
            {listData &&
              listData.list.map((el) => (
                <>
                  <li>
                    <span className="type">{el.offType}</span>
                    <span className="date">{el.date}</span>
                    <span className="day">{el.day}</span>
                  </li>
                </>
              ))}
            <Flex justifyContent="center" mt="5">
              {listData.nextManager.id === userInfo?.uid && (
                <Button onClick={onSubmit} colorScheme="blue">
                  결재
                </Button>
              )}
              {listData.cancelManager.id === userInfo?.uid && (
                <Button onClick={onCancel} colorScheme="blue">
                  결재취소
                </Button>
              )}
              {ownCheck && (
                <>
                  <Box ml={2}></Box>
                  <Confirm
                    submit={onRemove}
                    submitProps={listData.uid}
                    color={"red"}
                    btnTxt={"삭제"}
                    closeTxt={"취소"}
                    submitTxt={"삭제"}
                    desc={`삭제하시겠습니까?`}
                  />
                </>
              )}
            </Flex>
          </DayOffList>
        </div>
        <div className="bg" onClick={closePopup}></div>
      </ConfirmPopup>
    </>
  );
}
