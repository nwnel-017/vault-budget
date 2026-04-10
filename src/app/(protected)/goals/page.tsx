import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import CategoryGoals from "./_components/CategoryGoals";

// TO DO - review logic and improve
export default async function SavingsGoals() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (!userId) {
    redirect("/login");
  }

  const categories = await db.category.findMany({
    where: {
      user_id: userId,
    },
    include: {
      goals: {
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      category_name: "asc",
    },
  });

  const categoryGoals = categories.map((category) => {
    return {
      id: category.id,
      category_name: category.category_name,
      spending_goal: category.goals[0]?.amount.toString() ?? null,
    };
  });

  return (
    <div className="page">
      <CategoryGoals categories={categoryGoals} />
    </div>
  );
}
