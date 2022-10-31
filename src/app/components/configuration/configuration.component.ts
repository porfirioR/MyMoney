import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  protected numberType = NumberType
  protected languageType = LanguageType
  protected amount = 1000000000

  protected formGroup: FormGroup = new FormGroup({
    numberType: new FormControl(this.numberType.English),
    languageType: new FormControl(LanguageType.English),
  })
  constructor(
    private readonly location: Location,
    private readonly configurationService: ConfigurationService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.formGroup.controls['languageType'].valueChanges.subscribe({
      next: (language) => {
        this.translate.setDefaultLang(language)
        this.translate.use(language);
      }, error: (e) => {
        console.error(e)
        throw e;
      }
    })
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    console.log(this.formGroup.getRawValue());
    
    // this.location.back()

  }
}
