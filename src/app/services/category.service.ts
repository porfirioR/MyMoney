import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, orderBy, Query, query, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CollectionType } from '../enums/collection-type.enum';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: CollectionType = CollectionType.Categories

  constructor(private readonly firestore: Firestore) {}

  public getAll = (): Observable<CategoryModel[]> => {
    const ref = query(this.getReference(), orderBy('type'))
    return collectionData<CategoryModel>(ref as Query<CategoryModel>, { idField: 'id' })
  }

  public delete = (id: string): Promise<void> => {
    const ref = doc(this.firestore, `${this.categories}/${id}`)
    return deleteDoc(ref)
  }

  public create = (model: CategoryModel): Promise<DocumentReference> => {
    return addDoc(this.getReference(), model)
  }

  public update = (model: CategoryModel): Promise<void> => {
    const ref = doc(this.firestore, `${this.categories}/${model.id}`)
    return setDoc(ref, model)
  }

  private getReference = (): CollectionReference => {
    return collection(this.firestore, this.categories)
  }
}
