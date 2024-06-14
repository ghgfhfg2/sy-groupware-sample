export default function PartSelect({ partList }) {
  let partArr = [];
  for (const key in partList) {
    partArr.push({
      uid: key,
      name: partList[key],
    });
  }
  return (
    <>
      {partArr &&
        partArr.map((el, idx) => (
          <>
            <option key={idx} value={el.uid}>
              {el.name}
            </option>
          </>
        ))}
    </>
  );
}
