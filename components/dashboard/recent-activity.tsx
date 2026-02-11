import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, Package } from "lucide-react";

export function RecentActivity({ transactions }: { transactions: any[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <p className='text-sm text-muted-foreground py-10 text-center'>
        Belum ada aktivitas.
      </p>
    );
  }

  return (
    <div className='space-y-6'>
      {transactions.map((item) => (
        <div key={item.id} className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div
              className={`p-2 rounded-full ${item.type === "IN" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
            >
              {item.type === "IN" ? (
                <ArrowDownLeft className='h-4 w-4' />
              ) : (
                <ArrowUpRight className='h-4 w-4' />
              )}
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {item.products.name}
              </p>
              <p className='text-xs text-muted-foreground'>
                Oleh: {item.profiles.full_name} •{" "}
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p
              className={`text-sm font-bold ${item.type === "IN" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {item.type === "IN" ? "+" : "-"}
              {item.quantity}
            </p>
            <p className='text-[10px] text-muted-foreground uppercase font-mono'>
              PCS
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
