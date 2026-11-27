import { MovementModel } from '../models/movement.model';
import { HelperService } from './helper.service';

// What the user typed in a search box: words (description, category) or a number (amount)
export interface SearchQuery {
  // False while there is nothing to search yet: everything stays visible
  active: boolean
  // Words without accents and in lower case
  text: string
  // Only the digits, when the user typed a number ("50.000" → "50000")
  digits: string
}

// Text shorter than this shows everything: one letter matches almost every movement
const MIN_TEXT_LENGTH = 2

// Local search shared by the main screen, the reports and the category configuration.
// It only filters what the screen already loaded: it never reads from the database
export class SearchHelper {
  // "Café" and "cafe", or "AHORRO" and "ahorro", are the same for the search
  static normalize(value: string | null | undefined): string {
    return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  }

  static parse(value: string | null | undefined): SearchQuery {
    const text = SearchHelper.normalize(value)
    // Only numbers and thousand/decimal separators: it is an amount
    if (/^[\d\s.,]+$/.test(text) && /\d/.test(text)) {
      return { active: true, text, digits: text.replace(/\D/g, '') }
    }
    return { active: text.length >= MIN_TEXT_LENGTH, text, digits: '' }
  }

  // Words are searched inside any of the texts (description, translated category name...)
  static matchesText(query: SearchQuery, ...texts: (string | null | undefined)[]): boolean {
    if (!query.active || query.digits) { return false }
    return texts.some(x => SearchHelper.normalize(x).includes(query.text))
  }

  // Numbers are searched inside the amount without separators: "50000" finds 50.000 and 150.000
  static matchesAmount(query: SearchQuery, amount: number): boolean {
    if (!query.active || !query.digits) { return false }
    return String(Math.round(Math.abs(amount))).includes(query.digits)
  }

  static matchesMovement(query: SearchQuery, movement: MovementModel, categoryName: string): boolean {
    return SearchHelper.matchesAmount(query, movement.amount) || SearchHelper.matchesText(query, movement.memorandum, categoryName)
  }

  // A total only makes sense when every result is of the same type (adding incomes and expenses means nothing).
  // Savings add up their effect on the balance (withdrawals subtract)
  static getTotal(movements: MovementModel[]): number | null {
    if (movements.length === 0) { return null }
    const type = movements[0].type.toLowerCase()
    if (movements.some(x => x.type.toLowerCase() !== type)) { return null }
    return movements.reduce((total, x) => total + (HelperService.isSaving(x.type) ? HelperService.getSavingEffect(x) : x.amount), 0)
  }
}
