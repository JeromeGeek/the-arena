"use client";

import { useRouter } from "next/navigation";
import SetupModal from "@/components/SetupModal";

export default function CnPage() {
  const router = useRouter();

  return (
    <main className="grain-overlay relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#080B11]" style={{ overscrollBehavior: "none" }}>
      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed left-[15%] top-[20%] h-[500px] w-[500px] rounded-full"
        style={{ background: "rgba(255,65,108,0.05)", filter: "blur(120px)", transform: "translate(-50%,-50%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-[20%] right-[15%] h-[500px] w-[500px] rounded-full"
        style={{ background: "rgba(0,131,176,0.04)", filter: "blur(120px)", transform: "translate(50%,50%)" }}
      />
      <SetupModal isOpen={true} onClose={() => router.push("/")} />
    </main>
  );
}
