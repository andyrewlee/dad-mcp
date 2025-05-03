import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { resolveStorageUrl } from "@/lib/supabase/storage";

interface OutputPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OutputDetailPage({ params }: OutputPageProps) {
  // Use regular client for auth check and storage
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // Await params before accessing properties
  const { id } = await params;

  // Redirect to login if there's an auth error
  if (userError) {
    redirect("/auth/login");
  }

  // If no user data, show an error message instead of redirecting
  if (!userData?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          Authentication error: Unable to get user data. Please try logging in
          again.
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Fetch the output by ID
  const { data: output, error: outputError } = await supabase
    .from("outputs")
    .select("*")
    .eq("id", id)
    .single();

  // Check if output not found or error
  if (outputError || !output) {
    notFound();
  }

  // Check if the user is the owner of the output or if it's public
  if (output.user_id !== userData.user.id && !output.is_public) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          You do not have permission to view this output.
        </div>
        <Link
          href="/outputs"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          Back to Outputs
        </Link>
      </div>
    );
  }

  // Debug info
  // console.log("Output data:", JSON.stringify(output.data, null, 2)); // Keep commented for potential debugging

  // Get the first preview image URL using the shared helper
  // Extract the specific path/URL string from the output data
  const imagePathOrUrl =
    typeof output.data === "object" &&
    output.data !== null &&
    typeof (output.data as any).image === "string"
      ? (output.data as any).image
      : null;

  const previewImageUrl = imagePathOrUrl
    ? await resolveStorageUrl(supabase, output.data.image)
    : null; // If no path found in the expected field

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/outputs"
          className="mb-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Outputs
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{output.source}</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Output Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Source: {output.source}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {output.created_at
                  ? new Date(output.created_at).toString()
                  : "N/A"}
              </dd>
              <dt className="text-sm font-medium text-gray-500">Visibility</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    output.is_public
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {output.is_public ? "Public" : "Private"}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        {/* Display the first found image preview if available */}
        {previewImageUrl && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-md mb-3 font-medium text-gray-700">
                Image Preview
              </h4>
              <img
                src={previewImageUrl}
                alt="Output Image Preview"
                style={{ maxWidth: "500px", maxHeight: "500px" }}
              />
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-medium text-gray-900">
              Output Data
            </h2>
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              {typeof output.data === "object" ? (
                <pre className="max-h-96 overflow-auto text-sm whitespace-pre-wrap">
                  {JSON.stringify(output.data, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-700">{String(output.data)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
