import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Donut, TrendChart } from "@/components/averonix/Charts";
import { Search, ChevronRight } from "lucide-react";

export function OpsFiltersBar({ q, setQ, chips, placeholder }: { q: string; setQ: (s: string) => void; chips: string[]; placeholder: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="pl-9 h-9" />
      </div>
      {chips.map((c) => <Button key={c} variant="outline" size="sm" className="h-9 text-xs">{c}<ChevronRight className="h-3 w-3 rotate-90" /></Button>)}
    </div>
  );
}

export function ChartsRow({ donut, trendLabel, trendData }: { donut: { name: string; value: number; color: string }[]; trendLabel: string; trendData: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader><CardTitle className="text-sm">Distribution</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-6">
          <Donut size={160} data={donut} />
          <ul className="text-sm space-y-2 flex-1">
            {donut.map((d) => (
              <li key={d.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} /><span className="flex-1">{d.name}</span><span className="font-medium tabular-nums">{d.value}</span></li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader><CardTitle className="text-sm">{trendLabel}</CardTitle></CardHeader>
        <CardContent><TrendChart data={trendData} /></CardContent>
      </Card>
    </div>
  );
}
