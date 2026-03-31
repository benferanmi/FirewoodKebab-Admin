import { useState } from "react";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from "@/hooks/useTeam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamMemberSchema, TeamMemberFormData } from "@/validations/team";
import { AdminRole } from "@/types/admin";

const roleColors: Record<string, string> = {
  superadmin: "bg-destructive/15 text-destructive border-destructive/25",
  admin: "bg-info/15 text-info border-info/25",
  manager: "bg-primary/15 text-primary border-primary/25",
  kitchen: "bg-warning/15 text-warning border-warning/25",
  delivery: "bg-chart-4/15 text-chart-4 border-chart-4/25",
};

export default function TeamPage() {
  const { data: teamData, isLoading } = useTeamMembers();
  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();
  const [editDialog, setEditDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [addDialog, setAddDialog] = useState(false);
  const team = teamData?.admins || [];

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "manager",
      isActive: true,
    },
  });

  const onSubmit = (data: TeamMemberFormData) => {
    createMutation.mutate(
      {
        ...data,
        password: data.password || "temppass123",
        role: data.role as AdminRole,
      } as any,
      {
        onSuccess: () => {
          setAddDialog(false);
          form.reset();
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          className="h-9 text-xs"
          onClick={() => setAddDialog(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Team Member
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Member
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr
                key={member._id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={`text-[10px] border capitalize ${roleColors[member.role]}`}
                  >
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    {member.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {member.lastLogin
                    ? new Date(member.lastLogin).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={member.isActive}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({
                        id: member._id,
                        data: { isActive: checked },
                      })
                    }
                    className="scale-75"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setSelectedMember(member);
                        form.reset({
                          firstName: member.firstName,
                          lastName: member.lastName,
                          email: member.email,
                          phone: member.phone,
                          role: member.role,
                          isActive: member.isActive,
                        });
                        setEditDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-destructive"
                      onClick={() => deleteMutation.mutate(member._id)}
                      disabled={deleteMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">First Name</Label>
                <Input
                  {...form.register("firstName")}
                  className="h-9 text-sm"
                />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Last Name</Label>
                <Input {...form.register("lastName")} className="h-9 text-sm" />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                {...form.register("email")}
                className="h-9 text-sm"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Phone</Label>
              <Input
                {...form.register("phone")}
                className="h-9 text-sm"
                placeholder="+234..."
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                {...form.register("password")}
                className="h-9 text-sm"
                placeholder="Min 8 characters"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Select
                onValueChange={(v) => form.setValue("role", v as any)}
                value={form.watch("role")}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <form
              onSubmit={form.handleSubmit((data) => {
                updateMutation.mutate(
                  {
                    id: selectedMember._id,
                    data: {
                      firstName: data.firstName,
                      lastName: data.lastName,
                      email: data.email,
                      phone: data.phone,
                      role: data.role as AdminRole,
                    },
                  },
                  {
                    onSuccess: () => {
                      setEditDialog(false);
                      form.reset();
                    },
                  },
                );
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">First Name</Label>
                  <Input
                    {...form.register("firstName")}
                    className="h-9 text-sm"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Last Name</Label>
                  <Input
                    {...form.register("lastName")}
                    className="h-9 text-sm"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  {...form.register("email")}
                  className="h-9 text-sm"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Phone</Label>
                <Input
                  {...form.register("phone")}
                  className="h-9 text-sm"
                  placeholder="+234..."
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Role</Label>
                <Select
                  onValueChange={(v) => form.setValue("role", v as any)}
                  value={form.watch("role")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Member"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
