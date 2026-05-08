import { Header } from "@/components/layout/Header";
import { CFOChatClient } from "./CFOChatClient";

export const metadata = { title: "CFO Chat" };

export default function CFOPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="CFO Agent"
        subtitle="Ask your AI financial advisor anything about your business"
      />
      <div className="flex-1 overflow-hidden">
        <CFOChatClient />
      </div>
    </div>
  );
}
