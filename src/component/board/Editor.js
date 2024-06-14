import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import styled from "styled-components";
import { basicForm } from "@component/BasicForm";

import SunEditor, { buttonList } from "suneditor-react";
import plugins from "suneditor/src/plugins";
import { useToast } from "@chakra-ui/react";

// const SunEditor = dynamic(() => import("suneditor-react"), {
//   ssr: false,
// });

const EditorBox = styled.div`
  width: 100%;
  .sun-editor-editable {
    .form_wrapper {
      display: flex;
      justify-content: center;
    }
    .form_content {
      width: 95vw;
      max-width: 1000px;
      border: 2px solid #ddd;
      padding: 2.5rem;
    }
    .top_box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 120px;
      margin-bottom: 2rem;
      h2 {
        flex: 1;
        height: 100%;
        font-size: 20px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .manager_box {
        display: flex;
        height: 100%;
        .dl {
          min-width: 80px;
          height: 100%;
          border: 1px solid #aaa;
          margin-left: -1px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .dt {
          border-bottom: 1px solid #aaa;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .dd {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .stamp {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 3px solid #9b2c2c;
          width: 56px;
          height: 56px;
          color: #9b2c2c;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 13px;
          font-weight: bold;
          &::before {
            content: "";
            display: block;
            width: 87%;
            height: 87%;
            position: absolute;
            border: 1px solid #9b2c2c;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
          }
        }
      }
    }

    .con_box {
      width: 100%;
      margin-bottom: 2rem;
    }

    .con_table {
    }

    .footer_box {
      display: flex;
      justify-content: center;
      span {
        margin: 1rem;
      }
    }
  }

  @media screen and (max-width: 1024px) {
    overflow: auto;
    width: 100%;
    max-width: calc(${(props) => props.winWidth}px - 2rem);
    .scroll_box {
      min-width: 900px;
    }
  }
`;

export default function Editor({
  type,
  handleEditor,
  typeCon,
  initTypeCon,
  disable,
  insertHtml,
  height,
}) {
  const toast = useToast();
  const editor = useRef();

  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  const [windowWidth, setWindowWidth] = useState(window.outerWidth);
  const setWidth = () => {
    setWindowWidth(window.outerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", setWidth);
    return () => {
      window.removeEventListener("resize", setWidth);
    };
  }, []);

  useEffect(() => {
    let selCon;
    if (type && typeCon) {
      typeCon.forEach((el) => {
        if (el.uid === type) {
          selCon = el.editor;
        }
      });
      setTimeout(() => {
        inputHtml(selCon);
      }, 100);
      return;
    }
  }, [type, typeCon]);

  useEffect(() => {
    if (insertHtml) {
      setTimeout(() => {
        inputHtml(insertHtml);
      }, 100);
    }
  }, [insertHtml]);

  const inputHtml = (content) => {
    editor.current?.setContents(content);
  };

  const handleImageUploadBefore = (files, info, uploadHandler) => {
    toast({
      description: "에디터내 파일첨부는 하실 수 없습니다.",
      status: "error",
      duration: 1000,
      isClosable: false,
    });
  };

  return (
    <>
      <EditorBox winWidth={windowWidth}>
        <div className="scroll_box">
          <SunEditor
            disable={disable || false}
            onChange={handleEditor}
            height={height ? height : "70vh"}
            onImageUploadBefore={handleImageUploadBefore}
            getSunEditorInstance={getSunEditorInstance}
            defaultValue={initTypeCon || basicForm}
            setOptions={{
              buttonList: [
                ["undo", "redo"],
                ["font", "fontSize", "formatBlock"],
                ["paragraphStyle", "blockquote"],
                ["bold", "underline", "italic", "strike"],
                ["fontColor", "hiliteColor", "textStyle"],
                ["removeFormat"],
                "/", // Line break
                ["outdent", "indent"],
                ["align", "horizontalRule", "list", "lineHeight"],
                ["table", "link" /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
                /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
                ["fullScreen", "showBlocks", "codeView"],
                ["preview", "print"],
                /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
              ],
            }}
          />
        </div>
      </EditorBox>
    </>
  );
}
