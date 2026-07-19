import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, Badge, Section } from "@/components/ui-bits";
import { Bell, Check, Trash2, ArrowRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/api/notifications');
      return res.data.notifications;
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.put('/api/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm">Loading notifications...</span>
        </div>
      </div>
    );
  }

  const notifications = data || [];
  const unreadCount = notifications.filter((n: any) => n.unread).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay updated with your campus activities.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 cursor-pointer bg-primary/8 hover:bg-primary/12 px-4 py-2 rounded-xl press-effect"
          >
            <Check className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      <Card className="overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground/40 mb-4">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">You're all caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              There are no new notifications right now. Check back later for updates on your posts and activities.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n: any) => (
              <li 
                key={n.id} 
                className={cn(
                  "p-4 transition-all duration-200 hover:bg-secondary/50 flex items-start gap-4",
                  n.unread ? "bg-primary/3" : ""
                )}
              >
                <div className={cn(
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full transition-colors",
                  n.unread ? "bg-primary shadow-sm shadow-primary/30" : "bg-transparent"
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm", n.unread ? "font-semibold" : "font-medium")}>{n.title}</p>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  {n.message && <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>}
                  
                  {n.link && (
                    <Link to={n.link} className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline cursor-pointer group">
                      View details <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
                {n.unread && (
                  <button 
                    onClick={() => markAsRead.mutate(n.id)}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-all duration-200 p-1.5 cursor-pointer rounded-lg hover:bg-primary/8"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
