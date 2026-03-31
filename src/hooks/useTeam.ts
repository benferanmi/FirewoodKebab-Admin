import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamAPI, CreateTeamMemberRequest, UpdateTeamMemberRequest } from "@/services/api/team";
import { toast } from "sonner";

const mockTeam = [
  { id: "1", firstName: "Admin", lastName: "User", email: "superadmin@example.com", phone: "+234 801 000 0000", role: "superadmin" as const, isActive: true, lastLogin: "2026-03-29T10:00:00Z" },
  { id: "2", firstName: "Grace", lastName: "Obi", email: "grace@Firewoodkebabadmin.com", phone: "+234 802 000 0000", role: "admin" as const, isActive: true, lastLogin: "2026-03-29T08:00:00Z" },
  { id: "3", firstName: "Uche", lastName: "Nna", email: "uche@Firewoodkebabadmin.com", phone: "+234 803 000 0000", role: "manager" as const, isActive: true, lastLogin: "2026-03-28T14:00:00Z" },
  { id: "4", firstName: "Bola", lastName: "Ade", email: "bola@Firewoodkebabadmin.com", phone: "+234 804 000 0000", role: "kitchen" as const, isActive: true, lastLogin: "2026-03-29T06:00:00Z" },
  { id: "5", firstName: "Segun", lastName: "Ola", email: "segun@Firewoodkebabadmin.com", phone: "+234 805 000 0000", role: "delivery" as const, isActive: false, lastLogin: "2026-03-20T09:00:00Z" },
];

export function useTeamMembers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["team", params],
    queryFn: () => teamAPI.getTeamMembers(params),
    // placeholderData: { data: mockTeam, pagination: undefined },
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamMemberRequest) => teamAPI.createTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Team member added");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add team member");
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberRequest }) =>
      teamAPI.updateTeamMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Team member updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update team member");
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamAPI.deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Team member removed");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove team member");
    },
  });
}

export function useTeamActivity(params?: { adminId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["team", "activity", params],
    queryFn: () => teamAPI.getActivityLog(params),
    placeholderData: { data: [], pagination: undefined },
  });
}
