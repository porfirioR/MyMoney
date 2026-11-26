import { Injectable } from '@angular/core';
import { collection, collectionData, doc, DocumentData, DocumentReference, Firestore, Query, writeBatch } from '@angular/fire/firestore';
import { firstValueFrom, take } from 'rxjs';
import { CollectionType } from '../enums/collection-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
import { CategoryModel } from '../models/category.model';
import { MovementModel } from '../models/movement.model';
import { UserCategoryRequest } from '../models/user-category-request.model';
import {
  BACKUP_FORMAT, BACKUP_MOVEMENT_TYPES, BACKUP_VERSION, BackupModel, BackupMovementModel, BackupMovementType,
  BackupPlanModel, BackupUserCategoryModel
} from '../models/backup.model';
import { CategoryService } from './category.service';
import { UserCategoryService } from './user-category.service';
import { RelatedMovementService } from './related-movement.service';
import { UserService } from './user.service';

// Firestore accepts up to 500 writes per batch
const BATCH_SIZE = 500

// Full copy of an account: export it to a JSON file and import that file into any account.
// Importing the same file again overwrites what the first import wrote instead of duplicating it:
// - movements keep their id (they live under the email of the account, so they never clash with the original)
// - own categories and groups are top-level documents of every user, so in another account they get a fixed
//   id made from the original id and the account (`{id}-{suffix}`), which a second import finds again
@Injectable({
  providedIn: 'root'
})
export class BackupService {
  constructor(
    private readonly firestore: Firestore,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly userCategoryService: UserCategoryService,
    private readonly relatedMovementService: RelatedMovementService
  ) { }

