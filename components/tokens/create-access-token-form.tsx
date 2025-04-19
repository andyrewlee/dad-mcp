'use client'

import { useState, useTransition } from 'react';

interface CreateAccessTokenFormProps {
  createAccessTokenAction: (userId: string) => Promise<{ success: boolean; newToken?: string; error?: string }>;
  userId: string;
}

export default function CreateAccessTokenForm({ createAccessTokenAction, userId }: CreateAccessTokenFormProps) {
  const [isPending, startTransition] = useTransition();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNewToken(null);
    setShowToken(false);

    startTransition(async () => {
      const result = await createAccessTokenAction(userId);
      if (result.success && result.newToken) {
        setNewToken(result.newToken);
        setShowToken(true); // Show the token immediately after creation
      } else {
        setError(result.error || 'An unexpected error occurred.');
      }
    });
  };

  const handleCopy = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken)
        .then(() => {
          // Optional: Show a temporary confirmation message
          alert('Token copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy token: ', err);
          alert('Failed to copy token.');
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showToken && newToken && (
        <div className="p-4 border rounded-lg bg-green-50 border-green-200">
          <p className="text-sm font-medium text-green-800 mb-2">
            New token generated. Please copy it now. You won&apos;t be able to see it again.
          </p>
          <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
            <code className="text-sm text-gray-700 break-all flex-grow">{newToken}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 border rounded-lg bg-red-50 border-red-200">
          <p className="text-sm font-medium text-red-800">Error: {error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Generating...' : 'Generate New Token'}
        </button>
      </div>
    </form>
  );
} 