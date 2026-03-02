import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-60">
        <TopBar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
