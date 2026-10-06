import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StatCard({ title, value, subvalue }: { title: string, value: string | number, subvalue?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subvalue && (
          <p className="text-xs text-muted-foreground mt-1">
            {subvalue}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
