import React, { useEffect } from "react";
import { db } from "src/firebase";
import {
  ref,
  set,
  update,
  remove,
  query,
  orderByValue,
  orderByChild,
  equalTo,
  runTransaction,
  onValue,
  orderByKey,
  startAt,
  endAt,
} from "firebase/database";

export const onSendAlert = (userList, type) => {
  userList.forEach((el) => {
    runTransaction(ref(db, `user/${el}/alert/${type}`), (pre) => {
      return Number(pre) + 1;
    });
    update(ref(db, `user/${el}`), { alert_view: true });
  });
};

export const onReadAlert = (user, type) => {
  runTransaction(ref(db, `user/${user}/alert/${type}`), (pre) => {
    return Number(pre) - 1;
  });
};
