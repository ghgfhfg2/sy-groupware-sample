import { Button, useToast } from "@chakra-ui/react";
import React from "react";
import { IoMdRefresh } from "react-icons/io";

export default function Refresh({ reRender }) {
  const toast = useToast();
  //새로고침
  const onRender = () => {
    toast({
      description: "새로고침 되었습니다.",
      status: "success",
      duration: 1000,
      isClosable: false,
    });
    reRender();
  };
  return (
    <Button onClick={onRender} colorScheme="blue">
      <IoMdRefresh /> 새로고침
    </Button>
  );
}
