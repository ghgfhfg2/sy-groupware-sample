import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import {
  HStack,
  Box,
  FormLabel,
  FormErrorMessage,
  FormControl,
  Input,
  Button,
  Flex,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import useGetUser from "@component/hooks/getUserDb";
import { imageResize } from "@component/hooks/useImgResize";
import { AiOutlineDelete, AiOutlineEnter } from "react-icons/ai";
import { HiOutlinePlus } from "react-icons/hi";
import { BsPencilSquare, BsListCheck, BsUpload } from "react-icons/bs";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import AdminSelectPop from "@component/insa/AdminSelectPop";
import ManagerSelectPop from "@component/insa/ManagerSelectPop";
import { updateAllUser } from "@redux/actions/user_action";
import styled from "styled-components";
import shortid from "shortid";
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
  orderByValue,
  startAt,
} from "firebase/database";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  deleteObject,
} from "firebase/storage";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { RiDragDropLine } from "react-icons/ri";

export const CommonForm = styled.form`
  .row_section {
    margin-bottom: 1rem;
    border-bottom: 1px solid #eee;
    padding: 0 1rem 1rem 1rem;
  }
  .row_box {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    .label {
      width: 100px;
      margin: 0;
      font-weight: bold;
      flex-shrink: 0;
    }
    .xs {
      width: 12.5%;
    }
    .sm {
      width: 25%;
    }
    .md {
      width: 50%;
    }
    .lg {
      width: 100%;
    }
    .read_only {
      background: #f1f1f1;
    }
  }
  .manager_list {
    li {
      margin-top: 10px;
    }
  }
  .thumb {
    max-height: 40px;
    margin-right: 15px;
  }
  .empty_thumb {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .input_file {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
  }
  .file_name {
    padding: 0 1rem;
  }
  .btn_upload {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    margin: 0;
  }
  .part_list {
    overflow: auto;
    & > div {
      display: flex;
      margin: 10px 0;
    }
    li {
      padding: 7px 55px 7px 12px;
      border: 1px solid #1a365d;
      border-radius: 4px;
      background: #fff;
      margin-right: 5px;
      margin-bottom: 5px;
      position: relative;
      button {
        margin-left: 5px;
      }
      .modify_box {
        position: absolute;
        z-index: 10;
        left: 1px;
        top: 1px;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        padding: 0 10px;
        display: flex;
        align-items: center;
        background: #fff;
        input {
          border: 0;
          flex: 1;
          height: 100%;
          width: 100%;
        }
      }
      .btn_box {
        display: inline-block;
        position: absolute;
        right: 12px;
      }
      &.is_dragging {
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
      }
    }
  }
  .logo_input_box {
    display: flex;
    flex-wrap: wrap;
    img {
      margin: 0 10px 10px 0;
    }
  }
  @media screen and (max-width: 1024px) {
    .row_box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .label {
        width: 100px;
        margin: 0;
        margin-bottom: 10px;
        flex-shrink: 0;
      }
      .xs {
        width: 100%;
      }
      .sm {
        width: 100%;
      }
      .md {
        width: 100%;
      }
      .lg {
        width: 100%;
      }
      .read_only {
        background: #f1f1f1;
      }
      .manager_sel_btn_box {
        margin-top: 10px;
        justify-content: flex-end;
        display: flex;
        width: 100%;
      }
    }
  }
`;

