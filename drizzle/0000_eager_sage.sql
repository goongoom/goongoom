CREATE SCHEMA "goongoom";
--> statement-breakpoint
CREATE TABLE "goongoom"."answers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "goongoom"."answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goongoom"."questions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "goongoom"."questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"recipient_clerk_id" text NOT NULL,
	"sender_clerk_id" text,
	"content" text NOT NULL,
	"is_anonymous" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goongoom"."users" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"social_links" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "answers_question_id_idx" ON "goongoom"."answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "questions_recipient_clerk_id_idx" ON "goongoom"."questions" USING btree ("recipient_clerk_id");