import Link from "next/link";
import styled from "styled-components";

export const Pagenation = ({ total, current, viewPage, type }) => {
  const PagenationBox = styled.ul`
    display: flex;
    margin: 15px 0;
    li {
      margin-right: 5px;
      a {
        width: 34px;
        height: 34px;
        border: 1px solid #ddd;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #888;
      }
      &.on a {
        border-color: #1a365d;
        background: #1a365d;
        color: #fff;
      }
    }
  `;
  const lastPageNum = parseInt(total); //마지막 페이지 번호
  let startPage =
    Math.ceil(current / viewPage) == 1
      ? 1
      : (Math.ceil(current / viewPage) - 1) * viewPage + 1;
  let lastPage = startPage + viewPage - 1;
  if (lastPage > lastPageNum) {
    lastPage = lastPageNum;
  }
  let pageArr = [];
  for (let i = startPage; i <= lastPage; i++) {
    pageArr.push(i);
  }

  return (
    <PagenationBox>
      {current > 1 && (
        <li>
          <Link
            href={{
              pathname: type ? type : "/work",
              query: { p: 1 },
            }}
          >
            first
          </Link>
        </li>
      )}
      {current > viewPage && (
        <li>
          <Link
            href={{
              pathname: type ? type : "/work",
              query: { p: 1 * startPage - viewPage },
            }}
          >
            prev
          </Link>
        </li>
      )}
      {pageArr.map((el, idx) => (
        <li className={el == current && "on"} key={idx}>
          <Link
            href={{
              pathname: type ? type : "/work",
              query: { p: el },
            }}
          >
            {el}
          </Link>
        </li>
      ))}
      {lastPage < lastPageNum && (
        <li>
          <Link
            href={{
              pathname: type ? type : "/work",
              query: { p: 1 * lastPage + 1 },
            }}
          >
            next
          </Link>
        </li>
      )}
      {current < lastPageNum && (
        <li>
          <Link
            href={{
              pathname: type ? type : "/work",
              query: { p: lastPageNum },
            }}
          >
            last
          </Link>
        </li>
      )}
    </PagenationBox>
  );
};
