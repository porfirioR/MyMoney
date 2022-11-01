import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { take } from 'rxjs';
import { ConfigurationModel } from 'src/app/models/configuration.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  protected numberType = NumberType
  protected language = LanguageType
  protected amount = 1000000000
  protected loading = true

  protected formGroup: FormGroup = new FormGroup({
    id: new FormControl(),
    number: new FormControl(this.numberType.English),
    language: new FormControl(this.language.English),
  })
  constructor(
    private readonly location: Location,
    private readonly configurationService: ConfigurationService,
    private translate: TranslateService,
    private userService: UserService,
    private readonly snackBar: MatSnackBar,
    ) { }

  ngOnInit() {
    this.userService.getUserConfiguration$().pipe(take(1)).subscribe({
      next: (config) => {
        this.formGroup.controls['id'].setValue(config.id),
        this.formGroup.controls['number'].setValue(config.number),
        this.formGroup.controls['language'].setValue(config.language)
        this.loading = false
      }, error: (e) => {
        console.error(e)
        this.loading = false
        throw e;
      }
    })
    this.formGroup.controls['language'].valueChanges.subscribe({
      next: (language) => {
        this.translate.setDefaultLang(language)
        this.translate.use(language)
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
    const request: ConfigurationModel = this.formGroup.getRawValue()
    this.configurationService.upsert(request).then(() => {
      this.snackBar.open(this.translate.instant(`User configuration was ${request.id ? 'updated' : 'created'}`), '', { duration: 3000 })
      this.location.back()
    }).catch(e => console.error(e))
  }
}
