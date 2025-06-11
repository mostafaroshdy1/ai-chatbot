CREATE TABLE "ai_model_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_model_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar,
	"apiKey" varchar,
	CONSTRAINT "ai_model_providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_models_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ProviderId" integer,
	"name" varchar,
	CONSTRAINT "ai_models_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(256),
	"lastName" varchar(256),
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_ProviderId_ai_model_providers_id_fk" FOREIGN KEY ("ProviderId") REFERENCES "public"."ai_model_providers"("id") ON DELETE no action ON UPDATE no action;