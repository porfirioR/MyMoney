import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryModel } from '../models/category.model';
import { UserCategoryModel } from '../models/user-category.model';
import { UserDataModel } from '../models/user-data.model';
import { ItemObservable } from '../observables/item.observable';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ItemObservable<UserDataModel> {

  constructor(private readonly router: Router) {
    const initial: UserDataModel = {
      activeCategories: [],
      allCategories: [],
      email: ''
    }
    super(initial)
  }

  public getUserEmail = (): string => {
    return this.Item.email
  }

  public getAllCategories = (): CategoryModel[] => {
    return this.Item.allCategories
  }

  public setUserValues = (user: UserDataModel): void => {
    this.setItem(user)
  }

  public setCategories = (allCategories: CategoryModel[], userCategories: UserCategoryModel[]): CategoryModel[] => {
    const ignoreSystemCategories = userCategories.map(x => x.categoryId)
    const activeCategories = allCategories.filter(x => !ignoreSystemCategories.includes(x.id))
    const item = this.Item
    item.allCategories = allCategories
    item.activeCategories = activeCategories
    this.setItem(item)
    return activeCategories
  }

  public getActiveCategories =() => {
    const categories = this.Item.activeCategories
    if (categories.length === 0) {
      this.router.navigate([''])
    }
    return categories
  }
}
