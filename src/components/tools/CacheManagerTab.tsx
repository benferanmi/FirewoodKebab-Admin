import { useEffect, useState } from "react";
import { useToolsStore } from "@/store/toolsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CacheManagerTab() {
  const { cacheKeys, cacheLoading, cacheStats, fetchCacheKeys, deleteCacheKey, clearAllCache } = useToolsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchCacheKeys();
  }, []);

  const filteredKeys = cacheKeys.filter((key) =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteKey = async (key: string) => {
    try {
      await deleteCacheKey(key);
      toast.success(`Cache key deleted: ${key}`);
    } catch (error) {
      toast.error("Failed to delete cache key");
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllCache();
      toast.success("All cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear all cache");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Cache Keys</h3>
            <p className="text-sm text-gray-600">
              Total: {cacheStats?.totalKeys || 0} keys | Size: {((cacheStats?.dbSize || 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCacheKeys()}
              disabled={cacheLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Clear all cache?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all Redis cache keys. This action cannot be undone.
                </AlertDialogDescription>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {clearing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Clear All
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search cache keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead className="text-right">TTL (seconds)</TableHead>
                <TableHead className="text-right">Size (bytes)</TableHead>
                <TableHead className="text-right w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cacheLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No cache keys found
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((key) => (
                  <TableRow key={key.name}>
                    <TableCell className="font-mono text-sm">{key.name}</TableCell>
                    <TableCell className="text-right">
                      {key.ttl === null ? (
                        <span className="text-orange-500 font-semibold">No expiry</span>
                      ) : (
                        <span className={key.ttl < 300 ? "text-red-500 font-semibold" : ""}>
                          {key.ttl}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {key.size ? `${(key.size / 1024).toFixed(2)} KB` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete cache key?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete: <code className="bg-gray-100 px-2 py-1 rounded">{key.name}</code>
                          </AlertDialogDescription>
                          <div className="flex gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteKey(key.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}