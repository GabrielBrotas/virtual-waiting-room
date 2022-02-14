/*
  Warnings:

  - You are about to drop the column `tickets` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "tickets";

-- AlterTable
ALTER TABLE "TicketBuyer" ADD COLUMN     "sessionId" INTEGER;

-- AddForeignKey
ALTER TABLE "TicketBuyer" ADD CONSTRAINT "TicketBuyer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
