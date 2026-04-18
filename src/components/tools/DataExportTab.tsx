import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toolsAPI } from "@/services/api/tools";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useToolsStore } from "@/store/toolsStore";


export default function DataExportTab() {
  const { exporting, downloadFile } = useToolsStore();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const handleExport = async (type: "customers" | "orders" | "menu" | "settings") => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      let response;
      const today = new Date().toISOString().split("T")[0];

      if (type === "customers") {
        response = await toolsAPI.exportCustomers();
        downloadFile(response.data, `customers_${today}.csv`);
      } else if (type === "orders") {
        response = await toolsAPI.exportOrders();
        downloadFile(response.data, `orders_${today}.csv`);
      } else if (type === "menu") {
        response = await toolsAPI.exportMenu();
        downloadFile(response.data, `menu_${today}.csv`);
      } else if (type === "settings") {
        response = await toolsAPI.exportSettings();
        downloadFile(response.data, `settings_${today}.json`);
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${type}`);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const exportItems = [
    {
      id: "customers",
      label: "Export Customers",
      description: "Download all customer data as CSV",
      icon: "👥",
    },
    {
      id: "orders",
      label: "Export Orders",
      description: "Download complete order history as CSV",
      icon: "📦",
    },
    {
      id: "menu",
      label: "Export Menu",
      description: "Download all menu items as CSV",
      icon: "🍽️",
    },
    {
      id: "settings",
      label: "Export Settings",
      description: "Download system settings as JSON backup",
      icon: "⚙️",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Export</h2>
        <p className="text-gray-600 text-sm mt-1">Download system data for backup or analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <Button
              onClick={() => handleExport(item.id as any)}
              disabled={loading[item.id]}
              className="w-full"
            >
              {loading[item.id] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}