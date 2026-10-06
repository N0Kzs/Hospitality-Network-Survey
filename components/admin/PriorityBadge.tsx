import { LeadPriority } from '@/lib/admin/leads'
import { Badge } from '@/components/ui/badge'

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  if (priority === 'None') return null
  
  if (priority === 'Hot') {
    return <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">{priority}</Badge>
  }
  
  if (priority === 'Warm') {
    return <Badge variant="outline" className="border-primary text-primary">{priority}</Badge>
  }

  return <Badge variant="outline" className="text-muted-foreground">{priority}</Badge>
}
