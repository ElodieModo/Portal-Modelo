/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId,enrollmentDate]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "enrollments_studentId_courseId_key";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General';

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_courseId_enrollmentDate_key" ON "enrollments"("studentId", "courseId", "enrollmentDate");
