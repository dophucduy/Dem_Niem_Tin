import { ConnectionCard } from "../components/ConnectionCard";

export function HostPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1c2940,#070b14_60%)] p-6">
      <ConnectionCard clientType="HOST" />
    </main>
  );
}
