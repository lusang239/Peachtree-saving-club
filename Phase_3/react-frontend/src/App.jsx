import { createBrowserRouter, RouterProvider } from "react-router";

// Root
import RootLayout from "./pages/Root.jsx";
import HolidayRoot from "./pages/HolidayRoot.jsx";
import CityRoot from "./pages/CityRoot.jsx";
import ManufacturerRoot from "./pages/ManufacturerRoot.jsx";
import MembershipRoot from "./pages/MembershipRoot.jsx";

// Pages
import HomePage, { loader as homeLoader } from "./pages/HomePage.jsx";
import HolidayPage, { loader as holidayLoader } from "./pages/HolidayPage.jsx";
import CityPage, { loader as cityPopulationLoader } from "./pages/CityPage.jsx";
import ManufacturerReportPage, {
  loader as manufacturerLoader,
} from "./pages/ManufacturerReportPage.jsx";
import ManufacturerDetailPage, {
  loader as ManufacturerDetailLoader,
} from "./pages/ManufacturerDetailPage.jsx";
import CategoryReportPage, {
  loader as categoryLoader,
} from "./pages/CategoryReportPage.jsx";
import SpeakerRevenueComparePage, {
  loader as speakerRevenueCompareLoader,
} from "./pages/SpeakerRevenueComparePage.jsx";
import StoreRevenueByStatePage, {
  loader as storeRevenueLoader,
} from "./pages/StoreRevenueByStatePage.jsx";
import GroundhogDayACPage, {
  loader as groundhogACsalesLoader,
} from "./pages/GroundhogDayACPage.jsx";
import CategoryTopStatePage, {
  loader as categoryTopStateLoader,
} from "./pages/CategoryTopStatePage.jsx";
import RevenuePerPopulationPage, {
  loader as revPerPopuLoader,
} from "./pages/RevenuePerPopulationPage.jsx";
import MembershipTrendPage, {
  loader as membershipLoader,
} from "./pages/MembershipTrendPage.jsx";
import MembershipCityLevelPage, {
  loader as cityLevelLoader,
} from "./pages/MembershipCityLevelPage.jsx";
import MembershipStoreLevelPage, {
  loader as storeLevelLoader,
} from "./pages/MembershipStoreLevelPage.jsx";

// Forms
import HolidayForm, {
  action as addHolidayAction,
} from "./components/HolidayForm.jsx";
import CityForm, {
  action as updatePopulationAction,
} from "./components/CityForm.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage />, loader: homeLoader },
      {
        path: "holidays",
        element: <HolidayRoot />,
        children: [
          { index: true, element: <HolidayPage />, loader: holidayLoader },
          { path: "new", element: <HolidayForm />, action: addHolidayAction },
        ],
      },
      {
        path: "city-population",
        element: <CityRoot />,
        id: "city-population",
        loader: cityPopulationLoader,
        children: [
          { index: true, element: <CityPage /> },
          {
            path: "update",
            element: <CityForm />,
            action: updatePopulationAction,
          },
        ],
      },
      {
        path: "manufacturer-product-report",
        element: <ManufacturerRoot />,
        children: [
          {
            index: true,
            element: <ManufacturerReportPage />,
            loader: manufacturerLoader,
          },
          {
            path: ":mid",
            element: <ManufacturerDetailPage />,
            loader: ManufacturerDetailLoader,
          },
        ],
      },
      {
        path: "category-report",
        element: <CategoryReportPage />,
        loader: categoryLoader,
      },
      {
        path: "speaker-revenue-comparison",
        element: <SpeakerRevenueComparePage />,
        loader: speakerRevenueCompareLoader,
      },
      {
        path: "store-revenue-by-year-by-state",
        element: <StoreRevenueByStatePage />,
        loader: storeRevenueLoader,
      },
      {
        path: "groundhog-day-ac",
        element: <GroundhogDayACPage />,
        loader: groundhogACsalesLoader,
      },
      {
        path: "category-top-state",
        element: <CategoryTopStatePage />,
        loader: categoryTopStateLoader,
      },
      {
        path: "revenue-per-population",
        element: <RevenuePerPopulationPage />,
        loader: revPerPopuLoader,
      },
      {
        path: "membership-trend",
        element: <MembershipRoot />,
        children: [
          {
            index: true,
            element: <MembershipTrendPage />,
            loader: membershipLoader,
          },
          {
            path: "city-level/:year",
            element: <MembershipRoot />,
            children: [
              {
                index: true,
                element: <MembershipCityLevelPage />,
                loader: cityLevelLoader,
              },
              {
                path: "store-level/:cityid",
                element: <MembershipStoreLevelPage />,
                loader: storeLevelLoader,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
