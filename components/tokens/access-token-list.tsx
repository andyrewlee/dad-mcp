"use client";

import { useTransition } from "react";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AccessToken = Database["public"]["Tables"]["access_tokens"]["Row"];

// Helper function to format the token display
const formatTokenDisplay = (lookup: string | null | undefined): string => {
  if (!lookup || lookup.length < 8) {
    // Handle cases where lookup is null, undefined, or too short
    return "dmp_****...****";
  }
  const start = lookup.substring(0, 4);
  const end = lookup.substring(lookup.length - 4);
  return `dmp_${start}********************************${end}`;
};

interface AccessTokenListProps {
  tokens: AccessToken[];
  deleteAccessTokenAction: (
    tokenId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function AccessTokenList({
  tokens,
  deleteAccessTokenAction,
}: AccessTokenListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (tokenId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this token? This action cannot be undone."
      )
    ) {
      startTransition(async () => {
        const result = await deleteAccessTokenAction(tokenId);
        if (!result.success) {
          alert(`Failed to delete token: ${result.error || "Unknown error"}`);
        }
      });
    }
  };

  if (tokens.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You haven&apos;t created any access tokens yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((token) => (
          <TableRow key={token.id}>
            <TableCell className="font-medium">
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                {formatTokenDisplay(token.lookup)}
              </code>
            </TableCell>
            <TableCell>{new Date(token.created_at).toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(token.id)}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
