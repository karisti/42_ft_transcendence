/*
  Warnings:

  - You are about to drop the `ChatChannel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatChannel" DROP CONSTRAINT "ChatChannel_ownerUserId_fkey";

-- DropTable
DROP TABLE "ChatChannel";

-- CreateTable
CREATE TABLE "chatchannels" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerUserId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,

    CONSTRAINT "chatchannels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatchannelusers" (
    "id" SERIAL NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "isMutedUntil" TIMESTAMP(3),

    CONSTRAINT "chatchannelusers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatchannelmessages" (
    "id" SERIAL NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "chatchannelmessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatblockedusers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otherUserId" INTEGER NOT NULL,

    CONSTRAINT "chatblockedusers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatdirects" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId1" INTEGER NOT NULL,
    "userId2" INTEGER NOT NULL,

    CONSTRAINT "chatdirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatdirectmessages" (
    "id" SERIAL NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "directId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "chatdirectmessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatchannels_name_key" ON "chatchannels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chatchannelusers_channelId_userId_key" ON "chatchannelusers"("channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "chatblockedusers_userId_otherUserId_key" ON "chatblockedusers"("userId", "otherUserId");

-- CreateIndex
CREATE UNIQUE INDEX "chatdirects_userId1_userId2_key" ON "chatdirects"("userId1", "userId2");

-- AddForeignKey
ALTER TABLE "chatchannels" ADD CONSTRAINT "chatchannels_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatchannelusers" ADD CONSTRAINT "chatchannelusers_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "chatchannels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatchannelusers" ADD CONSTRAINT "chatchannelusers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatchannelmessages" ADD CONSTRAINT "chatchannelmessages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "chatchannels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatchannelmessages" ADD CONSTRAINT "chatchannelmessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatblockedusers" ADD CONSTRAINT "chatblockedusers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatblockedusers" ADD CONSTRAINT "chatblockedusers_otherUserId_fkey" FOREIGN KEY ("otherUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatdirects" ADD CONSTRAINT "chatdirects_userId1_fkey" FOREIGN KEY ("userId1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatdirects" ADD CONSTRAINT "chatdirects_userId2_fkey" FOREIGN KEY ("userId2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatdirectmessages" ADD CONSTRAINT "chatdirectmessages_directId_fkey" FOREIGN KEY ("directId") REFERENCES "chatdirects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatdirectmessages" ADD CONSTRAINT "chatdirectmessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
