export class FilterRelatedMovementModel {
  // Without a time range it searches every date
  constructor(
    public categoryIds: string[],
    public startTime?: number,
    public endTime?: number
  ) { }
}
