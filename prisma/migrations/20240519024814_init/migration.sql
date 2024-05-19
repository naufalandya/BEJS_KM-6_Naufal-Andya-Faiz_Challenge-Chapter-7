-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "bio" TEXT,
    "country" TEXT,
    "age" INTEGER,
    "isPublic" BOOLEAN DEFAULT false,
    "isVerified" BOOLEAN DEFAULT false,
    "profileLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "verificationToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
