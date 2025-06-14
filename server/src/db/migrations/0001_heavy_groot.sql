ALTER TABLE "chat_messages" RENAME COLUMN "AiModelId" TO "aiModelId";--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_AiModelId_ai_models_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "promptTokens" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "completionTokens" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_aiModelId_ai_models_id_fk" FOREIGN KEY ("aiModelId") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;