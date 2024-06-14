import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { CommonForm } from "pages/setting";
import { useForm } from "react-hook-form";
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Button,
  Input,
  Box,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  Select,
} from "@chakra-ui/react";
import { BsListCheck } from "react-icons/bs";
import {
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlineDelete,
  AiOutlinePlusSquare,
  AiOutlineSetting,
} from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import useGetUser from "@component/hooks/getUserDb";
import styled from "styled-components";
import axios from "axios";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

const WorkCateBox = styled.div`
  input{background:#fff}
  ul.depth_1 {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  ul.depth_1 ul {
    display: none;
    padding-left: 10px;
    margin-top: 5px;
    padding:10px;
    border-radius:4px;
    background:rgba(38, 115, 100,0.08)
  }
  ul.depth_1 > li {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  ul.depth_1 > li > .tit {
    font-size: 16px;
  }
  .tit_box {
    display: flex;
    align-items: center;
    .ic_setting {
      position: relative;
      z-index: -1;
      opacity: 0;
      transition: all 0.1s;
      margin-left:10px;
      width:20px;height:20px;
      padding:2px;
      cursor:pointer;
    }
    .ic_setting.on{
      border:1px solid #555;
      color:#fff;
      background:#555;
      border-radius:2px;
    }
    &:hover .ic_setting, .ic_setting.on{
        opacity: 1;
        z-index: 1;
      }
    }
  }
  .tit {
    &.depth_1 {
      font-size: 16px;
    }
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 600;
    padding-left: 17px;
    position: relative;
    .ic {
      position: absolute;
      left: 0;
      top: 5px;
      width: 11px;
      height: 11px;
      &::after {
        content: "";
        display: inline-block;
        width: 11px;
        height: 1px;
        background: #555;
        position: absolute;
        top: 5px;
        left: 0;
      }
      &::before {
        content: "";
        display: inline-block;
        width: 1px;
        height: 11px;
        background: #555;
        position: absolute;
        left: 5px;
        top: 0;
        transition: all 0.2s;
      }
    }
  }
  ul.depth_1 ul.on {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  ul.depth_3.on {
    margin-top:10px;
    margin-left:10px;
    margin-right:10px;
    gap: 5px !important;
  }

  .tit.open > .ic {
    &::before {
      transform: rotate(90deg);
    }
  }
  .btn_add {
    background: none;
    padding: 2px;
    width: auto;
    height: auto;
    min-width: 0;
    border: 1px solid #555;
    border-radius: 3px;
    &.modify {
      border: 0;
    }
    &.remove{
      border-radius:3px;
      border:0;
    }
    .ic {
      width: 9px;
      height: 9px;
      position: relative;
      &::after {
        content: "";
        display: inline-block;
        width: 7px;
        height: 1px;
        background: #555;
        position: absolute;
        top: 4px;
        left: 1px;
      }
      &::before {
        content: "";
        display: inline-block;
        width: 1px;
        height: 7px;
        background: #555;
        position: absolute;
        left: 4px;
        top: 1px;
        transition: all 0.2s;
      }
    }
    &.on .ic::before {
      display: none;
    }
  }
  .add_cate_box {
    display: none;
    align-items: center;
    &.on {
      display: flex;
    }
  }
  ul.depth_3 li {
    font-size: 12px;
    font-weight: 400;
    .tit {
      cursor: auto;
      padding-left:5px;
    }
  }
  .setting_box {
    display: flex;
    align-items: center;
    position:relative;
    z-index:-1;
    opacity:0;
    height:0;
    &.on{
      height:auto;
      opacity:1;
      z-index:1;
    }
  }
  .cate_order_list{
    display:flex;
    margin-bottom:15px;
    flex-direction:column;
    align-items:flex-start;
    gap:5px;
    .order{
      display:inline-block;
      padding:5px 10px;border:1px solid #555;
      border-radius:5px;
      background:#fff;
    }
  }
`;

