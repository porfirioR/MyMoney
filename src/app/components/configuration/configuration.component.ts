import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, take } from 'rxjs';
import { ConfigurationService } from '../../services/configuration.service';
import { UserService } from '../../services/user.service';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { ConfigurationModel } from '../../models/configuration.model';
import { ConfigurationForm } from '../../forms/configuration.form';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  protected numberType = NumberType
  protected languages = LanguageType
  protected amount = 1000000000
  protected loading = true
  protected date = new Date()
  protected formGroup: FormGroup<ConfigurationForm> = new FormGroup<ConfigurationForm>({
    id: new FormControl(),
    number: new FormControl(this.numberType.English),
    language: new FormControl(this.languages.English),
  })

  constructor(
    private readonly configurationService: ConfigurationService,
    private translate: TranslateService,
    private userService: UserService,
    private readonly snackBar: MatSnackBar,
    private dateAdapter: DateAdapter<Date>,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userService.getUserConfiguration$().pipe(take(1),catchError((e) => {
      console.error(e)
        this.loading = false
        throw e
      })).subscribe({
      next: (config) => {
        this.formGroup.controls.id.setValue(config.id ?? null),
        this.formGroup.controls.number.setValue(config.number),
        this.formGroup.controls.language.setValue(config.language)
        this.loading = false
      }
    })
    this.formGroup.controls.language.valueChanges.pipe(catchError((e) => {
      console.error(e)
      throw e
    })).subscribe({
      next: (language) => {
        this.translate.setDefaultLang(language!)
        this.translate.use(language!)
        this.dateAdapter.setLocale(language)
      }
    })
  }

  protected exit = (): void => {
    this.router.navigate([''])
  }

  protected save = (): void => {
    const request: ConfigurationModel = this.formGroup.getRawValue()! as ConfigurationModel
    this.configurationService.upsert(request).then(() => {
      this.snackBar.open(this.translate.instant(`User configuration was ${request.id ? 'updated' : 'created'}`), '', { duration: 3000 })
      this.exit()
    }).catch(e => console.error(e))
  }
}
