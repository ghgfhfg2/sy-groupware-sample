
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Editor({ placeholder, value, ...rest }) {
  const toolbarOptions = [
    ["link", "image", "video"],
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
  ]; 
  const modules = {
    toolbar: {
      container: toolbarOptions,
    },
  };
  const quillRef = useRef();
  const [initHtml, setInitHtml] = useState(`<div style="display:flex">
  <div>1</div><div>2</div>
</div>`)

  useEffect(() => {

    
    const handleImage = () => {
      // 이미지 핸들 로직
    }
    
    if (quillRef.current) {
      
      const toolbar = quillRef.current.getEditor().getModule("toolbar");
      toolbar.addHandler("image", handleImage);
    }
  }, [initHtml]);

  return (
    <ReactQuill
      {...rest}
      ref={quillRef}
      placeholder={placeholder}
      value={initHtml || ""}
      theme="snow" 
      modules={{
        ...modules,
      }}
      style={{
        height:"70vh",display:"flex",flexDirection:"column"
        ,maxHeight:"550px",minHeight:"300px"
      }}
    />
  )
}
