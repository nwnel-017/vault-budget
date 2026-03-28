export function formatFunds(funds: number) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(funds) ?? 0
  );
}

export function formatTransaction(amount: string) {
  try {
    const parsedAmount = Number(String(amount ?? "").trim().replace(/[^0-9.-]/g, ""));

    if (!Number.isFinite(parsedAmount)) {
      return 0;
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parsedAmount);
  } catch {
    return 0;
  }
}
