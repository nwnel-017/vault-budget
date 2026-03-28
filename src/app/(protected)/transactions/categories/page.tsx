import db from "../../../../lib/prisma";
import CategoryGrid from "./_components/CategoryGrid";
import styles from "./page.module.css";

export default async function ReviewTransactions() {
  const categories = await db.category.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <section className={styles.page}>
      <CategoryGrid categories={categories} />
    </section>
  );
}
