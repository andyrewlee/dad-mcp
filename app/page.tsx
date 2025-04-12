import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <header className="w-full py-6 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-medium text-gray-900 ml-2">DadMCP</h1>
          </div>
          <Link
            href="https://github.com/andyrewlee/dad-mcp"
            target="_blank"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Image src="/github.svg" alt="GitHub" width={24} height={24} className="inline-block" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </header>
      <div className="flex-1 w-full max-w-3xl px-4 py-12 flex flex-col items-center justify-center mb-14">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Dad-Powered Learning</h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Spark your kid&apos;s creativity with AI-powered education at home
          </p>
        </div>
        <div className="w-full mb-8">
          <div className="flex justify-center mb-4">
            <Button
              className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-md"
            >
              <a href="mailto:andrew@founding.so" className="text-white">Join the Waitlist</a>
            </Button>
          </div>
        </div>
      </div>
      <footer className="w-full py-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">Open source on <a href="https://github.com/andyrewlee/dad-mcp" target="_blank" className="text-blue-500 hover:text-blue-700">GitHub</a></p>
        </div>
      </footer>
    </main>
  );
} 
