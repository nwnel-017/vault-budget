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
    const parsedAmount = Number(
      String(amount ?? "")
        .trim()
        .replace(/[^0-9.-]/g, ""),
    );

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

// TO DO - review
export function santizeFunds(value: string): string {
  const normalizedValue = value.normalize("NFKC").replace(/[^\d.]/g, "");

  if (!normalizedValue) {
    return "";
  }

  const [wholePart, ...decimalParts] = normalizedValue.split(".");
  const decimalPart = decimalParts.join("").slice(0, 2);

  if (!wholePart && !decimalPart) {
    return "";
  }

  if (normalizedValue.startsWith(".")) {
    return decimalPart ? `0.${decimalPart}` : "0.";
  }

  return decimalPart ? `${wholePart}.${decimalPart}` : wholePart;
}
