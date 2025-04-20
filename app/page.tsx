import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full px-4 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center">
            <h1 className="ml-2 text-xl font-medium text-gray-900">DadMCP</h1>
          </div>
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
        </div>
      </header>
      <div className="mb-14 flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Dad-Powered Learning
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Spark your kid&apos;s creativity with AI-powered education at home
          </p>
        </div>
        <div className="mb-8 w-full">
          <div className="mb-4 flex justify-center">
            <Button className="rounded-md bg-black px-8 py-6 text-lg text-white hover:bg-gray-800">
              <a href="mailto:andrew@founding.so" className="text-white">
                Join the Waitlist
              </a>
            </Button>
          </div>
        </div>
      </div>
      <footer className="w-full border-t border-gray-200 py-6">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm text-gray-500">
            Open source on{" "}
            <a
              href="https://github.com/andyrewlee/dad-mcp"
              target="_blank"
              className="text-blue-500 hover:text-blue-700"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
