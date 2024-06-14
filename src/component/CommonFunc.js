export function numberToKorean(number) {
  let inputNumber = number < 0 ? false : number;
  let unitWords = ["", "만", "억", "조", "경"];
  let splitUnit = 10000;
  let splitCount = unitWords.length;
  let resultArray = [];
  let resultString = "";

  for (let i = 0; i < splitCount; i++) {
    let unitResult =
      (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
    unitResult = Math.floor(unitResult);
    if (unitResult > 0) {
      resultArray[i] = unitResult;
    }
  }

  for (let i = 0; i < resultArray.length; i++) {
    if (!resultArray[i]) continue;
    resultString =
      String(comma(resultArray[i])) + unitWords[i] + " " + resultString;
  }

  return resultString;
}

export const getFormatDate = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month >= 10 ? month : "0" + month;
  let og_month = date.getMonth();
  let day = date.getDate();
  day = day >= 10 ? day : "0" + day;
  let og_day = date.getDate();
  let weeek = date.getDay();
  let weekArr = ["일", "월", "화", "수", "목", "금", "토"];
  let hour = date.getHours();
  hour = hour >= 10 ? hour : "0" + hour;
  let min = date.getMinutes();
  min = min >= 10 ? min : "0" + min;
  let sec = date.getSeconds();
  let obj = {
    year: year,
    month: month,
    day: day,
    og_month: og_month,
    og_day: og_day,
    week: weekArr[weeek],
    weekNum: weeek,
    hour: hour,
    min: min,
    sec: sec,
    full: year + "" + month + "" + day,
    full_: year + "-" + month + "-" + day,
  };

  return obj;
};

export function comma(num) {
  let len, point, str;
  let minus = false;
  if (num < 0) {
    minus = true;
  }
  num = num + "";
  if (minus) {
    num = num.substr(1);
  }
  point = num.length % 3;
  len = num.length;

  str = num.substring(0, point);
  while (point < len) {
    if (str != "") str += ",";
    str += num.substring(point, point + 3);
    point += 3;
  }
  if (minus) {
    str = "-" + str;
  }
  return str;
}
