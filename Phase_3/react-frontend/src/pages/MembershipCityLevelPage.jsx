import { useLoaderData, useNavigate, useParams } from "react-router";

import PageContent from "../components/PageContent";
import Result from "../components/Result";

export default function MembershipCityLevelPage() {
  const navigate = useNavigate();
  const { year } = useParams();
  const { topData, bottomData } = useLoaderData();

  return (
    <>
      <PageContent title={"City Level Drill Down for Year " + `${year}`} />
      <div>
        <h2>Top 25 Cities Sold Most Memberships</h2>
        <Result pageid="p10" data={topData} layer="l1" is_detail={true} />
      </div>
      <div>
        <h2>Bottom 25 Cities Sold Least Memberships</h2>
        <Result pageid="p10" data={bottomData} layer="l1" is_detail={true} />
      </div>
      <button onClick={() => navigate("..")}>Go back</button>
    </>
  );
}

export async function loader({ params }) {
  const [topResponse, bottomResponse] = await Promise.all([
    fetch(
      "http://127.0.0.1:5000/memberships/top-25-cities/" + `${params.year}`
    ),
    fetch(
      "http://127.0.0.1:5000/memberships/bottom-25-cities/" + `${params.year}`
    ),
  ]);

  if (!topResponse.ok || !bottomResponse.ok) {
    //...
  } else {
    const topResData = await topResponse.json();
    const bottomResData = await bottomResponse.json();
    return {
      topData: topResData.top_25_cities,
      bottomData: bottomResData.bottom_25_cities,
    };
  }
}
