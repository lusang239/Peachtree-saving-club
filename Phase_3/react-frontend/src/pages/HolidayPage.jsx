import { useLoaderData, useNavigate } from "react-router";

import Result from "../components/Result.jsx";

export default function HolidayPage() {
  const navigate = useNavigate();
  const holidays = useLoaderData();

  return (
    <>
      <button onClick={() => navigate("new")}>Add Holiday</button>
      <Result pageid="p1" data={holidays} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/holidays");
  const resData = await response.json();
  return resData.holidays;
}
