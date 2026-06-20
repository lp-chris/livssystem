import BunneNav from "@/components/BunneNav";
import FangstOverlay from "@/components/FangstOverlay";
import SidebarNav from "@/components/SidebarNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "var(--bg)" }}>
      <SidebarNav />
      <div className="md:pl-[230px]">{children}</div>
      <BunneNav />
      <FangstOverlay />
    </div>
  );
}
