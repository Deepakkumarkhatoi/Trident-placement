import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, FileText, Building2, Bell, User } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "My Applications", path: "/applications" },
  { icon: Building2, label: "Drives", path: "/drives" },
  { icon: Bell, label: "Notifications", path: "/notifications", badge: 3 },
  { icon: User, label: "Profile", path: "/profile" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src={logo} alt="T&P Portal" className="w-9 h-9 rounded-lg" />
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-sidebar-foreground/60">T&P Portal</p>
          <p className="text-sm font-bold text-sidebar-accent-foreground">TAT College</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-muted-foreground">Training & Placement Cell</p>
        <p className="text-xs font-semibold text-sidebar-accent-foreground">Student Dashboard</p>
      </div>
    </aside>
  );
};

export default Sidebar;