  public build = async (): Promise<BackupModel> => {
    const email = this.userService.getUserEmail()
    const [categories, userCategories, groups, ...movements] = await Promise.all([
      firstValueFrom(this.categoryService.getAll().pipe(take(1))),
      firstValueFrom(this.userCategoryService.getUserCategories().pipe(take(1))),
      firstValueFrom(this.relatedMovementService.getAll().pipe(take(1))),
      ...BACKUP_MOVEMENT_TYPES.map(type => this.getMovements(email, type))
    ])
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      categories: categories
        .filter(x => x.owner !== ResourceType.ownerSystem)
        .map(({ owner, budget, ...category }) => category),
      userCategories: userCategories.map(x => ({
        categoryId: x.category!.path.split('/').pop()!,
        active: x.active,
        color: x.color,
        backgroundColor: x.backgroundColor,
        order: x.order,
        budget: x.budget ?? null
      })),
      movements: {
        income: movements[0],
        expense: movements[1],
        saving: movements[2]
      },
      relatedMovements: groups.map(({ owner, ...group }) => ({ ...group, id: group.id! }))
    }
  }

  // Throws the translation key of the problem when the text is not a backup this version can import
  public parse = (text: string): BackupModel => {
    let backup: BackupModel
    try {
      backup = JSON.parse(text)
    } catch {
      throw new Error('backup-messages.invalid-file')
    }
    if (!backup || backup.format !== BACKUP_FORMAT) {
      throw new Error('backup-messages.invalid-file')
    }
    if (typeof backup.version !== 'number' || backup.version > BACKUP_VERSION) {
      throw new Error('backup-messages.newer-version')
    }
    const validId = (id: unknown): boolean => typeof id === 'string' && id.length > 0 && !id.includes('/')
    const valid = Array.isArray(backup.categories) && backup.categories.every(x => validId(x?.id) && typeof x.name === 'string' && typeof x.type === 'string')
      && Array.isArray(backup.userCategories) && backup.userCategories.every(x => validId(x?.categoryId))
      && !!backup.movements && BACKUP_MOVEMENT_TYPES.every(type => Array.isArray(backup.movements[type])
        && backup.movements[type].every(x => validId(x?.id) && validId(x.categoryId) && typeof x.time === 'number' && typeof x.amount === 'number'))
      && Array.isArray(backup.relatedMovements) && backup.relatedMovements.every(x => validId(x?.id) && Array.isArray(x.related))
    if (!valid) {
      throw new Error('backup-messages.invalid-file')
    }
    return backup
  }

  // Compares the file with what this account already has; nothing is written yet
  public plan = async (backup: BackupModel): Promise<BackupPlanModel> => {
    const email = this.userService.getUserEmail()
    const suffix = this.getAccountSuffix(email)
    const [categories, userCategories, groups] = await Promise.all([
      firstValueFrom(this.categoryService.getAll().pipe(take(1))),
      firstValueFrom(this.userCategoryService.getUserCategories().pipe(take(1))),
      firstValueFrom(this.relatedMovementService.getAll().pipe(take(1)))
    ])
    const categoryIds = new Map<string, string>()
    const existingIds = new Set(categories.map(x => x.id))
    const ownCategories = categories.filter(x => x.owner === email)
    const sameName = (a: CategoryModel | Omit<CategoryModel, 'owner'>, b: CategoryModel | Omit<CategoryModel, 'owner'>): boolean =>
      a.name.trim().toLowerCase() === b.name.trim().toLowerCase() && a.type.toLowerCase() === b.type.toLowerCase()
    const plan: BackupPlanModel = {
      backup,
      categoriesToCreate: [],
      categoriesFound: 0,
      categoryIds,
      userCategories: [],
      movements: { income: 0, expense: 0, saving: 0 },
      movementsWithoutCategory: 0,
      groups: []
    }

    backup.categories.forEach(category => {
      const copyId = `${category.id}-${suffix}`
      // Same account, a previous import, or one created by hand with the same name
      const found = [category.id, copyId].find(id => existingIds.has(id)) ?? ownCategories.find(x => sameName(x, category))?.id
      if (found) {
        categoryIds.set(category.id, found)
        plan.categoriesFound++
        return
      }
      const { id, ...data } = category
      plan.categoriesToCreate.push({ id: copyId, data: { ...data, owner: email } })
      categoryIds.set(category.id, copyId)
      existingIds.add(copyId)
    })

    const userCategoryIds = new Map(userCategories.map(x => [x.category!.path.split('/').pop()!, x.id!]))
    plan.userCategories = backup.userCategories
      .map(x => ({ ...x, categoryId: categoryIds.get(x.categoryId) ?? x.categoryId }))
      // Settings of categories that are not in this account (an unknown system category) are left out
      .filter(x => existingIds.has(x.categoryId))
      // Old accounts may have two settings for one category: the app uses the first one, so only that one is copied
      .filter((x, index, list) => list.findIndex(y => y.categoryId === x.categoryId) === index)
      .map(data => ({ id: userCategoryIds.get(data.categoryId), data }))

    BACKUP_MOVEMENT_TYPES.forEach(type => {
      plan.movements[type] = backup.movements[type].length
      plan.movementsWithoutCategory += backup.movements[type].filter(x => !existingIds.has(categoryIds.get(x.categoryId) ?? x.categoryId)).length
    })

    const groupIds = new Set(groups.map(x => x.id))
    plan.groups = backup.relatedMovements.map(data => {
      const id = groupIds.has(data.id) ? data.id : `${data.id}-${suffix}`
      return { id, exists: groupIds.has(id), data }
    })
    return plan
  }

  // Categories first, so a movement never points to a category that is not there yet.
  // When it stops halfway, importing the same file again finishes it without duplicating anything
  public import = async (plan: BackupPlanModel, progress: (done: number, total: number) => void): Promise<void> => {
    const email = this.userService.getUserEmail()
    const writes: [DocumentReference<DocumentData>, DocumentData][] = []

    plan.categoriesToCreate.forEach(x => writes.push([this.getDocument(CollectionType.Categories, x.id), x.data]))

    const userCategoryCollection = collection(this.firestore, CollectionType.UserCategories)
    plan.userCategories.forEach(({ id, data }) => {
      const request: UserCategoryRequest = {
        category: doc(this.firestore, `${CollectionType.Categories}/${data.categoryId}`),
        active: data.active,
        email,
        order: data.order,
        color: data.color,
        backgroundColor: data.backgroundColor,
        budget: data.budget ?? null
      }
      writes.push([id ? this.getDocument(CollectionType.UserCategories, id) : doc(userCategoryCollection), request])
    })

    BACKUP_MOVEMENT_TYPES.forEach(type => plan.backup.movements[type].forEach(movement => {
      const { id, ...data } = movement as BackupMovementModel & { date?: unknown }
      delete data.date
      data.categoryId = plan.categoryIds.get(data.categoryId) ?? data.categoryId
      writes.push([doc(this.firestore, `${CollectionType.Movements}/${email}/${type}/${id}`), data])
    }))

    plan.groups.forEach(({ id, data }) => {
      const { id: _, ...group } = data
      writes.push([this.getDocument(CollectionType.RelatedMovements, id), { ...group, owner: email }])
    })

    progress(0, writes.length)
    for (let i = 0; i < writes.length; i += BATCH_SIZE) {
      const batch = writeBatch(this.firestore)
      writes.slice(i, i + BATCH_SIZE).forEach(([reference, data]) => batch.set(reference, data))
      await batch.commit()
      progress(Math.min(i + BATCH_SIZE, writes.length), writes.length)
    }
    await this.reloadCategories()
  }

  // The screens read categories from memory, so the new ones and their colors are loaded again
  private reloadCategories = async (): Promise<void> => {
    const [categories, userCategories] = await Promise.all([
      firstValueFrom(this.categoryService.getAll().pipe(take(1))),
      firstValueFrom(this.userCategoryService.getUserCategories().pipe(take(1)))
    ])
    userCategories.forEach(x => x.categoryId = x.category!.path.split('/').pop()!)
    this.userService.setCategories(categories, userCategories)
  }

  private getMovements = (email: string, type: BackupMovementType): Promise<BackupMovementModel[]> => {
    const reference = collection(this.firestore, `${CollectionType.Movements}/${email}/${type}`)
    return firstValueFrom(collectionData<MovementModel>(reference as Query<MovementModel>, { idField: 'id' }).pipe(take(1)))
      .then(movements => movements.map(({ date, ...movement }) => movement as BackupMovementModel))
  }

  private getDocument = (collectionType: CollectionType, id: string): DocumentReference<DocumentData> =>
    doc(this.firestore, `${collectionType}/${id}`)

  // Short and always the same for one account (FNV-1a of the email), so copied documents get the same id on every import
  private getAccountSuffix = (email: string): string => {
    let hash = 0x811c9dc5
    for (const char of email.toLowerCase()) {
      hash ^= char.charCodeAt(0)
      hash = Math.imul(hash, 0x01000193)
    }
    return (hash >>> 0).toString(36)
  }
}
