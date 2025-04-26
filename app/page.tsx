import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/tokens");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Navbar user={user} />
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
