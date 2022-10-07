import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected title = environment.title

  constructor(private readonly translate: TranslateService) {
    translate.addLangs(['en', 'es'])
    translate.setDefaultLang('en')
    translate.use('en')
  }
}
