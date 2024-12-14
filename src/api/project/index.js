import { useSelector } from "react-redux";
import { api } from "..";
import { useQuery } from "@tanstack/react-query";

//워크리스트 가져오기
export const getWorkList = async (userInfo) => {
  const res = await api.post({
    a: "get_work_list",
    page,
    limit,
    state,
    project,
    depth: userInfo.project_depth || null,
  });
  return res.data;
};

//워크리스트 가져오기 쿼리
export const useGetWorkList = () => {
  const userInfo = useSelector((state) => state.user.currentUser);
  return useQuery({
    queryKey: ["workList"],
    queryFn: () => getWorkList(userInfo),
  });
};

//프로젝트 리스트 가져오기
export const getProjectList = async () => {
  const res = await api.post("", {
    a: "get_project_list",
  });
  return res.data.project;
};

//프로젝트 리스트 가져오기 쿼리
export const useGetProjectList = () => {
  return useQuery({
    queryKey: ["projectList"],
    queryFn: getProjectList,
  });
};
