import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSendNotification } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [channels, setChannels] = useState({ email: true, inApp: true });

  const sendMutation = useSendNotification();

  const handleSend = () => {
    sendMutation.mutate(
      {
        title,
        message,
        recipientFilter: { userType: recipientFilter },
        sendToEmail: channels.email,
        // sendToSMS: channels.sms,
        // sendToPush: channels.push,
        sendToInApp: channels.inApp,
      },
      {
        onSuccess: () => {
          setTitle("");
          setMessage("");
        },
      },
    );
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="glass-card rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold">Send Notification</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message..."
              className="text-sm min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Recipients</Label>
            <Select value={recipientFilter} onValueChange={setRecipientFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="last_30d">
                  Ordered in Last 30 Days
                </SelectItem>
                <SelectItem value="last_90d">
                  Ordered in Last 90 Days
                </SelectItem>
                <SelectItem value="inactive">Inactive Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs">Channels</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email"
                  checked={channels.email}
                  onCheckedChange={(v) =>
                    setChannels((p) => ({ ...p, email: !!v }))
                  }
                />
                <label htmlFor="email" className="text-xs font-medium">
                  Email
                </label>
              </div>
              {/* <div className="flex items-center gap-2">
                <Checkbox id="sms" checked={channels.sms} onCheckedChange={(v) => setChannels((p) => ({ ...p, sms: !!v }))} />
                <label htmlFor="sms" className="text-xs font-medium">SMS</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="push" checked={channels.push} onCheckedChange={(v) => setChannels((p) => ({ ...p, push: !!v }))} />
                <label htmlFor="push" className="text-xs font-medium">Push</label>
              </div> */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inapp"
                  checked={channels.inApp}
                  onCheckedChange={(v) =>
                    setChannels((p) => ({ ...p, inApp: !!v }))
                  }
                />
                <label htmlFor="inapp" className="text-xs font-medium">
                  In-App
                </label>
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full sm:w-auto"
          onClick={handleSend}
          disabled={sendMutation.isPending || !title || !message}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {sendMutation.isPending ? "Sending..." : "Send Notification"}
        </Button>
      </div>
    </div>
  );
}
