export class FilterRelatedMovementModel {
  constructor(
    public categoryId: string[],
    public month: number,
    public year: number
  ) { }
}
