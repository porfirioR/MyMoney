export class FilterRelatedMovementModel {
  constructor(
    public categoryIds: string[],
    public month: number,
    public year: number
  ) { }
}
