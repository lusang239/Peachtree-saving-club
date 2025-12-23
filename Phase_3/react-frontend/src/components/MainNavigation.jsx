import { Link } from "react-router";

import classes from "./Navigation.module.css";
import PAGES from "../utils/pages.js";

export default function MainNavigation() {
  return (
    <ul className={classes.ul}>
      {PAGES.map((page) => (
        <li key={page.id} className={classes.list}>
          <Link to={page.path}>{page.title}</Link>
        </li>
      ))}
    </ul>
  );
}
