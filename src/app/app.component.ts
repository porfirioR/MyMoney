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
    this.translate.setDefaultLang(LanguageType.English)
    this.translate.use(LanguageType.English)
    this.dateAdapter.setLocale(LanguageType.English)
  }
}
