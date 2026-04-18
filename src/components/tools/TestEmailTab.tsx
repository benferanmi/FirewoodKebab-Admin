import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toolsAPI } from "@/services/api/tools";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type TemplateType = "welcome" | "order_confirmation" | "password_reset";

export default function TestEmailTab() {
  const [email, setEmail] = useState("");
  const [template, setTemplate] = useState<TemplateType>("welcome");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setStatus("idle");
    try {
      await toolsAPI.sendTestEmail(email, template);
      setStatus("success");
      setMessage(`Test email sent to ${email}`);
      setEmail("");
      setTemplate("welcome");
      toast.success("Test email sent successfully");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to send email");
      toast.error("Failed to send test email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 max-w-md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Recipient Email</label>
          <Input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email Template</label>
          <Select value={template} onValueChange={(val) => setTemplate(val as TemplateType)}>
            <SelectTrigger disabled={loading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome Email</SelectItem>
              <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
              <SelectItem value="password_reset">Password Reset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSendEmail}
          disabled={loading || !email}
          className="w-full"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Mail className="w-4 h-4 mr-2" />
          Send Test Email
        </Button>

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}