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
import { cn } from "@/lib/utils"; // Pastikan import cn untuk styling kondisional

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  // Hitung jumlah yang belum dibaca secara terpisah untuk Badge merah
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        // HAPUS .eq("is_read", false) agar yang sudah dibaca tetap muncul
        .order("created_at", { ascending: false })
        .limit(20); // Batasi 20 notifikasi terakhir agar tidak terlalu banyak
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

  const markAsRead = async (notificationId: string) => {
    // 1. Update Database
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    // 2. Update State Lokal (Gunakan map, JANGAN filter/hapus)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    // 1. Update Database
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    // 2. Update State Lokal (Set semua jadi true)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
          {unreadCount > 0 && (
            <span className='absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-background'>
              {unreadCount}
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
          {unreadCount > 0 && (
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
                Belum ada riwayat notifikasi.
              </p>
            </div>
          ) : (
            <div className='flex flex-col'>
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                  }}
                  className={cn(
                    "p-4 cursor-pointer border-b border-muted/20 last:border-none items-start gap-3 transition-colors",
                    // KONDISI STYLING:
                    // Jika belum dibaca: Background agak merah muda (optional) atau putih bersih
                    // Jika sudah dibaca: Background agak abu/muted
                    !n.is_read ? "bg-background" : "bg-muted/10 opacity-70",
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                      !n.is_read ? "bg-rose-50" : "bg-gray-100",
                    )}
                  >
                    <AlertCircle
                      className={cn(
                        "h-4 w-4",
                        !n.is_read ? "text-rose-600" : "text-gray-400",
                      )}
                    />
                  </div>
                  <div className='flex flex-col gap-1 overflow-hidden w-full'>
                    <div className='flex justify-between items-start'>
                      <p
                        className={cn(
                          "text-sm leading-none",
                          // Teks Bold jika belum dibaca
                          !n.is_read
                            ? "font-bold text-foreground"
                            : "font-medium text-muted-foreground",
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className='h-2 w-2 rounded-full bg-rose-500 shrink-0' />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs leading-snug line-clamp-2",
                        !n.is_read
                          ? "text-muted-foreground"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {n.message}
                    </p>
                    <span className='text-[10px] text-muted-foreground/50 font-medium mt-1'>
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
            Menampilkan 20 notifikasi terakhir
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
