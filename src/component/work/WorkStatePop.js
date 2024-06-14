import React, { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
  Input,
  Box,
  Highlight,
  Flex,
} from "@chakra-ui/react";

export default function WorkStatePop({
  isOpen,
  onClose,
  onSubmitStep,
  curState,
  onChangeComment,
  comment,
  stateText,
}) {
  const cancelRef = useRef();

  return (
    <>
      <AlertDialog
        isCentered
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" pb={1} fontWeight="bold">
              상태변경
            </AlertDialogHeader>
            <AlertDialogBody>
              <Flex alignItems="center" mb={2}>
                <Highlight
                  query={`${stateText[curState - 1].txt}`}
                  styles={{
                    px: "2",
                    py: "1",
                    rounded: "4px",
                    bg: "blue.500",
                    color: "#fff",
                    mr: "5px",
                  }}
                >
                  {`${stateText[curState - 1].txt} 상태로 변경 하시겠습니까?`}
                </Highlight>
              </Flex>
              <Input
                placeholder="추가 의견"
                onChange={onChangeComment}
                value={comment}
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button colorScheme="red" onClick={onSubmitStep} ml={3}>
                변경
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
