import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent.jsx";
import Result from "../components/Result.jsx";

export default function CategoryTopStatePage() {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = useLoaderData();

  const [selectedYearMonth, setSelectedYearMonth] = useState({
    year: null,
    month: null,
  });

  const [fetchedData, setFetchedData] = useState([]);

  function handleChange(identifier, value) {
    setSelectedYearMonth((prevSelectedYearMonth) => {
      return {
        ...prevSelectedYearMonth,
        [identifier]: +value,
      };
    });
  }

  useEffect(() => {
    async function fetchCategoryTopState() {
      const response = await fetch(
        "http://127.0.0.1:5000/category-top-state/" +
          selectedYearMonth.year +
          "/" +
          selectedYearMonth.month
      );
      const resData = await response.json();
      return setFetchedData(resData.category_top_state);
    }

    if (selectedYearMonth.year && selectedYearMonth.month) {
      fetchCategoryTopState();
    }
  }, [selectedYearMonth]);

  return (
    <>
      <PageContent title="State with Highest Volume for each Category" />
      <form>
        <p>
          <label htmlFor="yearDropdown">Year</label>
          <select
            id="yearDropdown"
            name="selectedYear"
            onChange={(event) => handleChange("year", event.target.value)}
            required
          >
            <option value="">Please select an option</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="monthDropdown">Month</label>
          <select
            id="monthDropdown"
            name="selectedMonth"
            onChange={(event) => handleChange("month", event.target.value)}
            required
          >
            <option value="">Please select an option</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </p>
      </form>
      <Result pageid="p8" data={fetchedData} />
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/years");
  const resData = await response.json();
  return resData.years;
}
