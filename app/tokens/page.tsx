import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AccessTokenList from '@/components/tokens/access-token-list';
import CreateAccessTokenForm from '@/components/tokens/create-access-token-form';
import { getAccessTokens, createAccessToken, deleteAccessToken } from './actions';

export default async function TokensPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const tokens = await getAccessTokens(user.id);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Manage Access Tokens</h1>

      <div className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Create New Token</h2>
        <CreateAccessTokenForm createAccessTokenAction={createAccessToken} userId={user.id} />
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Your Tokens</h2>
        {tokens.length > 0 ? (
          <AccessTokenList tokens={tokens} deleteAccessTokenAction={deleteAccessToken} />
        ) : (
          <p className="text-gray-500">You haven&apos;t created any access tokens yet.</p>
        )}
      </div>
    </div>
  );
} 
