import { useLoaderData } from "react-router";

import PageContent from "../components/PageContent.jsx";
import { numberFormatter } from "../utils/formatter.js";

export default function HomePage() {
  const metrics = useLoaderData();

  return (
    <>
      <PageContent title="Peachtree Savings Club" />
      <div>
        <ul>
          <li>
            <p>Store</p>
            <p>{numberFormatter.format(metrics.total_stores)}</p>
          </li>
          <li>
            <p>Manufacturer</p>
            <p>{numberFormatter.format(metrics.total_manufacturers)}</p>
          </li>
          <li>
            <p>Product</p>
            <p>{numberFormatter.format(metrics.total_products)}</p>
          </li>
          <li>
            <p>Membership</p>
            <p>{numberFormatter.format(metrics.total_memberships)}</p>
          </li>
        </ul>
      </div>
    </>
  );
}

export async function loader() {
  const response = await fetch("http://127.0.0.1:5000/metrics");
  const resData = response.json();
  return resData;
}
