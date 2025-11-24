/*
  Warnings:

  - You are about to drop the `Partner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Partner" DROP CONSTRAINT "Partner_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "partner_birth_date" TIMESTAMP(3),
ADD COLUMN     "partner_birth_place" TEXT,
ADD COLUMN     "partner_birth_time" TEXT,
ADD COLUMN     "partner_gender" "Gender",
ADD COLUMN     "partner_name" TEXT,
ADD COLUMN     "relationship_start_date" TIMESTAMP(3);

-- DropTable
DROP TABLE "Partner";
