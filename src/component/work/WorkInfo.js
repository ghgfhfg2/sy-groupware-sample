import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Flex,
  Input,
  Select,
  FormControl,
  useToast,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { useSelector } from "react-redux";
import styled from "styled-components";
import InfoModifyPop from "@component/work/InfoModifyPop";
import Refresh from "@component/Refresh";
const TableBox = styled.div`
  border: 1px solid #ededed;
  padding: 10px 15px 15px 15px;
  border-radius: 10px;
  .info_box {
    display: none;
  }
  td {
    transition: all 0.2s;
  }
  tr {
    &:hover {
      td {
        background: rgba(0, 0, 0, 0.1);
      }
      .info_box {
        display: flex;
      }
    }
  }
`;

const TopInputBox = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
  margin-bottom: 15px;
  align-items: stretch;
  .title {
    width: 30%;
  }
  button {
    min-width: 120px;
    height: auto;
    min-height: 40px;
  }
  @media all and (max-width: 640px) {
    flex-direction: column;
    .title {
      width: 100%;
    }
  }
`;

export default function WorkInfo() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const { handleSubmit, register, resetField } = useForm();
  const toast = useToast();

  const [render, setRender] = useState(false);
  const onRender = () => {
    setRender(!render);
  };

  const [curProject, setCurProject] = useState();
  const onFilterProject = (e) => {
    setCurProject(e.target.value);
  };

  const [projectList, setProjectList] = useState();
  useEffect(() => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_project_list",
      })
      .then((res) => {
        setProjectList(res.data.project);
      });
  }, []);

  const [infoData, setInfoData] = useState();
  useEffect(() => {
    if (!curProject) {
      setInfoData("");
      return;
    }
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "get_project_info",
        uid: curProject,
      })
      .then((res) => {
        setInfoData(res.data.info);
      });
  }, [curProject, render]);

  const onSubmit = (values) => {
    if (!values.title) {
      toast({
        description: "항목이 비어 있습니다.",
        status: "info",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    if (!values.content) {
      toast({
        description: "내용이 비어 있습니다.",
        status: "info",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    values.content = values.content.replace(/(?:\r\n|\r|\n)/g, "<br>");
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "regis_project_info",
        uid: curProject,
        writer: userInfo.uid,
        ...values,
      })
      .then((res) => {
        toast({
          description: "항목이 추가 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        resetField("title");
        resetField("content");
        onRender();
      });
  };

  //수정 팝업
  const [isModifyPop, setIsModifyPop] = useState(false);
  const [selectInfoData, setSelectInfoData] = useState();

  const onModifyPop = (e, uid) => {
    setIsModifyPop(true);
    e.content = e.content.replaceAll("<br>", "\r\n");
    setSelectInfoData(e);
  };
  const closeModifyPop = () => {
    setIsModifyPop(false);
  };

  //항목 삭제
  const removeInfo = (uid) => {
    const agree = confirm("삭제하시겠습니까?");
    axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
        a: "remove_project_info",
        uid,
      })
      .then((res) => {
        toast({
          description: "항목이 삭제 되었습니다.",
          status: "success",
          duration: 1000,
          isClosable: false,
        });
        onRender();
      });
  };

  return (
    <>
      {projectList && (
        <>
          <Flex>
            <Select
              onChange={onFilterProject}
              width={{ lg: 200, sm: "100%" }}
              mr={{ lg: 3, sm: "0" }}
            >
              <option value="" key="-1">
                프로젝트 선택
              </option>
              {projectList.map((el) => (
                <option value={el.uid} key={el.uid}>
                  {el.title}
                </option>
              ))}
            </Select>
            <Refresh reRender={onRender} />
          </Flex>
        </>
      )}
      {curProject && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <TopInputBox>
            <Input
              className="title"
              placeholder="항목"
              {...register("title")}
            />
            <Textarea placeholder="내용" {...register("content")} />
            <Button type="submit" colorScheme="blue">
              항목 추가
            </Button>
          </TopInputBox>
        </form>
      )}
      {infoData && (
        <TableBox>
          <>
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th fontSize="sm" color="#333">
                    항목
                  </Th>
                  <Th fontSize="sm" color="#333">
                    내용
                  </Th>
                  <Th textAlign="center" fontSize="sm" color="#333">
                    관리
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {infoData.map((el) => (
                  <>
                    <Tr>
                      <Td width="20%">{el.title}</Td>
                      <Td>
                        <div
                          dangerouslySetInnerHTML={{ __html: el.content }}
                        ></div>
                      </Td>
                      <Td width={150}>
                        <div className="info_box">
                          <Button
                            onClick={() => onModifyPop(el, el.uid)}
                            colorScheme="blue"
                            size="sm"
                            mr={1}
                          >
                            수정
                          </Button>
                          <Button
                            onClick={() => removeInfo(el.uid)}
                            colorScheme="red"
                            size="sm"
                          >
                            삭제
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  </>
                ))}
              </Tbody>
            </Table>
          </>
        </TableBox>
      )}
      {isModifyPop && selectInfoData && (
        <InfoModifyPop
          selectInfoData={selectInfoData}
          closeModifyPop={closeModifyPop}
          onRender={onRender}
        />
      )}
    </>
  );
}
