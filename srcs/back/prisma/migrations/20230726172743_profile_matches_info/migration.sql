/*
  Warnings:

  - You are about to drop the column `score` on the `gamematches` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `users` table. All the data in the column will be lost.
  - Added the required column `score1` to the `gamematches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score2` to the `gamematches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gamematches" DROP COLUMN "score",
ADD COLUMN     "score1" INTEGER NOT NULL,
ADD COLUMN     "score2" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "rank",
DROP COLUMN "score";
