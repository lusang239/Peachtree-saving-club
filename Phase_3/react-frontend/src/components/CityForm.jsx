import { useState } from "react";
import { Form, useNavigate, redirect, useRouteLoaderData } from "react-router";
import classes from "./Form.module.css";

export default function CityForm() {
  const navigate = useNavigate();
  const city_population = useRouteLoaderData("city-population");
  const stateSet = [...new Set(city_population.map((row) => row.state))];
  const [selectedLocation, setSelectedLocation] = useState({
    state: null,
    city: null,
  });
  const populationDefault = city_population.find(
    (row) =>
      row.city === selectedLocation.city && row.state === selectedLocation.state
  )?.population;

  function handleChange(identifier, value) {
    setSelectedLocation((prevSelectedLocation) => {
      return {
        ...prevSelectedLocation,
        [identifier]: value,
      };
    });
  }

  return (
    <Form method="POST" className={classes.form}>
      <p>
        <label htmlFor="state">State</label>
        <select
          id="stateDropdown"
          name="selectedState"
          onChange={(event) => handleChange("state", event.target.value)}
          required
        >
          <option value="">Please select an option</option>
          {stateSet.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </p>
      <p>
        <label htmlFor="city">City</label>
        <select
          id="cityDropdown"
          name="selectedCity"
          onChange={(event) => handleChange("city", event.target.value)}
          required
        >
          <option value="">Please select an option</option>
          {city_population
            .filter((row) => row.state === selectedLocation.state)
            .map((row) => (
              <option key={row.cityID} value={row.city}>
                {row.city}
              </option>
            ))}
        </select>
      </p>
      <p>
        <label htmlFor="population">Population</label>
        <input
          id="population"
          type="number"
          name="updatedPopulation"
          min={1}
          defaultValue={populationDefault}
          required
        />
      </p>
      <div className={classes.actions}>
        <button type="button" onClick={() => navigate("..")}>
          Cancel
        </button>
        <button>Save</button>
      </div>
    </Form>
  );
}

export async function action({ request }) {
  const formData = await request.formData();

  const cityData = {
    city: formData.get("selectedCity"),
    state: formData.get("selectedState"),
    population: formData.get("updatedPopulation"),
  };

  const response = await fetch("http://127.0.0.1:5000/city-population", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cityData),
  });

  if (!response.ok) {
    alert("Something went wrong. Try again!");
    return;
  }

  return redirect("/city-population");
}
