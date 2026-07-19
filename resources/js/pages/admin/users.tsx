import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui-bits";
import { Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type User = {
  id: number;
  name: string;
  email: string;
  roll_number: string;
  department: string;
  role: string;
  registration_status: string;
  created_at: string;
};

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", { search: searchTerm, role: roleFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      
      const res = await api.get(`/api/admin/users?${params.toString()}`);
      return res.data as User[];
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      await api.put(`/api/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        throw new Error("Cancelled");
      }
      await api.delete(`/api/admin/users/${id}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      if (err.message !== "Cancelled") {
        toast.error(err.response?.data?.message || "Failed to delete user");
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Users management" 
        description="View and manage all registered users in the system." 
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]"
          >
            <option value="">All roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto border rounded-lg border-border">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-blood">
                    Failed to load users: {error?.message}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold">
                          {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="font-medium text-foreground">{user.roll_number}</div>
                      <div className="text-xs">{user.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                        disabled={roleMutation.isPending}
                        className="text-xs rounded-md border border-input bg-background px-2 py-1 cursor-pointer hover:border-primary transition-colors focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.registration_status === 'Approved' ? 'success' : user.registration_status === 'Pending' ? 'warning' : 'blood'}>
                        {user.registration_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-muted-foreground hover:bg-blood/10 hover:text-blood rounded-md transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
