import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageType } from '../enums/language-type.enum';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private readonly translate: TranslateService, private readonly dateAdapter: DateAdapter<Date>) { }

  public get current(): LanguageType {
    return (this.translate.currentLang ?? this.translate.defaultLang) as LanguageType
  }

  // Texts, datepicker and the document language always change together
  public use = (language: LanguageType): void => {
    this.translate.setDefaultLang(language)
    this.translate.use(language)
    this.dateAdapter.setLocale(language)
    document.documentElement.lang = language
  }
}
