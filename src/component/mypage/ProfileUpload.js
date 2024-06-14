import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Flex,
  FormLabel,
  Box,
  Image,
  Avatar,
} from "@chakra-ui/react";
import { imageResize } from "@component/hooks/useImgResize";
import styled from "styled-components";
import { BiUpload } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";
const FileList = styled.div`
  display: flex;
  align-items: center;
  input {
    width: 0;
    height: 0;
    position: absolute;
    z-index: -1;
    opacity: 0;
    display: block;
    overflow: hidden;
  }
  .btn_add {
    margin-right: 15px;
    padding: 0;
    label {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .file_list {
    li {
      .thumb {
        max-width: 80px;
        max-height: 80px;
        width: 80px;
        height: 80px;
        background: #f1f1f1;
        display: flex;
        overflow: hidden;
        border-radius: 50%;
        justify-content: center;
        align-items: center;
        img {
          max-width: 200%;
          object-fit: cover;
        }
      }
      display: flex;
      align-items: center;
    }
  }
`;

export default function UploadBox({
  onAddUpload,
  uploadList,
  removeFile,
  initImg,
  removeInitProfile,
}) {
  const [fileList, setFileList] = useState();
  useEffect(() => {
    let newFileList = uploadList;
    if (uploadList) {
      uploadList.map((el, idx) => {
        imageResize(el, 200).then((img) => {
          newFileList[idx].thumb = typeof img === "string" ? img : "";
        });
      });
      setTimeout(() => {
        setFileList(newFileList);
      }, 100);
    }
  }, [uploadList]);

  return (
    <FileList>
      <ul className="file_list">
        {fileList && fileList.length === 0 && initImg && (
          <li>
            <div className="thumb">
              <Image alt="" src={initImg} />
            </div>
            <Button colorScheme="red" mr={2} onClick={removeInitProfile}>
              <RiDeleteBinLine />
            </Button>
          </li>
        )}
        {fileList &&
          fileList.map((el, idx) => (
            <>
              <li key={idx}>
                <div className="thumb">
                  {el.thumb && <Image alt="" src={el.thumb} />}
                </div>
                <Button
                  colorScheme="red"
                  mr={2}
                  onClick={() => {
                    removeFile(el.lastModified);
                  }}
                >
                  <RiDeleteBinLine />
                </Button>
              </li>
            </>
          ))}
      </ul>
      <input type="file" id="upload" onChange={onAddUpload} />
      <Button className="btn_add" colorScheme="blue" variant="outline">
        <FormLabel
          className="label"
          htmlFor="upload"
          style={{ width: "160px", marginBottom: "0" }}
        >
          <BiUpload
            style={{
              fontSize: "20px",
              paddingTop: "2px",
              marginRight: "3px",
            }}
          />
          이미지 업로드
        </FormLabel>
      </Button>
    </FileList>
  );
}
