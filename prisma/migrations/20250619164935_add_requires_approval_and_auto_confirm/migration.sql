-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'confirmed';

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false;
