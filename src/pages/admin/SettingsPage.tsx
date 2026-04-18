import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useRestaurantSettings,
  useUpdateRestaurantSettings,
  useDeliverySettings,
  useUpdateDeliverySettings,
  usePaymentSettings,
  useUpdatePaymentSettings,
  useEmailSettings,
  useUpdateEmailSettings,
  useSendTestEmail,
  useSocialSettings,
  useUpdateSocialSettings,
  useSupportSettings,
  useUpdateSupportSettings,
} from "@/hooks/useSettings";
import { useAuthStore } from "@/store/authStore";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SettingsPage() {
  const { hasPermission, hasRole } = useAuthStore();

  // Restaurant settings
  const { data: restaurant } = useRestaurantSettings();
  const updateRestaurant = useUpdateRestaurantSettings();
  const [restaurantForm, setRestaurantForm] = useState<Record<string, any>>({});
  const [openingHours, setOpeningHours] = useState<Record<string, any>>({});

  const getRestaurantValue = (field: string) =>
    restaurantForm[field] ?? (restaurant as any)?.[field] ?? "";
  const getHoursValue = (day: string) => {
    const custom = openingHours[day];
    const original = restaurant?.openingHours?.[day];
    return (
      custom || original || { open: true, startTime: "09:00", endTime: "21:00" }
    );
  };

  const handleSaveRestaurant = () => {
    updateRestaurant.mutate({
      name: getRestaurantValue("name"),
      tagline: getRestaurantValue("tagline"),
      phone: getRestaurantValue("phone"),
      email: getRestaurantValue("email"),
      address: getRestaurantValue("address"),
      openingHours: Object.fromEntries(days.map((d) => [d, getHoursValue(d)])),
    });
  };

  // Delivery settings
  const { data: delivery } = useDeliverySettings();
  const updateDelivery = useUpdateDeliverySettings();
  const [deliveryForm, setDeliveryForm] = useState<Record<string, any>>({});

  const getDeliveryValue = (field: string) =>
    deliveryForm[field] ?? (delivery as any)?.[field] ?? "";

  const handleSaveDelivery = () => {
    updateDelivery.mutate({
      radiusKm: Number(getDeliveryValue("radiusKm")),
      flatFee: Number(getDeliveryValue("flatFee")),
      minOrderAmount: Number(getDeliveryValue("minOrderAmount")),
      freeDeliveryThreshold: Number(getDeliveryValue("freeDeliveryThreshold")),
    });
  };


  // Email settings
  const { data: emailConfig } = useEmailSettings();
  const updateEmail = useUpdateEmailSettings();
  const [emailForm, setEmailForm] = useState<Record<string, any>>({});
  const sendTestEmail = useSendTestEmail();
  const [testEmailAddr, setTestEmailAddr] = useState("");

  const getEmailValue = (field: string) =>
    emailForm[field] ?? (emailConfig as any)?.[field] ?? "";

  // Social settings
  const { data: social } = useSocialSettings();
  const updateSocial = useUpdateSocialSettings();
  const [socialForm, setSocialForm] = useState<Record<string, any>>({});

  const getSocialValue = (field: string) =>
    socialForm[field] ?? (social as any)?.[field] ?? "";

  const handleSaveSocial = () => {
    updateSocial.mutate({
      facebook: getSocialValue("facebook"),
      instagram: getSocialValue("instagram"),
      twitter: getSocialValue("twitter"),
      linkedin: getSocialValue("linkedin"),
    });
  };

  // Support settings
  const { data: support } = useSupportSettings();
  const updateSupport = useUpdateSupportSettings();
  const [supportForm, setSupportForm] = useState<Record<string, any>>({});

  const getSupportValue = (field: string) =>
    supportForm[field] ?? (support as any)?.[field] ?? "";

  const handleSaveSupport = () => {
    updateSupport.mutate({
      quoteEmail: getSupportValue("quoteEmail"),
      contactEmail: getSupportValue("contactEmail"),
      autoReplyEnabled: getSupportValue("autoReplyEnabled") ?? true,
    });
  };

  return (
    <Tabs defaultValue="restaurant" className="space-y-4">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="restaurant" className="text-xs">
          Restaurant
        </TabsTrigger>
        <TabsTrigger value="delivery" className="text-xs">
          Delivery
        </TabsTrigger>
        <TabsTrigger value="support" className="text-xs">
          Support
        </TabsTrigger>
        <TabsTrigger value="social" className="text-xs">
          Social
        </TabsTrigger>
      
        {/* {isSuperAdmin && (
          <TabsTrigger value="email" className="text-xs">
            Email
          </TabsTrigger>
        )} */}
      </TabsList>

      {/* ── Restaurant ── */}
      <TabsContent value="restaurant">
        <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
          <h3 className="text-sm font-semibold">Restaurant Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* <div className="space-y-2">
              <Label className="text-xs">Restaurant Name</Label>
              <Input
                value={getRestaurantValue("name")}
                onChange={(e) =>
                  setRestaurantForm((p) => ({ ...p, name: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tagline</Label>
              <Input
                value={getRestaurantValue("tagline")}
                onChange={(e) =>
                  setRestaurantForm((p) => ({ ...p, tagline: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div> */}
            <div className="space-y-2">
              <Label className="text-xs">Phone</Label>
              <Input
                value={getRestaurantValue("phone")}
                onChange={(e) =>
                  setRestaurantForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            {/* <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input
                value={getRestaurantValue("email")}
                onChange={(e) =>
                  setRestaurantForm((p) => ({ ...p, email: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div> */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs">Address</Label>
              <Input
                value={getRestaurantValue("address")}
                onChange={(e) =>
                  setRestaurantForm((p) => ({ ...p, address: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold">Opening Hours</Label>
            {days.map((day) => {
              const hours = getHoursValue(day);
              return (
                <div key={day} className="flex items-center gap-3">
                  <Switch
                    checked={hours.open}
                    onCheckedChange={(v) =>
                      setOpeningHours((p) => ({
                        ...p,
                        [day]: { ...hours, open: v },
                      }))
                    }
                    className="scale-75"
                  />
                  <span className="w-24 text-xs font-medium">{day}</span>
                  <Input
                    value={hours.startTime}
                    onChange={(e) =>
                      setOpeningHours((p) => ({
                        ...p,
                        [day]: { ...hours, startTime: e.target.value },
                      }))
                    }
                    type="time"
                    className="h-8 w-28 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    value={hours.endTime}
                    onChange={(e) =>
                      setOpeningHours((p) => ({
                        ...p,
                        [day]: { ...hours, endTime: e.target.value },
                      }))
                    }
                    type="time"
                    className="h-8 w-28 text-xs"
                  />
                </div>
              );
            })}
          </div>

          <Button
            size="sm"
            onClick={handleSaveRestaurant}
            disabled={updateRestaurant.isPending}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {updateRestaurant.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </TabsContent>

      {/* ── Delivery ── */}
      <TabsContent value="delivery">
        <div className="glass-card rounded-xl p-6 space-y-5 max-w-lg">
          <h3 className="text-sm font-semibold">Delivery Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Delivery Radius (km)</Label>
              <Input
                type="number"
                value={getDeliveryValue("radiusKm")}
                onChange={(e) =>
                  setDeliveryForm((p) => ({ ...p, radiusKm: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Flat Delivery Fee ($)</Label>
              <Input
                type="number"
                value={getDeliveryValue("flatFee")}
                onChange={(e) =>
                  setDeliveryForm((p) => ({ ...p, flatFee: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            {/* <div className="space-y-2">
              <Label className="text-xs">Min Order Amount ($)</Label>
              <Input
                type="number"
                value={getDeliveryValue("minOrderAmount")}
                onChange={(e) =>
                  setDeliveryForm((p) => ({
                    ...p,
                    minOrderAmount: e.target.value,
                  }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Free Delivery Threshold ($)</Label>
              <Input
                type="number"
                value={getDeliveryValue("freeDeliveryThreshold")}
                onChange={(e) =>
                  setDeliveryForm((p) => ({
                    ...p,
                    freeDeliveryThreshold: e.target.value,
                  }))
                }
                className="h-9 text-sm"
              />
            </div> */}
          </div>
          <Button
            size="sm"
            onClick={handleSaveDelivery}
            disabled={updateDelivery.isPending}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {updateDelivery.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </TabsContent>

      {/* ── Support ── */}
      <TabsContent value="support">
        <div className="glass-card rounded-xl p-6 space-y-5 max-w-lg">
          <h3 className="text-sm font-semibold">Support Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Quote Email</Label>
              <Input
                type="email"
                value={getSupportValue("quoteEmail")}
                onChange={(e) =>
                  setSupportForm((p) => ({ ...p, quoteEmail: e.target.value }))
                }
                placeholder="quotes@yourrestaurant.com"
                className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Receives quote request submissions.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Contact Email</Label>
              <Input
                type="email"
                value={getSupportValue("contactEmail")}
                onChange={(e) =>
                  setSupportForm((p) => ({
                    ...p,
                    contactEmail: e.target.value,
                  }))
                }
                placeholder="support@yourrestaurant.com"
                className="h-9 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Receives general contact form messages.
              </p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">Auto-Reply</p>
                <p className="text-xs text-muted-foreground">
                  Send an automatic acknowledgement to customers on contact.
                </p>
              </div>
              <Switch
                checked={getSupportValue("autoReplyEnabled") ?? true}
                onCheckedChange={(v) =>
                  setSupportForm((p) => ({ ...p, autoReplyEnabled: v }))
                }
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSaveSupport}
            disabled={updateSupport.isPending}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {updateSupport.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </TabsContent>

      {/* ── Social ── */}
      <TabsContent value="social">
        <div className="glass-card rounded-xl p-6 space-y-5 max-w-lg">
          <h3 className="text-sm font-semibold">Social Media Links</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Facebook</Label>
              <Input
                value={getSocialValue("facebook")}
                onChange={(e) =>
                  setSocialForm((p) => ({ ...p, facebook: e.target.value }))
                }
                placeholder="https://facebook.com/yourpage"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Instagram</Label>
              <Input
                value={getSocialValue("instagram")}
                onChange={(e) =>
                  setSocialForm((p) => ({ ...p, instagram: e.target.value }))
                }
                placeholder="https://instagram.com/yourhandle"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Twitter / X</Label>
              <Input
                value={getSocialValue("twitter")}
                onChange={(e) =>
                  setSocialForm((p) => ({ ...p, twitter: e.target.value }))
                }
                placeholder="https://twitter.com/yourhandle"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">LinkedIn</Label>
              <Input
                value={getSocialValue("linkedin")}
                onChange={(e) =>
                  setSocialForm((p) => ({ ...p, linkedin: e.target.value }))
                }
                placeholder="https://linkedin.com/company/yourpage"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSaveSocial}
            disabled={updateSocial.isPending}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {updateSocial.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </TabsContent>

 

    </Tabs>
  );
}
