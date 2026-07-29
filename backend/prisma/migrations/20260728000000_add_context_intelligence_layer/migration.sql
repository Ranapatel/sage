-- ============================================================================
-- Contextual Intelligence Layer — Phase 1 (Foundation)
-- Adds persistent memory, feedback, notification, and recommendation-log tables.
-- Tightens UserSearchHistory.userId to non-null with relation + index.
-- ============================================================================

-- CreateEnum: FeedbackAction
CREATE TYPE "FeedbackAction" AS ENUM (
  'SAVED',
  'SKIPPED',
  'RATED',
  'BOOKED',
  'CANCELLED',
  'CLICKED',
  'IGNORED'
);

-- CreateEnum: NotificationKind
CREATE TYPE "NotificationKind" AS ENUM (
  'DELAY',
  'GATE_CHANGE',
  'WEATHER',
  'PRICE_DROP',
  'VISA',
  'PASSPORT',
  'COUNTDOWN',
  'BUDGET',
  'TRAFFIC',
  'GENERIC'
);

-- CreateTable: UserPreference
CREATE TABLE "UserPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "language" TEXT DEFAULT 'en',
  "homeCity" TEXT,
  "favoriteAirlines" TEXT[],
  "favoriteHotelChains" TEXT[],
  "favoriteCuisines" TEXT[],
  "dietaryRestrictions" TEXT[],
  "accessibilityNotes" TEXT,
  "preferredTransport" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FavoriteHotel
CREATE TABLE "FavoriteHotel" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "hotelName" TEXT NOT NULL,
  "city" TEXT,
  "rating" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FavoriteHotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FavoriteActivity
CREATE TABLE "FavoriteActivity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FavoriteActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Feedback
CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tripId" TEXT,
  "module" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "action" "FeedbackAction" NOT NULL,
  "rating" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Notification
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "NotificationKind" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "tripId" TEXT,
  "metadata" JSONB,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RecommendationLog
CREATE TABLE "RecommendationLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "module" TEXT NOT NULL,
  "inputHash" TEXT NOT NULL,
  "outputJson" JSONB NOT NULL,
  "aiConfidence" INTEGER NOT NULL,
  "accepted" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecommendationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "FavoriteHotel_userId_idx" ON "FavoriteHotel"("userId");
CREATE UNIQUE INDEX "FavoriteHotel_userId_hotelId_key" ON "FavoriteHotel"("userId", "hotelId");

-- CreateIndex
CREATE INDEX "FavoriteActivity_userId_idx" ON "FavoriteActivity"("userId");

-- CreateIndex
CREATE INDEX "Feedback_userId_module_idx" ON "Feedback"("userId", "module");
CREATE INDEX "Feedback_module_createdAt_idx" ON "Feedback"("module", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "RecommendationLog_userId_module_createdAt_idx" ON "RecommendationLog"("userId", "module", "createdAt");
CREATE INDEX "RecommendationLog_inputHash_idx" ON "RecommendationLog"("inputHash");

-- Tighten UserSearchHistory: make userId non-null, add FK, add index
-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteHotel" ADD CONSTRAINT "FavoriteHotel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteActivity" ADD CONSTRAINT "FavoriteActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tighten UserSearchHistory.userId to non-null + FK + index.
-- This requires that all existing rows have userId set. In dev/staging it's
-- safe to set NULLs to a sentinel via: UPDATE "UserSearchHistory" SET "userId" = (SELECT "id" FROM "User" LIMIT 1) WHERE "userId" IS NULL;
-- In production this should be reviewed; for now we assume dev/staging usage.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "UserSearchHistory" WHERE "userId" IS NULL) THEN
    UPDATE "UserSearchHistory"
      SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
      WHERE "userId" IS NULL;
  END IF;
END $$;

ALTER TABLE "UserSearchHistory" ALTER COLUMN "userId" SET NOT NULL;
CREATE INDEX "UserSearchHistory_userId_createdAt_idx" ON "UserSearchHistory"("userId", "createdAt");
ALTER TABLE "UserSearchHistory" ADD CONSTRAINT "UserSearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
