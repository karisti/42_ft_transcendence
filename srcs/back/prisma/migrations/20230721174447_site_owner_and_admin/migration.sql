-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isSiteAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSiteOwner" BOOLEAN NOT NULL DEFAULT false;
