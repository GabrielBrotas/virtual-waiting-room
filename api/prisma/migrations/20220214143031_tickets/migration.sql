-- CreateTable
CREATE TABLE "TicketBuyer" (
    "id" SERIAL NOT NULL,
    "buyer_id" INTEGER NOT NULL,

    CONSTRAINT "TicketBuyer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketBuyer" ADD CONSTRAINT "TicketBuyer_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
