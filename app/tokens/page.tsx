import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AccessTokenList from "@/components/tokens/access-token-list";
import CreateAccessTokenForm from "@/components/tokens/create-access-token-form";
import Navbar from "@/components/Navbar";

import {
  getAccessTokens,
  createAccessToken,
  deleteAccessToken,
} from "./actions";

export default async function TokensPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tokens = await getAccessTokens(user.id);

  return (
    <>
      <Navbar user={user} />
      <div className="mx-auto max-w-3xl py-10">
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Create New Token</h2>
          <CreateAccessTokenForm
            createAccessTokenAction={createAccessToken}
            userId={user.id}
          />
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Your Tokens</h2>
          {tokens.length > 0 ? (
            <AccessTokenList
              tokens={tokens}
              deleteAccessTokenAction={deleteAccessToken}
            />
          ) : (
            <p className="text-gray-500">
              You haven&apos;t created any access tokens yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
