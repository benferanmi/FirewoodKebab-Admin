import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useToolsStore } from "@/store/toolsStore";

type ActionType = "carts" | "coupons" | "notifications";

interface DangerAction {
  id: ActionType;
  label: string;
  description: string;
  confirmText: string;
  successMessage: string;
}

const dangerActions: DangerAction[] = [
  {
    id: "carts",
    label: "Clear All Guest Carts",
    description: "Delete all guest shopping carts (30+ days old)",
    confirmText: "CLEAR CARTS",
    successMessage: "Guest carts cleared",
  },
  {
    id: "coupons",
    label: "Delete Expired Coupons",
    description: "Permanently remove all expired coupon codes",
    confirmText: "DELETE COUPONS",
    successMessage: "Expired coupons deleted",
  },
  {
    id: "notifications",
    label: "Flush Old Notifications",
    description: "Delete all notifications older than 90 days",
    confirmText: "FLUSH NOTIFICATIONS",
    successMessage: "Old notifications flushed",
  },
];

export default function DangerZoneTab() {
  const { executing, lastResult, executeMaintenanceAction } = useToolsStore();
  const [confirmationTexts, setConfirmationTexts] = useState<{ [key: string]: string }>({});

  const handleAction = async (action: DangerAction) => {
    const confirmText = confirmationTexts[action.id] || "";
    if (confirmText !== action.confirmText) {
      toast.error(`Please type "${action.confirmText}" to confirm`);
      return;
    }

    try {
      await executeMaintenanceAction(action.id);
      setConfirmationTexts((prev) => ({ ...prev, [action.id]: "" }));
      toast.success(action.successMessage);
    } catch (error) {
      toast.error(`Failed to execute action`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Danger Zone</h3>
          <p className="text-sm text-red-800 mt-1">
            These actions are permanent and cannot be undone. Proceed with caution.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {dangerActions.map((action) => (
          <div
            key={action.id}
            className="bg-white rounded-lg border border-red-200 p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-red-600">{action.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              </div>
              {lastResult?.[action.id] !== undefined && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    {lastResult[action.id]} affected
                  </span>
                </div>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  {executing[action.id] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Execute
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Confirm {action.label}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone. Type the confirmation text below to
                  proceed.
                </AlertDialogDescription>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Type to confirm: <code className="bg-gray-100 px-2 py-1 rounded">{action.confirmText}</code>
                    </label>
                    <Input
                      value={confirmationTexts[action.id] || ""}
                      onChange={(e) =>
                        setConfirmationTexts((prev) => ({
                          ...prev,
                          [action.id]: e.target.value,
                        }))
                      }
                      placeholder="Type confirmation text"
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-3">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction(action)}
                      disabled={
                        (confirmationTexts[action.id] || "") !== action.confirmText ||
                        executing[action.id]
                      }
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {executing[action.id] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirm
                    </AlertDialogAction>
                  </div>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}