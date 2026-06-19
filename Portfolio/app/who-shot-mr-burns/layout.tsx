import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Who Shot Mr. Burns? — Springfield Police Department",
  description: "A Springfield mystery — sift through suspects, clues and eyewitness statements to crack the case.",
};

export default function WSMBLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
