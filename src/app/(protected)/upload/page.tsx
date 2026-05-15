import db from "../../../lib/general/prisma";
import { requireSession } from "@/lib/auth/auth-helpers";
import FileUpload from "./_components/upload/FileUpload/FileUpload";
import type { FieldMap } from "@/types/upload";

function normalizeColumnList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((column): column is string => typeof column === "string")
    : [];
}

export default async function UploadPage() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (!userId || sessionResult.error) {
    return null;
  }

  const savedFieldMap = await db.userColumnMappings.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      mode: true,
      amount: true,
      positiveColumns: true,
      negativeColumns: true,
      date_purchased: true,
      merchant: true,
    },
  });

  const fieldMap: FieldMap | null = savedFieldMap
    ? {
        mode: savedFieldMap.mode,
        amount: savedFieldMap.amount,
        positiveColumns: normalizeColumnList(savedFieldMap.positiveColumns),
        negativeColumns: normalizeColumnList(savedFieldMap.negativeColumns),
        date_purchased: savedFieldMap.date_purchased,
        merchant: savedFieldMap.merchant,
      }
    : null;

  return <FileUpload fieldMap={fieldMap} />;
}
