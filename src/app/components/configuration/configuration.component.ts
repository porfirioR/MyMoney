import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigurationService } from '../../services/configuration.service';
import { UserService } from '../../services/user.service';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { ThemeType } from '../../enums/theme-type.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { ConfigurationModel } from '../../models/configuration.model';
import { ConfigurationForm } from '../../forms/configuration.form';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  protected numberType = NumberType
  protected languages = LanguageType
  protected themes = Object.values(ThemeType)
  protected amount = 1000000000
  protected saving = false
  protected date = new Date()
  protected formGroup: FormGroup<ConfigurationForm> = new FormGroup<ConfigurationForm>({
    id: new FormControl(),
    number: new FormControl(this.numberType.English),
    language: new FormControl(this.languages.English),
    theme: new FormControl(ThemeType.System),
  })
  private savedLanguage = LanguageType.English
  private savedTheme = ThemeType.System
  private saved = false

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly userService: UserService,
    private readonly languageService: LanguageService,
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const config = this.userService.item!.userConfiguration
    this.savedLanguage = config.language
    this.formGroup.controls.id.setValue(config.id ?? null)
    this.formGroup.controls.number.setValue(config.number)
    this.formGroup.controls.language.setValue(config.language)
    this.savedTheme = this.themeService.preference
    this.formGroup.controls.theme.setValue(this.savedTheme)
    // The screen previews the chosen language and theme; they are undone on leave unless saved
    this.formGroup.controls.language.valueChanges.subscribe({
      next: (language) => this.languageService.use(language as LanguageType)
    })
    this.formGroup.controls.theme.valueChanges.subscribe({
      next: (theme) => this.themeService.use(theme!)
    })
  }

  ngOnDestroy(): void {
    if (this.saved) { return }
    if (this.languageService.current !== this.savedLanguage) {
      this.languageService.use(this.savedLanguage)
    }
    if (this.themeService.preference !== this.savedTheme) {
      this.themeService.use(this.savedTheme)
    }
  }

  protected exit = (): void => {
    this.router.navigate([''])
  }

  protected save = (): void => {
    if (this.formGroup.invalid || this.saving) { return }
    this.saving = true
    const request: ConfigurationModel = this.formGroup.getRawValue()! as ConfigurationModel
    this.configurationService.upsert(request).then((reference) => {
      request.id = request.id ?? reference?.id
      // The other screens read the configuration from memory, so it is updated right away
      this.userService.setConfiguration(request)
      this.saved = true
      this.notificationService.message(`User configuration was ${this.formGroup.value.id ? 'updated' : 'created'}`)
      this.exit()
    }).catch(e => {
      this.saving = false
      this.notificationService.error(e)
    })
  }
}
