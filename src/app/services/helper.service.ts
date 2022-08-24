import { Injectable } from '@angular/core';
import { CategoryType } from '../enums/category-type.enum';
import { CategoryModel } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

constructor() { }

  public static categoriesByType = (categories: CategoryModel[], type: CategoryType): CategoryModel[] => {
    categories.sort((a, b) => b.owner.localeCompare(a.owner))
    return categories.filter(x => x.type === type)
  }
}
