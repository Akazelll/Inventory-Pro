"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { exportToPDF, exportToExcel } from "./export-utils"; // Pastikan path ini benar

export default function InventoryReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("ALL");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Pilih rentang tanggal terlebih dahulu");
      return;
    }

    setLoading(true);
    const { data: reportData, error } = await supabase.rpc(
      "get_inventory_report",
      {
        p_start_date: startDate,
        p_end_date: endDate,
        p_type: type,
      },
    );

    if (error) {
      toast.error("Gagal menarik laporan: " + error.message);
    } else {
      setData(reportData || []);
    }
    setLoading(false);
  };

  return (
    <div className='space-y-6'>
      <Card className='border-none shadow-sm bg-muted/20'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
            <div className='space-y-2'>
              <label className='text-xs font-bold uppercase text-muted-foreground'>
                Dari Tanggal
              </label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='bg-white'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-xs font-bold uppercase text-muted-foreground'>
                Sampai Tanggal
              </label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='bg-white'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-xs font-bold uppercase text-muted-foreground'>
                Jenis Transaksi
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className='bg-white'>
                  <SelectValue placeholder='Semua' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Tipe</SelectItem>
                  <SelectItem value='IN'>Masuk Saja</SelectItem>
                  <SelectItem value='OUT'>Keluar Saja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={fetchReport}
              disabled={loading}
              className='w-full shadow-sm'
            >
              {loading ? (
                <Loader2 className='animate-spin h-4 w-4' />
              ) : (
                <Filter className='mr-2 h-4 w-4' />
              )}
              Filter Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {data.length > 0 ? (
        <Card className='border-none shadow-sm overflow-hidden'>
          <CardHeader className='bg-muted/30 flex flex-row items-center justify-between py-4'>
            <CardTitle className='text-sm font-semibold'>
              Hasil Filter: {data.length} Transaksi
            </CardTitle>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => exportToExcel(data, startDate, endDate)}
                className='h-8 bg-white'
              >
                <FileSpreadsheet className='mr-2 h-3.5 w-3.5 text-emerald-600' />{" "}
                Excel
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => exportToPDF(data, startDate, endDate)}
                className='h-8 bg-white'
              >
                <FileText className='mr-2 h-3.5 w-3.5 text-rose-600' /> PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className='text-right'>Qty</TableHead>
                  <TableHead>Petugas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className='text-xs font-mono'>
                      {new Date(row.tanggal).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium text-sm'>
                        {row.nama_produk}
                      </div>
                      <div className='text-[10px] text-muted-foreground'>
                        {row.sku_produk}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${row.jenis_transaksi === "IN" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {row.jenis_transaksi === "IN" ? "+" : "-"}
                      {row.jumlah}
                    </TableCell>
                    <TableCell className='text-xs'>{row.petugas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        !loading && (
          <div className='flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border border-dashed'>
            <SearchX className='h-10 w-10 text-muted-foreground/40 mb-3' />
            <p className='text-muted-foreground text-sm font-medium'>
              Pilih filter untuk memuat laporan kustom.
            </p>
          </div>
        )
      )}
    </div>
  );
}
