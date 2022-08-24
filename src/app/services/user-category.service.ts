import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, doc, DocumentData, DocumentReference, Firestore, orderBy, Query, query, setDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CollectionType } from '../enums/collection-type.enum';
import { UserCategoryRequest } from '../models/user-category-request.model';
import { UserCategoryModel } from '../models/user-category.model';

@Injectable({
  providedIn: 'root'
})
export class UserCategoryService {
  protected email!: string;
  private userCategoryType: CollectionType = CollectionType.UserCategories

  private userCategories: UserCategoryModel[] = []

  constructor(private readonly firestore: Firestore, private readonly router: Router) {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        this.email = user.email as string
      } else {
        this.router.navigate([''])
      }
    })
  }

  public upsertCategory = (userCategory: UserCategoryModel): Promise<void> | Promise<DocumentReference<DocumentData>>   => {
    const request = new UserCategoryRequest(userCategory.active, userCategory.category, this.email)
    const model = this.userCategories.find(x => x.categoryId == userCategory.categoryId)
    if (model) {
      const ref = doc(this.firestore, `${this.userCategoryType}/${model.id}`)
      return setDoc(ref, request)
    } else {
      return addDoc(this.getReference(), request)
    }
  }

  protected getUserCategories = (): Observable<UserCategoryModel[]> => {
    const ref = query(this.getReference(), where('email', '==', this.email), orderBy('active'))
    return collectionData<UserCategoryModel>(ref as Query<UserCategoryModel>, { idField: 'id' })
  }

  private getReference = (): CollectionReference => {
    return collection(this.firestore, this.userCategoryType)
  }
}
