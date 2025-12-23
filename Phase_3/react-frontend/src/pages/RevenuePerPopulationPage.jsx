import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent.jsx";
import Result from "../components/Result.jsx";

export default function RevenuePerPopulationPage() {
  const revenue_per_population = useLoaderData();

  return (
    <>
      <PageContent title="Revenue per Population" />
      <Result pageid="p9" data={revenue_per_population} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/revenue-per-population");
  const resData = await response.json();
  return resData.revenue_per_population;
}
