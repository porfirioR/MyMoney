import { Injectable } from '@angular/core';
import { CategoryType } from '../enums/category-type.enum';
import { MonthType } from '../enums/month-type.enum';
import { CategoryModel } from '../models/category.model';
import { YearMonthModel } from '../models/year-month-model';
import { ConfigurationModel } from '../models/configuration.model';
import { NumberType } from '../enums/number-type.enum';
import { RelatedMapModel } from '../models/related-map-model';

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

  public static getMarkValues = (configuration: ConfigurationModel | undefined): [string, string] => {
    const englishMarkConfiguration: [string, string] = ['separator.0', ',']
    const spanishMarkConfiguration: [string, string] = ['separator,0', '.']
    return configuration && configuration.number === NumberType.Spanish ? spanishMarkConfiguration : englishMarkConfiguration
  }

  public static getRelatedMovementToSave = (relatedList: RelatedMapModel[]): Record<string, string>[] => relatedList.map(y => {
    const relatedValue: Record<string, string> = {}
    relatedValue['id'] = y.id,
    relatedValue['type'] = y.type
    return relatedValue
  })
}
