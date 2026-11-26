import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, take } from 'rxjs';
import { CategoryType } from '../enums/category-type.enum';
import { RelatedProgressType } from '../enums/related-progress-type.enum';
import { SavingDirection } from '../enums/saving-direction.enum';
import { CategoryModel } from '../models/category.model';
import { ConfigurationModel } from '../models/configuration.model';
import { MoveToSavingPlanModel, MoveToSavingResultModel } from '../models/move-to-saving.model';
import { MovementModel } from '../models/movement.model';
import { UserCategoryModel } from '../models/user-category.model';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from '../constants/category.constants';
import { ConfigurationService } from './configuration.service';
import { HelperService } from './helper.service';
import { MovementService } from './movement.service';
import { RelatedMovementService } from './related-movement.service';
import { UserCategoryService } from './user-category.service';
import { UserService } from './user.service';

// Moves the movements of expense or income categories used as savings ("Ahorro", "Inversiones"...)
// to a saving category, keeping their ids so the related groups still find them
@Injectable({
  providedIn: 'root'
})
export class MoveToSavingService {
  // Names (translated or not, without accents) that suggest a category was used as a saving
  private static readonly savingWords = ['ahorro', 'saving', 'inversion', 'invest', 'cda', 'plazo fijo', 'fixed-term', 'fondo mutuo', 'mutual fund', 'interes', 'interest', 'rendimiento', 'yield']
  private static readonly yieldWords = ['interes', 'interest', 'rendimiento', 'yield']
  // Ids of the system saving categories (scripts/seed-saving-categories.mjs) and the words that point to each one
  private static readonly targetWords: [string, string[]][] = [
    ['system-saving-home', ['casa', 'home']],
    ['system-saving-cda', ['cda']],
    ['system-saving-fixed-term', ['plazo', 'fixed']],
    ['system-saving-mutual-fund', ['fondo', 'fund']],
    ['system-saving-scheduled', ['programado', 'scheduled']],
    ['system-saving-rotating', ['rueda', 'rotating']],
    ['system-saving-stocks-bonds', ['accion', 'bono', 'stock', 'bond', 'inversion', 'invest']]
  ]
  private static readonly defaultTargetId = 'system-saving-free'
  // Each movement is two operations (create in saving, delete the old one) and a batch accepts 500
  private static readonly movementsPerBatch = 250

  constructor(
    private readonly movementService: MovementService,
    private readonly relatedMovementService: RelatedMovementService,
    private readonly userService: UserService,
    private readonly userCategoryService: UserCategoryService,
    private readonly configurationService: ConfigurationService,
    private readonly translateService: TranslateService
  ) { }

  public isSavingLike = (category: CategoryModel): boolean => this.hasWord(category, MoveToSavingService.savingWords)

  // Every expense and income category (also hidden ones), the ones that look like savings first
  public getCandidates = (): CategoryModel[] => {
    const candidates = this.userService.getAllCategories().filter(x => !HelperService.isSaving(x.type))
    const name = (x: CategoryModel) => this.translateService.instant(x.name) as string
    return candidates.sort((a, b) => Number(this.isSavingLike(b)) - Number(this.isSavingLike(a)) || name(a).localeCompare(name(b)))
  }

  public getSavingCategories = (): CategoryModel[] =>
    this.userService.getAllCategories().filter(x => HelperService.isSaving(x.type) && x.active)

  public suggestTarget = (category: CategoryModel, savingCategories: CategoryModel[]): CategoryModel | undefined => {
    const match = MoveToSavingService.targetWords.find(([, words]) => this.hasWord(category, words))
    const targetId = match?.[0] ?? MoveToSavingService.defaultTargetId
    return savingCategories.find(x => x.id === targetId)
      ?? savingCategories.find(x => x.id === MoveToSavingService.defaultTargetId)
      ?? savingCategories[0]
  }

  // Expenses were money put in the saving; incomes, money taken out (or interest it earned)
  public suggestDirection = (category: CategoryModel, target?: CategoryModel): SavingDirection => {
    if (HelperService.isExpense(category.type)) {
      return SavingDirection.Deposit
    }
    return target?.earnsInterest && this.hasWord(category, MoveToSavingService.yieldWords) ? SavingDirection.Yield : SavingDirection.Withdrawal
  }

  public countMovements = async (category: CategoryModel): Promise<number> =>
    (await this.getMovements(category)).length

  // Shown once in the main screen: only when an active category looks like a saving and there is where to move it
  public shouldShowNotice = (): boolean => {
    const configuration = this.userService.item?.userConfiguration
    return !configuration?.moveToSavingDismissed
      && this.getSavingCategories().length > 0
      && this.userService.getActiveCategories().some(x => !HelperService.isSaving(x.type) && this.isSavingLike(x))
  }

