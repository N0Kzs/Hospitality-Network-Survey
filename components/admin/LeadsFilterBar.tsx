'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

export function LeadsFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get('search') || ''
  const currentPriority = searchParams.get('priority') || 'all'

  const [search, setSearch] = useState(currentSearch)

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', search)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto flex-1 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search leads..." 
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="flex gap-2 w-full sm:w-auto">
        <Select value={currentPriority as string || 'all'} onValueChange={val => updateParam('priority', val || 'all')}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Hot">Hot</SelectItem>
            <SelectItem value="Warm">Warm</SelectItem>
            <SelectItem value="Later">Later</SelectItem>
          </SelectContent>
        </Select>

        {(currentSearch || currentPriority !== 'all') && (
          <Button variant="ghost" onClick={() => router.push('/admin/leads')} className="text-muted-foreground">
            <X className="mr-2 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  )
}
