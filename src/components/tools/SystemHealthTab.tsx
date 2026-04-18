import { useEffect } from "react";
import { useToolsStore } from "@/store/toolsStore";

import { Button } from "@/components/ui/button";
import { Loader2, Circle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SystemHealthTab() {
  const { health, healthLoading, healthError, checkHealth } = useToolsStore();

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const renderStatusCard = (
    name: string,
    status: "healthy" | "unhealthy" | undefined,
    details?: string,
    error?: string
  ) => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">{details}</p>
        </div>
        <div className="flex items-center gap-2">
          <Circle
            className={cn(
              "w-4 h-4",
              status === "healthy"
                ? "fill-green-500 text-green-500"
                : "fill-red-500 text-red-500"
            )}
          />
          <span className={cn(
            "text-sm font-semibold",
            status === "healthy" ? "text-green-600" : "text-red-600"
          )}>
            {status === "healthy" ? "Healthy" : "Unhealthy"}
          </span>
        </div>
      </div>
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-gray-600 text-sm mt-1">
            {health?.checkedAt && `Last checked: ${new Date(health.checkedAt).toLocaleTimeString()}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => checkHealth()}
          disabled={healthLoading}
        >
          {healthLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {healthLoading && !health ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : healthError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Error checking health: {healthError}</p>
        </div>
      ) : health ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderStatusCard(
            "MongoDB",
            health.mongodb.status,
            `Response time: ${health.mongodb.responseTime}ms`,
            health.mongodb.error
          )}
          {renderStatusCard(
            "Redis",
            health.redis.status,
            "Cache & session store",
            health.redis.error
          )}
          {renderStatusCard(
            "Cloudinary",
            health.cloudinary.status,
            "Image hosting service",
            health.cloudinary.error
          )}
        </div>
      ) : null}
    </div>
  );
}