/*
  Warnings:

  - A unique constraint covering the columns `[userId,friend_userId]` on the table `friends` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "friends_userId_friend_userId_key" ON "friends"("userId", "friend_userId");
