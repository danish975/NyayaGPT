import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat · NyayaGPT",
  description:
    "Ask NyayaGPT about Indian laws, welfare schemes, and constitutional provisions. Every answer is source-grounded with citations.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
