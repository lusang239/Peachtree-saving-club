import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent.jsx";
import Result from "../components/Result.jsx";

export default function StoreRevenueByStatePage() {
  const [selectedState, setSelectedState] = useState(null);
  const [fetchedData, setFetchedData] = useState([]);
  const states = useLoaderData();

  function handleChange(event) {
    setSelectedState(event.target.value);
  }

  useEffect(() => {
    async function fetchStateStoreRevenue() {
      const response = await fetch(
        `http://127.0.0.1:5000/store-revenue-by-year-by-state/` + selectedState
      );
      const resData = await response.json();
      return setFetchedData(resData.store_revenue);
    }

    fetchStateStoreRevenue();
  }, [selectedState]);

  return (
    <>
      <PageContent title="Store Revenue by Year by State" />
      <form>
        <label htmlFor="statesDropdown">State</label>
        <select
          id="statesDropdown"
          name="selectedState"
          onChange={handleChange}
        >
          <option value="">Please select an option</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </form>
      <Result pageid="p6" data={fetchedData} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/states");
  const resData = await response.json();
  return resData.states;
}
