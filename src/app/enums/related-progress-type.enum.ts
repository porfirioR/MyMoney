// What counts as progress in a related movement group; values are also translation keys (related-progress.*)
export enum RelatedProgressType {
  Expense = 'expense',
  Income = 'income',
  Balance = 'balance',
  // Only saving movements: the deposits move towards the goal
  Saving = 'saving'
}
