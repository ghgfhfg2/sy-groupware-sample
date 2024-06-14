import { useState, useEffect } from "react";
import { app, db } from "src/firebase";
import { ref, get, off, set, runTransaction, update } from "firebase/database";
import { useDispatch } from "react-redux";
import { setAllUser } from "@redux/actions/user_action";

export default function useGetUser() {
  const dispatch = useDispatch();
  const [userList, setUserList] = useState();
  const [adminSetting, setAdminSetting] = useState();
  useEffect(() => {
    const dbRef = ref(db, `user`);
    const adminRef = ref(db, `admin/setting`);
    const fetchUser = async () => {
      const adminSetting = await (await get(adminRef)).val();
      if (!adminSetting) {
        return;
      }
      let partList = {};
      let rankList = {};
      adminSetting.part &&
        adminSetting.part.forEach((el) => {
          partList[el.uid] = el.name;
        });
      adminSetting.rank &&
        adminSetting.rank.forEach((el) => {
          rankList[el.uid] = el.name;
        });
      setAdminSetting({ partList, rankList });
      const userArr = await get(dbRef);

      let arr = [];
      userArr.forEach((list) => {
        let user = {
          ...list.val(),
          uid: list.key,
          part: list.val().part ? partList[list.val().part] : "",
          rank: list.val().rank ? rankList[list.val().rank] : "",
        };
        arr.push(user);
      });
      setUserList(arr);
      dispatch(setAllUser(arr));
    };
    fetchUser();
  }, []);

  return [userList, adminSetting];
}
