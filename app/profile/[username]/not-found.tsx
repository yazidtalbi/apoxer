import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold text-white mb-2">Player not found</h1>
      <p className="text-white/60 mb-6">
        The player profile you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
}

