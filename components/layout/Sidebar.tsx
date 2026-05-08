"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",    icon: LayoutDashboard },
  { label: "Transactions",   href: "/transactions", icon: ArrowLeftRight   },
  { label: "Documents",      href: "/documents",    icon: FileText         },
  { label: "Agents",         href: "/agents",       icon: Bot              },
  { label: "CFO Chat",       href: "/cfo",          icon: MessageSquare    },
  { label: "Rules & Prompts",href: "/rules",        icon: BookOpen         },
  { label: "Reports",        href: "/reports",      icon: BarChart3        },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: "232px",
        flexShrink: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        borderRight: "1px solid rgba(26,26,26,0.08)",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 20px",
          borderBottom: "1px solid rgba(26,26,26,0.08)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "2px",
            backgroundColor: "#94af74",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.01em",
          }}
        >
          NumiFin
        </span>
      </div>

      {/* ── Main navigation ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
          scrollbarWidth: "none",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(26,26,26,0.35)",
            padding: "0 8px",
            marginBottom: "8px",
          }}
        >
          Main
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: "none",
                    transition: "background 0.2s cubic-bezier(0.25,1,0.5,1), color 0.2s cubic-bezier(0.25,1,0.5,1)",
                    backgroundColor: isActive ? "rgba(148,175,116,0.16)" : "transparent",
                    color: isActive ? "#3a5c24" : "rgba(26,26,26,0.65)",
                  }}
                  className={cn(!isActive && "hover:bg-[rgba(26,26,26,0.04)] hover:text-[#1a1a1a]")}
                >
                  <item.icon
                    style={{
                      width: "15px",
                      height: "15px",
                      flexShrink: 0,
                      color: isActive ? "#94af74" : "rgba(26,26,26,0.4)",
                      transition: "color 0.2s cubic-bezier(0.25,1,0.5,1)",
                    }}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom section ── */}
      <div
        style={{
          borderTop: "1px solid rgba(26,26,26,0.08)",
          padding: "12px",
          flexShrink: 0,
        }}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: "none",
                    transition: "background 0.2s cubic-bezier(0.25,1,0.5,1), color 0.2s cubic-bezier(0.25,1,0.5,1)",
                    backgroundColor: isActive ? "rgba(148,175,116,0.16)" : "transparent",
                    color: isActive ? "#3a5c24" : "rgba(26,26,26,0.65)",
                  }}
                  className={cn(!isActive && "hover:bg-[rgba(26,26,26,0.04)] hover:text-[#1a1a1a]")}
                >
                  <item.icon style={{ width: "15px", height: "15px", flexShrink: 0, color: isActive ? "#94af74" : "rgba(26,26,26,0.4)", transition: "color 0.2s cubic-bezier(0.25,1,0.5,1)" }} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 400,
                border: "none",
                background: "transparent",
                color: "rgba(26,26,26,0.5)",
                cursor: "pointer",
                transition: "background 0.2s cubic-bezier(0.25,1,0.5,1), color 0.2s cubic-bezier(0.25,1,0.5,1)",
                textAlign: "left",
              }}
              className="hover:bg-red-50 hover:!text-red-600 [&>svg]:hover:text-red-500"
            >
              <LogOut style={{ width: "15px", height: "15px", flexShrink: 0, color: "rgba(26,26,26,0.35)" }} />
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
