/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionId_key" ON "session"("sessionId");
