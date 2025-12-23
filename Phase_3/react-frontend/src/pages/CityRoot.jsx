import { Outlet } from "react-router";

import PageContent from "../components/PageContent";

export default function CityRoot() {
  return (
    <>
      <PageContent title="View/Edit City Population" />
      <Outlet />
    </>
  );
}
