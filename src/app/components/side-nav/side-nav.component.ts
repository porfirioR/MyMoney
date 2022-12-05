import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NavItemModel } from '../../models/nav-item.model';
import { UserDataModel } from '../../models/user-data.model';
import { ConfigurationModel } from '../../models/configuration.model';
import { ItemAction } from '../../enums/item-action.enum';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  protected navItems: NavItemModel[] = [
    new NavItemModel('dashboard', 'Category', ItemAction.category),
    new NavItemModel('launch', 'Export', ItemAction.export),
    new NavItemModel('cloud_upload', 'Import', ItemAction.import),
    new NavItemModel('stars', 'About us', ItemAction.aboutUs),
    new NavItemModel('build', 'Configuration', ItemAction.configuration),
  ];
  protected displayName: string = ''
  protected photo!: SafeUrl

  constructor(
    private auth: AuthService,
    protected router: Router,
    private readonly userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getItemObservable$.subscribe({
      next: (user) => {
        this.photo = user.photo!,
        this.displayName = user.displayName
      }, error: (e) => {
        console.error(e);
        throw e;
      }
    })
  }

  protected performItemAction = (action: ItemAction) => {
    this.router.navigate([action])
  }

  protected logout = () => {
    this.auth.logOut().then(() => {
      const userData: UserDataModel = {
        email: '',
        activeCategories: [],
        allCategories: [],
        userCategories: [],
        photo: null,
        displayName: '',
        userConfiguration: new ConfigurationModel(LanguageType.English, NumberType.English,'')
      }
      this.userService.setUser(userData)
      this.router.navigate(['logout'])
    })
    .catch(error => console.error(error))
  }
  
}
