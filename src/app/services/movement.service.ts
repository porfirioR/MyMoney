import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentData, documentId, DocumentReference, Firestore, orderBy, Query, query, setDoc, where, WriteBatch, writeBatch } from '@angular/fire/firestore';
import { combineLatest, concatAll, concatMap, forkJoin, map, Observable, of, take } from 'rxjs';
import { CategoryType } from '../enums/category-type.enum';
import { CollectionType } from '../enums/collection-type.enum';
import { MovementModel } from '../models/movement.model';
import { UserService } from './user.service';
import { FilterRelatedMovementModel } from '../models/filter-related-movement.model';

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
    this.movementList = this.movementList.filter(x => x.id === id)
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

  // Without categories it returns every movement of the month
  public getGetMovementByFilter = (request: FilterRelatedMovementModel): Observable<[MovementModel[], MovementModel[]]> => {
    if (request.categoryIds.length === 0) {
      return combineLatest([
        this.getBySelectedMonth(CategoryType.income, request.month, request.year),
        this.getBySelectedMonth(CategoryType.expense, request.month, request.year)
      ])
    }
    const [startTime, endTime] = this.getDateTimeRange(request.month, request.year)
    const hasExpenseIds = this.userService.getActiveCategories().filter(x => x.type === CategoryType.expense.toLocaleLowerCase()).map(x => x.id).some(x => request.categoryIds.includes(x))
    const hasIncomeIds = this.userService.getActiveCategories().filter(x => x.type === CategoryType.income.toLocaleLowerCase()).map(x => x.id).some(x => request.categoryIds.includes(x))
    let expenseRequest$: Observable<MovementModel[]> = of([])
    let incomeRequest$: Observable<MovementModel[]> = of([])
    if (hasExpenseIds) {
      const ref = query(this.getReference(CategoryType.expense), where('categoryId', 'in', request.categoryIds), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
      expenseRequest$ = collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
    }
    if (hasIncomeIds) {
      const ref = query(this.getReference(CategoryType.income), where('categoryId', 'in', request.categoryIds), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
      incomeRequest$ = collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
    }
    return combineLatest([incomeRequest$, expenseRequest$])
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