export default function Setting() {
  const toast = useToast();
  useGetUser();
  const dispatch = useDispatch();
  const userAll = useSelector((state) => state.user.allUser);
  const router = useRouter();
  const [isAdminPop, setIsAdminPop] = useState(false);
  const [isManagerPop, setIsManagerPop] = useState(false);
  const {
    getValues,
    setValue,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const storage = getStorage();
  const logoRef = sRef(storage, "company/logo");

  const [partList, setPartList] = useState([]);
  const [rankList, setRankList] = useState([]);

  const [settingState, setSettingState] = useState();

  const [logoThumb, setLogoThumb] = useState();
  useEffect(() => {
    getDownloadURL(logoRef)
      .then((res) => {
        setLogoThumb(res);
      })
      .catch((error) => {
        console.error(error);
      });

    const adminRef = ref(db, `admin/setting`);
    onValue(adminRef, (data) => {
      if (!data.val()) {
        return;
      }
      setSettingState(data.val());
      setPartList(data.val().part);
      setRankList(data.val().rank);
    });
    return () => {
      off(adminRef);
    };
  }, []);

  const onAdminPop = () => {
    setIsAdminPop(true);
  };
  const closeAdminPop = () => {
    setIsAdminPop(false);
  };

  const [selectAdmin, setSelectAdmin] = useState();

  useEffect(() => {
    if (userAll) {
      let adminList = userAll.filter((el) => {
        return el.authority?.includes("admin");
      });
      setSelectAdmin(adminList);
    }
  }, [userAll]);

  const onSelectAdmin = (checkedItems) => {
    const newUserAll = userAll.map((el) => {
      let userRef = ref(db, `user/${el.uid}`);
      if (checkedItems.includes(el.uid)) {
        let newAuth = el.authority ? el.authority.split(" ") : [];
        if (!newAuth.includes("admin")) {
          newAuth.push("admin");
        }
        newAuth = newAuth.join(" ");
        el.authority = newAuth;
        update(userRef, {
          authority: newAuth,
        });
      } else if (el.authority) {
        let newAuth = el.authority.split(" ");
        newAuth = newAuth.filter((el) => el !== "admin");
        newAuth = newAuth.join(" ");
        el.authority = newAuth;
        update(userRef, {
          authority: newAuth,
        });
      }
      return el;
    });
    setSelectAdmin();
    dispatch(updateAllUser(newUserAll));
    closeAdminPop();
  };

  const onManagerPop = () => {
    setIsManagerPop(true);
  };
  const closeManagerPop = () => {
    setIsManagerPop(false);
  };
  const onSelectManager = (checkedItems) => {
    const newUserAll = userAll.map((el) => {
      let userRef = ref(db, `user/${el.uid}`);
      if (checkedItems.includes(el.uid)) {
        el.manager = 1;
        update(userRef, {
          manager: 1,
        });
      } else {
        el.manager = 0;
        update(userRef, {
          manager: 0,
        });
      }
      return el;
    });
    dispatch(updateAllUser(newUserAll));
    closeManagerPop();
  };

  const onAddPart = (type, sort) => {
    const val = getValues(sort);
    if (val.length === 0) {
      return;
    }
    if (type === "part") {
      let newArr = [...partList];
      let obj = {
        uid: shortid.generate(),
        name: val,
        state: 1,
      };
      newArr.push(obj);
      setPartList(newArr);
    }
    if (type === "rank") {
      let newArr = [...rankList];
      let obj = {
        uid: shortid.generate(),
        name: val,
        state: 1,
      };
      newArr.push(obj);
      setRankList(newArr);
    }
    setValue(sort, "");
  };
  const onRemovePart = (type, uid, name) => {
    let agree = confirm(`${name}을(를) 삭제하시겠습니까?`);
    if (agree) {
      if (type === "part") {
        let newArr = [...partList];
        newArr = newArr.filter((el) => el.uid !== uid);
        setPartList(newArr);
      }
      if (type === "rank") {
        let newArr = [...rankList];
        newArr = newArr.filter((el) => el.uid !== uid);
        setRankList(newArr);
      }
    }
  };

  //부서 수정열기
  const onModifyPart = (type, uid) => {
    if (type === "part") {
      let newArr = [...partList];
      newArr = newArr.map((el) => {
        if (el.uid === uid) {
          el.state = 2;
        }
        return el;
      });
      setPartList(newArr);
    }
    if (type === "rank") {
      let newArr = [...rankList];
      newArr = newArr.map((el) => {
        if (el.uid === uid) {
          el.state = 2;
        }
        return el;
      });
      setRankList(newArr);
    }
    setTimeout(() => {
      document.getElementById(uid).focus();
    }, 100);
  };

  //부서 수정완료
  const onModiPartSubmit = (type, uid) => {
    if (type === "part") {
      let newArr = [...partList];
      newArr = newArr.map((el) => {
        if (el.uid === uid) {
          (el.state = 1), (el.name = document.getElementById(uid).value);
        }
        return el;
      });
      setPartList(newArr);
    }
    if (type === "rank") {
      let newArr = [...rankList];
      newArr = newArr.map((el) => {
        if (el.uid === uid) {
          (el.state = 1), (el.name = document.getElementById(uid).value);
        }
        return el;
      });
      setRankList(newArr);
    }
  };

  const [logoName, setLogoName] = useState();

  const logoCheck = async () => {
    const file = getValues("logo")[0];
    const thumbnail = await imageResize(file, 50);
    const limit = 2097152;
    if (!file) {
      return;
    }
    if (file.size > limit) {
      toast({
        description: "이미지 용량은 2MB 이내로 등록 가능합니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      setValue("logo", "");
      setLogoName("");
      setLogoThumb("");
      return;
    }
    if (
      file.type !== "image/svg+xml" &&
      file.type !== "image/gif" &&
      file.type !== "image/png" &&
      file.type !== "image/jpeg"
    ) {
      toast({
        description: "지원하지않는 형식 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      setValue("logo", "");
      setLogoName("");
      setLogoThumb("");
      return;
    }
    setLogoName(file.name);
    setLogoThumb(thumbnail);
  };

  const removeLogo = () => {
    setLogoThumb("");
    deleteObject(logoRef)
      .then(() => {
        toast({
          description: "삭제 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
      })
      .catch((error) => console.error(error));
  };

  const onSubmit = (values) => {
    let newValues;
    return new Promise((resolve) => {
      if (values.logo[0]) {
        uploadBytes(logoRef, values.logo[0]);
      }
      newValues = {
        ...values,
        part: partList || "",
        rank: rankList || "",
      };
      const setRef = ref(db, `admin/setting`);

      set(setRef, {
        ...newValues,
      })
        .then(() => {
          toast({
            description: "수정 되었습니다.",
            status: "success",
            duration: 1000,
            isClosable: false,
          });
        })
        .catch((error) => console.error(error));
      resolve();
    });
  };

  //dnd
  const onDragEnd = ({ source, destination }) => {
    const _items = JSON.parse(JSON.stringify(rankList));
    const [targetItem] = _items.splice(source.index, 1);
    _items.splice(destination.index, 0, targetItem);
    setRankList(_items);
  };

  const onDragEndPart = ({ source, destination }) => {
    const _items = JSON.parse(JSON.stringify(partList));
    const [targetItem] = _items.splice(source.index, 1);
    _items.splice(destination.index, 0, targetItem);
    setPartList(_items);
  };

  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }
  return (
    <>
      {
        <CommonForm onSubmit={handleSubmit(onSubmit)}>
          <Flex marginTop={5}>
            <Flex
              width="100%"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              <FormControl isInvalid={errors.company} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="company">
                    회사명
                  </FormLabel>
                  <Input
                    id="company"
                    className="input sm"
                    placeholder="회사명"
                    defaultValue={settingState?.company}
                    {...register("company")}
                  />
                </div>
              </FormControl>
              <FormControl isInvalid={errors.adress} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="adress">
                    회사주소
                  </FormLabel>
                  <Input
                    id="adress"
                    className="input lg"
                    placeholder="회사주소"
                    defaultValue={settingState?.adress}
                    {...register("adress")}
                  />
                </div>
              </FormControl>
              <FormControl isInvalid={errors.logo} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="logo">
                    회사로고
                  </FormLabel>
                  <div className="logo_input_box">
                    <input
                      id="logo"
                      type="file"
                      className="input_file"
                      {...register("logo", {
                        onChange: logoCheck,
                      })}
                    />
                    {logoThumb ? (
                      <img className="thumb" src={logoThumb} />
                    ) : (
                      <div className="empty_thumb">
                        <MdOutlineImageNotSupported fontSize="18px" />
                      </div>
                    )}
                    <Button colorScheme="blue" type="button" px={0}>
                      <FormLabel className="btn_upload" htmlFor="logo">
                        파일첨부
                        <BsUpload style={{ marginLeft: "5px" }} />
                      </FormLabel>
                    </Button>
                    <Button
                      onClick={removeLogo}
                      ml={2}
                      colorScheme="blue"
                      variant="outline"
                      type="button"
                    >
                      삭제
                      <AiOutlineDelete />
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormControl isInvalid={errors.admin} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="admin">
                    관리자
                  </FormLabel>
                  <Box size="lg">
                    <Button onClick={onAdminPop} colorScheme="blue">
                      편집
                      <BsListCheck style={{ marginLeft: "5px" }} />
                    </Button>
                    <ul className="manager_list">
                      {selectAdmin &&
                        selectAdmin.map((el) => (
                          <>
                            <li>
                              {el.name}
                              {el.rank && `(${el.rank})`}
                              {el.part && `- ${el.part}`}
                            </li>
                          </>
                        ))}
                    </ul>
                  </Box>
                </div>
              </FormControl>
              <FormControl isInvalid={errors.manager} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="manager">
                    담당자
                  </FormLabel>
                  <Box size="lg">
                    <Button onClick={onManagerPop} colorScheme="blue">
                      편집
                      <BsListCheck style={{ marginLeft: "5px" }} />
                    </Button>
                    <ul className="manager_list">
                      {userAll &&
                        userAll.map((el) => {
                          if (el.manager === 1) {
                            return (
                              <li>
                                {el.name}
                                {el.rank && `(${el.rank})`}
                                {el.part && `- ${el.part}`}
                              </li>
                            );
                          }
                        })}
                    </ul>
                  </Box>
                </div>
              </FormControl>
              <FormControl isInvalid={errors.part} className="row_section">
                <div className="row_box">
                  <Tooltip
                    hasArrow
                    label="드래그 & 드랍으로 순서변경"
                    bg="blue.500"
                    color="#fff"
                  >
                    <FormLabel className="label" htmlFor="part">
                      <Flex alignItems="center">
                        부서
                        <RiDragDropLine style={{ marginLeft: "5px" }} />
                      </Flex>
                    </FormLabel>
                  </Tooltip>
                  <Box className="lg">
                    <Flex>
                      <Input
                        id="part"
                        placeholder="추가할 부서명"
                        className="input xs"
                        {...register("part")}
                      />
                      <Button
                        onClick={() => onAddPart("part", "part")}
                        colorScheme="blue"
                        ml={2}
                      >
                        <HiOutlinePlus fontSize="1.1rem" />
                      </Button>
                    </Flex>

                    {partList && partList.length > 0 && (
                      <>
                        <ul className="part_list">
                          <DragDropContext onDragEnd={onDragEndPart}>
                            <Droppable
                              droppableId="droppable"
                              direction="horizontal"
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {partList.map((el, index) => (
                                    <Draggable
                                      key={el.uid}
                                      draggableId={el.uid}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <li
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={
                                            snapshot.isDragging
                                              ? "is_dragging"
                                              : ""
                                          }
                                        >
                                          {el.name}
                                          {el.state === 2 && (
                                            <>
                                              <div className="modify_box">
                                                <input
                                                  type="text"
                                                  id={el.uid}
                                                  defaultValue={el.name}
                                                ></input>
                                                <button
                                                  onClick={() =>
                                                    onModiPartSubmit(
                                                      "part",
                                                      el.uid
                                                    )
                                                  }
                                                  type="button"
                                                >
                                                  <AiOutlineEnter />
                                                </button>
                                              </div>
                                            </>
                                          )}
                                          <div className="btn_box">
                                            <button
                                              onClick={() => {
                                                onModifyPart("part", el.uid);
                                              }}
                                              type="button"
                                            >
                                              <BsPencilSquare />
                                            </button>
                                            <button
                                              onClick={() => {
                                                onRemovePart(
                                                  "rank",
                                                  el.uid,
                                                  el.name
                                                );
                                              }}
                                              type="button"
                                            >
                                              <AiOutlineDelete />
                                            </button>
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </ul>
                      </>
                    )}
                  </Box>
                </div>
              </FormControl>
              <FormControl isInvalid={errors.rank} className="row_section">
                <div className="row_box">
                  <Tooltip
                    hasArrow
                    label="드래그& 드랍으로 순서변경"
                    bg="blue.500"
                    color="#fff"
                  >
                    <FormLabel className="label" htmlFor="rank">
                      <Flex alignItems="center">
                        직급
                        <RiDragDropLine style={{ marginLeft: "5px" }} />
                      </Flex>
                    </FormLabel>
                  </Tooltip>
                  <Box className="lg">
                    <Flex>
                      <Input
                        id="rank"
                        placeholder="추가할 직급명"
                        className="input xs"
                        {...register("rank")}
                      />
                      <Button
                        onClick={() => onAddPart("rank", "rank")}
                        colorScheme="blue"
                        ml={2}
                      >
                        <HiOutlinePlus fontSize="1.1rem" />
                      </Button>
                    </Flex>
                    {rankList?.length > 0 && (
                      <>
                        <ul className="part_list">
                          <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable
                              droppableId="droppable"
                              direction="horizontal"
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {rankList.map((el, index) => (
                                    <Draggable
                                      key={el.uid}
                                      draggableId={el.uid}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <li
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={
                                            snapshot.isDragging
                                              ? "is_dragging"
                                              : ""
                                          }
                                        >
                                          {el.name}
                                          {el.state === 2 && (
                                            <>
                                              <div className="modify_box">
                                                <input
                                                  type="text"
                                                  id={el.uid}
                                                  defaultValue={el.name}
                                                ></input>
                                                <button
                                                  onClick={() =>
                                                    onModiPartSubmit(
                                                      "rank",
                                                      el.uid
                                                    )
                                                  }
                                                  type="button"
                                                >
                                                  <AiOutlineEnter />
                                                </button>
                                              </div>
                                            </>
                                          )}
                                          <div className="btn_box">
                                            <button
                                              onClick={() => {
                                                onModifyPart("rank", el.uid);
                                              }}
                                              type="button"
                                            >
                                              <BsPencilSquare />
                                            </button>
                                            <button
                                              onClick={() => {
                                                onRemovePart(
                                                  "rank",
                                                  el.uid,
                                                  el.name
                                                );
                                              }}
                                              type="button"
                                            >
                                              <AiOutlineDelete />
                                            </button>
                                          </div>
                                        </li>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </ul>
                      </>
                    )}
                  </Box>
                </div>
              </FormControl>
              {/* submit */}
              <Flex
                width="150px"
                mt={4}
                flexDirection="column"
                justifyContent="center"
              >
                <Button
                  mb={2}
                  width="100%"
                  size="lg"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  저장
                  {isSubmitting}
                </Button>
              </Flex>
              {/* submit */}
            </Flex>
          </Flex>
        </CommonForm>
      }
      {isAdminPop && userAll && (
        <AdminSelectPop
          userData={userAll}
          closeAdminPop={closeAdminPop}
          onSelectAdmin={onSelectAdmin}
        />
      )}
      {isManagerPop && userAll && (
        <ManagerSelectPop
          userData={userAll}
          closeManagerPop={closeManagerPop}
          onSelectManager={onSelectManager}
          isManagerPop={isManagerPop}
        />
      )}
    </>
  );
}
