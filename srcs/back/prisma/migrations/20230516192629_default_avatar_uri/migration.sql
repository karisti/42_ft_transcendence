/*
  Warnings:

  - Made the column `avatarUri` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatarUri" SET NOT NULL,
ALTER COLUMN "avatarUri" SET DEFAULT 'default.jpg';
