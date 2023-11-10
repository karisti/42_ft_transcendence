/*
  Warnings:

  - You are about to drop the `gamelobbies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "gamelobbies" DROP CONSTRAINT "gamelobbies_userId_fkey";

-- DropTable
DROP TABLE "gamelobbies";
