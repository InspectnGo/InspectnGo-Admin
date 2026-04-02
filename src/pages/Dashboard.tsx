import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MechanicsTable } from "@/components/MechanicsTable";
import { LPMechanicsTable } from "@/components/LPMechanicsTable";
import { LPCustomersTable } from "@/components/LPCustomersTable";
import { AppConfigCard } from "@/components/AppConfigCard";

export function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-ing-heading">InspectnGO Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <AppConfigCard />

        <Tabs defaultValue="mechanics" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
            <TabsTrigger value="lp-mechanics">LP Mechanics</TabsTrigger>
            <TabsTrigger value="lp-customers">LP Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="mechanics">
            <MechanicsTable />
          </TabsContent>

          <TabsContent value="lp-mechanics">
            <LPMechanicsTable />
          </TabsContent>

          <TabsContent value="lp-customers">
            <LPCustomersTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
