import { Injectable } from '@angular/core';
import { CategoryType } from '../enums/category-type.enum';
import { MonthType } from '../enums/month-type.enum';
import { CategoryModel } from '../models/category.model';
import { YearMonthModel } from '../models/year-month-model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

constructor() { }

  public static categoriesByType = (categories: CategoryModel[], type: CategoryType): CategoryModel[] => {
    categories.sort((a, b) => a.order - b.order)
    return categories.filter(x => x.type.toLocaleLowerCase() ===  type.toLowerCase())
  }

  public static convertStringToMonthType = (value: string): MonthType => Number.parseInt(Object.entries(MonthType).find(([key, val]) => val === value)![0])

  public static getSearchMessage = (): YearMonthModel => {
    const date = new Date();
    return new YearMonthModel(date.getFullYear(), date.getMonth())
  }
}
