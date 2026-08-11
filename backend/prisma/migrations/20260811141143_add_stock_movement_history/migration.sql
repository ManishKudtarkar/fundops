-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('SALES_CHALLAN', 'MANUAL', 'ADJUSTMENT');

-- AlterEnum
ALTER TYPE "StockMovementType" ADD VALUE 'ADJUSTMENT';

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "newStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "previousStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "referenceType" "ReferenceType" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "Challan_status_idx" ON "Challan"("status");

-- CreateIndex
CREATE INDEX "Challan_customerId_idx" ON "Challan"("customerId");

-- CreateIndex
CREATE INDEX "Challan_createdAt_idx" ON "Challan"("createdAt");

-- CreateIndex
CREATE INDEX "Challan_challanNumber_idx" ON "Challan"("challanNumber");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_followUpDate_idx" ON "Customer"("followUpDate");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_movementType_idx" ON "StockMovement"("movementType");

-- CreateIndex
CREATE INDEX "StockMovement_referenceId_idx" ON "StockMovement"("referenceId");
