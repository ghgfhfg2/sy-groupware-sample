import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { db } from "src/firebase";
import {
  ref,
  onValue,
  remove,
  get,
  off,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { format, addMonths, subMonths } from "date-fns";
import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { comma } from "@component/CommonFunc";
import { RenderHeader, ScheduleCalendar } from "pages/schedule";

const StatTable = styled.div`
  table {
    tbody {
      tr {
        transition: all 0.2s;
        &:hover {
          background: #e6fffa;
        }
      }
    }
  }
  tfoot {
    tr {
      color: #fff;
      background: #1a365d;
      font-weight: bold;
    }
  }
`;

export default function PriceStats() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [priceList, setPriceList] = useState();
  const [monthSum, setMonthSum] = useState();
  useEffect(() => {
    const formatMonth = format(currentMonth, "yyyyMM");
    const PriceRef = query(
      ref(db, `stats/price`),
      orderByChild("dateMonth"),
      equalTo(formatMonth)
    );
    onValue(PriceRef, (data) => {
      let arr = [];
      data.forEach((el) => {
        let obj = {
          ...el.val(),
          sum: el.val().income - el.val().spend,
        };
        arr.push(obj);
      });
      let sum = 0;
      let incomeSum = 0;
      let spendSum = 0;
      arr.forEach((el) => {
        sum += el.sum;
        incomeSum += el.income;
        spendSum += el.spend;
      });
      setMonthSum({
        total: sum,
        income: incomeSum,
        spend: spendSum,
      });
      arr.sort((a, b) => {
        return b.date.split("-")[2] - a.date.split("-")[2];
      });
      setPriceList(arr);
    });
    return () => {};
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <>
      <ScheduleCalendar>
        <RenderHeader
          currentMonth={currentMonth}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
        />
      </ScheduleCalendar>
      <StatTable>
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Imperial to metric conversion factors</TableCaption>
            <Thead>
              <Tr>
                <Th>날짜</Th>
                <Th>제목</Th>
                <Th isNumeric>소득금액</Th>
                <Th isNumeric>지출금액</Th>
                <Th isNumeric>합계</Th>
              </Tr>
            </Thead>
            <Tbody>
              {priceList &&
                priceList.map((el, idx) => (
                  <Tr key={idx}>
                    <Td>{el.date}</Td>
                    <Td>{el.subject}</Td>
                    <Td isNumeric>
                      {el.income ? `${comma(el.income)}원` : ""}
                    </Td>
                    <Td isNumeric>{el.spend ? `${comma(el.spend)}원` : ""}</Td>
                    <Td isNumeric>{el.sum ? `${comma(el.sum)}원` : ""}</Td>
                  </Tr>
                ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Td>합계</Td>
                <Td></Td>
                <Td isNumeric>{comma(monthSum?.income)}원</Td>
                <Td isNumeric>{comma(monthSum?.spend)}원</Td>
                <Td isNumeric>{comma(monthSum?.total)}원</Td>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </StatTable>
    </>
  );
}
