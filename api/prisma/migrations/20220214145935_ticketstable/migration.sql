/*
  Warnings:

  - You are about to drop the `TicketBuyer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketBuyer" DROP CONSTRAINT "TicketBuyer_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "TicketBuyer" DROP CONSTRAINT "TicketBuyer_sessionId_fkey";

-- DropTable
DROP TABLE "TicketBuyer";

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
