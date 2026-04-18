import { useEffect, useState } from "react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRedirects, useCreateRedirect, useDeleteRedirect } from "@/hooks/useContent";

export default function RedirectsManagerTab() {
  const { data: redirects = [], isLoading } = useRedirects();
  const createMutation = useCreateRedirect();
  const deleteMutation = useDeleteRedirect();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [fromUrl, setFromUrl] = useState("");
  const [toUrl, setToUrl] = useState("");

  const filteredRedirects = redirects.filter((r) =>
    r.from?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRedirect = async () => {
    if (!fromUrl || !toUrl) {
      toast.error("Please fill in both URLs");
      return;
    }

    try {
      await createMutation.mutateAsync({
        from: fromUrl,
        to: toUrl,
        statusCode: 301,
      });
      setFromUrl("");
      setToUrl("");
      setIsOpen(false);
      toast.success("Redirect created");
    } catch (error) {
      toast.error("Failed to create redirect");
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Redirect deleted");
    } catch (error) {
      toast.error("Failed to delete redirect");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">301 Redirects</h3>
            <p className="text-sm text-gray-600">Manage URL redirects for SEO</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Redirect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Redirect</DialogTitle>
                <DialogDescription>Add a new 301 redirect</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">From URL</label>
                  <Input
                    placeholder="/old-page"
                    value={fromUrl}
                    onChange={(e) => setFromUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">To URL</label>
                  <Input
                    placeholder="/new-page"
                    value={toUrl}
                    onChange={(e) => setToUrl(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateRedirect}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Redirect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search redirects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From URL</TableHead>
                <TableHead>To URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredRedirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No redirects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRedirects.map((redirect) => (
                  <TableRow key={redirect._id}>
                    <TableCell className="font-mono text-sm">{redirect.from}</TableCell>
                    <TableCell className="font-mono text-sm">{redirect.to}</TableCell>
                    <TableCell>
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {redirect.statusCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRedirect(redirect._id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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