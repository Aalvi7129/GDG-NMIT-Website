import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-12">
      <h1 className="text-8xl sm:text-9xl font-black font-mono tracking-tight bg-gradient-to-r from-g-blue via-g-red to-g-green bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-gray-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-g-blue hover:opacity-90 transition text-sm"
      >
        Back to Home
      </Link>
    </main>
  );
}
