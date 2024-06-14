import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import styled from "styled-components";
import axios from "axios";
import useGetUser from "@component/hooks/getUserDb";
import { WorkViewBox } from "@component/work/WorkView";
import { Button, Flex, useToast } from "@chakra-ui/react";
import Link from "next/link";

export default function RuleView() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const toast = useToast();
  const router = useRouter();
  useGetUser();
  const userAll = useSelector((state) => state.user.allUser);
  const [viewData, setViewData] = useState();
  useEffect(() => {
    const uid = router.query.uid;
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_rule_view",
        uid,
      })
      .then((res) => {
        console.log(res);
        const resData = res.data.rule;
        const writer = userAll?.find((user) => resData.writer === user.uid);
        const manager = userAll?.find((user) => resData.manager === user.uid);
        resData.manager = manager?.name;
        resData.images = JSON.parse(resData.images);
        setViewData({
          ...writer,
          ...res.data.rule,
        });
      });
  }, [userAll]);

  const onRuleRemove = (uid) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_rule_list",
        uid,
      })
      .then((res) => {
        toast({
          description: "삭제되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        router.push("/rule");
      });
  };
  return (
    <>
      {viewData && (
        <>
          <WorkViewBox>
            <dl>
              <dt>{viewData.title}</dt>
              <dd>
                <div className="box">
                  <span className="tit">작성자 : </span>
                  <span className="con">{viewData.name}</span>
                </div>
                <div className="box">
                  <span className="tit">담당자 : </span>
                  <span className="con">{viewData.manager}</span>
                </div>
                <div className="box">
                  <span className="tit">작성일 : </span>
                  <span className="con">{viewData.date_regis}</span>
                </div>
              </dd>
              <dd>
                <div
                  dangerouslySetInnerHTML={{ __html: viewData.content }}
                ></div>
                <Flex flexDirection="column" alignItems="flex-start" gap={1}>
                  {viewData.images &&
                    viewData.images.map((el) => (
                      <>
                        <img
                          src={`https://shop.editt.co.kr/_upload/_groupware/rule/${el}`}
                        />
                      </>
                    ))}
                </Flex>
              </dd>
            </dl>
          </WorkViewBox>
          <Flex mt={3}>
            {viewData.writer == userInfo.uid && (
              <>
                <Button
                  mr={1}
                  colorScheme="red"
                  onClick={() => onRuleRemove(viewData.uid)}
                >
                  삭제
                </Button>
                <Link
                  href={{
                    pathname: "/rule/modify",
                    query: { uid: viewData.uid },
                  }}
                >
                  <Button mr={1}>수정</Button>
                </Link>
              </>
            )}
            <Link href="/rule">
              <Button colorScheme="blue">목록</Button>
            </Link>
          </Flex>
        </>
      )}
    </>
  );
}
