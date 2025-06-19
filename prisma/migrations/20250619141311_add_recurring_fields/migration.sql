-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringPattern" TEXT;
