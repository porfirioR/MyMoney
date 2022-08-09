import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { NewCategoryModel } from '../../models/new-category.model';
import { NewCategoryGroupModel } from '../../models/new-category-group.model';
import { CategoryGroupIconType } from '../../enums/category-group-icon-type.enum';
import { IconType } from '../../enums/icon-type.enum';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
})
export class NewCategoryComponent implements OnInit {
  protected type!: string;
  protected currentCategory: NewCategoryModel = new NewCategoryModel(
    CategoryType.income,
    [
      new NewCategoryGroupModel(CategoryGroupIconType.Food, [
        IconType.Cake, IconType.School,
        IconType.City, IconType.Spa, IconType.Smoking,
        IconType.Pool, IconType.Kitchen, IconType.HotTub,
        IconType.Golf, IconType.Coffee, IconType.Fitness,
        IconType.Child, IconType.Baby, IconType.Casino,
        IconType.Business, IconType.Beach, IconType.Inclusive,
        IconType.Bus, IconType.Bus2, IconType.Ice,
        IconType.Marry, IconType.Wifi, IconType.Car,
        IconType.Sync, IconType.Sms, IconType.Sd,
        IconType.Power, IconType.Phone, IconType.Tv,
        IconType.Encryption, IconType.Event, IconType.Mountain,
        IconType.Restaurant, IconType.Store, IconType.RestaurantMenu,
        IconType.Place, IconType.Money, IconType.MyLocation,
        IconType.Map, IconType.Taxi, IconType.Camera,
        IconType.Post, IconType.Print, IconType.Pizza,
        IconType.Pharmacy, IconType.Phone2,
        IconType.Offer, IconType.Movie, IconType.Mall,
        IconType.Library, IconType.Hotel, IconType.Hospital,
        IconType.Gas, IconType.Florist, IconType.Bar,
        IconType.Airport, IconType.FastFood, IconType.Bike,
        IconType.Monetization, IconType.Bluetooth, IconType.Book,
        IconType.Computer, IconType.Security, IconType.Toys,
        IconType.Rotate, IconType.Style, IconType.Group,
        IconType.People, IconType.Poll, IconType.Train,
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Transport, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Shopping, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Entertainment, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Fitness, [
        IconType.Cake, IconType.School,
        IconType.City, IconType.Spa, IconType.Smoking,
        IconType.Pool, IconType.Kitchen, IconType.HotTub,
        IconType.Golf, IconType.Coffee, IconType.Fitness,
        IconType.Child, IconType.Baby, IconType.Casino,
        IconType.Business, IconType.Beach, IconType.Inclusive,
        IconType.Bus, IconType.Bus2, IconType.Ice,
        IconType.Marry, IconType.Wifi, IconType.Car,
        IconType.Sync, IconType.Sms, IconType.Sd,
        IconType.Power, IconType.Phone, IconType.Tv,
        IconType.Encryption, IconType.Event, IconType.Mountain,
        IconType.Restaurant, IconType.Store, IconType.RestaurantMenu,
        IconType.Place, IconType.Money, IconType.MyLocation,
        IconType.Map, IconType.Taxi, IconType.Camera,
        IconType.Post, IconType.Print, IconType.Pizza,
        IconType.Pharmacy, IconType.Phone2,
        IconType.Offer, IconType.Movie, IconType.Mall,
        IconType.Library, IconType.Hotel, IconType.Hospital,
        IconType.Gas, IconType.Florist, IconType.Bar,
        IconType.Airport, IconType.FastFood, IconType.Bike,
        IconType.Monetization, IconType.Bluetooth, IconType.Book,
        IconType.Computer, IconType.Security, IconType.Toys,
        IconType.Rotate, IconType.Style, IconType.Group,
        IconType.People, IconType.Poll, IconType.Train,
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Medical, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Family, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Furniture, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Electronic, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Education, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Personal, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Life, []),
      new NewCategoryGroupModel(CategoryGroupIconType.Income, []),
    ]
  )
  protected formGroup!: FormGroup

  constructor(protected location: Location, protected route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe({
      next: (value) => {
        this.type = value['type']
        this.currentCategory
        this.formGroup = new FormGroup({
          categoryName: new FormControl('', Validators.required),
          icon: new FormControl(this.currentCategory.groups[0].icons[0], Validators.required),
          type: new FormControl(this.type, Validators.required)
        })
      }
    })
  }

  protected exit = () => {
    this.location.back()
  }

  protected updateIcon = (icon: IconType) => {
    this.formGroup.get('icon')?.setValue(icon)
  }
}
