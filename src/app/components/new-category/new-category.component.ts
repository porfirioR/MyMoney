import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { NewCategoryModel } from '../../models/new-category.model';
import { NewCategoryGroupModel } from '../../models/new-category-group.model';
import { CategoryGroupIconType } from '../../enums/category-group-icon-type.enum';
import { IconType } from '../../enums/item-type.enum';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
})
export class NewCategoryComponent implements OnInit {
  protected type!: string;
  protected currentCategory: NewCategoryModel = new NewCategoryModel(
    CategoryType.expense,
    [
      new NewCategoryGroupModel(CategoryGroupIconType.Food, [
        IconType.Burger, IconType.Fries, IconType.Apple
      ])
    ]
  );

  constructor(protected location: Location, protected route: ActivatedRoute) {
    route.params.pipe(take(1)).subscribe({
      next: (value) => {
        this.type = value['type'];
      },
    });
  }

  ngOnInit() {}

  protected exit = () => {
    this.location.back();
  };
}
