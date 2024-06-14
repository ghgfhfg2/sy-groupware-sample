import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "src/firebase";
import { ref, update } from "firebase/database";
import { format } from "date-fns";
import styled from "styled-components";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import { CommonPopup } from "../insa/UserDayoffPop";
import ManagerSelect from "@component/popup/ManagerSelect";
import { CommonForm } from "pages/setting";
import AddressPop from "../popup/AddressPop";
import ManagerListPop from "../board/ManagerListPop";

const PartnerModiPopup = styled(CommonPopup)``;

export default function PartnersModifyPop({
  partnerData,
  managerList,
  closeModifyPop,
}) {
  const toast = useToast();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    console.log(partnerData);
  }, []);

  const [openPostcode, setOpenPostcode] = useState(false);
  const handle = {
    // 버튼 클릭 이벤트
    clickButton: () => {
      onPostcode();
    },

    // 주소 선택 이벤트
    selectAddress: (data) => {
      setValue("address", data.zonecode);
      setValue("address2", data.address);
      setFocus("address3");
      closePostcode();
    },
  };

  const onPostcode = () => {
    setOpenPostcode(true);
  };
  const closePostcode = () => {
    setOpenPostcode(false);
  };

  // 담당자 편집
  const [checkManagerList, setCheckManagerList] = useState(
    partnerData[0].manager
  );

  const [isManagerPop, setIsManagerPop] = useState(false);
  const onManagerPop = () => {
    setIsManagerPop(true);
  };
  const closeManagerPop = () => {
    setIsManagerPop(false);
  };
  const onSelectManager = (checkedItems) => {
    let newList = checkedItems.sort((a, b) => {
      return a.value - b.value;
    });
    setCheckManagerList(newList);
    closeManagerPop();
  };

  const onSubmit = (values) => {
    const pRef = ref(db, `partners/list/${partnerData[1]}`);
    update(pRef, {
      ...values,
      manager: checkManagerList || "",
    }).then(() => {
      toast({
        description: "업데이트 되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
    });
    closeModifyPop();
  };
  return (
    <>
      {isManagerPop && managerList && (
        <ManagerListPop
          noNumber={true}
          userData={managerList}
          checkManagerList={checkManagerList}
          closeManagerPop={closeManagerPop}
          onSelectManager={onSelectManager}
          isManagerPop={isManagerPop}
        />
      )}
      <PartnerModiPopup>
        <div className="con_box">
          <CommonForm
            style={{ width: "100%" }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Flex>
              <Flex width="100%" flexDirection="column" gap={5}>
                <FormControl isInvalid={errors.name}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="name">
                      회사명
                    </FormLabel>
                    <Input
                      id="name"
                      className="lg"
                      placeholder="* 회사명"
                      defaultValue={partnerData[0].name}
                      {...register("name", {
                        required: "이름은 필수항목 입니다.",
                      })}
                    />
                  </div>
                  <FormErrorMessage>
                    {errors.name && errors.name.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.call}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="call">
                      전화번호
                    </FormLabel>
                    <Input
                      id="call"
                      type="text"
                      className="lg"
                      defaultValue={partnerData[0]?.call}
                      placeholder="전화번호"
                      {...register("call")}
                    />
                  </div>
                  {errors.call && <>{errors.call.type}</>}
                </FormControl>

                <FormControl isInvalid={errors.email}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="email">
                      이메일
                    </FormLabel>
                    <Input
                      id="email"
                      className="lg"
                      placeholder="이메일"
                      defaultValue={partnerData[0]?.email}
                      {...register("email", {
                        pattern: /^\S+@\S+$/i,
                      })}
                    />
                  </div>
                  <FormErrorMessage>
                    {errors.email && errors.email.type === "pattern" && (
                      <>이메일 형식이 맞지 않습니다.</>
                    )}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.address}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="address">
                      주소
                    </FormLabel>
                    <Box style={{ width: "100%" }}>
                      <Flex>
                        <Input
                          id="address"
                          className="lg"
                          placeholder="우편번호"
                          defaultValue={partnerData[0]?.address}
                          readOnly
                          {...register("address")}
                        />
                        <Button
                          ml={2}
                          colorScheme="blue"
                          variant="outline"
                          onClick={handle.clickButton}
                        >
                          주소찾기
                        </Button>
                      </Flex>
                      <Flex flexDirection="column">
                        <Input
                          id="address2"
                          mt={2}
                          className="lg"
                          placeholder="기본주소"
                          defaultValue={partnerData[0]?.address2}
                          readOnly
                          {...register("address2")}
                        />
                        <Input
                          id="address3"
                          mt={2}
                          className="lg"
                          placeholder="상세주소"
                          defaultValue={partnerData[0]?.address3}
                          {...register("address3")}
                        />
                      </Flex>
                    </Box>
                  </div>
                  <FormErrorMessage>
                    {errors.address && errors.address.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.p_manager}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="p_manager">
                      협력사 담당
                    </FormLabel>
                    <Input
                      id="name"
                      placeholder="협력사 담당자명"
                      {...register("p_manager")}
                    />
                    <Input
                      id="name"
                      ml={2}
                      placeholder="협력사 담당자 직급"
                      {...register("p_manager_rank")}
                    />
                  </div>
                </FormControl>

                <FormControl isInvalid={errors.role}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="role">
                      담당업무
                    </FormLabel>
                    <Input
                      id="role"
                      className="lg"
                      placeholder=""
                      defaultValue={partnerData[0].role}
                      {...register("role")}
                    />
                  </div>
                  <FormErrorMessage>
                    {errors.role && errors.role.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.manager}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="manager">
                      담당자
                    </FormLabel>
                    <Input
                      type="text"
                      className="lg"
                      value={
                        checkManagerList &&
                        checkManagerList.map((el) => el.name)
                      }
                      readOnly
                    />
                    <Button
                      flexShrink="0"
                      colorScheme="blue"
                      onClick={onManagerPop}
                      ml={2}
                    >
                      담당자 선택
                    </Button>
                  </div>
                  <FormErrorMessage>
                    {errors.manager && errors.manager.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.etc}>
                  <div className="row_box">
                    <FormLabel className="label" htmlFor="etc">
                      비고
                    </FormLabel>
                    <Input
                      id="etc"
                      className="lg"
                      placeholder=""
                      defaultValue={partnerData[0].etc}
                      {...register("etc")}
                    />
                  </div>
                  <FormErrorMessage>
                    {errors.etc && errors.etc.message}
                  </FormErrorMessage>
                </FormControl>

                <Flex mt={4} width="100%" justifyContent="center">
                  <Button
                    width="150px"
                    size="lg"
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    수정
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </CommonForm>
        </div>
        <div className="bg" onClick={closeModifyPop}></div>
      </PartnerModiPopup>
      {openPostcode && (
        <AddressPop
          handle={handle}
          onPostcode={onPostcode}
          closePostcode={closePostcode}
        />
      )}
    </>
  );
}
