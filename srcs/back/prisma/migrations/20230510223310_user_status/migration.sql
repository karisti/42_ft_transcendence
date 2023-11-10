-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('online', 'offline', 'playing');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'offline';
