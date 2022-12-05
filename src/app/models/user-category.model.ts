import { DocumentData, DocumentReference } from "firebase/firestore";

export class UserCategoryModel {
  constructor(
    public active: boolean,
    public categoryId: string,
    public email?: string,
    public id?: string,
    public category?: DocumentReference<DocumentData>,
    public color: string = '#000000',
    public backgroundColor: string = '#ffffff',
    public order: number = 0,
  ) { }
}
