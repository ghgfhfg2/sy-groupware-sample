import React, { useState, useEffect } from "react";
import { Button, CheckboxGroup, Checkbox, Flex } from "@chakra-ui/react";
import { db } from "src/firebase";
import {
  ref,
  set,
  onValue,
  off,
  query,
  update,
  orderByChild,
  equalTo,
} from "firebase/database";
import { CommonPopup } from "@component/insa/UserModifyPop";
import { ListUl } from "@component/insa/UserList";
import styled from "styled-components";
const ManagerPopBox = styled(CommonPopup)`
  width: 100%;
`;

const ManagerSelect = styled(ListUl)`
  width: 90vw;
  max-width: 500px;
  .chk {
    max-width: 50px;
  }
  .name {
    max-width: 80px;
  }
  .body {
    overflow: auto;
    max-height: 60vh;
  }
  .body .name {
    justify-content: flex-start;
  }
`;

export default function SelectManagerPop({
  userData,
  closeManagerPop,
  onSelectManager,
  selectUser,
}) {
  const [userList, setUserList] = useState();
  const [checkedItems, setCheckedItems] = useState();

  useEffect(() => {
    const filterUser = userData.filter((el) => !el.hidden);
    setUserList(filterUser);
  }, []);

  const onChageCheckItem = (e) => {
    setCheckedItems(e);
  };

  return (
    <ManagerPopBox>
      <div className="con_box">
        <ManagerSelect>
          <ul className="header">
            <li className="box chk"></li>
            <li className="box name">이름</li>
            <li className="box part">부서</li>
            <li className="box rank">직급</li>
          </ul>
          <CheckboxGroup
            onChange={onChageCheckItem}
            defaultValue={selectUser}
            colorScheme="blue"
          >
            <ul className="body">
              {userList &&
                userList.map((el) => (
                  <>
                    <li key={el.uid}>
                      <span className="box chk">
                        <Checkbox value={el.uid}></Checkbox>
                      </span>
                      <span className="box name">{el.name}</span>
                      <span className="box part">{el.part}</span>
                      <span className="box rank">{el.rank}</span>
                    </li>
                  </>
                ))}
            </ul>
          </CheckboxGroup>
        </ManagerSelect>
        <Flex justifyContent="center" mt={5}>
          <Button
            onClick={() => {
              onSelectManager(checkedItems);
            }}
            colorScheme="blue"
            width="100px"
          >
            선택
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closeManagerPop}></div>
    </ManagerPopBox>
  );
}
