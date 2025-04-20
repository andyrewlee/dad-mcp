"use client";

import { useState, useTransition } from "react";

interface CreateAccessTokenFormProps {
  createAccessTokenAction: (
    userId: string
  ) => Promise<{ success: boolean; newToken?: string; error?: string }>;
  userId: string;
}

export default function CreateAccessTokenForm({
  createAccessTokenAction,
  userId,
}: CreateAccessTokenFormProps) {
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
        setError(result.error || "An unexpected error occurred.");
      }
    });
  };

  const handleCopy = () => {
    if (newToken) {
      navigator.clipboard
        .writeText(newToken)
        .then(() => {
          // Optional: Show a temporary confirmation message
          alert("Token copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy token: ", err);
          alert("Failed to copy token.");
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showToken && newToken && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-2 text-sm font-medium text-green-800">
            New token generated. Please copy it now. You won&apos;t be able to
            see it again.
          </p>
          <div className="flex items-center space-x-2 rounded bg-gray-100 p-2">
            <code className="flex-grow text-sm break-all text-gray-700">
              {newToken}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded bg-blue-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Error: {error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="focus:ring-opacity-75 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Generating..." : "Generate New Token"}
        </button>
      </div>
    </form>
  );
}
