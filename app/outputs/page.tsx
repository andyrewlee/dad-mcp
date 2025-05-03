import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { resolveStorageUrl } from "@/lib/supabase/storage";

export default async function OutputsPage() {
  // Use regular client for auth check
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

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

  // Fetch the user's outputs
  const { data: outputs, error: outputsError } = await supabase
    .from("outputs")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  // Process all outputs to find the first image preview using the new helper
  const processedOutputs = await Promise.all(
    (outputs || []).map(async (output) => {
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

      return {
        ...output,
        previewImageUrl, // Add the found (or null) preview URL
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Outputs</h1>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Logged in as: {userData.user.email}
        </p>
      </div>

      {outputsError && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p className="font-bold">Error loading outputs:</p>
          <p>{outputsError.message}</p>
        </div>
      )}

      {!processedOutputs || processedOutputs.length === 0 ? (
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-center text-gray-500">No outputs found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {processedOutputs.map((output) => (
            <div
              key={output.id}
              className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md"
            >
              {/* Show image preview if available */}
              {output.previewImageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={output.previewImageUrl}
                    alt="Output preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {output.source}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(output.created_at).toString()}
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col space-y-4">
                  {!output.previewImageUrl && (
                    <div className="max-h-40 overflow-hidden">
                      {typeof output.data === "object" ? (
                        <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-sm">
                          {JSON.stringify(output.data, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-700">{String(output.data)}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        output.is_public
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {output.is_public ? "Public" : "Private"}
                    </span>

                    <Link
                      href={`/outputs/${output.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
