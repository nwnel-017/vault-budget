"use client";

import { resetUserTransactions } from "../actions";

export default function DeleteTransactions() {
  async function resetTransactions() {
    const res = await resetUserTransactions();

    if (!res.success) {
      alert("Something went wrong!");
      return;
    }
    alert("Success");
  }
  return (
    <div>
      <button onClick={resetTransactions}>
        Remove your stored transactions
      </button>
    </div>
  );
}
