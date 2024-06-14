import React from "react";
import { Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { db } from "src/firebase";
import {
  ref,
  get,
  set,
  update,
  remove,
  query,
  orderByValue,
  orderByChild,
  equalTo,
  runTransaction,
  onValue,
} from "firebase/database";
import { ConfirmPopup } from "@component/schedule/ConfirmPop";
import { DayOffList } from "@component/schedule/OffWrite";
import styled from "styled-components";
import shortid from "shortid";
import { format } from "date-fns";

export default function FinishPop({ listData, userInfo, closePopup }) {
  const dispatch = useDispatch();

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

  function onSubmit() {
    return new Promise((resolve) => {
      let finishDate = format(listData.timestamp, "yyyyMM");
      runTransaction(
        ref(db, `user/${listData.userUid.trim()}/dayoff`),
        (pre) => {
          return Number(pre) + Number(listData.daySum);
        }
      ).then(() => {
        update(ref(db, `dayoff/temp/${listData.uid}`), {
          ...listData,
          nextManager: listData.cancelManager,
          cancelManager: listData.manager[listData.manager.length - 2] || "",
        })
          .then(() => {
            listData.list.forEach((el) => {
              let d = format(new Date(el.date), "yyyyMMdd");
              onValue(
                query(
                  ref(db, `dayoff/list/${d}`),
                  orderByChild("uid"),
                  equalTo(listData.uid)
                ),
                (data) => {
                  for (const key in data.val()) {
                    remove(ref(db, `dayoff/list/${d}/${key}`));
                  }
                }
              );
            });
          })
          .then(() => {
            remove(ref(db, `dayoff/finish/${finishDate}/${listData.uid}`));
          })
          .then(() => {
            closePopup();
            resolve();
          })
          .catch((error) => {
            console.error(error);
            resolve();
          });
      });
    });
  }

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
              {listData.cancelManager.id === userInfo?.uid && (
                <Button onClick={onSubmit} colorScheme="blue">
                  결재취소
                </Button>
              )}
            </Flex>
          </DayOffList>
        </div>
        <div className="bg" onClick={closePopup}></div>
      </ConfirmPopup>
    </>
  );
}
