import React, {useState,useEffect} from 'react'
import { db } from "src/firebase";
import {
  ref,
  get
} from "firebase/database";

export default function useAdminSetting() {

  const [settingData, setSettingData] = useState()
  useEffect(() => {
    const setRef = ref(db,`admin/setting`)
    get(setRef)
    .then(data=>{
      setSettingData(data.val())
    })

  }, [])
  
  return settingData
}
