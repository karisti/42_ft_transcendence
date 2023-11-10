-- CreateTable
CREATE TABLE "gamelobbies" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "gamelobbies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamematches" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "hasEnded" BOOLEAN NOT NULL DEFAULT false,
    "winnerUserId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "gamematches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gamelobbies" ADD CONSTRAINT "gamelobbies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamematches" ADD CONSTRAINT "gamematches_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamematches" ADD CONSTRAINT "gamematches_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamematches" ADD CONSTRAINT "gamematches_winnerUserId_fkey" FOREIGN KEY ("winnerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
