// Runs once when the server starts (Next.js instrumentation hook). Opening the
// database connection here means the first visitor's page doesn't have to
// wait for it.

export async function register() {
  // The database driver only runs on Node. Keep the import inside this check
  // so webpack leaves it out of the edge bundle.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectToDatabase } = await import("./lib/mongodb");
    connectToDatabase().catch((error: unknown) => {
      console.error("Could not open the database connection at startup; pages will retry.", error);
    });
  }
}
