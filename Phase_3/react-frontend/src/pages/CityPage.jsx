import { useRouteLoaderData, useNavigate } from "react-router";

import Result from "../components/Result";

export default function CityPage() {
  const navigate = useNavigate();
  const city_population = useRouteLoaderData("city-population");

  return (
    <>
      <button onClick={() => navigate("update")}>Edit City Population</button>
      <Result pageid="p2" data={city_population} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/city-population");
  const resData = await response.json();
  return resData.city_population;
}
