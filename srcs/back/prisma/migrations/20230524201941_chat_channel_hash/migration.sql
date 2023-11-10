/*
  Warnings:

  - You are about to drop the column `password` on the `chatchannels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chatchannels" DROP COLUMN "password",
ADD COLUMN     "hash" TEXT;
