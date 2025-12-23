import { NavLink } from "react-router";

import PAGES from "../utils/pages.js";

import {
  currencyFormatter,
  numberFormatter,
  percentFormatter,
} from "../utils/formatter.js";

const renderCellContent = (field, row, pageid, layer) => {
  if (pageid === "p3" && field === "manufacturer_id") {
    return <NavLink to={`${row[field]}`}>{row[field]}</NavLink>;
  }

  if (pageid === "p10" && layer === null && field === "signup_year") {
    return <NavLink to={`city-level/${row[field]}`}>{row[field]}</NavLink>;
  }

  if (
    pageid === "p10" &&
    layer === "l1" &&
    field === "city" &&
    row["total_stores"] > 1
  ) {
    return <NavLink to={`store-level/${row["city_id"]}`}>{row[field]}</NavLink>;
  }

  if (field.includes("revenue") || field.includes("price")) {
    return currencyFormatter.format(row[field]);
  }

  if (
    field === "population" ||
    field.includes("total") ||
    field.includes("units_sold")
  ) {
    return numberFormatter.format(row[field]);
  }

  if (field === "maximum_discount") {
    return percentFormatter.format(row[field]);
  }

  return row[field];
};

export default function Result({
  pageid,
  data,
  layer = null,
  is_detail = false,
}) {
  const fields = is_detail
    ? PAGES.find((page) => page.id === pageid)?.detail_fields[layer]
    : PAGES.find((page) => page.id === pageid)?.fields;

  return (
    <table id={pageid}>
      <thead>
        <tr>
          {Object.keys(fields).map((field, id) => (
            <th key={id}>{field}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(fields).map((field, colIndex) => {
              let isHighlight = false;

              if (
                pageid === "p10" &&
                layer === "l1" &&
                field === "total_memberships_sold"
              ) {
                isHighlight =
                  row[field] >= 250
                    ? { backgroundColor: "green" }
                    : row[field] <= 30
                    ? { backgroundColor: "red" }
                    : false;
              }

              return (
                <td
                  key={colIndex}
                  style={isHighlight !== false ? isHighlight : undefined}
                >
                  {renderCellContent(field, row, pageid, layer)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
