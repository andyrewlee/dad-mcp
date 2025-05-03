CREATE TABLE "public"."outputs"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "is_public" bool NOT NULL DEFAULT FALSE,
  "source" text NOT NULL,
  "data" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "public"."outputs"
  ADD CONSTRAINT "outputs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT valid;
