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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Tokens</h1>
        </div>

        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create New Token
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <CreateAccessTokenForm
              createAccessTokenAction={createAccessToken}
              userId={user.id}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Tokens
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
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
      </div>
    </>
  );
}
