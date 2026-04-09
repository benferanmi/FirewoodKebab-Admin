import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateDeliveryZone } from "@/hooks/useDeliveryZone";
import { IDeliveryZone } from "@/services/api/delivery";

interface CreateZoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateZoneModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateZoneModalProps) {
  const [zoneType, setZoneType] = useState<"zipcode" | "radius">("zipcode");
  const [zipInput, setZipInput] = useState("");
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    deliveryFee: "",
    minimumOrder: "",
    estimatedDeliveryTimeMin: "",
    estimatedDeliveryTimeMax: "",
    active: true,
    priority: "0",
    centerLatitude: "",
    centerLongitude: "",
    radiusKm: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createZone = useCreateDeliveryZone();

  const handleAddZipCode = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = zipInput.trim();
      if (trimmed && /^\d{5}/.test(trimmed)) {
        if (!zipCodes.includes(trimmed)) {
          setZipCodes([...zipCodes, trimmed.substring(0, 5)]);
        }
        setZipInput("");
      }
    }
  };

  const handleRemoveZipCode = (zip: string) => {
    setZipCodes(zipCodes.filter((z) => z !== zip));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Zone name is required";
    if (!form.deliveryFee) newErrors.deliveryFee = "Delivery fee is required";
    if (!form.minimumOrder) newErrors.minimumOrder = "Minimum order is required";
    if (!form.estimatedDeliveryTimeMin)
      newErrors.timeMin = "Min delivery time is required";
    if (!form.estimatedDeliveryTimeMax)
      newErrors.timeMax = "Max delivery time is required";

    if (zoneType === "zipcode" && zipCodes.length === 0) {
      newErrors.zipCodes = "At least one ZIP code is required";
    }

    if (zoneType === "radius") {
      if (!form.centerLatitude) newErrors.lat = "Latitude is required";
      if (!form.centerLongitude) newErrors.lng = "Longitude is required";
      if (!form.radiusKm) newErrors.radius = "Radius is required";
    }

    const timeMin = Number(form.estimatedDeliveryTimeMin);
    const timeMax = Number(form.estimatedDeliveryTimeMax);
    if (timeMin >= timeMax) {
      newErrors.timeMin = "Min ETA must be less than Max ETA";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const data: Partial<IDeliveryZone> = {
      name: form.name,
      description: form.description,
      type: zoneType,
      deliveryFee: Number(form.deliveryFee),
      minimumOrder: Number(form.minimumOrder),
      estimatedDeliveryTimeMin: Number(form.estimatedDeliveryTimeMin),
      estimatedDeliveryTimeMax: Number(form.estimatedDeliveryTimeMax),
      active: form.active,
      priority: Number(form.priority),
      coverage: {
        zipCodePrefixes: zoneType === "zipcode" ? zipCodes : undefined,
        centerLatitude:
          zoneType === "radius" ? Number(form.centerLatitude) : undefined,
        centerLongitude:
          zoneType === "radius" ? Number(form.centerLongitude) : undefined,
        radiusKm: zoneType === "radius" ? Number(form.radiusKm) : undefined,
      },
    };

    createZone.mutate(data, {
      onSuccess: () => {
        setForm({
          name: "",
          description: "",
          deliveryFee: "",
          minimumOrder: "",
          estimatedDeliveryTimeMin: "",
          estimatedDeliveryTimeMax: "",
          active: true,
          priority: "0",
          centerLatitude: "",
          centerLongitude: "",
          radiusKm: "",
        });
        setZipCodes([]);
        setZipInput("");
        setErrors({});
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Delivery Zone</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Zone Details</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Zone Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g., Orange County North"
                  className="h-9 text-sm mt-1"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional description for this zone"
                  className="text-sm h-20 mt-1 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Zone Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Zone Type *</h3>
            <RadioGroup value={zoneType} onValueChange={(v: any) => setZoneType(v)}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="zipcode" id="type-zip" />
                <Label htmlFor="type-zip" className="text-sm cursor-pointer">
                  ZIP Code Based
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="radius" id="type-radius" />
                <Label htmlFor="type-radius" className="text-sm cursor-pointer">
                  Radius Based
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Type-specific fields */}
          {zoneType === "zipcode" ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">ZIP Code Prefixes *</h3>
              <div>
                <Label className="text-xs">Add ZIP Codes</Label>
                <Input
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  onKeyDown={handleAddZipCode}
                  placeholder="Enter ZIP code (5 digits) and press Enter"
                  maxLength={5}
                  className="h-9 text-sm mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter or comma to add
                </p>
                {errors.zipCodes && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.zipCodes}
                  </p>
                )}
              </div>

              {zipCodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {zipCodes.map((zip) => (
                    <div
                      key={zip}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm"
                    >
                      <span>{zip}</span>
                      <button
                        onClick={() => handleRemoveZipCode(zip)}
                        className="hover:text-foreground text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Coverage Radius *</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Center Latitude *</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={form.centerLatitude}
                    onChange={(e) =>
                      setForm({ ...form, centerLatitude: e.target.value })
                    }
                    placeholder="33.6845"
                    className="h-9 text-sm mt-1"
                  />
                  {errors.lat && (
                    <p className="text-xs text-red-500 mt-1">{errors.lat}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Center Longitude *</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={form.centerLongitude}
                    onChange={(e) =>
                      setForm({ ...form, centerLongitude: e.target.value })
                    }
                    placeholder="-117.8265"
                    className="h-9 text-sm mt-1"
                  />
                  {errors.lng && (
                    <p className="text-xs text-red-500 mt-1">{errors.lng}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Radius (KM) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.radiusKm}
                    onChange={(e) =>
                      setForm({ ...form, radiusKm: e.target.value })
                    }
                    placeholder="5.5"
                    className="h-9 text-sm mt-1"
                  />
                  {errors.radius && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.radius}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Delivery */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Pricing & Delivery</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Delivery Fee ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.deliveryFee}
                  onChange={(e) =>
                    setForm({ ...form, deliveryFee: e.target.value })
                  }
                  placeholder="3.99"
                  className="h-9 text-sm mt-1"
                />
                {errors.deliveryFee && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.deliveryFee}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Minimum Order ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.minimumOrder}
                  onChange={(e) =>
                    setForm({ ...form, minimumOrder: e.target.value })
                  }
                  placeholder="15.00"
                  className="h-9 text-sm mt-1"
                />
                {errors.minimumOrder && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.minimumOrder}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Est. Delivery Min (minutes) *</Label>
                <Input
                  type="number"
                  value={form.estimatedDeliveryTimeMin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estimatedDeliveryTimeMin: e.target.value,
                    })
                  }
                  placeholder="15"
                  className="h-9 text-sm mt-1"
                />
                {errors.timeMin && (
                  <p className="text-xs text-red-500 mt-1">{errors.timeMin}</p>
                )}
              </div>

              <div>
                <Label className="text-xs">Est. Delivery Max (minutes) *</Label>
                <Input
                  type="number"
                  value={form.estimatedDeliveryTimeMax}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estimatedDeliveryTimeMax: e.target.value,
                    })
                  }
                  placeholder="30"
                  className="h-9 text-sm mt-1"
                />
                {errors.timeMax && (
                  <p className="text-xs text-red-500 mt-1">{errors.timeMax}</p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Optional Settings</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Priority</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  placeholder="0"
                  className="h-9 text-sm mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher priority wins for overlapping zones
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createZone.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createZone.isPending || Object.keys(errors).length > 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {createZone.isPending ? "Creating..." : "Create Zone"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}