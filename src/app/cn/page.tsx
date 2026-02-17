"use client";

import { useRouter } from "next/navigation";
import SetupModal from "@/components/SetupModal";

export default function CnPage() {
  const router = useRouter();

  return (
    <main className="relative flex h-screen items-center justify-center">
      <SetupModal isOpen={true} onClose={() => router.push("/")} />
    </main>
  );
}
