import { LanguageType } from "../enums/language-type.enum";
import { NumberType } from "../enums/number-type.enum";

export class ConfigurationModel {
  public email!: string
  constructor(
    public language: LanguageType,
    public number: NumberType,
    public id?: string
  ) { }
}
