// File read by my-events to import movements (my-events epic #213). Keep it backwards compatible:
// a breaking change needs a new version and the matching change in the my-events importer.
export const MY_EVENTS_EXPORT_FORMAT = 'mymoney-export'
export const MY_EVENTS_EXPORT_VERSION = 1

export type MyEventsMovementType = 'income' | 'expense'

export interface MyEventsExportCategoryModel {
  id: string
  name: string
  type: MyEventsMovementType
  active: boolean
}

export interface MyEventsExportMovementModel {
  // Firestore document id: lets my-events re-import without duplicating
  id: string
  // Local calendar date in `timezone` (YYYY-MM-DD), not UTC
  date: string
  type: MyEventsMovementType
  categoryId: string
  // Always positive; the type says whether it comes in or goes out
  amount: number
  memorandum: string
}

export interface MyEventsExportRelatedGroupModel {
  id: string
  name: string
  progressType: string
  totalAmount: number
  // Only the movements included in this file
  movementIds: string[]
}

export interface MyEventsExportModel {
  format: typeof MY_EVENTS_EXPORT_FORMAT
  version: typeof MY_EVENTS_EXPORT_VERSION
  exportedAt: string
  timezone: string
  currency: 'PYG'
  // The range is complete: a movement of the range missing from the file was deleted in MyMoney
  from: string
  to: string
  categories: MyEventsExportCategoryModel[]
  movements: MyEventsExportMovementModel[]
  relatedGroups: MyEventsExportRelatedGroupModel[]
}
