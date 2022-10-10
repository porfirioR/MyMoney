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

  public setCategory = (category: CategoryModel): void => {
    const user = this.item!
    user!.allCategories = this.getAllCategories().concat(category)
    user!.activeCategories = this.getActiveCategories().concat(category)
    this.setUser(user)
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
    const allUserCategories = userCategories.map(x => x.categoryId)
    allCategories.forEach(x => x.active = allUserCategories.includes(x.id) ? userCategories.find(y => y.categoryId === x.id)?.active!: true)
    const activeCategories = allCategories.filter(x => x.active)
    const item = this.item!
    item.allCategories = allCategories
    item.activeCategories = activeCategories,
    item.userCategories = userCategories
    this.setItem(item)
    return activeCategories
  }

  public getActiveCategories = () => {
    return this.item!.activeCategories
  }

  public getActiveCategories$ = (): Observable<CategoryModel[]> => {
    return this.getItemObservable$.pipe(map(x => x.activeCategories))
  }

  public getUserCategories = (): UserCategoryModel[] => {
    return this.item?.userCategories!
  }

  public getUserCategories$ = (): Observable<UserCategoryModel[]> => {
    return this.getItemObservable$.pipe(map(x => x.userCategories))
  }

}
