import { Suspense } from "react";
import UnlockForm from "./UnlockForm";

export const metadata = {
  title: "Unlock",
  robots: { index: false, follow: false },
};

export default function UnlockPage() {
  return (
    <Suspense fallback={null}>
      <UnlockForm />
    </Suspense>
  );
}
