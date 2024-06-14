export default function ManagerSelect({ managerList }) {
  return (
    <>
      {managerList &&
        managerList.map((el, idx) => (
          <>
            <option key={idx} value={el.uid}>
              {el.name}
            </option>
          </>
        ))}
    </>
  );
}
