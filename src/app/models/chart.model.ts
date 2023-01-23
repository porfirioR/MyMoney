import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";

export class ChartModel {
  public data!: ChartConfiguration

  constructor(
    public type: ChartType,
    public labels: string[],
    public chartOptions: ChartOptions,
    public legend: boolean
  ) { }
}
