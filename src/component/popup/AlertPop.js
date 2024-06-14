import React, { useState, useEffect } from "react";
import { CommonPopup } from "@component/insa/UserModifyPop";
import { Button, Flex, Text, useToast } from "@chakra-ui/react";
import { db } from "src/firebase";
import { ref, remove, update } from "firebase/database";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
const AlertPopup = styled(CommonPopup)`
  .con_box {
    min-width: 360px;
    .list {
      li {
        text-align: center;
      }
      .tit {
        margin-right: 5px;
      }
      strong {
        font-size: 16px;
        margin-right: 3px;
      }
    }
  }
`;

function AlertPop({ alertState, closeAlertPop }) {
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  const typeObj = {
    message: "쪽지",
    dayoff: "연차결재",
    work: "프로젝트&유지보수",
    expenses: "지출결의서",
  };
  const [msgData, setMsgData] = useState();
  useEffect(() => {
    let arr = [];
    for (let key in alertState) {
      arr.push({
        type: typeObj[key],
        count: alertState[key],
      });
    }
    setMsgData(arr);
    update(ref(db, `user/${userInfo.uid}`), { alert_view: false });
    remove(ref(db, `user/${userInfo.uid}/alert`));
  }, []);

  return (
    <AlertPopup>
      <div className="con_box">
        <Flex mb={4} justifyContent="center">
          <Text as="b" fontSize="lg">
            알림
          </Text>
        </Flex>
        <ul className="list">
          {msgData &&
            msgData.map((el) => (
              <>
                <li>
                  <span className="tit">새 {el.type} 가(이) 있습니다.</span>
                </li>
              </>
            ))}
        </ul>
        <Flex gap={2} mt={5} justifyContent="center">
          <Button onClick={closeAlertPop} colorScheme="blue">
            확인
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closeAlertPop}></div>
    </AlertPopup>
  );
}

export default AlertPop;
