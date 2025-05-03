CREATE TABLE "public"."access_tokens"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "lookup" text UNIQUE NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "public"."access_tokens"
  ADD CONSTRAINT "access_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT valid;

CREATE INDEX "idx_access_tokens_lookup" ON "public"."access_tokens"("lookup");
