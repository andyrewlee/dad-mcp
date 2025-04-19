'use client'

import { useTransition } from 'react';
import type { Database } from '@/lib/database.types';

type AccessToken = Database['public']['Tables']['access_tokens']['Row'];

interface AccessTokenListProps {
  tokens: AccessToken[];
  deleteAccessTokenAction: (tokenId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AccessTokenList({ tokens, deleteAccessTokenAction }: AccessTokenListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (tokenId: string) => {
    if (confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deleteAccessTokenAction(tokenId);
        if (!result.success) {
          alert(`Failed to delete token: ${result.error || 'Unknown error'}`);
        }
      });
    }
  };

  return (
    <ul className="space-y-3">
      {tokens.map((token) => (
        <li key={token.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg bg-gray-50">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm font-medium text-gray-800">Token ID: <code className="text-xs bg-gray-200 px-1 rounded">{token.id}</code></p>
            <p className="text-xs text-gray-500">
              Created: {new Date(token.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => handleDelete(token.id)}
            disabled={isPending}
            className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  );
} 
