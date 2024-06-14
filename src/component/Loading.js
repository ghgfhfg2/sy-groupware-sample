import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading({ size }) {
  return (
    <>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="blue.200"
        color="blue.500"
        size={size}
      />
    </>
  );
}
