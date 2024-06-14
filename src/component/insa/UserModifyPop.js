import { useState, useEffect } from "react";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Select,
  Button,
  Flex,
  Checkbox,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { db } from "src/firebase";
import { ref, update } from "firebase/database";
import { useDispatch } from "react-redux";
import { updateAllUser } from "@redux/actions/user_action";

import styled from "styled-components";
import PartSelect from "@component/popup/PartSelect";
import RankSelect from "@component/popup/RankSelect";
import ManagerSelect from "@component/popup/ManagerSelect";
import axios from "axios";

export const CommonPopup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  animation: fadeIn 0.2s forwards;
  opacity: 0;
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  .bg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.25);
  }
  .con_box {
    h2.title {
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 10px;
    }
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
    padding: 1rem;
    transform: translateY(30px);
    z-index: 10;
    animation: fadeUp 0.2s forwards;
  }
  @keyframes fadeUp {
    to {
      transform: translateY(0);
    }
  }
`;

export default function UserModifyPop({
  managerList,
  userData,
  closeUserModify,
  partList,
  rankList,
  onRender,
}) {
  const toast = useToast();
  const dispatch = useDispatch();

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const watchClient = watch("partner");

  const [projectList, setProjectList] = useState();
  useEffect(() => {
    if (!watchClient) {
      setProjectList("");
    } else {
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
          a: "get_cate_list",
        })
        .then((res) => {
          const cateList = res.data.cate.filter((el) => {
            return el.depth.split("_").length == 1;
          });
          setProjectList(cateList);
        });
    }
  }, [userData, watchClient]);

  function onSubmit(values) {
    if (values.partner && !values.project) {
      toast({
        description: "협력사를 선택해 주세요.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (values.project) {
      const projectArr = values.project.split("_");
      values.project = projectArr[0];
      values.project_depth = projectArr[1];
    }
    return new Promise((resolve) => {
      values.uid = userData.uid;
      update(ref(db, `user/${userData.uid}`), {
        ...values,
        call: values.call || "",
        call2: values.call2 || "",
        part: values.part || "",
        rank: values.rank || "",
        manager_uid: values.manager_uid || "",
        date: values.date || "",
        timestamp: new Date(values.date).getTime(),
      })
        .then(() => {
          values.part = values.part ? partList[values.part] : "";
          values.rank = values.rank ? rankList[values.rank] : "";

          dispatch(updateAllUser(values));
          closeUserModify();
          onRender();
          resolve();
          toast({
            description: "수정되었습니다.",
            status: "success",
            duration: 1000,
            isClosable: false,
          });
        })
        .catch((error) => {
          console.error(error);
          resolve();
        });
    });
  }

  return (
    <CommonPopup>
      <div className="con_box">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex justifyContent="center" marginTop={3}>
            <Flex
              maxWidth={400}
              width="100%"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              <Input readOnly defaultValue={userData.uid} />
              <Input
                readOnly
                defaultValue={userData.name}
                {...register("name")}
              />
              <Input
                readOnly
                defaultValue={userData.email}
                {...register("email")}
              />
              <Select
                placeholder="부서"
                defaultValue={userData.part}
                {...register("part")}
              >
                <PartSelect partList={partList} />
              </Select>
              <Select
                placeholder="직급"
                defaultValue={userData.rank}
                {...register("rank")}
              >
                <RankSelect rankList={rankList} />
              </Select>
              <Select
                placeholder="담당자"
                defaultValue={userData.manager_uid}
                {...register("manager_uid")}
              >
                <ManagerSelect managerList={managerList} />
              </Select>
              <FormControl isInvalid={errors.call}>
                <Input
                  type="number"
                  defaultValue={userData.call}
                  placeholder="전화번호"
                  {...register("call", {
                    pattern: /^01([0|1|6|7|8|9]?)([0-9]{3,4})([0-9]{4})$/,
                  })}
                />
                <FormErrorMessage>
                  {errors.call && errors.call.type === "pattern" && (
                    <>{`휴대폰번호 양식에 맞지 않습니다.`}</>
                  )}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <Input
                  type="number"
                  defaultValue={userData.call2}
                  placeholder="전화번호2"
                  {...register("call2")}
                />
              </FormControl>

              <FormControl isInvalid={errors.date}>
                <Input
                  type="date"
                  defaultValue={userData.date.split(" ")[0]}
                  placeholder="입사일"
                  {...register("date")}
                />
              </FormControl>
              <FormControl mt={1} isInvalid={errors.hidden}>
                <Stack spacing={4} pl={1} direction="row">
                  <Checkbox
                    defaultChecked={userData.hidden}
                    colorScheme="blue"
                    {...register("hidden")}
                  >
                    <Text fontSize="sm">근태숨김</Text>
                  </Checkbox>
                </Stack>
              </FormControl>
              <FormControl mt={1} isInvalid={errors.hidden}>
                <Stack spacing={4} pl={1} direction="row">
                  <Checkbox
                    defaultChecked={userData.partner}
                    colorScheme="blue"
                    {...register("partner")}
                  >
                    <Text fontSize="sm">협력사</Text>
                  </Checkbox>
                </Stack>
              </FormControl>
              {watchClient && projectList && (
                <Select
                  defaultValue={`${userData.project}_${userData.project_depth}`}
                  {...register("project")}
                >
                  <option value="">협력사 선택</option>
                  <>
                    {projectList.map((el) => (
                      <>
                        <option value={`${el.uid}_${el.depth}`}>
                          {el.title}
                        </option>
                      </>
                    ))}
                  </>
                </Select>
              )}

              <Flex
                mt={4}
                width="100%"
                flexDirection="column"
                justifyContent="center"
              >
                <Button
                  mb={2}
                  width="100%"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  수정
                  {isSubmitting}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </form>
      </div>
      <div className="bg" onClick={closeUserModify}></div>
    </CommonPopup>
  );
}
