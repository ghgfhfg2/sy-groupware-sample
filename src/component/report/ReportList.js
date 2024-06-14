import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { WorkBoardList } from "@component/work/WorkList";
import { format } from "date-fns";
import shortid from "shortid";
import None from "@component/None";
import styled from "styled-components";
import axios from "axios";
import useGetUser from "@component/hooks/getUserDb";
import { Pagenation } from "../Pagenation";
import Link from "next/link";

export default function ReportList({ main }) {
  const router = useRouter();
  useGetUser();
  const userInfo = useSelector((state) => state.user.currentUser);
  const userAll = useSelector((state) => state.user.allUser);
  const [listData, setListData] = useState();
  const curPage = router.query["p"] || 1;
  const limit = main ? 5 : 20;

  const [totalPage, setTotalPage] = useState();
  const getWorkList = (page) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_report_list",
        page,
        limit,
        mem_uid: userInfo?.uid,
      })
      .then((res) => {
        const total = res.data.total;
        setTotalPage(total);
        const list = res.data.list?.map((el) => {
          const findUser = userAll?.find((user) => el.writer === user.uid);
          const manager = userAll?.find((user) => el.manager === user.uid);
          el.manager = manager?.name;
          return {
            ...findUser,
            ...el,
          };
        });
        setListData(list);
      });
  };

  useEffect(() => {
    getWorkList(curPage);
    return () => {};
  }, [userAll, curPage]);

  return (
    <>
      <WorkBoardList>
        <li className="header">
          {!main && <span>번호</span>}
          <span className="subject">제목</span>
          <span className="name">작성자</span>
          {!main && <span className="manager">담당자</span>}
          <span className="date">작성일</span>
        </li>
        {listData &&
          listData.map((el) => (
            <li key={shortid()}>
              {!main && <span>{el.uid}</span>}
              <span className="subject">
                <Link
                  href={{
                    pathname: "/report/view",
                    query: { uid: el.uid },
                  }}
                >
                  {el.title}
                </Link>
              </span>
              <span className="name">{el.name}</span>
              {!main && <span className="manager">{el.manager}</span>}
              <span className="date">
                {format(new Date(el.date_regis), "yyyy-MM-dd")}
              </span>
            </li>
          ))}
        {listData?.length === 0 && <None />}
      </WorkBoardList>
      {!main && (
        <Pagenation
          type="report"
          total={totalPage}
          current={curPage}
          viewPage={10}
        />
      )}
    </>
  );
}
