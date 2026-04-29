import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import CategoryGoals from "./_components/CategoryGoals";
import SpendingGoal from "./_components/SpendingGoal";
import styles from "./page.module.css";

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
      goal: true,
    },
    orderBy: {
      category_name: "asc",
    },
  });

  const categoryGoals = categories.map((category) => {
    return {
      id: category.id,
      category_name: category.category_name,
      spending_goal: category.goal?.amount.toString() ?? null,
    };
  });

  const savingsGoal = await db.savingsGoal.findFirst({
    where: {
      user_id: userId,
    },
    select: {
      amount: true,
    },
  });

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <SpendingGoal currentGoal={savingsGoal?.amount.toString() ?? null} />
        <CategoryGoals categories={categoryGoals} />
      </section>
    </div>
  );
}
