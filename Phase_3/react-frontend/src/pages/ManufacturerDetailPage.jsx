import { useLoaderData, useNavigate } from "react-router";

import PageContent from "../components/PageContent.jsx";
import Result from "../components/Result.jsx";

export default function ManufacturerDetailPage() {
  const navigate = useNavigate();
  const { manufacturer, manufacturer_detail } = useLoaderData();

  return (
    <>
      <PageContent title="Manufacturer's Detail Information" />
      <Result pageid="p3" data={manufacturer} layer="l1" is_detail={true} />
      <h2>Manufacturer's Product Detail</h2>
      <Result
        pageid="p3"
        data={manufacturer_detail}
        layer="l2"
        is_detail={true}
      />
      <button onClick={() => navigate("..")}>Go back</button>
    </>
  );
}

export async function loader({ params }) {
  const [mResponse, mpResponse] = await Promise.all([
    fetch("http://127.0.0.1:5000/manufacturers/" + `${params.mid}`),
    fetch("http://127.0.0.1:5000/manufacturer-detail/" + `${params.mid}`),
  ]);

  if (!mResponse.ok || !mpResponse.ok) {
    //...
  } else {
    const mResData = await mResponse.json();
    const mpResData = await mpResponse.json();
    return {
      manufacturer: mResData.manufacturer,
      manufacturer_detail: mpResData.manufacturer_detail,
    };
  }
}
