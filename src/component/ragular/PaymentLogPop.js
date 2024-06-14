import React, { useState, useEffect, useRef } from "react";

import { CommonPopup } from '../insa/UserModifyPop'
import styled from "styled-components";
import { BoardLi } from "@component/BoardList";


export default function PaymentRegistPop({closePop, logData}) {

  return (
    <>
      <CommonPopup>        
        <div className="con_box" style={{width:"100%",maxWidth:"400px"}}>
          <h2 className="title">정기결제 내역</h2>
          <BoardLi>
            <li className="header">
              <span className="subject">제목</span>
              <span className="income">소득</span>
              <span className="spend">지출</span>
              <span className="date">결재일</span>
            </li>
            {logData.map((el,idx)=>(
              <li key={idx} className="body">
                <span className="subject">{el.subject}</span>
                <span className="income">{el?.income}</span>
                <span className="spend">{el?.spend}</span>
                <span className="date">{el.date}</span>
              </li>
            ))}
          </BoardLi>
        </div>
        <div className="bg" onClick={closePop}></div>
      </CommonPopup>
    </>
  )
}
