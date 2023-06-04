import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, doc, DocumentData, DocumentReference, Firestore, orderBy, Query, query, setDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CollectionType } from '../enums/collection-type.enum';
import { UserCategoryRequest } from '../models/user-category-request.model';
import { UserCategoryModel } from '../models/user-category.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserCategoryService {
  private userCategoryType: CollectionType = CollectionType.UserCategories

  constructor(
    private readonly firestore: Firestore,
    private readonly userService: UserService
  ) { }

  public upsertCategory = async (userCategory: UserCategoryModel): Promise<void | DocumentReference<DocumentData>> => {
    const request: UserCategoryRequest = {
      active: userCategory.active,
      email: userCategory.email!,
      category: doc(this.firestore, `${CollectionType.Categories}/${userCategory.categoryId}`),
      backgroundColor: userCategory.backgroundColor,
      color: userCategory.color,
      order: userCategory.order
    }
    request.category = doc(this.firestore, `${CollectionType.Categories}/${userCategory.categoryId}`)
    const model = this.userService.getUserCategories().find(x => x.categoryId == userCategory.categoryId)
    if (model) {
      const ref = doc(this.firestore, `${this.userCategoryType}/${model.id}`)
      return await setDoc(ref, request)
    } else {
      return await addDoc(this.getReference(), {...request})
    }
  }

  public getUserCategories = (): Observable<UserCategoryModel[]> => {
    const ref = query(this.getReference(), where('email', '==', this.userService.getUserEmail()), orderBy('active'))
    return collectionData<UserCategoryModel>(ref as Query<UserCategoryModel>, { idField: 'id' })
  }

  private getReference = (): CollectionReference => {
    return collection(this.firestore, this.userCategoryType)
  }

  public getUserCategoryReferenceById = (id: string): DocumentReference<DocumentData> => doc(this.firestore, `${this.userCategoryType}/${id}`)
}
