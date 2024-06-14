export default function RankSelect({ rankList }) {
  let rankArr = [];
  for (const key in rankList) {
    rankArr.push({
      uid: key,
      name: rankList[key],
    });
  }
  return (
    <>
      {rankArr &&
        rankArr.map((el, idx) => (
          <>
            <option key={idx} value={el.uid}>
              {el.name}
            </option>
          </>
        ))}
    </>
  );
}
