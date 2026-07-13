-- AlterTable: Add new fields to TravelPhoto for the Photo Upload System
ALTER TABLE "TravelPhoto" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itineraryDayId" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "originalUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rewardStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "TravelPhoto_tripId_itineraryDayId_idx" ON "TravelPhoto"("tripId", "itineraryDayId");

-- CreateIndex
CREATE INDEX "TravelPhoto_userId_idx" ON "TravelPhoto"("userId");

-- AddForeignKey
ALTER TABLE "TravelPhoto" ADD CONSTRAINT "TravelPhoto_itineraryDayId_fkey" FOREIGN KEY ("itineraryDayId") REFERENCES "ItineraryDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
