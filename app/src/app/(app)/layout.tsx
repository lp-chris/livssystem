import BunneNav from "@/components/BunneNav";
import FangstOverlay from "@/components/FangstOverlay";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "var(--bg)" }}>
      {children}
      <BunneNav />
      <FangstOverlay />
    </div>
  );
}
