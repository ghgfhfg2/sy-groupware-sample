import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import AlertBox from "@component/popup/Alert";
import OffWrite from "@component/schedule/OffWrite";
import useGetUser from "@component/hooks/getUserDb";

export default function Write() {
  useGetUser();
  const userInfo = useSelector((state) => state.user.currentUser);
  const userAll = useSelector((state) => state.user.allUser);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertState, setAlertState] = useState(false);

  return (
    <>
      {alertState && <AlertBox text={alertMessage} />}
      <OffWrite userInfo={userInfo} userAll={userAll} />
    </>
  );
}
