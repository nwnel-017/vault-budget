import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helpers";
import db from "../../../../lib/prisma";
import CategoryGrid from "./_components/CategoryGrid";
import styles from "./page.module.css";

export default async function ReviewTransactions() {
  // make sure only the current user's categories are shown
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const categories = await db.category.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <div className="page">
      <section className={styles.page}>
        <CategoryGrid categories={categories} />
      </section>
    </div>
  );
}
