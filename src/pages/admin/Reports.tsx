import { useState } from "react";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFiltersStore } from "@/store/filtersStore";
import {
  useRevenueAnalytics,
  useOrderAnalytics,
  usePaymentMethodAnalytics,
  useItemsPerformance,
  useCustomerAnalytics,
  useSalesReportFull,
  useOrdersReportFull,
  useMenuPerformanceReport,
  useCustomersReportFull,
  useDeliveryReportFull,
  useDiscountsReport,
} from "@/hooks/useAnalytics";
import { analyticsAPI } from "@/services/api/analytics";
import CustomersReportTab from "@/components/reports/CustomersReportTab";
import DeliveryReportTab from "@/components/reports/DeliveryReportTab";
import DiscountsReportTab from "@/components/reports/DiscountsReportTab";
import MenuPerformanceTab from "@/components/reports/MenuPerformanceTab";
import OrdersReportTab from "@/components/reports/OrdersReportTab";
import SalesReportTab from "@/components/reports/SalesReportTab";



export default function ReportsPage() {
  const { analyticsFilters, setAnalyticsFilters } = useFiltersStore();
  const [activeTab, setActiveTab] = useState("sales");
  const [isExporting, setIsExporting] = useState(false);

  // Real-time analytics hooks (for overview cards)
  const { data: revenueBreakdown = [] } = useRevenueAnalytics({
    period: analyticsFilters.period,
  });
  const { data: orderAnalytics = [] } = useOrderAnalytics({
    period: analyticsFilters.period,
  });
  const { data: paymentMethods = [] } = usePaymentMethodAnalytics({
    period: analyticsFilters.period,
  });
  const { data: itemsPerformance = [] } = useItemsPerformance({
    period: analyticsFilters.period,
  });
  const { data: customerStats } = useCustomerAnalytics({
    period: analyticsFilters.period,
  });

  // Full report hooks (for detailed reports)
  const { data: salesReport } = useSalesReportFull({
    period: analyticsFilters.period,
  });
  
  const { data: ordersReport } = useOrdersReportFull({
    period: analyticsFilters.period,
  });
  const { data: menuReport } = useMenuPerformanceReport({
    period: analyticsFilters.period,
  });
  const { data: customersReport } = useCustomersReportFull({
    period: analyticsFilters.period,
  });
  const { data: deliveryReport } = useDeliveryReportFull({
    period: analyticsFilters.period,
  });
  const { data: discountsReport } = useDiscountsReport({
    period: analyticsFilters.period,
  });

  const handleExport = async (type: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      const response = await analyticsAPI.exportReport(activeTab, type, {
        period: analyticsFilters.period,
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `report-${activeTab}-${new Date().toISOString().split("T")[0]}.${type === "csv" ? "csv" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Filter + Export Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <Button
              key={period}
              variant={
                analyticsFilters.period === period ? "secondary" : "ghost"
              }
              size="sm"
              className="text-xs h-8"
              onClick={() => setAnalyticsFilters({ period })}
            >
              {period === "7d"
                ? "7 Days"
                : period === "30d"
                  ? "30 Days"
                  : "90 Days"}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => handleExport("csv")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="sales" className="text-xs md:text-sm">
            Sales
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs md:text-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="menu" className="text-xs md:text-sm">
            Menu
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-xs md:text-sm">
            Customers
          </TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs md:text-sm">
            Delivery
          </TabsTrigger>
          <TabsTrigger value="discounts" className="text-xs md:text-sm">
            Discounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesReportTab
            analyticsData={{
              revenueBreakdown,
              orderAnalytics,
              paymentMethods,
            }}
            reportData={salesReport}
            period={analyticsFilters.period}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersReportTab
            analyticsData={{
              orderAnalytics,
              paymentMethods,
            }}
            reportData={ordersReport}
            period={analyticsFilters.period}
          />
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <MenuPerformanceTab
            analyticsData={{
              itemsPerformance,
            }}
            reportData={menuReport}
            period={analyticsFilters.period}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomersReportTab
            analyticsData={{
              customerStats,
            }}
            reportData={customersReport}
            period={analyticsFilters.period}
          />
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <DeliveryReportTab
            reportData={deliveryReport}
            period={analyticsFilters.period}
          />
        </TabsContent>

        <TabsContent value="discounts" className="space-y-6">
          <DiscountsReportTab
            reportData={discountsReport}
            period={analyticsFilters.period}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
