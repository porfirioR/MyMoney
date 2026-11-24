import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentData, documentId, DocumentReference, Firestore, orderBy, Query, query, QueryConstraint, setDoc, where, WriteBatch, writeBatch } from '@angular/fire/firestore';
import { combineLatest, firstValueFrom, map, Observable, of, take } from 'rxjs';
import { CategoryType } from '../enums/category-type.enum';
import { CollectionType } from '../enums/collection-type.enum';
import { MovementModel } from '../models/movement.model';
import { UserService } from './user.service';
import { FilterRelatedMovementModel } from '../models/filter-related-movement.model';
import { HelperService } from './helper.service';
import { RelatedMapModel } from '../models/related-map-model';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private collections: CollectionType = CollectionType.Movements
  private movementList: MovementModel[] = []

  constructor(private readonly firestore: Firestore, private readonly userService: UserService) { }

  public getBySelectedMonth = (category: CategoryType, month: number, year: number): Observable<MovementModel[]> => {
    const [startTime, endTime] = this.getDateTimeRange(month, year)

    const ref = query(this.getReference(category), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
    return collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
  }

  public getBySelectedYear = (category: CategoryType, year: number): Observable<MovementModel[]> => {
    const startDate = new Date(+year, 0, 1)
    startDate.setHours(0, 0, 0)
    const startTime = startDate.getTime()
    const endDate = new Date(+year, 11, 31)
    endDate.setHours(23, 59, 59)
    const endTime = endDate.getTime()

    const ref = query(this.getReference(category), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
    return collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
  }

  public create = (model: MovementModel): Promise<DocumentReference> => {
    return addDoc(this.getReference(model.type), model)
  }

  public update = (model: MovementModel): Promise<void> => {
    const ref = doc(this.firestore, `${this.collections}/${this.userService.getUserEmail()}/${model.type.toLowerCase()}/${model.id}`)
    return setDoc(ref, model)
  }

  public delete = (id: string, type: CategoryType): Promise<void> => {
    const ref = this.getMovementDocumentReferenceById(type, id)
    return deleteDoc(ref)
  }

  public getMovementById = (id: string): MovementModel | undefined  => {
    return this.movementList.find(x => x.id === id)
  }

  public setMovementList = (movementList: MovementModel[]): void => {
    this.movementList = movementList
  }

  public deleteMovementForList = (id: string): void => {
    this.movementList = this.movementList.filter(x => x.id !== id)
  }

  // Used when the screen is reloaded and the movement is not in the list of the main screen
  public getMovementByIdFromServer = async (id: string): Promise<MovementModel | undefined> => {
    const [expenses, incomes, savings] = await firstValueFrom(combineLatest([
      this.getMovementsByIds(CategoryType.expense, [id]),
      this.getMovementsByIds(CategoryType.income, [id]),
      this.getMovementsByIds(CategoryType.saving, [id])
    ]))
    const movement = [...expenses, ...incomes, ...savings][0]
    if (movement) {
      movement.date = new Date(movement.time)
      this.movementList = [...this.movementList.filter(x => x.id !== id), movement]
    }
    return movement
  }

  public openBatch = (): WriteBatch => {
    return writeBatch(this.firestore)
  }

  public getReference = (category: CategoryType): CollectionReference => {
    return collection(this.firestore, `${this.collections}/${this.userService.getUserEmail()}/${category.toLowerCase()}`)
  }

  public getMovementToExport = (category: CategoryType, startDate: Date, endDate: Date): Observable<MovementModel[]> => {
    startDate.setHours(0, 0, 0)
    const startTime = startDate.getTime()
    endDate.setHours(23, 59, 59)
    const endTime = endDate.getTime()

    const ref = query(this.getReference(category), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
    return collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
  }

  public getMovementsByCategoryId = (category: CategoryType, categoryId: string): Observable<MovementModel[]> => {
    const ref = query(this.getReference(category), where('categoryId', '==', categoryId), orderBy('time'))
    return collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
  }

  public getMovementDocumentReferenceById = (type: CategoryType, id: string): DocumentReference<DocumentData> =>
    doc(this.firestore, `${this.collections}/${this.userService.getUserEmail()}/${type.toLowerCase()}/${id}`)

  // Firestore 'in' queries accept up to 30 values, so long groups are fetched in chunks
  public getMovementsByIds = (category: CategoryType, movementIds: string[]): Observable<MovementModel[]> => {
    const chunkSize = 30
    const ids = [...new Set(movementIds)]
    if (ids.length === 0) {
      return of([])
    }
    const requests$: Observable<MovementModel[]>[] = []
    for (let i = 0; i < ids.length; i += chunkSize) {
      const ref = query(this.getReference(category), where(documentId(), 'in', ids.slice(i, i + chunkSize)))
      requests$.push(collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' }).pipe(take(1)))
    }
    return combineLatest(requests$).pipe(map(x => x.flat()))
  }

  // The movements of a related group, each read from the collection of its type
  public getMovementsByRelated = (related: (RelatedMapModel | Record<string, string>)[]): Observable<MovementModel[]> => {
    const idsOf = (type: CategoryType) => related.filter(x => (x.type ?? '').toLowerCase() === type.toLowerCase()).map(x => x.id)
    // Old groups may store the type with another case: anything that is not a saving or an expense is an income
    const incomeIds = related
      .filter(x => !HelperService.isExpense(x.type) && !HelperService.isSaving(x.type))
      .map(x => x.id)
    return combineLatest([
      this.getMovementsByIds(CategoryType.expense, idsOf(CategoryType.expense)),
      this.getMovementsByIds(CategoryType.income, incomeIds),
      this.getMovementsByIds(CategoryType.saving, idsOf(CategoryType.saving))
    ]).pipe(take(1), map(x => x.flat()))
  }

  // Without categories it returns every movement of the range of the given types; without a range, every date
  public getGetMovementByFilter = (
    request: FilterRelatedMovementModel,
    types: CategoryType[] = [CategoryType.income, CategoryType.expense]
  ): Observable<MovementModel[]> => {
    const byType = (type: CategoryType): Observable<MovementModel[]> => {
      const constraints: QueryConstraint[] = []
      if (request.categoryIds.length > 0) {
        // System categories store 'Expense'/'Income' and own ones 'expense'/'income'
        const typeIds = this.userService.getActiveCategories().filter(x => x.type.toLowerCase() === type.toLowerCase()).map(x => x.id)
        const ids = request.categoryIds.filter(x => typeIds.includes(x))
        if (ids.length === 0) {
          return of([])
        }
        constraints.push(where('categoryId', 'in', ids))
      }
      if (request.startTime !== undefined && request.endTime !== undefined) {
        constraints.push(where('time', '>=', request.startTime), where('time', '<=', request.endTime))
      }
      const ref = query(this.getReference(type), ...constraints, orderBy('time'))
      return collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' }).pipe(take(1))
    }
    return combineLatest(types.map(byType)).pipe(map(x => x.flat()))
  }

  public getMonthTimeRange = (month: number, year: number): [number, number] => this.getDateTimeRange(month, year)

  public getYearTimeRange = (year: number): [number, number] => {
    const startDate = new Date(year, 0, 1)
    startDate.setHours(0, 0, 0)
    const endDate = new Date(year, 11, 31)
    endDate.setHours(23, 59, 59)
    return [startDate.getTime(), endDate.getTime()]
  }

  private getDateTimeRange = (month: number, year: number): [number, number] => {
    const startDate = new Date(year, month, 1)
    startDate.setHours(0, 0, 0)
    const startTime = startDate.getTime()
    const endDate = new Date(+year, +month + 1, 0)
    endDate.setHours(23, 59, 59)
    const endTime = endDate.getTime()

    return [startTime, endTime]
  }
}
