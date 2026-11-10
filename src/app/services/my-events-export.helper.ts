import {
  MY_EVENTS_EXPORT_FORMAT,
  MY_EVENTS_EXPORT_VERSION,
  MyEventsExportModel,
  MyEventsMovementType,
} from '../models/my-events-export.model'

// Plain data (no Angular): what the Firestore collections return
export interface MyEventsExportSource {
  categories: { id: string, name: string, type: string, active?: boolean }[]
  movements: { id?: string, type: string, categoryId: string, time: number, amount: number, memorandum?: string }[]
  relatedGroups: { id?: string, name: string, progressType?: string, totalAmount: number, related: { id: string }[] }[]
  // Inclusive range as local dates (YYYY-MM-DD)
  from: string
  to: string
  timezone: string
  exportedAt: Date
}

export class MyEventsExportHelper {
  static build(source: MyEventsExportSource): MyEventsExportModel {
    const movements = source.movements
      .filter(m => !!m.id)
      .map(m => ({
        id: m.id!,
        date: MyEventsExportHelper.toLocalDate(m.time),
        type: MyEventsExportHelper.toType(m.type),
        categoryId: m.categoryId,
        amount: Math.abs(m.amount),
        memorandum: (m.memorandum ?? '').trim(),
      }))
      .filter(m => m.date >= source.from && m.date <= source.to)
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

    const movementIds = new Set(movements.map(m => m.id))
    const usedCategoryIds = new Set(movements.map(m => m.categoryId))

    // Active categories always; inactive ones only if they have movements in the range
    const categories = source.categories
      .filter(c => c.active !== false || usedCategoryIds.has(c.id))
      .map(c => ({ id: c.id, name: c.name, type: MyEventsExportHelper.toType(c.type), active: c.active !== false }))
      .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))

    const relatedGroups = source.relatedGroups
      .filter(g => !!g.id)
      .map(g => ({
        id: g.id!,
        name: g.name,
        progressType: g.progressType ?? '',
        totalAmount: g.totalAmount ?? 0,
        movementIds: g.related.map(r => r.id).filter(id => movementIds.has(id)),
      }))
      .filter(g => g.movementIds.length > 0)

    return {
      format: MY_EVENTS_EXPORT_FORMAT,
      version: MY_EVENTS_EXPORT_VERSION,
      exportedAt: source.exportedAt.toISOString(),
      timezone: source.timezone,
      currency: 'PYG',
      from: source.from,
      to: source.to,
      categories,
      movements,
      relatedGroups,
    }
  }

  // Local date of the browser (the user's timezone), never UTC: 23:00 of the 31st stays in that month
  static toLocalDate(value: number | Date): string {
    const date = new Date(value)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }

  // Movements store 'Expense'/'Income' and categories 'expense'/'income'
  private static toType(type: string): MyEventsMovementType {
    return (type ?? '').toLowerCase() === 'income' ? 'income' : 'expense'
  }
}
