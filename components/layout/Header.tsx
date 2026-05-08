"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        backgroundColor: "#F7F7F5",
        borderBottom: "1px solid rgba(26,26,26,0.08)",
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#1a1a1a",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "12px", color: "rgba(26,26,26,0.45)", margin: "2px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {actions}
        </div>
      )}
    </header>
  );
}
