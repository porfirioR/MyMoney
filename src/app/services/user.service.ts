import { Injectable } from '@angular/core';
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

  public getUserEmail = (): string => this.item.email

  public getAllCategories = (): CategoryModel[] => this.item.allCategories

  public setUser = (user: UserDataModel): void => {
    this.setItem(user)
  }

  public setCategories = (allCategories: CategoryModel[], userCategories: UserCategoryModel[]): CategoryModel[] => {
    const ignoreSystemCategories = userCategories.map(x => x.categoryId)
    const activeCategories = allCategories.filter(x => !ignoreSystemCategories.includes(x.id))
    const item = this.item
    item.allCategories = allCategories
    item.activeCategories = activeCategories
    this.setItem(item)
    return activeCategories
  }

  public getActiveCategories =() => this.item.activeCategories

}
