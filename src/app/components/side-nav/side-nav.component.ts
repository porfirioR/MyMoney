import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemAction } from '../../enums/item-action.enum';
import { AuthService } from '../../services/auth.service';
import { NavItemModel } from '../../models/nav-item.model';
import { UserService } from '../../services/user.service';
import { UserDataModel } from '../../models/user-data.model';

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
  protected email: string = ''
  constructor(private auth: AuthService, protected router: Router, private readonly userService: UserService) {}

  ngOnInit() {
    this.email = this.userService.getUserEmail()
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
        userCategories: []
      }
      this.userService.setUser(userData)
      this.router.navigate(['logout'])
    })
    .catch(error => console.error(error))
  }
  
}
