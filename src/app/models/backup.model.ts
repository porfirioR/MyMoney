import { CategoryModel } from './category.model'
import { MovementModel } from './movement.model'
import { RelatedMovementModel } from './related-movement.model'

export const BACKUP_FORMAT = 'mymoney-backup'
export const BACKUP_VERSION = 1

// Collection name of each movement type (movements/{email}/{income|expense|saving})
export type BackupMovementType = 'income' | 'expense' | 'saving'
export const BACKUP_MOVEMENT_TYPES: BackupMovementType[] = ['income', 'expense', 'saving']

// Everything of one account, to copy it into another one (or the same one).
// Emails are left out: on import every document gets the email of the account that imports it
export interface BackupModel {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  // Own categories only: system categories have the same id in every account
  categories: BackupCategoryModel[]
  // Color, order, budget and visibility of every category (system ones too)
  userCategories: BackupUserCategoryModel[]
  // Each movement keeps its id, so its groups still point to it after the import
  movements: Record<BackupMovementType, BackupMovementModel[]>
  relatedMovements: BackupRelatedMovementModel[]
}

export type BackupCategoryModel = Omit<CategoryModel, 'owner'>

export interface BackupUserCategoryModel {
  categoryId: string
  active: boolean
  color: string
  backgroundColor: string
  order: number
  budget: number | null
}

export type BackupMovementModel = Omit<MovementModel, 'date'> & { id: string }

export type BackupRelatedMovementModel = Omit<RelatedMovementModel, 'owner'> & { id: string }

// What an import is going to write, shown before confirming it
export interface BackupPlanModel {
  backup: BackupModel
  // Own categories of the file that do not exist in this account
  categoriesToCreate: { id: string, data: Omit<CategoryModel, 'id'> }[]
  // Own categories of the file already in this account (same id, a previous import or the same name and type)
  categoriesFound: number
  // Category id of the file → category id in this account
  categoryIds: Map<string, string>
  // User data of each category; id is the existing user_categories document, missing when it has to be created
  userCategories: { id?: string, data: BackupUserCategoryModel }[]
  movements: Record<BackupMovementType, number>
  // Movements whose category is neither a system category nor in the file: they keep the id they had
  movementsWithoutCategory: number
  // Group id in this account; exists = true when the group is already here and is overwritten
  groups: { id: string, exists: boolean, data: BackupRelatedMovementModel }[]
}
