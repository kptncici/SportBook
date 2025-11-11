/*
  Warnings:

  - The values [ONLINE] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('MIDTRANS', 'CASH');
ALTER TABLE "public"."Booking" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "Booking" ALTER COLUMN "paymentMethod" SET DEFAULT 'MIDTRANS';
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "paymentMethod" SET DEFAULT 'MIDTRANS';
