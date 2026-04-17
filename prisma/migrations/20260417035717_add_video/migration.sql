-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT true,
    "r2Key" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_r2Key_key" ON "Video"("r2Key");
