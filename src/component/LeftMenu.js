import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "src/firebase";
import {
  ref,
  onValue,
  remove,
  get,
  off,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { updateDayoffCount } from "@redux/actions/counter_action";
import { setBoardCount } from "@redux/actions/counter_action";
import { colors } from "../constans/colors";
const LeftMenu = styled.nav`
  width: 200px;
  flex-shrink: 0;
  background: ${colors.BLUE_700};
  .depth_1 {
    display: flex;
    flex-direction: column;
    > li {
      display: flex;
      padding: 1rem 0;
      position: relative;
      &.on {
        background: ${colors.BLUE_900};
        a {
          color: #fff;
          font-weight: 600;
        }
      }
    }
    > li > a {
      padding: 0 15px;
      display: block;
      width: 100%;
      font-size: 13px;
      color: #bcdde1;
      &:hover {
        color: #fff;
        cursor: pointer;
        font-weight: 600;
      }
    }
  }

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

function LeftMunu({ userInfo }) {
  const router = useRouter().route;
  const dispatch = useDispatch();
  const dayoffCheckNum = useSelector((state) => state.counter.dayoffCount);
  const boardCount = useSelector((state) => state.counter.boardCount);
  const ruleAuth = ["uV6cbGPfdVNapneBaLX3bVYdebn2"];

  useEffect(() => {
    let countRef;
    countRef = query(ref(db, `dayoff/temp`));
    if (router.includes("/schedule")) {
      onValue(countRef, (data) => {
        let count = 0;
        for (const key in data.val()) {
          let mgList = data.val()[key].manager.map((mg) => mg.id);
          if (
            mgList.includes(userInfo?.uid) ||
            data.val()[key].userUid === userInfo?.uid
          ) {
            count++;
          }
        }
        dispatch(updateDayoffCount(count));
      });
    }
    return () => {
      off(countRef);
    };
  }, [userInfo]);

  const [boardWait, setBoardWait] = useState(0);

  useEffect(() => {
    const listRef = query(
      ref(db, `board/list`),
      orderByChild("state"),
      equalTo("ing")
    );
    if (router.includes("/board")) {
      onValue(listRef, (data) => {
        let count = 0;
        data.forEach((el) => {
          let mg_list = [];
          mg_list = el.val().manager.map((el) => el.uid);
          if (
            mg_list.includes(userInfo.uid) ||
            el.val().writer_uid === userInfo.uid
          ) {
            count++;
          }
        });
        setBoardWait(count);
        dispatch(setBoardCount(count));
      });
    }
    return () => {
      off(listRef);
    };
  }, [userInfo, router]);

  return (
    <>
      <LeftMenu>
        {router.includes("/setting") && (
          <>
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
          </>
        )}
        {router.includes("/insa") && (
          <>
            <ul className="depth_1">
              <li className={router === "/insa" ? "on" : ""}>
                <Link href="/insa/">직원정보</Link>
              </li>
              <li className={router === "/insa/attend" ? "on" : ""}>
                <Link href="/insa/attend">근태정보(전체)</Link>
              </li>
              <li className={router === "/insa/attend_each" ? "on" : ""}>
                <Link href="/insa/attend_each">근태정보(개별)</Link>
              </li>
            </ul>
          </>
        )}
        {router.includes("/rule") && (
          <>
            <ul className="depth_1">
              <li className={router === "/rule" ? "on" : ""}>
                <Link href="/rule/">목록</Link>
              </li>
              {ruleAuth.includes(userInfo?.uid) && (
                <>
                  <li className={router === "/rule/write" ? "on" : ""}>
                    <Link href="/rule/write">글 작성</Link>
                  </li>
                </>
              )}
            </ul>
          </>
        )}
        {router.includes("/report") && (
          <>
            <ul className="depth_1">
              <li className={router === "/report" ? "on" : ""}>
                <Link href="/report/">목록</Link>
              </li>

              <li className={router === "/report/report_each" ? "on" : ""}>
                <Link href="/report/report_each">목록(개별)</Link>
              </li>
              <li className={router === "/report/write" ? "on" : ""}>
                <Link href="/report/write">글 작성</Link>
              </li>
            </ul>
          </>
        )}
        {router.includes("/work") && (
          <>
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
          </>
        )}
        {router.includes("/schedule") && (
          <>
            <ul className="depth_1">
              <li className={router === "/schedule" ? "on" : ""}>
                <Link href="/schedule">스케쥴표</Link>
              </li>
              <li className={router === "/schedule/write" ? "on" : ""}>
                <Link href="/schedule/write">글작성</Link>
              </li>
              <li className={router === "/schedule/sign_ready" ? "on" : ""}>
                <Link href="/schedule/sign_ready">
                  <a>결재요청({dayoffCheckNum})</a>
                </Link>
              </li>
              <li className={router === "/schedule/finish" ? "on" : ""}>
                <Link href="/schedule/finish">결재완료</Link>
              </li>
            </ul>
          </>
        )}
        {router.includes("/board") && (
          <>
            <ul className="depth_1">
              <li className={router.includes("/board/wait") ? "on" : ""}>
                <Link href="/board/wait">
                  <a>결재요청({boardCount})</a>
                </Link>
              </li>
              <li className={router.includes("/board/list") ? "on" : ""}>
                <Link href="/board/list">결재완료</Link>
              </li>
              <li className={router === "/board/write" ? "on" : ""}>
                <Link href="/board/write">글작성</Link>
              </li>
            </ul>
          </>
        )}
        {router.includes("/stats") && (
          <>
            <ul className="depth_1">
              <li className={router.includes("/stats/price") ? "on" : ""}>
                <Link href="/stats/price">소득/지출</Link>
              </li>
            </ul>
          </>
        )}
        {router.includes("/mypage") && (
          <>
            <ul className="depth_1">
              <li className={router === "/mypage" ? "on" : ""}>
                <Link href="/mypage">기본정보</Link>
              </li>
              <li className={router.includes("/mypage/dayoff") ? "on" : ""}>
                <Link href="/mypage/dayoff">연차내역</Link>
              </li>

              <li
                className={router.includes("/mypage/message_list") ? "on" : ""}
              >
                <Link href="/mypage/message_list?type=1">쪽지목록</Link>
              </li>
              <li
                className={router.includes("/mypage/message_write") ? "on" : ""}
              >
                <Link href="/mypage/message_write">쪽지작성</Link>
              </li>
            </ul>
          </>
        )}
        {router.includes("/partners") && (
          <>
            <ul className="depth_1">
              <li className={router === "/partners" ? "on" : ""}>
                <Link href="/partners">협력사 리스트</Link>
              </li>
              <li className={router === "/partners/regist" ? "on" : ""}>
                <Link href="/partners/regist">협력사 등록</Link>
              </li>
            </ul>
          </>
        )}
      </LeftMenu>
    </>
  );
}

export default LeftMunu;
