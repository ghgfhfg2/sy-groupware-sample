import { Flex, Image } from "@chakra-ui/react";
import { off, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { db } from "src/firebase";
import styled from "styled-components";
const FooterBox = styled.div`
  border-top: 1px solid #ddd;
  .content_box {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }
  .logo {
    width: 100px;margin-right:80px;opacity:0.5
  }
  .footer_con{color:#888}
  @media screen and (max-width: 1024px){
    .logo{margin-right:2rem;width: 70px;}
  }
`;

export default function Footer() {
  const logoUrl = useSelector((state) => state.logo.url);
  const [footerData, setFooterData] = useState();
  useEffect(() => {
    const footRef = ref(db, `admin/setting`);
    onValue(footRef,data=>{
      setFooterData(data.val())
    })
    return () => {
      off(footRef)
    }
  }, [])
  

  return (
    <FooterBox>
      <div className="content_box">
        <Flex>
          <div className="logo">{logoUrl && <Image alt="" src={logoUrl} />}</div>
          <div className="footer_con">
            {footerData && footerData.adress}
          </div>
        </Flex>
      </div>
    </FooterBox>
  );
}
