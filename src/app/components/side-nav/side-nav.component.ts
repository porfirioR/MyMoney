import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemAction } from '../../enums/item-action.enum';
import { AuthService } from '../../services/auth.service';
import { NavItemModel } from '../../models/nav-item.model';
import { UserService } from '../../services/user.service';
import { UserDataModel } from '../../models/user-data.model';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  protected navItems: NavItemModel[] = [
    new NavItemModel('dashboard', 'Category', ItemAction.categoryConfiguration),
    new NavItemModel('launch', 'Export', ItemAction.exportData),
    new NavItemModel('cloud_upload', 'Import', ItemAction.importData),
    new NavItemModel('stars', 'About us', ItemAction.showData),
  ];
  protected displayName: string = ''
  protected photo!: SafeUrl

  constructor(private auth: AuthService,
              protected router: Router,
              private readonly userService: UserService) {}

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
    switch (action) {
      case ItemAction.categoryConfiguration:
      case ItemAction.importData:
      case ItemAction.exportData:
        this.router.navigate([action]);
        break;
      default:
        break;
    }
  }

  protected logout = () => {
    this.auth.logOut().then(() => {
      const userData: UserDataModel = {
        email: '',
        activeCategories: [],
        allCategories: [],
        userCategories: [],
        photo: null,
        displayName: ''
      }
      this.userService.setUser(userData)
      this.router.navigate(['logout'])
    })
    .catch(error => console.error(error))
  }
  
}
