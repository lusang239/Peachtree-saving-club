import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent";
import Result from "../components/Result.jsx";

export default function CategoryReportPage() {
  const category_report = useLoaderData();

  return (
    <>
      <PageContent title="Category Report" />
      <Result pageid="p4" data={category_report} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/category-report");
  const resData = await response.json();
  return resData.category_report;
}
