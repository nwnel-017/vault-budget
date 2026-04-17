"use client";

import { useState } from "react";

export default function IncomeSelect({
  onSelectPayPeriod,
}: {
  onSelectPayPeriod: (periodBegin: string) => Promise<void>;
}) {
  const [periodBegin, setPeriodBegin] = useState("");
  const dayOptions = Array.from({ length: 31 }, (_, index) => `${index + 1}`);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!periodBegin) {
      alert("Please select a day.");
      return;
    }

    await onSelectPayPeriod(periodBegin);
  }

  return (
    <div>
      <h1>
        Select the day of the month when you usually get your first paycheck:
      </h1>
      <h2>
        This data will be used to calculate accurate pay period for you. You can
        change any time.
      </h2>
      <form onSubmit={submit}>
        <label htmlFor="pay-period-day">Day of the month</label>
        <select
          id="pay-period-day"
          value={periodBegin}
          onChange={(event) => setPeriodBegin(event.target.value)}
          required
        >
          <option value="">Select a day</option>
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <button className="btn" type="submit">
          Save Pay Period
        </button>
      </form>
    </div>
  );
}
