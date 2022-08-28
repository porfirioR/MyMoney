import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, orderBy, Query, query, setDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CollectionType } from '../enums/collection-type.enum';
import { ResourceType } from '../enums/resource-type.enum';
import { CategoryModel } from '../models/category.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: CollectionType = CollectionType.Categories
  private email!: string

  constructor(private readonly firestore: Firestore, private readonly router: Router, private readonly userService: UserService) {
    // onAuthStateChanged(getAuth(), (user) => {
    //   if (user) {
    //     this.email = this.userService.getUserEmail()
    //   } else {
    //     this.router.navigate([''])
    //   }
    // })
  }

  public getAll = (): Observable<CategoryModel[]> => {
    this.email = this.userService.getUserEmail()
    if (!this.email) {
      this.router.navigate([''])
    }
    const ref = query(this.getReference(), where('owner', 'in', [ ResourceType.ownerSystem, this.email ]), orderBy('type'))
    return collectionData<CategoryModel>(ref as Query<CategoryModel>, { idField: 'id' })
  }

  public delete = (id: string): Promise<void> => {
    const ref = doc(this.firestore, `${this.categories}/${id}`)
    return deleteDoc(ref)
  }

  public create = (model: CategoryModel): Promise<DocumentReference> => {
    model.owner = this.email
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
