import ExcelJS from 'exceljs'
import type { SurveyResponse } from './types'
import { getLeadPriority } from './leads'
import { sections } from '@/lib/survey/questions'

function sanitizeCell(value: any): string {
  if (value === null || value === undefined) return ''
  let str = String(value)
  if (['=', '+', '-', '@'].includes(str[0])) {
    str = "'" + str
  }
  return str
}

function getColumns(scope: 'all' | 'leads') {
  const cols = []
  
  if (scope === 'leads') {
    cols.push({ key: 'priority', header: 'Priority' })
  }
  
  cols.push({ key: 'id', header: 'Response ID' })
  cols.push({ key: 'submittedAt', header: 'Submitted At' })
  
  sections.forEach(s => {
    s.questions.forEach(q => {
      cols.push({ key: q.id, header: `${q.id.toUpperCase()} - ${q.prompt}` })
      if (q.options?.includes('Other')) {
        cols.push({ key: `${q.id}_other`, header: `${q.id.toUpperCase()} - Other (text)` })
      }
    })
  })
  
  return cols
}

function getRows(responses: SurveyResponse[], scope: 'all' | 'leads') {
  return responses.map(r => {
    const row: Record<string, string> = {}
    
    if (scope === 'leads') {
      row['priority'] = getLeadPriority(r)
    }
    
    row['id'] = r.id
    row['submittedAt'] = new Date(r.submittedAt).toISOString()
    
    sections.forEach(s => {
      s.questions.forEach(q => {
        const val = r.answers[q.id]
        if (Array.isArray(val)) {
          row[q.id] = val.join('; ')
        } else {
          row[q.id] = val !== undefined ? String(val) : ''
        }
        
        if (q.options?.includes('Other')) {
          const otherVal = r.answers[`${q.id}_other`]
          row[`${q.id}_other`] = otherVal !== undefined ? String(otherVal) : ''
        }
      })
    })
    
    // Sanitize all string fields
    for (const k in row) {
      row[k] = sanitizeCell(row[k])
    }
    
    return row
  })
}

export async function generateCsv(responses: SurveyResponse[], scope: 'all' | 'leads'): Promise<string> {
  const cols = getColumns(scope)
  const rows = getRows(responses, scope)
  
  const escapeCsv = (str: string) => {
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = cols.map(c => escapeCsv(c.header)).join(',')
  
  const dataRows = rows.map(r => 
    cols.map(c => escapeCsv(r[c.key])).join(',')
  )
  
  // Add BOM for Excel UTF-8
  return '\uFEFF' + [headerRow, ...dataRows].join('\n')
}

export async function generateExcel(responses: SurveyResponse[], scope: 'all' | 'leads'): Promise<Buffer> {
  const cols = getColumns(scope)
  const rows = getRows(responses, scope)
  
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Responses', {
    views: [{ state: 'frozen', ySplit: 1 }]
  })
  
  sheet.columns = cols.map(c => ({
    header: c.header,
    key: c.key,
    width: Math.min(Math.max(c.header.length, 15), 50)
  }))
  
  // Format header
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  
  // Autofilter
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: cols.length }
  }
  
  // Add data
  rows.forEach(r => {
    sheet.addRow(r)
  })
  
  // Wrap text
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: 'top' }
    })
  })
  
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
