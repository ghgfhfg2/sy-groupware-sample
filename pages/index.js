import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Main from "@component/Main";
import MainLayout from "@component/MainLayout";

const Home = () => {
  const router = useRouter();
  const userInfo = useSelector((state) => state.user.currentUser);
  const [partnerCheck, setPartnerCheck] = useState(true);
  useEffect(() => {
    if (userInfo && !userInfo.partner) {
      setPartnerCheck(false);
    } else {
      router.push("/work");
    }
  }, [userInfo]);

  return <>{!partnerCheck && <Main />}</>;
};

export default Home;

Home.getLayout = function getLayout(page, logoImg) {
  return <MainLayout logoImg={logoImg}>{page}</MainLayout>;
};
