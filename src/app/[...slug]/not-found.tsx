import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-4xl font-bold text-neutral-100">404</h1>
      <p className="mb-6 text-lg text-neutral-400">
        Deliverable not found
      </p>
      <Link
        href="https://sprintzero.sh"
        className="text-sm text-sz-orange transition-colors hover:text-sz-orange-light"
      >
        sprintzero.sh
      </Link>
    </div>
  );
}
