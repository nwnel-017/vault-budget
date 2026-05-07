import db from "../../../lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import FileUpload from "./_components/FileUpload";

// Reviewed
export default async function UploadPage() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (!userId || sessionResult.error) {
    return null;
  }

  const fieldMap = await db.userColumnMappings.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      amount: true,
      date_purchased: true,
      merchant: true,
    },
  });

  return <FileUpload fieldMap={fieldMap} />;
}
