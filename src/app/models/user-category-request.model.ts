import { DocumentReference } from "firebase/firestore";

export interface UserCategoryRequest {
  category: DocumentReference
  active: boolean
  email: string
  order: number
  color: string
  backgroundColor: string
  // Monthly spending limit; null when the category has none
  budget: number | null
}
