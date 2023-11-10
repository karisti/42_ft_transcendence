/*
  Warnings:

  - You are about to drop the column `ownerUserId` on the `chatchannels` table. All the data in the column will be lost.
  - You are about to drop the column `isBanned` on the `chatchannelusers` table. All the data in the column will be lost.
  - You are about to drop the column `isMutedUntil` on the `chatchannelusers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chatchannels" DROP CONSTRAINT "chatchannels_ownerUserId_fkey";

-- AlterTable
ALTER TABLE "chatchannels" DROP COLUMN "ownerUserId";

-- AlterTable
ALTER TABLE "chatchannelusers" DROP COLUMN "isBanned",
DROP COLUMN "isMutedUntil",
ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "chatchannelbannedusers" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "isMutedUntil" TIMESTAMP(3),

    CONSTRAINT "chatchannelbannedusers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatchannelbannedusers_channelId_userId_key" ON "chatchannelbannedusers"("channelId", "userId");

-- AddForeignKey
ALTER TABLE "chatchannelbannedusers" ADD CONSTRAINT "chatchannelbannedusers_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "chatchannels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatchannelbannedusers" ADD CONSTRAINT "chatchannelbannedusers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
