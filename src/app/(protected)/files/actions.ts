"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";

// Reviewed
export async function deleteFile(fileUploadId: string) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    return {
      success: false,
      error: sessionResult.error ?? "Unauthorized",
    };
  }

  const validatedFileUploadId = String(fileUploadId ?? "").trim();

  if (!validatedFileUploadId) {
    return {
      success: false,
      error: "File id is required.",
    };
  }

  try {
    const fileUpload = await db.userFileUpload.findFirst({
      where: {
        id: validatedFileUploadId,
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!fileUpload) {
      return {
        success: false,
        error: "File not found.",
      };
    }

    await db.$transaction(async (tx) => {
      // Delete transactions first so the upload row can be removed cleanly.
      await tx.transaction.deleteMany({
        where: {
          file_upload_id: validatedFileUploadId,
          user_id: userId,
        },
      });

      await tx.userFileUpload.delete({
        where: {
          id: validatedFileUploadId,
        },
      });
    });

    revalidatePath("/files");
    revalidatePath("/transactions/review");
    revalidatePath("/dashboard");

    return {
      success: true,
      error: null,
    };
  } catch {
    return {
      success: false,
      error: "Unable to delete file.",
    };
  }
}
