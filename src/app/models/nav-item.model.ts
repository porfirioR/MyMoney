import { ItemAction } from "../enums/item-action.enum";

export class NavItemModel {

  constructor(
    public icon: string,
    public name: string,
    public action: ItemAction) {
    
  }
  
}
