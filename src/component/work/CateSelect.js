import React, { useEffect, useState } from "react";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import axios from "axios";

export default function CateSelect({
  initData,
  cateUid1,
  cateUid2,
  cateUid3,
  onCateUid1,
  onCateUid2,
  onCateUid3,
}) {
  const CateDataProcessing = (initArray) => {
    let depthArr2 = [];
    let depthArr3 = [];

    let cateArr = [];

    initArray.forEach((el) => {
      const depth = el.depth.split("_");
      if (depth.length == 1) {
        cateArr.push(el);
      }
      if (depth.length == 2) {
        depthArr2.push(el);
      }
      if (depth.length == 3) {
        depthArr3.push(el);
      }
    });

    cateArr.sort((a, b) => a.depth - b.depth);

    depthArr3.forEach((d3) => {
      const idx = depthArr2.findIndex(
        (d2) =>
          d2.depth.split("_")[0] == d3.depth.split("_")[0] &&
          d2.depth.split("_")[1] == d3.depth.split("_")[1]
      );
      if (depthArr2[idx].sub) {
        depthArr2[idx].sub.push(d3);
      } else {
        depthArr2[idx].sub = [d3];
      }
    });

    depthArr2.forEach((d2) => {
      if (d2.sub) {
        d2.sub.sort((a, b) => a.depth.split("_")[2] - b.depth.split("_")[2]);
      }
      const idx = cateArr.findIndex(
        (d1) => d1.depth.split("_")[0] == d2.depth.split("_")[0]
      );
      if (cateArr[idx].sub) {
        cateArr[idx].sub.push(d2);
      } else {
        cateArr[idx].sub = [d2];
      }
    });

    cateArr.forEach((el) => {
      if (el.sub) {
        el.sub.sort((a, b) => a.depth.split("_")[1] - b.depth.split("_")[1]);
      }
    });
    return cateArr;
  };

  //카테고리 선택
  const [selectCateDepth2, setSelectCateDepth2] = useState();
  const [selectCateDepth3, setSelectCateDepth3] = useState();

  const onChangeCate = (e, depth) => {
    let uid;
    if (typeof e == "string") {
      uid = e;
    } else {
      uid = e.target.value;
    }
    if (depth == 1) {
      setSelectCateDepth2("");
      setSelectCateDepth3("");
      onCateUid2("");
      onCateUid3("");
      if (uid) {
        for (let i = 0; i < cateList.length; i++) {
          if (cateList[i].uid == uid && cateList[i].sub) {
            onCateUid1(cateList[i]);
            setSelectCateDepth2(cateList[i].sub);
          }
        }
      } else {
        onCateUid1("");
      }
    } else if (depth == 2) {
      if (uid) {
        for (let i = 0; i < selectCateDepth2.length; i++) {
          if (selectCateDepth2[i].uid == uid && selectCateDepth2[i].sub) {
            setSelectCateDepth3(selectCateDepth2[i].sub);
            onCateUid2(selectCateDepth2[i]);
            onCateUid3("");
          }
        }
      } else {
        onCateUid2("");
        onCateUid3("");
        setSelectCateDepth3("");
      }
    } else {
      if (uid) {
        for (let i = 0; i < selectCateDepth3.length; i++) {
          if (selectCateDepth3[i].uid == uid) {
            onCateUid3(selectCateDepth3[i]);
          }
        }
      } else {
        onCateUid3("");
      }
    }
  };

  const initSelect = (init) => {
    if (init.cate_2) {
      onChangeCate(init.cate_1.uid, 1);
      if (init.cate_3) {
        onChangeCate(init.cate_2.uid, 2);
      }
    }
  };

  const [cateList, setCateList] = useState();
  useEffect(() => {
    axios &&
      axios
        .post(process.env.NEXT_PUBLIC_API_URL + "/groupware.php", {
          a: "get_cate_list",
        })
        .then((res) => {
          const cate = res.data.cate;
          const list = CateDataProcessing(cate);
          setCateList(list);
        });
  }, []);

  useEffect(() => {
    if (cateList) {
      initSelect(initData);
    }
  }, [initData]);

  return (
    <FormControl className="row_section">
      <div className="row_box">
        <FormLabel className="label">카테고리</FormLabel>
        <Select width={250} onChange={(e) => onChangeCate(e, 1)}>
          <option value="">카테고리 선택</option>
          {cateList &&
            cateList.map((el) => (
              <option
                selected={initData.cate_1.uid == el.uid && true}
                key={el.uid}
                value={el.uid}
              >
                {el.title}
              </option>
            ))}
        </Select>
        {selectCateDepth2 && (
          <Select width={250} ml={2} onChange={(e) => onChangeCate(e, 2)}>
            <option value="">[{cateUid1.title}] 카테고리 선택</option>
            {selectCateDepth2.map((el) => (
              <option
                key={el.uid}
                value={el.uid}
                selected={
                  initData.cate_2 && initData.cate_2.uid == el.uid && true
                }
              >
                {el.title}
              </option>
            ))}
          </Select>
        )}
        {selectCateDepth3 && (
          <Select width={250} ml={2} onChange={(e) => onChangeCate(e, 3)}>
            <option value="">[{cateUid2.title}] 카테고리 선택</option>
            {selectCateDepth3.map((el) => (
              <option
                key={el.uid}
                value={el.uid}
                selected={
                  initData.cate_3 && initData.cate_3.uid == cateUid3.uid && true
                }
              >
                {el.title}
              </option>
            ))}
          </Select>
        )}
      </div>
    </FormControl>
  );
}
