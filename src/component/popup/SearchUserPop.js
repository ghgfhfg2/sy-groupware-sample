import React, { useState, useEffect } from "react";
import {
  Button,
  CheckboxGroup,
  Checkbox,
  Flex,
  Input,
  useToast,
} from "@chakra-ui/react";
import { CommonPopup } from "@component/insa/UserModifyPop";
import { ListUl } from "@component/insa/UserList";
import styled from "styled-components";
import { IoMdAdd } from "react-icons/io";
const ManagerPopBox = styled(CommonPopup)`
  width: 100%;
  .search_box {
    margin-bottom: 10px;
    position: relative;
  }
  .search_list {
    position: absolute;
    left: 0;
    top: 45px;
    width: 100%;
    z-index: 10;
    ul {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 250px;
      overflow: auto;
      li {
        display: flex;
        align-items: center;
      }
    }
  }
`;

const UserSelect = styled(ListUl)`
  width: 90vw;
  max-width: 500px;
  .body {
    overflow: auto;
    max-height: 60vh;
  }
`;

export default function SearchUserPop({
  userData,
  closeManagerPop,
  onSelectManager,
  selectUser,
}) {
  const toast = useToast();
  const [userList, setUserList] = useState(selectUser);

  const onChageCheckItem = (e) => {
    setCheckedItems(e);
  };

  const [searchInput, setSearchInput] = useState();
  const onChangeInput = (e) => {
    setSearchInput(e.target.value);
  };

  const [searchUser, setSearchUser] = useState();
  let searchTimer;
  const onSearchUser = (e) => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      const val = e.target.value;
      const user = userData.filter((el) => el.name.indexOf(val) > -1);
      if (!val || user.length == 0) {
        setSearchUser("");
      } else {
        setSearchUser(user);
      }
    }, 200);
  };

  const onAddUser = (uid) => {
    if (userList && userList.find((el) => el == uid)) {
      toast({
        description: "이미 추가된 사람 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    const newUserList = userList ? [...userList] : [];
    newUserList.push(uid);
    setUserList(newUserList);
    toast({
      description: "받는사람이 추가 되었습니다.",
      status: "success",
      duration: 1000,
      isClosable: false,
    });
    setSearchInput("");
    setSearchUser("");
  };

  const onResetList = () => {
    setUserList("");
  };

  return (
    <ManagerPopBox>
      <div className="con_box">
        <div className="search_box">
          <Input
            onInput={onSearchUser}
            onChange={onChangeInput}
            value={searchInput}
            placeholder="추가할 사람의 이름을 입력해 주세요."
          />
          <div className="search_list">
            {searchUser && (
              <ul>
                {searchUser.map((el) => (
                  <>
                    <li>
                      <Button
                        onClick={() => onAddUser(el.uid)}
                        size="xs"
                        mr={2}
                      >
                        <IoMdAdd />
                        추가
                      </Button>
                      {el.name}
                    </li>
                  </>
                ))}
              </ul>
            )}
          </div>
        </div>
        <UserSelect>
          <ul className="header">
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
              {userData &&
                userData.map((el) => {
                  if (userList?.includes(el.uid)) {
                    return (
                      <li key={el.uid}>
                        <span className="box name">{el.name}</span>
                        <span className="box part">{el.part}</span>
                        <span className="box rank">{el.rank}</span>
                      </li>
                    );
                  }
                })}
            </ul>
          </CheckboxGroup>
        </UserSelect>
        <Flex justifyContent="center" mt={5}>
          <Button
            onClick={() => {
              onSelectManager(userList);
            }}
            colorScheme="blue"
            width="100px"
          >
            선택
          </Button>
          <Button colorScheme="red" ml={2} onClick={onResetList}>
            초기화
          </Button>
          <Button ml={2} onClick={closeManagerPop}>
            닫기
          </Button>
        </Flex>
      </div>
      <div className="bg" onClick={closeManagerPop}></div>
    </ManagerPopBox>
  );
}
