import db from "../../../lib/general/prisma";
import { requireSession } from "@/lib/auth/auth-helpers";
import FileUpload from "./_components/FileUpload";

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