function WorkCate() {
  const router = useRouter();
  useGetUser();
  const toast = useToast();

  const userAll = useSelector((state) => state.user.allUser);
  const userInfo = useSelector((state) => state.user.currentUser);

  const toggleDepth = (e, depth) => {
    const tit = e.currentTarget;
    const li = tit.closest("li");
    const ul = li.querySelector(`ul[data-depth="${depth}"]`);
    tit.classList.toggle("open");
    ul.classList.toggle("on");
  };

  const onDepthInput = (e, depth) => {
    const btn = e.currentTarget;
    btn.classList.toggle("on");
    const box = document.querySelector(`div[data-depth="${depth}"]`);
    const input = box.querySelector("input");
    box.classList.toggle("on");
    if (btn.classList.contains("on")) {
      input.value = "";
    } else {
      input.focus();
    }
  };

  const [depthArr2, setDepthArr2] = useState();
  const [depthArr3, setDepthArr3] = useState();
  const CateDataProcessing = (initArray) => {
    if (!initArray) {
      return;
    }
    let depthArr2 = [];
    let depthArr3 = [];

    let cateArr = [];

    initArray.forEach((el) => {
      const depth = el.depth.split("_");
      if (depth.length == 1) {
        cateArr.push(el);
      }
      if (depth.length == 2) {
        depthArr2.push(el);
      }
      if (depth.length == 3) {
        depthArr3.push(el);
      }
    });

    cateArr.sort((a, b) => a.depth - b.depth);

    depthArr3.forEach((d3) => {
      const idx = depthArr2.findIndex(
        (d2) =>
          d2.depth.split("_")[0] == d3.depth.split("_")[0] &&
          d2.depth.split("_")[1] == d3.depth.split("_")[1]
      );
      if (depthArr2[idx].sub) {
        depthArr2[idx].sub.push(d3);
      } else {
        depthArr2[idx].sub = [d3];
      }
    });

    depthArr2.forEach((d2) => {
      if (d2.sub) {
        d2.sub.sort((a, b) => a.depth.split("_")[2] - b.depth.split("_")[2]);
      }
      const idx = cateArr.findIndex(
        (d1) => d1.depth.split("_")[0] == d2.depth.split("_")[0]
      );
      if (cateArr[idx].sub) {
        cateArr[idx].sub.push(d2);
      } else {
        cateArr[idx].sub = [d2];
      }
    });

    cateArr.forEach((el) => {
      if (el.sub) {
        //el.sub.sort((a, b) => a.depth.split("_")[1] - b.depth.split("_")[1]);
        el.sub.sort((a, b) => a.order_num - b.order_num);
      }
    });

    depthArr2.sort((a, b) => a.order_num - b.order_num);

    setDepthArr2(depthArr2);
    setDepthArr3(depthArr3);

    return cateArr;
  };

  const [render, setRender] = useState();
  const [cateList, setCateList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_cate_list",
      })
      .then((res) => {
        console.log("get_cate_list", res);
        const listData = CateDataProcessing(res.data.cate);
        setCateList(listData);
      });
  }, [render]);

  const makeDepth = (depth) => {
    const d = depth?.split("_");

    let idx;
    if (d && d.length == 1) {
      idx = depthArr2.filter((el) => el.depth.split("_")[0] == d[0]);
      idx =
        idx.length > 0 ? 1 * idx[idx.length - 1].depth.split("_")[1] + 1 : 0;
    } else if (d && d.length == 2) {
      idx = depthArr3.filter(
        (el) => el.depth.split("_")[0] == d[0] && el.depth.split("_")[1] == d[1]
      );
      idx =
        idx.length > 0 ? 1 * idx[idx.length - 1].depth.split("_")[2] + 1 : 0;
    } else {
      idx = cateList ? 1 * cateList[cateList.length - 1].depth + 1 : 0;
    }

    const addDepth = depth ? `${depth}_${idx}` : String(idx);

    const input =
      document.querySelector(`div[data-depth="${depth}"] input`) ||
      document.querySelector(".input_poject");
    const title = input.value;

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_cate_depth",
        title,
        depth: addDepth,
        project: addDepth.length == 1 ? 1 : 0,
      })
      .then((res) => {
        toast({
          description: "카테고리가 추가 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        input.value = "";
        setRender(!render);
      });
  };

  const onModifyInput = (e, uid) => {
    const btn = e.currentTarget;

    const box = document.querySelector(`div[data-uid="${uid}"]`);
    const input = box.querySelector("input");

    box.classList.toggle("on");
    if (btn.classList.contains("on")) {
      input.value = "";
    } else {
      input.focus();
    }
  };

  const cateModifySubmit = (uid) => {
    const box = document.querySelector(`div[data-uid="${uid}"]`);
    const input = box.querySelector("input");

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_cate_title",
        title: input.value,
        uid,
      })
      .then((res) => {
        toast({
          description: "카테고리가 수정 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        setRender(!render);
      });
  };

  const onSettingToggle = (e, uid) => {
    const btn = e.currentTarget;
    const box = document.querySelector(`div[data-setting="${uid}"]`);
    btn.classList.toggle("on");
    box.classList.toggle("on");
  };

  const removeList = (depth, uid, title) => {
    const agree = confirm(
      `${title}을(를) 삭제 하시겠습니까?\n상위 카테고리의 경우 하위 카테고리까지 모두 삭제 됩니다.`
    );
    if (agree) {
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
          a: "remove_cate_list",
          depth,
          uid,
        })
        .then((res) => {
          toast({
            description: "삭제 되었습니다.",
            status: "success",
            duration: 1000,
            isClosable: false,
          });
          setRender(!render);
        });
    }
  };

  //dnd
  const onDragEndCate = ({ source, destination }) => {
    if (!destination) {
      return;
    }

    const _items = JSON.parse(JSON.stringify(depthArr2));
    const [targetItem] = _items.splice(source.index, 1);
    _items.splice(destination.index, 0, targetItem);
    setDepthArr2(_items);
  };

  const [orderState, setOrderState] = useState(false);
  const onCateOrder = () => {
    setOrderState(!orderState);
  };

  const onCateSave = () => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "update_cate_order",
        list: depthArr2,
      })
      .then((res) => {
        toast({
          description: "저장 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        setRender(!render);
      });
  };

  return (
    <>
      <WorkCateBox>
        <Flex width={400} mb={3}>
          <Input
            className="input_poject"
            size="sm"
            placeholder="프로젝트 추가"
          />
          <Button
            onClick={() => makeDepth()}
            size="sm"
            ml={1}
            colorScheme="blue"
          >
            생성
          </Button>
        </Flex>
        <Flex gap={2} mb={3}>
          <Button onClick={onCateOrder}>
            카테고리 정렬
            {orderState ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
          </Button>
          {orderState && (
            <Button colorScheme="blue" onClick={onCateSave}>
              정렬 저장
            </Button>
          )}
        </Flex>

        {orderState && depthArr2 && (
          <DragDropContext onDragEnd={onDragEndCate}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  className="cate_order_list"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {depthArr2 &&
                    depthArr2.map((el, idx) => (
                      <Draggable key={el.uid} draggableId={el.uid} index={idx}>
                        {(provided, snapshot) => (
                          <>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={
                                snapshot.isDragging
                                  ? "is_dragging order"
                                  : "order"
                              }
                            >
                              [{idx}] {el.title}
                            </div>
                          </>
                        )}
                      </Draggable>
                    ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        <ul className="depth_1">
          {cateList &&
            cateList.map((el) => {
              return (
                <>
                  <li key={el.uid}>
                    <div className="tit_box">
                      <span
                        className="tit depth_1"
                        onClick={(e) => toggleDepth(e, el.depth)}
                      >
                        <span className="ic"></span>
                        {el.title}
                      </span>
                      <AiOutlineSetting
                        onClick={(e) => onSettingToggle(e, el.uid)}
                        className="ic_setting"
                        title="설정"
                      />
                      <div className="setting_box" data-setting={el.uid}>
                        <Button
                          onClick={(e) => onModifyInput(e, el.uid)}
                          className="btn_add modify"
                          size="sm"
                          ml={2}
                          title="제목 수정"
                        >
                          <FiEdit />
                        </Button>
                        <Button
                          onClick={() => removeList(el.depth, el.uid, el.title)}
                          className="btn_add remove"
                          size="sm"
                          ml={2}
                          title="삭제"
                        >
                          <RiDeleteBin6Line />
                        </Button>
                        <Button
                          onClick={(e) => onDepthInput(e, el.depth)}
                          className="btn_add"
                          size="sm"
                          ml={2}
                          title="하위 추가"
                        >
                          <span className="ic" />
                        </Button>
                        <div data-uid={el.uid} className="add_cate_box">
                          <Input
                            size="sm"
                            ml={2}
                            width={250}
                            defaultValue={el.title}
                            placeholder={`[${el.title}] 수정할 이름`}
                          />
                          <Button
                            onClick={() => cateModifySubmit(el.uid)}
                            size="sm"
                            ml={1}
                            colorScheme="blue"
                          >
                            수정하기
                          </Button>
                        </div>
                        <div data-depth={el.depth} className="add_cate_box">
                          <Input
                            size="sm"
                            ml={2}
                            width={250}
                            placeholder={`[${el.title}] 하위 카테고리명`}
                          />
                          <Button
                            onClick={() => makeDepth(el.depth)}
                            size="sm"
                            ml={1}
                            colorScheme="blue"
                          >
                            생성
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ul data-depth={el.depth} className="depth_2">
                      {el.sub &&
                        el.sub.map((list) => (
                          <>
                            <li key={list.uid}>
                              <div className="tit_box">
                                <span
                                  className="tit open"
                                  onClick={(e) => toggleDepth(e, list.depth)}
                                >
                                  <span className="ic"></span>
                                  {list.title}
                                </span>
                                <AiOutlineSetting
                                  onClick={(e) => onSettingToggle(e, list.uid)}
                                  className="ic_setting"
                                  title="설정"
                                />
                                <div
                                  className="setting_box"
                                  data-setting={list.uid}
                                >
                                  <Button
                                    onClick={(e) => onModifyInput(e, list.uid)}
                                    className="btn_add modify"
                                    size="sm"
                                    ml={2}
                                    title="제목 수정"
                                  >
                                    <FiEdit />
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      removeList(
                                        list.depth,
                                        list.uid,
                                        list.title
                                      )
                                    }
                                    className="btn_add remove"
                                    size="sm"
                                    ml={2}
                                    title="삭제"
                                  >
                                    <RiDeleteBin6Line />
                                  </Button>
                                  <Button
                                    onClick={(e) => onDepthInput(e, list.depth)}
                                    className="btn_add"
                                    size="sm"
                                    ml={2}
                                    title="하위 추가"
                                  >
                                    <span className="ic" />
                                  </Button>
                                  <div
                                    data-uid={list.uid}
                                    className="add_cate_box"
                                  >
                                    <Input
                                      size="sm"
                                      ml={2}
                                      width={250}
                                      defaultValue={list.title}
                                      placeholder={`[${list.title}] 수정할 이름`}
                                    />
                                    <Button
                                      onClick={() => cateModifySubmit(list.uid)}
                                      size="sm"
                                      ml={1}
                                      colorScheme="blue"
                                    >
                                      수정하기
                                    </Button>
                                  </div>
                                  <div
                                    data-depth={list.depth}
                                    className="add_cate_box"
                                  >
                                    <Input
                                      size="sm"
                                      ml={2}
                                      width={250}
                                      placeholder={`[${list.title}] 하위 카테고리명`}
                                    />
                                    <Button
                                      onClick={() => makeDepth(list.depth)}
                                      size="sm"
                                      ml={1}
                                      colorScheme="blue"
                                    >
                                      생성
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <ul
                                data-depth={list.depth}
                                className="depth_3 on"
                              >
                                {list.sub &&
                                  list.sub.map((list2) => (
                                    <>
                                      <li key={list2.uid}>
                                        <div className="tit_box">
                                          <span className="tit">
                                            {list2.title}
                                          </span>
                                          <AiOutlineSetting
                                            onClick={(e) =>
                                              onSettingToggle(e, list2.uid)
                                            }
                                            className="ic_setting"
                                            title="설정"
                                          />
                                          <div
                                            data-setting={list2.uid}
                                            className="setting_box"
                                          >
                                            <Button
                                              onClick={(e) =>
                                                onModifyInput(e, list2.uid)
                                              }
                                              className="btn_add modify"
                                              size="sm"
                                              ml={2}
                                              title="제목 수정"
                                            >
                                              <FiEdit />
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                removeList(
                                                  list2.depth,
                                                  list2.uid,
                                                  list2.title
                                                )
                                              }
                                              className="btn_add remove"
                                              size="sm"
                                              ml={2}
                                              title="삭제"
                                            >
                                              <RiDeleteBin6Line />
                                            </Button>
                                            <div
                                              data-uid={list2.uid}
                                              className="add_cate_box"
                                            >
                                              <Input
                                                size="sm"
                                                ml={2}
                                                width={250}
                                                defaultValue={list2.title}
                                                placeholder={`[${list2.title}] 수정할 이름`}
                                              />
                                              <Button
                                                onClick={() =>
                                                  cateModifySubmit(list2.uid)
                                                }
                                                size="sm"
                                                ml={1}
                                                colorScheme="blue"
                                              >
                                                수정하기
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    </>
                                  ))}
                              </ul>
                            </li>
                          </>
                        ))}
                    </ul>
                  </li>
                </>
              );
            })}
          {/* <li>
            <Flex alignItems="center">
              <span className="tit" onClick={(e) => toggleDepth(e, "0")}>
                <span className="ic"></span>메뉴1
              </span>
              <Button className="btn_add" size="sm" ml={2}>
                <AiOutlinePlusSquare onClick={onDepthInput()} />
              </Button>
              <div className="add_cate_box">
                <Input size="sm" ml={2} placeholder="하위 카테고리명" />
                <Button
                  onClick={() => makeDepth("0")}
                  size="sm"
                  ml={1}
                  colorScheme="blue"
                >
                  생성
                </Button>
              </div>
            </Flex>
            <ul data-depth="0" className="depth_2">
              <li>
                <span className="tit" onClick={(e) => toggleDepth(e, "0_0")}>
                  <span className="ic"></span>하위1
                </span>
                <ul data-depth="0_0" className="depth_3">
                  <li>
                    <span className="tit">하위2</span>
                  </li>
                </ul>
              </li>
            </ul>
          </li> */}
        </ul>
      </WorkCateBox>
    </>
  );
}

export default WorkCate;
