import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CategoryModel } from '../models/category.model';
import { UserCategoryModel } from '../models/user-category.model';
import { UserDataModel } from '../models/user-data.model';
import { ItemObservable } from '../observables/item.observable';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ItemObservable<UserDataModel> {

  constructor() {
    super()
  }

  public getUserEmail = (): string => {
    return this.item!.email!
  }

  public getAllCategories = (): CategoryModel[] =>  {
    return this.item!.allCategories
  }

  public getAllCategories$ = (): Observable<CategoryModel[]> => {
    return this.getItemObservable$.pipe(map(x => x.allCategories))
  }

  public setUser = (user: UserDataModel): void => {
    this.setItem(user)
  }

  public setCategories = (allCategories: CategoryModel[], userCategories: UserCategoryModel[]): CategoryModel[] => {
    const ignoreSystemCategories = userCategories.map(x => x.categoryId)
    allCategories.forEach(x => x.active = ignoreSystemCategories.includes(x.id) ? userCategories.find(x => x.categoryId === x.id)?.active! : true)
    const activeCategories = allCategories.filter(x => x.active)
    const item = this.item!
    item.allCategories = allCategories
    item.activeCategories = activeCategories
    this.setItem(item)
    return activeCategories
  }

  public getActiveCategories = () => {
    return this.item!.activeCategories
  }

  public getActiveCategories$ = (): Observable<CategoryModel[]> => {
    return this.getItemObservable$.pipe(map(x => x.activeCategories))
  }

}
