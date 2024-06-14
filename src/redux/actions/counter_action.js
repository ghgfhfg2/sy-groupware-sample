import {
  SET_DAYOFF_COUNT,
  UPDATE_DAYOFF_COUNT,
  BOARD_COUNT,
  UPDATE_NON_READ,
} from "./types";

export const setDayoffCount = (count) => {
  return {
    type: SET_DAYOFF_COUNT,
    payload: count,
  };
};
export const updateDayoffCount = (chk) => {
  return {
    type: UPDATE_DAYOFF_COUNT,
    payload: chk,
  };
};

export const setBoardCount = (num) => {
  return {
    type: BOARD_COUNT,
    payload: num,
  };
};

export const updateNonRead = (num) => {
  return {
    type: UPDATE_NON_READ,
    payload: num,
  };
};
