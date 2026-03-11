export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <a
        href="https://sprintzero.sh"
        className="mb-6 text-sm font-semibold tracking-wide text-sz-orange transition-colors hover:text-sz-orange-light"
      >
        Sprint Zero
      </a>
      <h1 className="text-center font-mono text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl">
        diff.sprintzero.sh
      </h1>
      <p className="mt-4 text-center text-neutral-500">
        Client deliverables by Sprint Zero
      </p>
    </div>
  );
}
