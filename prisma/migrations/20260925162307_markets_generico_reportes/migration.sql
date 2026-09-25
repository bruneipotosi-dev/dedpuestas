-- DropForeignKey
ALTER TABLE "markets" DROP CONSTRAINT "markets_player_id_fkey";

-- AlterTable
ALTER TABLE "markets" ALTER COLUMN "player_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "clip_url" TEXT NOT NULL,
    "note" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_player_id_idx" ON "reports"("player_id");

-- CreateIndex
CREATE INDEX "reports_reviewed_idx" ON "reports"("reviewed");

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
