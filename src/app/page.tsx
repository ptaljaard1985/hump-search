import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-6">HUM Content Search</h1>
        <div className="flex gap-4">
          <Link
            href="/search"
            className="bg-black text-white px-6 py-3 rounded-lg text-sm hover:bg-gray-800"
          >
            Member Search
          </Link>
          <Link
            href="/admin"
            className="border border-gray-300 px-6 py-3 rounded-lg text-sm hover:bg-gray-100"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
