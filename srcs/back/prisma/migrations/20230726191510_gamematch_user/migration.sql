/*
  Warnings:

  - You are about to drop the column `user1Id` on the `gamematches` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `gamematches` table. All the data in the column will be lost.
  - Added the required column `userId1` to the `gamematches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId2` to the `gamematches` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "gamematches" DROP CONSTRAINT "gamematches_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "gamematches" DROP CONSTRAINT "gamematches_user2Id_fkey";

-- AlterTable
ALTER TABLE "gamematches" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "userId1" INTEGER NOT NULL,
ADD COLUMN     "userId2" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "gamematches" ADD CONSTRAINT "gamematches_userId1_fkey" FOREIGN KEY ("userId1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamematches" ADD CONSTRAINT "gamematches_userId2_fkey" FOREIGN KEY ("userId2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
