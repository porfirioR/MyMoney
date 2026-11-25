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
    // Only when the year has savings: deposited - withdrawn is what left the available money
    totalDeposited?: number
    totalWithdrawn?: number
    totalYields?: number
    totalSaved?: number
    available?: number
    savingBalanceAtYearEnd?: number
  }
  categoriesByMonth: {
    expense: CategoryMonthlyAmountModel[]
    income: CategoryMonthlyAmountModel[]
    // Effect of each month on the balance of each saving category
    saving?: CategoryMonthlyAmountModel[]
  }
}
