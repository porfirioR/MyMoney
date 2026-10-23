import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';
import { combineLatest, firstValueFrom, take } from 'rxjs';
import { UserService } from '../services/user.service';
import { CategoryService } from '../services/category.service';
import { UserCategoryService } from '../services/user-category.service';
import { ConfigurationService } from '../services/configuration.service';
import { LanguageService } from '../services/language.service';
import { ThemeService } from '../services/theme.service';
import { NotificationService } from '../services/notification.service';
import { UserDataModel } from '../models/user-data.model';
import { ConfigurationModel } from '../models/configuration.model';
import { LanguageType } from '../enums/language-type.enum';
import { NumberType } from '../enums/number-type.enum';

@Injectable({
  providedIn: 'root'
})
export class UserGuard  {
  constructor(
    private readonly auth: Auth,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly userCategoryService: UserCategoryService,
    private readonly configurationService: ConfigurationService,
    private readonly languageService: LanguageService,
    private readonly themeService: ThemeService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) { }

  // Waits for Firebase to restore the session, so reloading any screen keeps the user on it
  async canActivate(): Promise<boolean | UrlTree> {
    const user = await firstValueFrom(authState(this.auth))
    if (!user?.email) {
      return this.router.parseUrl('/logout')
    }
    const item = this.userService.item
    if (item?.email === user.email && item.allCategories.length > 0) {
      return true
    }
    try {
      await this.loadUserData(user)
      return true
    } catch (e) {
      this.notificationService.error(e)
      return false
    }
  }

  // Categories and configuration are loaded once per session; the screens read them from UserService
  private loadUserData = async (user: User): Promise<void> => {
    const userData: UserDataModel = {
      email: user.email!,
      activeCategories: [],
      allCategories: [],
      userCategories: [],
      photo: user.photoURL,
      displayName: user.displayName ?? '',
      userConfiguration: new ConfigurationModel(this.languageService.current ?? LanguageType.English, NumberType.English)
    }
    userData.userConfiguration.email = user.email!
    this.userService.setUser(userData)
    const [categories, userCategories, configuration] = await firstValueFrom(combineLatest([
      this.categoryService.getAll().pipe(take(1)),
      this.userCategoryService.getUserCategories().pipe(take(1)),
      this.configurationService.getConfiguration().pipe(take(1))
    ]))
    userCategories.forEach(x => x.categoryId = x.category!.path.split('/').pop()!)
    if (configuration) {
      this.userService.setConfiguration(configuration)
      // Waits for the texts: mat-select does not refresh its selected label when the translation arrives later
      await this.languageService.use(configuration.language)
      if (configuration.theme) {
        this.themeService.use(configuration.theme)
      }
    }
    this.userService.setCategories(categories, userCategories)
  }
}
