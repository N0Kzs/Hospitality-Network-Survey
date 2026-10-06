'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { sections } from '@/lib/survey/questions'

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

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset pagination on filter
    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  // Get options for filters from the source of truth
  const q13Options = sections.find(s => s.id === 's3')?.questions.find(q => q.id === 'q13')?.options || []
  const q26Options = sections.find(s => s.id === 's6')?.questions.find(q => q.id === 'q26')?.options || []
  const q41Options = sections.find(s => s.id === 's10')?.questions.find(q => q.id === 'q41')?.options || []

  return (
    <div className="flex flex-col gap-4 mb-6">
      <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search name, email, company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5 w-full sm:w-[220px]">
          <label className="text-xs font-medium text-muted-foreground">Investment Plans</label>
          <Select 
            value={searchParams.get('q13') as string || 'all'} 
            onValueChange={val => updateFilter('q13', val || 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Any Active Investment</SelectItem>
              {q13Options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1.5 w-full sm:w-[220px]">
          <label className="text-xs font-medium text-muted-foreground">POL Interest</label>
          <Select 
            value={searchParams.get('q26') as string || 'all'} 
            onValueChange={val => updateFilter('q26', val || 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {q26Options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1.5 w-full sm:w-[220px]">
          <label className="text-xs font-medium text-muted-foreground">Follow-up</label>
          <Select 
            value={searchParams.get('q41') as string || 'all'} 
            onValueChange={val => updateFilter('q41', val || 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {q41Options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {Array.from(searchParams.keys()).some(k => ['search', 'q13', 'q26', 'q41', 'q5', 'from', 'to'].includes(k)) && (
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => router.push('/admin/responses')} className="text-muted-foreground mb-[2px]">
              <X className="mr-2 h-4 w-4" /> Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
