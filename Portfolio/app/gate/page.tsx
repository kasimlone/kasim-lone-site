import { Suspense } from "react";
import { PinGate } from "@/components/PinGate";

export const dynamic = "force-dynamic";

export default function GatePage() {
  return (
    <Suspense fallback={null}>
      <PinGate />
    </Suspense>
  );
}
