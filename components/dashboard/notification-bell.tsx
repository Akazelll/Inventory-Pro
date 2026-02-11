"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bell, AlertCircle, CheckCheck, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
    };

    fetchInitial();

    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    setNotifications([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative hover:bg-muted transition-colors rounded-full'
        >
          <Bell className='h-5 w-5 text-muted-foreground' />
          {notifications.length > 0 && (
            <span className='absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-background'>
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-80 p-0 shadow-xl border-none'
        align='end'
      >
        <div className='flex items-center justify-between p-4 bg-muted/30'>
          <DropdownMenuLabel className='p-0 font-bold text-sm'>
            Notifikasi
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto p-0 text-[11px] text-primary hover:bg-transparent font-semibold flex items-center gap-1'
              onClick={markAllAsRead}
            >
              <CheckCheck className='h-3 w-3' /> Tandai semua dibaca
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className='m-0' />

        <ScrollArea className='h-[350px]'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3'>
                <Inbox className='h-6 w-6 text-muted-foreground/50' />
              </div>
              <p className='text-xs font-medium text-muted-foreground'>
                Semua aman! Tidak ada stok kritis.
              </p>
            </div>
          ) : (
            <div className='flex flex-col'>
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className='p-4 cursor-pointer focus:bg-muted/50 border-b border-muted/20 last:border-none items-start gap-3'
                >
                  <div className='mt-1 h-8 w-8 shrink-0 rounded-full bg-rose-50 flex items-center justify-center'>
                    <AlertCircle className='h-4 w-4 text-rose-600' />
                  </div>
                  <div className='flex flex-col gap-1 overflow-hidden'>
                    <p className='text-sm font-bold leading-none'>{n.title}</p>
                    <p className='text-xs text-muted-foreground leading-snug line-clamp-2'>
                      {n.message}
                    </p>
                    <span className='text-[10px] text-muted-foreground font-medium mt-1'>
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator className='m-0' />
        <div className='p-2 bg-muted/10'>
          <Button
            variant='ghost'
            className='w-full text-[11px] h-8 font-medium text-muted-foreground'
            disabled
          >
            Lihat semua pemberitahuan
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
