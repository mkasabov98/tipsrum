DROP INDEX "telegram_links_user_id_idx";--> statement-breakpoint
ALTER TABLE "telegram_links" ADD COLUMN "telegram_username" text;--> statement-breakpoint
ALTER TABLE "telegram_links" ADD COLUMN "start_token" text;--> statement-breakpoint
ALTER TABLE "telegram_links" ADD COLUMN "start_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "telegram_links" ADD COLUMN "invite_link" text;--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_links_user_id_idx" ON "telegram_links" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "telegram_links" ADD CONSTRAINT "telegram_links_start_token_unique" UNIQUE("start_token");