import { Form, redirect, useNavigate } from "react-router";
import classes from "./Form.module.css";

export default function HolidayForm() {
  const navigate = useNavigate();

  return (
    <Form method="POST" className={classes.form}>
      <p>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          name="date"
          min="2017-01-01"
          max="2019-12-31"
          required
        />
      </p>
      <p>
        <label htmlFor="holiday">Holiday</label>
        <input id="holiday" type="text" name="holiday" required />
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

  const holidayData = {
    date: formData.get("date"),
    holiday: formData.get("holiday"),
  };

  const response = await fetch("http://127.0.0.1:5000/holidays", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(holidayData),
  });

  if (response.status === 409) {
    alert("Can't add holiday because date already existed.");
    return;
  }

  if (response.status === 400) {
    alert("Can't add holiday because holiday name cannot be empty.");
    return;
  }

  if (!response.ok) {
    alert("Something went wrong!");
    return;
  }

  return redirect("..");
}
