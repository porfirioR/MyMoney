import { IconType } from "../enums/icon-type.enum";
import { MovementModel } from "./movement.model";

export class GroupMovementCategoryModel {

  constructor(
    public categoryName: string,
    public icon: IconType,
    public color: string,
    public backgroundColor: string,
    public amount: number = 0,
    public movements: MovementModel[] = []
  ) { }
}
