import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import styled from "styled-components";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";

const LeftmenuComponent = styled.div`
  .chakra-accordion__button {
    padding: 0.7rem 1rem;
  }
  .chakra-accordion__panel {
    padding-bottom: 10px;
  }
  .depth_1 {
    li {
      a {
        padding: 0.4rem 0;
        display: block;
        font-size: 13px;
      }
      &.on {
        a {
          font-weight: bold;
        }
      }
    }
  }
`;

export default function MobileMenu({ userInfo, router }) {
  const [curIndex, setCurIndex] = useState([]);
  useEffect(() => {
    if (router.indexOf("/setting") > -1) {
      setCurIndex([0]);
    }
    if (router.indexOf("/insa") > -1) {
      setCurIndex([1]);
    }
    if (router.indexOf("/schedule") > -1) {
      setCurIndex([2]);
    }
    if (router.indexOf("/board") > -1) {
      setCurIndex([3]);
    }
    if (router.indexOf("/ragular") > -1) {
      setCurIndex([4]);
    }
    if (router.indexOf("/stats") > -1) {
      setCurIndex([5]);
    }
    if (router.indexOf("/partners") > -1) {
      setCurIndex([6]);
    }
  }, []);

  const onChangeMenu = (e) => {
    setCurIndex(e);
  };

  return (
    <LeftmenuComponent>
      <Accordion allowMultiple index={curIndex} onChange={onChangeMenu}>
        {userInfo && userInfo.partner ? (
          <>
            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        프로젝트&유지보수
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li className={router === "/work" ? "on" : ""}>
                        <Link href="/work">목록(리스트)</Link>
                      </li>
                      <li className={router === "/work/structure" ? "on" : ""}>
                        <Link href="/work/structure">목록(구조도)</Link>
                      </li>
                      {userInfo && !userInfo.partner && (
                        <>
                          <li className={router === "/work/cate" ? "on" : ""}>
                            <Link href="/work/cate">카테고리 관리</Link>
                          </li>
                          <li className={router === "/work/info" ? "on" : ""}>
                            <Link href="/work/info">프로젝트 정보</Link>
                          </li>
                        </>
                      )}
                      <li className={router === "/work/write" ? "on" : ""}>
                        <Link href="/work/write">글 등록</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </>
        ) : (
          <>
            {userInfo && userInfo.authority?.includes("admin") && (
              <AccordionItem>
                {({ isExpanded }) => (
                  <>
                    <h2>
                      <AccordionButton
                        _expanded={{ bg: "teal", color: "white" }}
                      >
                        <Box flex="1" fontSize="1rem" textAlign="left">
                          설정
                        </Box>
                        {isExpanded ? (
                          <AiOutlineMinus fontSize="12px" />
                        ) : (
                          <AiOutlinePlus fontSize="12px" />
                        )}
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <ul className="depth_1">
                        <li className={router === "/setting" ? "on" : ""}>
                          <Link href="/setting/">기본설정</Link>
                        </li>
                        <li
                          className={
                            router.includes("/setting/type_write") ||
                            router.includes("/setting/type_board")
                              ? "on"
                              : ""
                          }
                        >
                          <Link href="/setting/type_board">결재양식</Link>
                        </li>
                      </ul>
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            )}

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        인사관리
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li className={router === "/insa" ? "on" : ""}>
                        <Link href="/insa/">직원정보</Link>
                      </li>
                      <li className={router === "/insa/attend" ? "on" : ""}>
                        <Link href="/insa/attend">근태정보(전체)</Link>
                      </li>
                      <li
                        className={router === "/insa/attend_each" ? "on" : ""}
                      >
                        <Link href="/insa/attend_each">근태정보(개별)</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        업무보고
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li className={router === "/report" ? "on" : ""}>
                        <Link href="/report/">목록</Link>
                      </li>
                      <li className={router === "/report/write" ? "on" : ""}>
                        <Link href="/report/write">글 작성</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        프로젝트&유지보수
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li className={router === "/work" ? "on" : ""}>
                        <Link href="/work">목록(리스트)</Link>
                      </li>
                      <li className={router === "/work/structure" ? "on" : ""}>
                        <Link href="/work/structure">목록(구조도)</Link>
                      </li>
                      {userInfo && !userInfo.partner && (
                        <>
                          <li className={router === "/work/cate" ? "on" : ""}>
                            <Link href="/work/cate">카테고리 관리</Link>
                          </li>
                          <li className={router === "/work/info" ? "on" : ""}>
                            <Link href="/work/info">프로젝트 정보</Link>
                          </li>
                        </>
                      )}
                      <li className={router === "/work/write" ? "on" : ""}>
                        <Link href="/work/write">글 등록</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        일정관리
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li className={router === "/schedule" ? "on" : ""}>
                        <Link href="/schedule">스케쥴표</Link>
                      </li>
                      <li className={router === "/schedule/write" ? "on" : ""}>
                        <Link href="/schedule/write">글작성</Link>
                      </li>
                      <li
                        className={
                          router === "/schedule/sign_ready" ? "on" : ""
                        }
                      >
                        <Link href="/schedule/sign_ready">
                          <a>결재요청</a>
                        </Link>
                      </li>
                      <li className={router === "/schedule/finish" ? "on" : ""}>
                        <Link href="/schedule/finish">결재완료</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        지출결의서
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li
                        className={router.includes("/board/wait") ? "on" : ""}
                      >
                        <Link href="/board/wait">
                          <a>결재요청</a>
                        </Link>
                      </li>
                      <li
                        className={router.includes("/board/list") ? "on" : ""}
                      >
                        <Link href="/board/list">결재완료</Link>
                      </li>
                      <li className={router === "/board/write" ? "on" : ""}>
                        <Link href="/board/write">글작성</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <h2>
                  <Link href="/ragular">
                    <a>
                      <AccordionButton
                        _expanded={{ bg: "teal", color: "white" }}
                      >
                        <Box flex="1" fontSize="1rem" textAlign="left">
                          정기결제
                        </Box>
                        <IoIosArrowForward style={{ marginRight: "-2px" }} />
                      </AccordionButton>
                    </a>
                  </Link>
                </h2>
              )}
            </AccordionItem>

            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <h2>
                    <AccordionButton _expanded={{ bg: "teal", color: "white" }}>
                      <Box flex="1" fontSize="1rem" textAlign="left">
                        협력사
                      </Box>
                      {isExpanded ? (
                        <AiOutlineMinus fontSize="12px" />
                      ) : (
                        <AiOutlinePlus fontSize="12px" />
                      )}
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <ul className="depth_1">
                      <li className={router === "/partners" ? "on" : ""}>
                        <Link href="/partners">협력사 리스트</Link>
                      </li>
                      <li className={router === "/partners/regist" ? "on" : ""}>
                        <Link href="/partners/regist">협력사 등록</Link>
                      </li>
                    </ul>
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </>
        )}
      </Accordion>
    </LeftmenuComponent>
  );
}
