import {
  SET_DAYOFF_COUNT,
  UPDATE_DAYOFF_COUNT,
  BOARD_COUNT,
  UPDATE_NON_READ,
} from "../actions/types";

const initState = {
  dayoffCount: 0,
  dayoffCheck: false,
  boardCount: 0,
};

const counter = (state = initState, action) => {
  switch (action.type) {
    case SET_DAYOFF_COUNT:
      return {
        ...state,
        dayoffCount: action.payload,
      };
    case UPDATE_DAYOFF_COUNT:
      return {
        ...state,
        dayoffCount: action.payload,
      };
    case BOARD_COUNT:
      return {
        ...state,
        boardCount: action.payload,
      };
    case UPDATE_NON_READ:
      return {
        ...state,
        nonRead: action.payload,
      };
    default:
      return state;
  }
};

export default counter;
