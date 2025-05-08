"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu as MenuIcon } from "lucide-react";

type NavbarProps = {
  user: User | null;
};

const navLinks = [
  { href: "/outputs", label: "Outputs" },
  { href: "/tokens", label: "Tokens" },
];

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">DadMCP</h1>
        </Link>

        {/* Desktop Nav */}
        <NavigationMenu className="hidden flex-1 justify-center md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side (GitHub, Auth) */}
        <div className="hidden items-center gap-4 md:flex">
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

        {/* Mobile Nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b px-4 py-4">
                  <Link href="/" className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-900">DadMCP</h1>
                  </Link>
                </div>
                <nav className="flex flex-col gap-1 px-4 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2 border-t px-4 py-4">
                  <Link
                    href="https://github.com/andyrewlee/dad-mcp"
                    target="_blank"
                    className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <Image
                      src="/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="inline-block"
                    />
                    <span>GitHub</span>
                  </Link>
                  {user ? (
                    <LogoutButton />
                  ) : (
                    <Link href="/auth/login" passHref>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
