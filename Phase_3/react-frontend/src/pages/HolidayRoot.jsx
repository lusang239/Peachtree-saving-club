import { Outlet } from "react-router";

import PageContent from "../components/PageContent.jsx";

export default function HolidayRoot() {
  return (
    <>
      <PageContent title="View/Add Holiday" />
      <Outlet />
    </>
  );
}
