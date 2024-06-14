import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  FormLabel,
  FormControl,
  Input,
  Button,
  Flex,
  useToast,
  FormErrorMessage,
  Select,
} from "@chakra-ui/react";
import useGetUser from "@component/hooks/getUserDb";

import styled from "styled-components";
import { db } from "src/firebase";
import { ref, update } from "firebase/database";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { CommonForm } from "pages/setting";
import ProfileUpload from "@component/mypage/ProfileUpload";
import { imageResize, dataURLtoFile } from "@component/hooks/useImgResize";
import axios from "axios";

export default function Mypage() {
  const storage = getStorage();
  const toast = useToast();
  const userInfo = useSelector((state) => state.user.currentUser);
  const getUserInfo = useGetUser();
  const partList = getUserInfo[1]?.partList;
  const rankList = getUserInfo[1]?.rankList;

  const [userData, setUserData] = useState();
  const [initProfile, setInitProfile] = useState();
  useEffect(() => {
    setInitProfile(userInfo?.profile);
    if (partList && rankList && userInfo) {
      let user = {
        ...userInfo,
        part: userInfo.part ? partList[userInfo.part] : "",
        rank: userInfo.rank ? rankList[userInfo.rank] : "",
      };
      setUserData(user);
    }
  }, [userInfo, partList, rankList]);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const [attendTime, setAttendTime] = useState();
  const onChangeAttendTime = (e) => {
    setAttendTime(e.target.value);
  };

  const onSubmit = async (values) => {
    const curTime = await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_time",
      })
      .then((res) => {
        return res.data.time;
      });
    if (curTime == "09") {
      toast({
        title: "09:00 ~ 10:00 에는 수정이 불가능합니다.",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
      return;
    }
    if (!attendTime && !userData.attendTime) {
      toast({
        title: "출근시간을 정해주세요.",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
      return;
    }
    let url;
    if (userInfo.profile) {
      url = userInfo.profile;
    }
    if (uploadList.length > 0) {
      url = uploadList;
    } else if (initProfile) {
      url = initProfile;
    } else {
      url = "";
    }

    if (uploadList.length > 0) {
      const getResizeProfile = await imageResize(uploadList[0], 300).then(
        (img) => {
          const resizeImg = dataURLtoFile(img, uploadList[0].name);
          return resizeImg;
        }
      );
      const storageRef = sRef(storage, `profile/${userInfo.uid}/profile_img`);
      url = await uploadBytes(storageRef, getResizeProfile).then((snapshot) => {
        const downloadUrl = getDownloadURL(snapshot.ref);
        return downloadUrl;
      });
    }

    update(ref(db, `user/${userInfo.uid}`), {
      ...values,
      attendTime: attendTime || userData.attendTime || "",
      addLunch: addLunch || userData.addLunch || "",
      profile: url || "",
    }).then(() => {
      toast({
        position: "top",
        title: "업데이트 되었습니다.",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    });
  };

  //이미지 등록
  const [uploadList, setUploadList] = useState([]);
  const onAddUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 2097152) {
      toast({
        description: "첨부파일 최대용량은 2MB 입니다.",
        status: "error",
        duration: 1000,
        isClosable: false,
      });
      e.target.value = null;
      return;
    } else {
      const newList = [file];
      setUploadList(newList);
      e.target.value = null;
    }
  };
  const removeFile = (uid) => {
    let newFileList = uploadList;
    newFileList = newFileList.filter((el) => {
      return el.lastModified !== uid;
    });
    setInitProfile("");
    setUploadList(newFileList);
  };

  const removeInitProfile = () => {
    setInitProfile("");
  };

  return (
    <>
      {userData && (
        <CommonForm onSubmit={handleSubmit(onSubmit)}>
          <Flex marginTop={5}>
            <Flex
              width="100%"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel htmlFor="upload" className="label">
                    프로필
                  </FormLabel>
                  <ProfileUpload
                    onAddUpload={onAddUpload}
                    uploadList={uploadList}
                    removeFile={removeFile}
                    initImg={initProfile}
                    removeInitProfile={removeInitProfile}
                  />
                </div>
              </FormControl>
              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel className="label">이름</FormLabel>
                  <Input
                    id="name"
                    defaultValue={userData.name}
                    readOnly
                    className="xs read_only"
                  />
                </div>
              </FormControl>
              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel className="label">이메일</FormLabel>
                  <Input
                    id="name"
                    defaultValue={userData.email}
                    readOnly
                    className="sm read_only"
                  />
                </div>
              </FormControl>
              <FormControl className="row_section">
                <div className="row_box">
                  <FormLabel className="label">부서</FormLabel>
                  <Input
                    id="part"
                    defaultValue={userData.part}
                    readOnly
                    className="read_only sm"
                  />
                </div>
              </FormControl>

              <FormControl isInvalid={errors.call} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="call">
                    휴대폰번호
                  </FormLabel>
                  <Input
                    id="call"
                    type="number"
                    defaultValue={userData.call}
                    className="input xs"
                    {...register("call", {
                      pattern: /^01([0|1|6|7|8|9]?)([0-9]{3,4})([0-9]{4})$/,
                    })}
                  />
                </div>
                <FormErrorMessage>
                  {errors.call && errors.call.type === "pattern" && (
                    <>{`휴대폰번호 양식에 맞지 않습니다.`}</>
                  )}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.call} className="row_section">
                <div className="row_box">
                  <FormLabel className="label" htmlFor="attend_time">
                    출근시간
                  </FormLabel>
                  <Select
                    width={150}
                    id="attend_time"
                    onChange={onChangeAttendTime}
                    value={attendTime}
                    defaultValue={userData.attendTime}
                  >
                    <option value="">출근시간</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                  </Select>
                </div>
              </FormControl>

              {/* submit */}
              <Flex
                width="150px"
                mt={4}
                flexDirection="column"
                justifyContent="center"
              >
                <Button
                  mb={2}
                  width="100%"
                  size="lg"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                >
                  저장
                  {isSubmitting}
                </Button>
              </Flex>
              {/* submit */}
            </Flex>
          </Flex>
        </CommonForm>
      )}
    </>
  );
}
