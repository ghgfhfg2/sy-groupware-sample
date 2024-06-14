import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { AiOutlineDoubleRight } from "react-icons/ai";
import WorkStatePop from "@component/work/WorkStatePop";
import {
  Button,
  Flex,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { colors } from "../../constans/colors";
const StepComponent = styled.div`
  .step_list {
    display: flex;
    gap: 15px;
    li {
      color: #bbb;
      border-radius: 5px;
      display: flex;
      align-items: center;
      &.state {
        cursor: pointer;
        color: #fff;
        background: #ddd;
        padding: 5px 10px;
      }
      &.on {
        cursor: auto;
        color: #fff;
        background: ${colors.BLUE_800};
        font-weight: 600;
      }
    }
  }

  .state_history {
    display: flex;
    flex-direction: column;
    gap: 7px;
    li {
      display: flex;
      align-items: center;
      font-size: 12px;
    }
    .name {
      margin-right: 10px;
    }
    .cmt {
    }
    .date {
      margin-right: 10px;
      color: #888;
    }
  }

  .state {
    width: 75px;
    display: flex;
    justify-content: center;
    border-radius: 4px;
    margin-right: 10px;
    color: #fff;
    font-weight: 600;
    &.state_1 {
      color: #2d3748;
      border: 1px solid #2d3748;
    }
    &.state_2 {
      color: #e53e3e;
      border: 1px solid #e53e3e;
    }
    &.state_3 {
      color: #2f855a;
      border: 1px solid #2f855a;
    }
    &.state_4 {
      color: #c96100;
      border: 1px solid #c96100;
    }
    &.state_5 {
      color: #1f0b5e;
      border: 1px solid #1f0b5e;
    }
    &.state_6 {
      color: #2b6cb0;
      border: 1px solid #a0aec0;
    }
    &.state_7 {
      color: #a0aec0;
      border: 1px solid #a0aec0;
    }
  }
`;

export default function StepBox({ stateData, step, onRender, stateText }) {
  console.log(stateData);

  const router = useRouter();
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [realState, setRealState] = useState(step);
  const [curState, setCurState] = useState(step);
  const onStateChange = (state) => {
    if (realState != state) {
      setCurState(state);
      onOpen();
    }
  };

  const [comment, setComment] = useState();
  const onChangeComment = (e) => {
    setComment(e.target.value);
  };
  const onSubmitStep = () => {
    const values = {
      a: "regis_work_state",
      state: curState,
      writer: userInfo.uid,
      comment: comment,
      ruid: router.query.uid,
    };

    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        ...values,
      })
      .then((res) => {
        setRealState(curState);
        onRender();
        onClose();
      });
  };

  const [historyState, setHistoryState] = useState(false);
  const toggleHistory = () => {
    setHistoryState(!historyState);
  };

  return (
    <>
      <Flex flexDirection="column">
        <StepComponent>
          <ul className="step_list">
            {stateText.map((el, idx) => (
              <>
                <li
                  key={idx}
                  className={realState == el.state ? "on state" : "state"}
                  onClick={() => onStateChange(el.state)}
                >
                  {el.info ? (
                    <Tooltip color="white" label={el.info}>
                      {el.txt}
                    </Tooltip>
                  ) : (
                    <>{el.txt}</>
                  )}
                </li>
                {stateText.length - 1 != idx && (
                  <li>
                    <AiOutlineDoubleRight />
                  </li>
                )}
              </>
            ))}
          </ul>
          {stateData && (
            <Flex mt={3}>
              <Button
                colorScheme="blue"
                onClick={toggleHistory}
                size="xs"
                width={20}
                mr={3}
              >
                {historyState ? "내역 숨기기" : "내역 보기"}
              </Button>
              {historyState && (
                <ul className="state_history">
                  {stateData &&
                    stateData.map((el, idx) => (
                      <li key={idx}>
                        <span className={`state state_${el.state}`}>
                          {el.stateTxt}
                        </span>
                        <span className="name">{el.writer.name}</span>
                        <span className="date">{el.date_regis}</span>
                        <span className="cmt">{el.comment}</span>
                      </li>
                    ))}
                </ul>
              )}
            </Flex>
          )}
        </StepComponent>
      </Flex>

      <WorkStatePop
        isOpen={isOpen}
        curState={curState}
        onSubmitStep={onSubmitStep}
        onClose={onClose}
        onChangeComment={onChangeComment}
        comment={comment}
        stateText={stateText}
      />
    </>
  );
}
