import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent.jsx";
import Result from "../components/Result.jsx";

export default function GroundhogDayACPage() {
  const groundhog_day_ac_sales = useLoaderData();

  return (
    <>
      <PageContent title="Air Conditioners on Groundhog Day" />
      <Result pageid="p7" data={groundhog_day_ac_sales} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/groundhog-day-ac");
  const resData = await response.json();
  return resData.groundhog_day_ac_sales;
}
