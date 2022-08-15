import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, doc, DocumentReference, Firestore, orderBy, Query, query, setDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CategoryType } from '../enums/category-type.enum';
import { CollectionType } from '../enums/collection-type.enum';
import { MovementModel } from '../models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private collections: CollectionType = CollectionType.Movements
  private email!: string

  constructor(private readonly firestore: Firestore, private readonly router: Router) {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        this.email = user.email as string
      } else {
        this.router.navigate([''])
      }
    })
  }

  public getBySelectedMonth = (category: CategoryType, month: number, year: number) => {
    const startDate = new Date(year, month, 1)
    startDate.setHours(0, 0, 0)
    const startTime = startDate.getTime()
    const endDate = new Date(year, month + 1, 0)
    endDate.setHours(23, 59, 59)
    const endTime = endDate.getTime()

    const ref = query(this.getReference(category), where('time', '>=', startTime), where('time', '<=', endTime), orderBy('time'))
    return collectionData<MovementModel>(ref as Query<MovementModel>, {idField: 'id'})
  }

  public create = (model: MovementModel): Promise<DocumentReference> => {
    return addDoc(this.getReference(model.type), model)
  }

  public update = (model: MovementModel): Promise<void> => {
    const ref = doc(this.firestore, `${this.collections}/${this.email}/${model.type.toLowerCase()}/${model.id}`)
    return setDoc(ref, model)
  }

  private getReference = (category: CategoryType): CollectionReference => {
    return collection(this.firestore, `${this.collections}/${this.email}/${category.toLowerCase()}`)
  };

}
