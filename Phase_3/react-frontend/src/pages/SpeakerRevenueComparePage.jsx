import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent";
import Result from "../components/Result.jsx";

export default function SpeakerRevenueComparePage() {
  const speaker_revenue_compare = useLoaderData();

  return (
    <>
      <PageContent title="Actual vs. Predicted Revenue for Speaker Units" />
      <Result pageid="p5" data={speaker_revenue_compare} />
    </>
  );
}

export async function loader() {
  const response = await fetch(
    "http://127.0.0.1:5000/speaker-revenue-comparison"
  );

  if (!response.ok) {
    // ...
  } else {
    const resData = await response.json();
    return resData.speaker_revenue_compare;
  }
}
