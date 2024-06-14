import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "src/firebase";
import { ref, onValue, remove } from "firebase/database";
import styled from "styled-components";
import None from "@component/None";
import useGetUser from "@component/hooks/getUserDb";
import { Button, Flex, useToast } from "@chakra-ui/react";
import { MdOutlineEmail } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";
import { BsCommand } from "react-icons/bs";
import { GoNote } from "react-icons/go";
import { GrUserManager } from "react-icons/gr";
import { BiPhoneCall } from "react-icons/bi";
import PartnersModifyPop from "./PartnersModifyPop";
import ComConfirm from "../popup/Confirm";

const PartnersLi = styled.ul`
  li {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 15px;
    overflow: hidden;
    .name {
      font-size: 1rem;
      font-weight: 600;
      padding: 0.7rem 1.5rem;
      background: #319795;
      color: #fff;
    }
    .left_box {
      flex: 1;
      & > div {
        margin: 5px 0;
        display: flex;
        align-items: center;
        svg {
          margin-right: 5px;
          font-size: 1rem;
        }
      }
    }
    .right_box {
      display: flex;
      flex-direction: column;
      margin-left: 1rem;
      justify-content: center;
    }
  }
  @media screen and (min-width: 1024px) {
    display: flex;
    flex-wrap: wrap;
    li {
      width: calc(50% - 0.5rem);
      margin-right: 1rem;
    }
    li:nth-child(2n + 2) {
      margin-right: 0;
    }
  }
`;

export default function PartnerList() {
  const toast = useToast();
  const getUserInfo = useGetUser();
  let userAll = useSelector((state) => state.user.allUser);
  const [managerList, setManagerList] = useState();
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
      let managerArr = [];
      userAll.map((el) => {
        if (el.manager == "1") {
          managerArr.push(el);
        }
      });
      setManagerList(managerArr);
    }
  }, [userAll]);

  const [partnerList, setPartnerList] = useState();
  useEffect(() => {
    const pRef = ref(db, `partners/list`);
    onValue(pRef, (data) => {
      let arr = [];
      const list = data.val();
      for (const key in list) {
        list[key].uid = key;
        arr.push(list[key]);
      }
      arr = arr.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        if (a.name === b.name) return 0;
        else return -1;
      });
      setPartnerList(arr);
    });

    return () => {};
  }, []);

  const [partnerData, setPartnerData] = useState();
  const [isModifyPop, setIsModifyPop] = useState(false);
  const onModify = (uid) => {
    let data = partnerList.filter((el) => el.uid === uid);
    data[0].uid = uid;
    setPartnerData([data[0], uid]);
    setIsModifyPop(true);
  };

  const closeModifyPop = () => {
    setPartnerData("");
    setIsModifyPop(false);
  };

  const onRemove = (uid) => {
    const pRef = ref(db, `partners/list/${uid}`);
    remove(pRef).then(() => {
      toast({
        description: "삭제되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    });
  };

  return (
    <>
      <PartnersLi>
        {partnerList &&
          partnerList.map((el) => (
            <li key={el.uid}>
              <div className="name">{el.name}</div>
              <Flex
                flex={1}
                padding="1rem 1.5rem"
                justifyContent="space-between"
              >
                <div className="left_box">
                  <div className="email">
                    {el.email && (
                      <>
                        <MdOutlineEmail />
                        {el.email}
                      </>
                    )}
                  </div>
                  <div className="call">
                    {el.call && (
                      <>
                        <BiPhoneCall />
                        {el.call}
                      </>
                    )}
                  </div>
                  <div className="address">
                    {el.address2 && (
                      <>
                        <FiMapPin />
                        {el.address2}
                        {el.address2 && `, ${el.address3}`}
                      </>
                    )}
                  </div>
                  <div className="p_manager">
                    {el.p_manager && el.p_manager_rank && (
                      <>
                        <GrUserManager />
                        {el.p_manager}({el.p_manager_rank})
                      </>
                    )}
                  </div>
                  <div className="role">
                    {el.role && (
                      <>
                        <BsCommand />
                        {el.role}
                      </>
                    )}
                  </div>
                  <div className="manager">
                    {el.manager && (
                      <>
                        <GrUserManager />
                        {el.manager.map((el, idx) => (
                          <span key={idx}>{el.name}</span>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="etc">
                    {el.etc && (
                      <>
                        <GoNote />
                        {el.etc}
                      </>
                    )}
                  </div>
                </div>
                <div className="right_box">
                  <Button
                    mb={2}
                    variant="outline"
                    onClick={() => onModify(el.uid)}
                  >
                    수정
                  </Button>
                  <ComConfirm
                    btnTxt="삭제"
                    color="red"
                    desc="삭제 하시겠습니까?"
                    closeTxt="취소"
                    submitTxt="삭제"
                    submit={onRemove}
                    submitProps={el.uid}
                  />
                </div>
              </Flex>
            </li>
          ))}
      </PartnersLi>
      {isModifyPop && partnerData && (
        <PartnersModifyPop
          partnerData={partnerData}
          managerList={managerList}
          closeModifyPop={closeModifyPop}
        />
      )}
    </>
  );
}
