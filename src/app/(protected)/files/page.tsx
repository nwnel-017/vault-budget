import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";
import FilesGrid from "./_components/FilesGrid";
import styles from "./page.module.css";

export default async function FilesPage() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const fileUploads = await db.userFileUpload.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      file_name: true,
      start_date: true,
      end_date: true,
      created_at: true,
    },
  });

  return (
    <div className="page">
      <section className={styles.page}>
        <FilesGrid
          files={fileUploads.map((fileUpload) => ({
            id: fileUpload.id,
            file_name: fileUpload.file_name,
            start_date: fileUpload.start_date.toISOString(),
            end_date: fileUpload.end_date.toISOString(),
            created_at: fileUpload.created_at.toISOString(),
          }))}
        />
      </section>
    </div>
  );
}
