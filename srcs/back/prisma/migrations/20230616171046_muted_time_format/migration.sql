/*
  Warnings:

  - The `isMutedUntil` column on the `chatchannelbannedusers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "chatchannelbannedusers" DROP COLUMN "isMutedUntil",
ADD COLUMN     "isMutedUntil" INTEGER;
