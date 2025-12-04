/*
  Warnings:

  - You are about to drop the column `astrology_today` on the `UsageStats` table. All the data in the column will be lost.
  - You are about to drop the column `fortune_today` on the `UsageStats` table. All the data in the column will be lost.
  - You are about to drop the column `tarot_readings_today` on the `UsageStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UsageStats" DROP COLUMN "astrology_today",
DROP COLUMN "fortune_today",
DROP COLUMN "tarot_readings_today",
ADD COLUMN     "astrology_love_today" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "astrology_overview_today" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "horoscope_daily_today" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tarot_overview_today" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tarot_question_today" INTEGER NOT NULL DEFAULT 0;
