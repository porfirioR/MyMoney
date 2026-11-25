// What happened with the savings of a period (or of all time)
export class SavingTotalsModel {
  constructor(
    public deposited: number = 0,
    public withdrawn: number = 0,
    public yields: number = 0
  ) { }

  // Money that left the available money: yields stay inside the saving, so they do not count
  public get saved(): number {
    return this.deposited - this.withdrawn
  }

  // How much is kept in the saving
  public get balance(): number {
    return this.deposited - this.withdrawn + this.yields
  }

  public get isEmpty(): boolean {
    return this.deposited === 0 && this.withdrawn === 0 && this.yields === 0
  }
}
