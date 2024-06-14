import DaumPostcode from "react-daum-postcode";
import styled from "styled-components";
import { GrClose } from "react-icons/gr";
const AdressPopBox = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  .con_box {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 90%;
    height: 80%;
    transform: translate(-50%, -50%);
    max-width: 500px;
    max-height: 500px;
    z-index: 10;
    background: #fff;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  }
  .header {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1a365d;
    color: #fff;
    position: relative;
    h2 {
      font-size: 17px;
      font-weight: 600;
    }
  }
  .close_btn {
    width: 50px;
    height: 100%;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 19px;
    path {
      stroke: #fff;
    }
  }
  .post_box {
    height: 100% !important;
  }
  .bg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.25);
  }
`;

export default function AddressPop({ handle, closePostcode }) {
  return (
    <AdressPopBox>
      <div className="con_box">
        <header className="header">
          <h2>주소검색</h2>
          <button type="button" className="close_btn" onClick={closePostcode}>
            <GrClose />
          </button>
        </header>
        <DaumPostcode
          className="post_box"
          onComplete={handle.selectAddress} // 값을 선택할 경우 실행되는 이벤트
          autoClose={false} // 값을 선택할 경우 사용되는 DOM을 제거하여 자동 닫힘 설정
          defaultQuery="" // 팝업을 열때 기본적으로 입력되는 검색어
        />
      </div>
      <div className="bg" onClick={closePostcode}></div>
    </AdressPopBox>
  );
}
