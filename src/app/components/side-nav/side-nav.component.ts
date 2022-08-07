import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ItemAction } from 'src/app/enums/item-action.enum';
import { NavItemModel } from '../../models/nav-item.model';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  protected navItems: NavItemModel[] = [
    new NavItemModel('dashboard', 'Category', ItemAction.categoryConfiguration),
    new NavItemModel('launch', 'Export', ItemAction.exportData),
    new NavItemModel('stars', 'About us', ItemAction.showData)
  ]

  constructor(protected router: Router) { }

  ngOnInit() {
  }

  protected performItemAction = (action: ItemAction) => {
switch (action) {
  case ItemAction.categoryConfiguration:
    this.router.navigate([action])
    break;

  default:
    break;
}
  }
}
