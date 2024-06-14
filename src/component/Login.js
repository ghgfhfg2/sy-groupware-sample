import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@redux/actions/user_action";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Button,
  Flex,
} from "@chakra-ui/react";
import LoginLayout from "@component/LoginLayout";
import Link from "next/link";
import { app, db } from "../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AlertBox from "@component/popup/Alert";

function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = getAuth();
  const [alertMessage, setAlertMessage] = useState("");
  const [alertState, setAlertState] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();
  function onSubmit(values) {
    return new Promise((resolve) => {
      signInWithEmailAndPassword(auth, values.email, values.password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          window.sessionStorage.setItem("isLogin", true);
          // ...
        })
        .then((res) => {
          dispatch(setUser(user));
          router.push("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorCode === "auth/user-not-found") {
            setAlertMessage("없는 이메일주소 입니다.");
            setAlertState(true);
            setTimeout(() => {
              setAlertState(false);
            }, 1500);
          }
          if (errorCode === "auth/wrong-password") {
            setAlertMessage("잘못된 비밀번호 입니다.");
            setAlertState(true);
            setTimeout(() => {
              setAlertState(false);
            }, 1500);
          }
          if (errorCode === "auth/too-many-requests") {
            setAlertMessage(
              "반복된 요청으로 인한 오류입니다.\n잠시 후 시도해 주세요."
            );
            setAlertState(true);
            setTimeout(() => {
              setAlertState(false);
            }, 1500);
          }
          resolve();
        });
    });
  }
  const joinGuest = () => {
    onSubmit({
      email: "guest@guest.com",
      password: "guest1234",
    });
  };
  return (
    <>
      {alertState && <AlertBox text={alertMessage} />}
      <form
        style={{ width: "100%", paddingTop: "20vh" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Flex justifyContent="center" marginTop={10}>
          <Flex
            maxWidth={400}
            width="100%"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <FormControl isInvalid={errors.email}>
              <Input
                id="email"
                placeholder="이메일"
                {...register("email", {
                  required: "이메일은 필수항목 입니다.",
                  pattern: /^\S+@\S+$/i,
                })}
              />
              <FormErrorMessage>
                {errors.email &&
                  errors.email.type === "required" &&
                  errors.email.message}
                {errors.email && errors.email.type === "pattern" && (
                  <>이메일 형식이 맞지 않습니다.</>
                )}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.password}>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                {...register("password", {
                  required: true,
                  minLength: 4,
                  maxLength: 16,
                })}
              />
              <FormErrorMessage>
                {errors.password && errors.password.type === "required" && (
                  <>비밀번호를 입력해 주세요</>
                )}
              </FormErrorMessage>
            </FormControl>

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
                로그인
              </Button>
              <Button
                onClick={joinGuest}
                mb={2}
                width="100%"
                isLoading={isSubmitting}
              >
                손님으로 입장
              </Button>
              <Link href="/join">
                <a style={{ alignSelf: "flex-end" }}>회원가입</a>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </form>
    </>
  );
}

export default Login;
