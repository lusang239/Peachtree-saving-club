import { useLoaderData, useParams, useNavigate } from "react-router";

import PageContent from "../components/PageContent";
import Result from "../components/Result";

export default function MembershipStoreLevelPage() {
  const navigate = useNavigate();
  const params = useParams();
  const store_info = useLoaderData();

  return (
    <>
      <PageContent
        title={"Store Level Drill Down for Year " + `${params.year}`}
      />
      <Result pageid="p10" data={store_info} layer="l2" is_detail={true} />
      <button onClick={() => navigate("..")}>Go back</button>
    </>
  );
}

export async function loader({ params }) {
  const response = await fetch(
    "http://127.0.0.1:5000/memberships/" +
      `${params.year}` +
      "/" +
      `${params.cityid}`
  );

  if (!response.ok) {
    //...
  } else {
    const resData = await response.json();
    return resData.store_info;
  }
}
