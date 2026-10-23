import { Component, Input, OnInit } from '@angular/core';
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
  @Input() year?: number

  protected navItems: NavItemModel[] = [
    new NavItemModel('home', 'Home', ItemAction.home),
    new NavItemModel('dashboard', 'Category', ItemAction.category),
    new NavItemModel('group_work', 'Related Mov.', ItemAction.relatedMovements),
    // Hidden for now, together with their routes in app.routing.ts
    // new NavItemModel('launch', 'Export', ItemAction.export),
    // new NavItemModel('cloud_upload', 'Import', ItemAction.import),
    new NavItemModel('assignment', 'Annual Report', ItemAction.annualReport),
    new NavItemModel('stars', 'About us', ItemAction.aboutUs),
    new NavItemModel('build', 'Configuration', ItemAction.configuration),
  ];
  protected displayName: string = ''
  protected photo!: SafeUrl

  constructor(
    private auth: AuthService,
    protected router: Router,
    private readonly userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getItemObservable$.subscribe({
      next: (user) => {
        this.photo = user.photo!,
        this.displayName = user.displayName
      }
    })
  }

  // The menu lives inside each screen, so the current URL tells which item is open
  protected isActive = (action: ItemAction): boolean => {
    const path = this.router.url.split(/[?#]/)[0]
    return action === ItemAction.home ? path === '/' : path === `/${action}` || path.startsWith(`/${action}/`)
  }

  protected performItemAction = (action: ItemAction) => {
    // Screens without a year of their own open the report on the year being viewed
    const year = this.year ?? this.userService.getSelectedYearMonth().year
    const url = action === ItemAction.annualReport ? `${action}/${year}` : action
    this.router.navigate([url])
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
