import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import CacheManagerTab from "@/components/tools/CacheManagerTab";
import DangerZoneTab from "@/components/tools/DangerZoneTab";
import DataExportTab from "@/components/tools/DataExportTab";
import RedirectsManagerTab from "@/components/tools/RedirectsManagerTab";
import SystemHealthTab from "@/components/tools/SystemHealthTab";
import TestEmailTab from "@/components/tools/TestEmailTab";

export default function ToolsPage() {
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === "superadmin";
  const [activeTab, setActiveTab] = useState("email");

  if (!isSuperAdmin && admin?.role !== "manager") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-600 mt-2">You do not have permission to access this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-gray-600 mt-2">System utilities and maintenance tools</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full gap-2 grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="email">Test Email</TabsTrigger>
          <TabsTrigger value="redirects">Redirects</TabsTrigger>
          {isSuperAdmin && (
            <>
              <TabsTrigger value="cache">Cache</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <TestEmailTab />
        </TabsContent>

        <TabsContent value="redirects" className="mt-6">
          <RedirectsManagerTab />
        </TabsContent>

        {isSuperAdmin && (
          <>
            <TabsContent value="cache" className="mt-6">
              <CacheManagerTab />
            </TabsContent>

            <TabsContent value="health" className="mt-6">
              <SystemHealthTab />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <DataExportTab />
            </TabsContent>

            <TabsContent value="danger" className="mt-6">
              <DangerZoneTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}