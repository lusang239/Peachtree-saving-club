import { useLoaderData } from "react-router";

import Result from "../components/Result.jsx";
import PageContent from "../components/PageContent.jsx";

export default function ManufacturerReportPage() {
  const manufacturers = useLoaderData();

  return (
    <>
      <PageContent title="Manufacturer's Product Report" />
      <Result pageid="p3" data={manufacturers} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/manufacturers");

  if (!response.ok) {
    // ...
  } else {
    const resData = await response.json();
    return resData.manufacturers;
  }
}
