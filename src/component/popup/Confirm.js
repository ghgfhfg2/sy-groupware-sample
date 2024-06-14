import React from "react"
import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react'

export default function ComConfirm(props) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()
  return (
    <>
      <Button colorScheme={props.color} onClick={onOpen}>
        {props.btnTxt}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {props.title}
            </AlertDialogHeader>

            <AlertDialogBody>
              {props.desc}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {props.closeTxt}
              </Button>
              <Button colorScheme='red' onClick={
                ()=>{props.submit(props.submitProps);onClose()}
                } 
                ml={2}>
                {props.submitTxt}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}