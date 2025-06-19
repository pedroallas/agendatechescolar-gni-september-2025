/*
  Warnings:

  - You are about to drop the column `performedAt` on the `MaintenanceRecord` table. All the data in the column will be lost.
  - Added the required column `priority` to the `MaintenanceRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MaintenanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaintenanceRecord" DROP COLUMN "performedAt",
ADD COLUMN     "actualCost" DOUBLE PRECISION,
ADD COLUMN     "estimatedCost" DOUBLE PRECISION,
ADD COLUMN     "priority" TEXT NOT NULL,
ADD COLUMN     "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "solution" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MaintenanceRecord_userId_idx" ON "MaintenanceRecord"("userId");

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
