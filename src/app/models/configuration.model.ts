import { LanguageType } from "../enums/language-type.enum";
import { NumberType } from "../enums/number-type.enum";
import { ThemeType } from "../enums/theme-type.enum";

export class ConfigurationModel {
  public email!: string
  // Missing in configurations saved before dark mode existed: the device preference is kept
  public theme?: ThemeType
  // The main screen stops suggesting to move the categories used as savings
  public moveToSavingDismissed?: boolean
  constructor(
    public language: LanguageType,
    public number: NumberType,
    public id?: string
  ) { }
}
