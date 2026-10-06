import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BarChart({ title, data, total }: { title: string, data: { label: string, count: number }[], total: number }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {data.map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
            const barWidth = Math.max((item.count / max) * 100, 1)
            
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                  <span className="truncate pr-4">{item.label}</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{item.count} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all" style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
