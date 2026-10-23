import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LanguageType } from '../enums/language-type.enum';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private readonly translate: TranslateService, private readonly dateAdapter: DateAdapter<Date>) { }

  public get current(): LanguageType {
    return (this.translate.currentLang ?? this.translate.defaultLang) as LanguageType
  }

  // Texts, datepicker and the document language always change together.
  // Resolves when the texts are loaded (or failed to), so a screen can wait for them before rendering
  public use = (language: LanguageType): Promise<void> => {
    this.translate.setDefaultLang(language)
    const loaded = firstValueFrom(this.translate.use(language)).then(() => undefined, () => undefined)
    this.dateAdapter.setLocale(language)
    document.documentElement.lang = language
    return loaded
  }
}
