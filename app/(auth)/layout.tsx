import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <nav className="flex h-14 items-center px-6 border-b border-[#E1E1E1] bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3C366B]">
            <Zap className="h-3.5 w-3.5 text-[#00D9C0]" />
          </div>
          <span className="font-bold text-[#3C366B]">NumiFin</span>
        </Link>
      </nav>
      <div className="flex flex-1 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
