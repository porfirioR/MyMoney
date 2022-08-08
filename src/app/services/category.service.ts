import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentReference } from '@angular/fire/compat/firestore';
import { filter, map, Observable } from 'rxjs';
import { CategoryType } from '../enums/category-type.enum';
import { CollectionType } from '../enums/collection';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: CollectionType = CollectionType.Categories;

constructor(private readonly db: AngularFirestore) { }

  public getAll = (): Observable<CategoryModel[]> => {
    return this.db.collection<CategoryModel>(this.categories).snapshotChanges().pipe(map((x: DocumentChangeAction<CategoryModel>[]) => {
      const categoryList = x.map(y => {
        const category = y.payload.doc.data() as CategoryModel
        category.id = y.payload.doc.id
        return category
      })
      return categoryList.sort((a, b) => a.type.localeCompare(b.type))
    }))
  }

  public delete = (id: string): Promise<void> => {
    return this.db.collection<CategoryModel>(this.categories).doc(id).delete()
  }

  public create = (model: CategoryModel): Promise<DocumentReference<CategoryModel>> => {
    return this.db.collection<CategoryModel>(this.categories).add(model)
  }

  public update = (model: CategoryModel): Promise<void> => {
    return this.db.collection<CategoryModel>(this.categories).doc(model.id).set(model)
  }

}

