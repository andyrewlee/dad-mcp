"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/logout-button";

type NavbarProps = {
  user: User | null;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="w-full border-b border-gray-200 px-4 py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-medium text-gray-900">DadMCP</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com/andyrewlee/dad-mcp"
            target="_blank"
            className="text-gray-600 transition-colors hover:text-gray-900"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={24}
              height={24}
              className="inline-block"
            />
            <span className="sr-only">GitHub</span>
          </Link>
          {user ? (
            <LogoutButton />
          ) : (
            <Link href="/auth/login" passHref>
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
