import { Injectable } from '@angular/core';
import { UserDataModel } from '../models/user-data.model';
import { ItemObservable } from '../observables/item.observable';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ItemObservable<UserDataModel> {

  constructor() {
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

  public setUserValues = (user: UserDataModel): void => {
    this.setItem(user)
  }

}
