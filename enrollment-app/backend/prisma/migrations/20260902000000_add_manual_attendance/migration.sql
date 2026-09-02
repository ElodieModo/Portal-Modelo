-- CreateTable
CREATE TABLE "manual_attendances" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "studentName" TEXT NOT NULL,
    "age" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_attendances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "manual_attendances" ADD CONSTRAINT "manual_attendances_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
