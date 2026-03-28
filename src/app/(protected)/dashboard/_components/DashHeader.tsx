import { formatFunds } from "@/utils/funds";

export default function DashHeader({ totalSpent }: { totalSpent: number }) {
  return (
    <div className="flex-center">
      <h1>Dashboard</h1>
      <div>{`Total spent: ${formatFunds(totalSpent)}`}</div>
    </div>
  );
}
