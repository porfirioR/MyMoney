import { Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { LanguageType } from './enums/language-type.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected title = environment.title

  constructor(private readonly translate: TranslateService, private dateAdapter: DateAdapter<Date>) {
    this.translate.addLangs([LanguageType.English, LanguageType.Spanish])
    const navigatorLanguage = navigator.language
    let systemLanguage = Object.values(LanguageType).find(x => navigatorLanguage === x || navigatorLanguage.startsWith(`${x}-`))
    systemLanguage = systemLanguage ?? LanguageType.English
    this.translate.setDefaultLang(systemLanguage)
    this.translate.use(systemLanguage)
    this.dateAdapter.setLocale(systemLanguage)
  }
}
