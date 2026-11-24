// What happened in a saving movement; values are also translation keys (saving-direction.*)
export enum SavingDirection {
  // Money put into the saving: it leaves what is available, but it is not an expense
  Deposit = 'deposit',
  // Money taken out of the saving: it comes back to what is available, but it is not an income
  Withdrawal = 'withdrawal',
  // What the saving earned (or lost, stored negative) while it stayed there
  Yield = 'yield'
}
