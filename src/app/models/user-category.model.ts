import { CollectionType } from "../enums/collection-type.enum"

export class UserCategoryModel {
  public category!: string

  constructor(public active: boolean, public categoryId: string, public email?: string, public id?: string) {
    this.category = `/${CollectionType.Categories}/${categoryId}`
  }
}
