import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, orderBy, Query, query, setDoc, where, WriteBatch, writeBatch } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CategoryType } from '../enums/category-type.enum';
import { CollectionType } from '../enums/collection-type.enum';
import { MovementModel } from '../models/movement.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private collections: CollectionType = CollectionType.Movements
  private email!: string
  private movementList: MovementModel[] = []

  constructor(private readonly firestore: Firestore,
              private readonly userService: UserService) {
    this.email = this.userService.getUserEmail()
  }

  public getBySelectedMonth = (category: CategoryType, month: number, year: number) => {
    const startDate = new Date(year, month, 1)
    startDate.setHours(0, 0, 0)
    const startTime = startDate.getTime()
    const endDate = new Date(year, month + 1, 0)
    endDate.setHours(23, 59, 59)
    const endTime = endDate.getTime()

    const ref = query(this.getReference(category), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
    return collectionData<MovementModel>(ref as Query<MovementModel>, { idField: 'id' })
  }

  public create = (model: MovementModel): Promise<DocumentReference> => {
    return addDoc(this.getReference(model.type), model)
  }

  public update = (model: MovementModel): Promise<void> => {
    const ref = doc(this.firestore, `${this.collections}/${this.email}/${model.type.toLowerCase()}/${model.id}`)
    return setDoc(ref, model)
  }

  public delete = (id: string, type: CategoryType): Promise<void> => {
    const ref = doc(this.firestore, `${this.collections}/${this.email}/${type.toLowerCase()}/${id}`)
    return deleteDoc(ref)
  }

  public getMovementById = (id: string): MovementModel | undefined  => {
    return this.movementList.find(x => x.id === id)
  }

  public setMovementList = (movementList: MovementModel[]) => {
    this.movementList = movementList
  }

  public deleteMovementForList = (id: string): void => {
    this.movementList = this.movementList.filter(x => x.id === id)
  }

  public openBranch = (): WriteBatch => {
    return writeBatch(this.firestore)
  }

  private getReference = (category: CategoryType): CollectionReference => {
    return collection(this.firestore, `${this.collections}/${this.email}/${category.toLowerCase()}`)
  }

  public batchReference = (category: CategoryType): DocumentReference => {
    return doc(this.firestore, `${this.collections}/${this.email}/${category.toLowerCase()}`)
  }


}
