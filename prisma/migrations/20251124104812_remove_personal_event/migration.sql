/*
  Warnings:

  - You are about to drop the `PersonalEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonalEvent" DROP CONSTRAINT "PersonalEvent_user_id_fkey";

-- DropTable
DROP TABLE "PersonalEvent";