  public dismissNotice = async (): Promise<void> => {
    const current = this.userService.item!.userConfiguration
    // Firestore does not accept undefined fields
    const configuration = Object.fromEntries(
      Object.entries({ ...current, moveToSavingDismissed: true }).filter(([, value]) => value !== undefined)
    ) as unknown as ConfigurationModel
    const reference = await this.configurationService.upsert(configuration)
    configuration.id = configuration.id ?? reference?.id
    this.userService.setConfiguration(configuration)
  }

  // The groups are updated before the movements: if something fails, running it again finds the same
  // movements in the old category and repeats both steps without duplicating anything
  public migrate = async (plans: MoveToSavingPlanModel[]): Promise<MoveToSavingResultModel> => {
    const result = new MoveToSavingResultModel()
    for (const plan of plans) {
      const movements = await this.getMovements(plan.category)
      if (movements.length === 0) { continue }
      await this.updateGroups(movements.map(x => x.id!), result)
      await this.moveMovements(movements, plan)
      result.movements += movements.length
    }
    return result
  }

  // Hiding keeps the old categories (and their colors and order); they only stop being offered
  public hideCategories = async (categories: CategoryModel[]): Promise<void> => {
    for (const category of categories) {
      const userCategory = this.userService.getUserCategories().find(x => x.categoryId === category.id)
      const request = new UserCategoryModel(
        false,
        category.id,
        this.userService.getUserEmail(),
        userCategory?.id,
        undefined,
        userCategory?.color ?? category.color ?? DEFAULT_ICON_COLOR,
        userCategory?.backgroundColor ?? category.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
        userCategory?.order ?? category.order ?? 0,
        userCategory?.budget ?? category.budget ?? null
      )
      const reference = await this.userCategoryService.upsertCategory(request)
      if (reference) {
        request.id = reference.id
      }
      this.userService.setUserCategory(request)
      this.userService.setCategoryActive(category.id, false)
    }
  }

  private getMovements = (category: CategoryModel): Promise<MovementModel[]> =>
    firstValueFrom(this.movementService.getMovementsByCategoryId(category.type, category.id).pipe(take(1)))

  // Groups with only moved movements become saving groups (same name and goal); the others keep the links
  private updateGroups = async (movementIds: string[], result: MoveToSavingResultModel): Promise<void> => {
    const moved = new Set(movementIds)
    const groups = await firstValueFrom(this.relatedMovementService.getAll().pipe(take(1)))
    const affected = groups.filter(x => x.related.some(y => moved.has(y.id)))
    if (affected.length === 0) { return }
    const batch = this.relatedMovementService.openBatch()
    affected.forEach(group => {
      const related = group.related.map(x => ({ id: x.id, type: moved.has(x.id) ? CategoryType.saving : x.type }))
      const onlySavings = related.every(x => HelperService.isSaving(x.type))
      batch.update(this.relatedMovementService.getReferenceById(group.id!), onlySavings
        ? { related, progressType: RelatedProgressType.Saving }
        : { related })
      if (onlySavings) {
        result.savingGroups.add(group.name)
      } else {
        result.mixedGroups.add(group.name)
      }
    })
    await batch.commit()
  }

  // Same id, date, amount and memorandum; only the type, category, icon and direction change
  private moveMovements = async (movements: MovementModel[], plan: MoveToSavingPlanModel): Promise<void> => {
    for (let i = 0; i < movements.length; i += MoveToSavingService.movementsPerBatch) {
      const batch = this.movementService.openBatch()
      movements.slice(i, i + MoveToSavingService.movementsPerBatch).forEach(movement => {
        const { id, date, color, backgroundColor, categoryName, ...stored } = movement
        const saving: MovementModel = {
          ...stored,
          type: CategoryType.saving,
          categoryId: plan.target.id,
          icon: plan.target.icon,
          amount: Math.abs(movement.amount),
          direction: plan.direction
        }
        batch.set(this.movementService.getMovementDocumentReferenceById(CategoryType.saving, id!), saving)
        batch.delete(this.movementService.getMovementDocumentReferenceById(plan.category.type, id!))
      })
      await batch.commit()
    }
  }

  private hasWord = (category: CategoryModel, words: string[]): boolean => {
    const names = [category.name, this.translateService.instant(category.name) as string].map(this.normalize)
    return words.some(word => names.some(name => name.includes(word)))
  }

  private normalize = (text: string): string => (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
