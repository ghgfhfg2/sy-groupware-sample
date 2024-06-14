import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Flex, useToast } from "@chakra-ui/react";

import { db } from "src/firebase";
import { ref, onValue, remove } from "firebase/database";
import styled from "styled-components";
import { ListUl } from "@component/insa/UserList";
import Confirm from "@component/popup/Confirm";

const BoardList = styled(ListUl)`
  .admin {
    width: 100px;
    flex: 0 1 auto;
  }
`;

export default function TypeBoardList() {
  const toast = useToast();
  const [typeList, setTypeList] = useState();
  useEffect(() => {
    const listRef = ref(db, `board/type_list`);
    onValue(listRef, (data) => {
      let arr = [];
      data.forEach((el) => {
        arr.push(el.val());
      });
      setTypeList(arr);
    });

    return () => {};
  }, []);

  const onDeleteType = (uid) => {
    const removeRef = ref(db, `board/type_list/${uid}`);
    remove(removeRef).then(() => {
      toast({
        description: "삭제되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
    });
  };

  return (
    <>
      <BoardList>
        <ul className="header">
          <li className="box title">양식명</li>
          <li className="box admin"></li>
        </ul>
        <ul className="body">
          {typeList &&
            typeList.map((el, idx) => (
              <li key={idx}>
                <Link href={`/setting/type_write/${el.uid}`}>
                  <span className="box title link">{el.title}</span>
                </Link>
                <span className="box admin">
                  <Confirm
                    submit={onDeleteType}
                    submitProps={el.uid}
                    color={"red"}
                    btnTxt={"삭제"}
                    closeTxt={"취소"}
                    submitTxt={"삭제"}
                    desc={`삭제하시겠습니까?`}
                  />
                </span>
              </li>
            ))}
        </ul>
      </BoardList>
      <Flex justifyContent="flex-end" mt={5}>
        <Link href="/setting/type_write">
          <Button colorScheme="blue">양식작성</Button>
        </Link>
      </Flex>
    </>
  );
}
