import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemAction } from '../../enums/item-action.enum';
import { AuthService } from '../../services/auth.service';
import { NavItemModel } from '../../models/nav-item.model';

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

  constructor(private auth: AuthService, protected router: Router) {}

  ngOnInit() {}

  protected performItemAction = (action: ItemAction) => {
    switch (action) {
      case ItemAction.categoryConfiguration:
      case ItemAction.importData:
        this.router.navigate([action]);
        break;
      default:
        break;
    }
  }

  protected logout = () => {
    this.auth.logOut()
    .then(() => this.router.navigate(['']))
    .catch(error => console.log(error))
  }
  
}
