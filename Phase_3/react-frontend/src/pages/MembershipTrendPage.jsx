import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent.jsx";
import Result from "../components/Result.jsx";

export default function MembershipTrendPage() {
  const memberships_trend = useLoaderData();

  return (
    <>
      <PageContent title="Membership Trend" />
      <Result pageid="p10" data={memberships_trend} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/memberships");

  if (!response.ok) {
    // ...
  } else {
    const resData = await response.json();
    return resData.memberships_trend;
  }
}
