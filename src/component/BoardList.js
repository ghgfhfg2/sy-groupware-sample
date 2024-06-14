import styled from "styled-components";

export const BoardLi = styled.ul`
  display: flex;
  flex-direction: column;
  li {
    &.header {
      background: #1a365d;
      border-radius: 5px;
      color: #fff;
    }
    display: flex;
    height: 48px;
    border-bottom: 1px solid #e1e1e1;
    span {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100px;
      height: 100%;
    }
    .btn {
      margin-left: auto;
    }
  }
  @media screen and (max-width: 1024px) {
    overflow: auto;
  }
`;
export default function BoardList({ children }) {
  return <BoardLi>{children}</BoardLi>;
}
