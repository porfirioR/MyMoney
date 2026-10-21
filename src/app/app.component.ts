import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { LanguageType } from './enums/language-type.enum';
import { LanguageService } from './services/language.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected title = environment.title

  // ThemeService is injected here so the saved theme is applied before the first screen renders
  constructor(
    private readonly translate: TranslateService,
    private readonly languageService: LanguageService,
    private readonly themeService: ThemeService
  ) {
    this.translate.addLangs([LanguageType.English, LanguageType.Spanish])
    const navigatorLanguage = navigator.language
    let systemLanguage = Object.values(LanguageType).find(x => navigatorLanguage === x || navigatorLanguage.startsWith(`${x}-`))
    systemLanguage = systemLanguage ?? LanguageType.English
    this.languageService.use(systemLanguage)
  }
}
