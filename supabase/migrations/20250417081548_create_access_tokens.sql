create table
  "public"."access_tokens" (
    "id" uuid not null default gen_random_uuid (),
    "user_id" uuid,
    "token" text,
    "created_at" timestamp
    with
      time zone not null default now ()
  );

alter table "public"."access_tokens" enable row level security;

create policy "User can create their own access token" on "public"."access_tokens" as permissive for insert to authenticated
with
  check (
    (
      (
        SELECT
          auth.uid () AS uid
      ) = user_id
    )
  );

create policy "User can delete their own access token" on "public"."access_tokens" as permissive for delete to authenticated using (
  (
    (
      SELECT
        auth.uid () AS uid
    ) = user_id
  )
);

create policy "User can read their own access token" on "public"."access_tokens" as permissive for
select
  to authenticated using (
    (
      (
        SELECT
          auth.uid () AS uid
      ) = user_id
    )
  );

create policy "User can update their own access token" on "public"."access_tokens" as permissive for
update to authenticated using (
  (
    (
      SELECT
        auth.uid () AS uid
    ) = user_id
  )
)
with
  check (
    (
      (
        SELECT
          auth.uid () AS uid
      ) = user_id
    )
  );
