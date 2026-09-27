CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "date" DATE NOT NULL,
    "additionalInfo" VARCHAR(2000) NOT NULL DEFAULT '',
    "completedSteps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Release_date_idx" ON "Release"("date" DESC);
