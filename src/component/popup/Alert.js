import {
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import styled from 'styled-components';

const AlertPop = styled.div`
  position:fixed;left:50%;top:0px;
  z-index:500;
  transform:translateX(-50%);
  box-shadow:0 0 15px rgba(0,0,0,0.25);
  opacity:0;
  animation: fadeIn 1.5s;
  @keyframes fadeIn {
    from{
      transform:translate(-50%,0);
    }
    15%{
      opacity:1;
      transform:translate(-50%,30px);
    }
    85%{
      opacity:1;
      transform:translate(-50%,30px);
    }
    to{
      opacity:0;
      transform:translate(-50%,0);
    }
  }
`

export default function AlertBox({text,type}) {
  return (
    <AlertPop>
      <Alert status={type}>
        <AlertIcon />
        {text}
      </Alert>
    </AlertPop>
  )
}
