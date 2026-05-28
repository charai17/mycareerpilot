import { AppShell, FoundationNotes } from "@/components/app-shell";

export default function Home() {
  return (
    <>
      <AppShell />
      <section className="border-t border-line bg-white px-4 py-8 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase text-pilot-green">Build foundation</p>
          <h2 className="mt-2 text-2xl font-bold">Ready for Supabase, OpenAI, and Stripe</h2>
          <div className="mt-5">
            <FoundationNotes />
          </div>
        </div>
      </section>
    </>
  );
}
