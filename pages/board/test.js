import styled from "styled-components";

const ComForm = styled.div`
  .form_wrapper {
    display: flex;
    justify-content: center;
  }
  .form_content {
    width: 95vh;
    max-width: 1000px;
    border: 2px solid #ddd;
    padding: 2.5rem;
  }
  .top_box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;
    margin-bottom: 2rem;
    h2 {
      flex: 1;
      height: 100%;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .manager_box {
      display: flex;
      height: 100%;
      .dl {
        min-width: 80px;
        height: 100%;
        border: 1px solid #aaa;
        margin-left: -1px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
      .dt {
        border-bottom: 1px solid #aaa;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .dd {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .con_box {
    width: 100%;
    margin-bottom: 2rem;
  }

  .con_table {
  }

  .footer_box {
    display: flex;
    justify-content: center;
    span {
      margin: 1rem;
    }
  }
`;

export default function Test() {
  return (
    <ComForm>
      <div className="form_wrapper">
        <div className="form_content">
          <div className="top_box">
            <h2>양식 제목</h2>
            <div className="manager_box">
              <div className="dl">
                <div className="dt">결재자</div>
                <div className="dd"></div>
              </div>
              <div className="dl">
                <div className="dt">결재자</div>
                <div className="dd"></div>
              </div>
              <div className="dl">
                <div className="dt">결재자</div>
                <div className="dd"></div>
              </div>
              <div className="dl">
                <div className="dt">결재자</div>
                <div className="dd"></div>
              </div>
            </div>
          </div>

          <div className="con_box">
            <table className="table_basic">
              <colgroup>
                <col style={{ width: "120px" }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row">작성자</th>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="footer_box">
            <div className="date">
              <span className="year">년</span>
              <span className="month">월</span>
              <span className="day">일</span>
            </div>
          </div>
        </div>
      </div>
    </ComForm>
  );
}

/*

<div class="form_wrapper">        
<div class="form_content">          
<div class="top_box">            
<h2>양식 제목</h2>
 
<div class="manager_box">              
<div class="dl">                
<div class="dt">결재자</div>
 </div>
 
<div class="dl">                
<div class="dt">결재자</div>
 </div>
 
<div class="dl">                
<div class="dt">결재자</div>
 </div>
 
<div class="dl">                
<div class="dt">결재자</div>
 </div>
 </div>
 </div>
 
<div class="con_box">                              
      <table class="table_basic">
                                  <tbody>
           <tr>
             <th style="width:120px">
              <div>                             작성자 </div>
            </th>
             <td>
               <div>
              </div>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 
<div class="footer_box">            
<div class="date">              <span class="year">년</span> <span class="month">월</span> <span class="day">일</span> </div>
 </div>
 </div>
 </div>

 */
