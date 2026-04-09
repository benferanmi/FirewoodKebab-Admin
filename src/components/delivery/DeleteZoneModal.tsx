import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminDeliveryZone } from "@/hooks/useDeliveryZone";

interface DeleteZoneModalProps {
  open: boolean;
  zoneId: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function DeleteZoneModal({
  open,
  zoneId,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteZoneModalProps) {
  const { data: zone, isLoading: zoneLoading } = useAdminDeliveryZone(
    open ? zoneId : undefined,
  );

  if (zoneLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center h-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Delivery Zone</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Confirmation Message */}
          <div className="space-y-3">
            <p className="text-sm">
              Are you sure you want to delete the delivery zone{" "}
              <strong>{zone?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>

          {/* Warnings */}
          {zone?.active && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This zone is currently active and may have orders using it.
                Deleting it may affect customer deliveries.
              </AlertDescription>
            </Alert>
          )}

          {/* Zone Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {zone?.type === "zipcode" ? "ZIP Code" : "Radius"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee:</span>
              <span className="font-medium">
                ${zone?.deliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {zone?.active ? "Active" : "Inactive"}
              </span>
            </div>
            {zone?.type === "zipcode" && zone.coverage.zipCodePrefixes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ZIP Codes:</span>
                <span className="font-medium">
                  {zone.coverage.zipCodePrefixes.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Deleting..." : "Delete Zone"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}