import { DocumentData, DocumentReference } from "firebase/firestore";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_ICON_COLOR } from "../constants/category.constants";

export class UserCategoryModel {
  constructor(
    public active: boolean,
    public categoryId: string,
    public email?: string,
    public id?: string,
    public category?: DocumentReference<DocumentData>,
    public color: string = DEFAULT_ICON_COLOR,
    public backgroundColor: string = DEFAULT_BACKGROUND_COLOR,
    public order: number = 0,
    // Monthly spending limit of expense categories; null when there is none
    public budget: number | null = null,
  ) { }
}
