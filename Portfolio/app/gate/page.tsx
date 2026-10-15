import type { Metadata } from "next";
import { Suspense } from "react";
import { PinGate } from "@/components/PinGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <PinGate />
    </Suspense>
  );
}
