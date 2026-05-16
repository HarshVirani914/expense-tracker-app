"use server";

import { requireCurrentUser } from "@/lib/auth";
import { analyzeBulkImportFile } from "@/lib/ai/bulk-import-parser";
import { prisma } from "@/lib/prisma";

export const createBulkImportSession = async (
  fileContent: string,
  fileName: string,
  fileType: "csv" | "xlsx" | "pdf" | "text"
) => {
  const user = await requireCurrentUser();

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { isDefault: true }] },
  });

  const extractedData = await analyzeBulkImportFile(
    fileContent,
    fileType,
    categories.map(c => c.name)
  );

  const session = await prisma.bulkImportSession.create({
    data: {
      userId: user.id,
      fileName,
      fileType,
      mappedData: extractedData,
      status: "reviewing",
    },
  });

  return { sessionId: session.id, data: extractedData };
};

export const confirmBulkImport = async (sessionId: string, expenses: any[]) => {
  const user = await requireCurrentUser();

  const session = await prisma.bulkImportSession.findUnique({ where: { id: sessionId } });

  if (!session || session.userId !== user.id) {
    throw new Error("Invalid session");
  }

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { isDefault: true }] },
  });

  let imported = 0;
  let errors = 0;

  for (const exp of expenses) {
    try {
      const category = categories.find(c => 
        c.name.toLowerCase() === exp.category.toLowerCase()
      );

      await prisma.expense.create({
        data: {
          amount: exp.amount,
          description: exp.description,
          type: exp.type,
          date: new Date(exp.date),
          userId: user.id,
          categoryId: category?.id || categories.find(c => c.name === "Other")!.id,
        },
      });
      imported++;
    } catch {
      errors++;
    }
  }

  await prisma.bulkImportSession.update({
    where: { id: sessionId },
    data: { status: "completed", importedCount: imported, errorCount: errors },
  });

  return { imported, errors };
};
