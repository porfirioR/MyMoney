export interface CategoryMonthlyAmountModel {
  category: string
  total: number
  months: Record<string, number>
}

export interface AnnualReportExportModel {
  year: number
  generatedAt: string
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
  }
  categoriesByMonth: {
    expense: CategoryMonthlyAmountModel[]
    income: CategoryMonthlyAmountModel[]
  }
}
