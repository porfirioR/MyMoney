import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryType } from '../../enums/category-type.enum';
import { CategoryGroupIconType } from '../../enums/category-group-icon-type.enum';
import { IconType } from '../../enums/icon-type.enum';
import { NewCategoryModel } from '../../models/new-category.model';
import { NewCategoryGroupModel } from '../../models/new-category-group.model';
import { CategoryModel } from '../../models/category.model';
import { UserCategoryModel } from '../../models/user-category.model';
import { CategoryService } from '../../services/category.service';
import { UserCategoryService } from '../../services/user-category.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss'],
})
export class NewCategoryComponent implements OnInit {
  @ViewChild("inputCategoryName") inputCategoryName?: ElementRef;
  protected title!: string
  protected currentCategory: NewCategoryModel = new NewCategoryModel(
    CategoryType.income,
    [
      new NewCategoryGroupModel(CategoryGroupIconType.Food, [
        IconType.FastFood, IconType.Cake, IconType.Coffee, IconType.Pizza,
        IconType.Restaurant, IconType.Smoking, IconType.RestaurantMenu, IconType.Bar,
        IconType.SportsBar, IconType.BakeryDining
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Transport, [
        IconType.Gas, IconType.Train, IconType.Toys, IconType.Airport,
        IconType.Bike, IconType.Bus, IconType.Bus2, IconType.Car, IconType.Taxi,
        IconType.Shipping
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Shopping, [
        IconType.ShoppingCart, IconType.Mall, IconType.CreditCard, IconType.Offer,
        IconType.Monetization, IconType.Store, IconType.Savings, IconType.Receipt,
        IconType.CurrencyExchange, IconType.Luggage, IconType.Payment, IconType.Loyalty,
        IconType.Wallet, IconType.BalanceWallet
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Entertainment, [
        IconType.Movie, IconType.Casino, IconType.Pool, IconType.Golf, IconType.Fitness,
        IconType.Sports, IconType.Tennis, IconType.Surfing, IconType.Baseball,
        IconType.Roller
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Maps, [
        IconType.Beach, IconType.Ice, IconType.Mountain, IconType.Place,
        IconType.MyLocation, IconType.Map, IconType.Event, IconType.Parking,
        IconType.Church, IconType.Flag
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Medical, [
        IconType.Hospital, IconType.Pharmacy, IconType.Recycling, IconType.Mask
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Family, [
        IconType.Marry, IconType.Child, IconType.Baby, IconType.Pregnant,
        IconType.Diversity, IconType.People, IconType.Spa, IconType.Hotel,
        IconType.Home, IconType.Florist, IconType.Old, IconType.OldWoman,
        IconType.Man, IconType.Woman, IconType.Transgender
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Electronic, [
        IconType.Tv, IconType.Print, IconType.Computer, IconType.Kitchen,
        IconType.Camera, IconType.Sync, IconType.Wifi, IconType.Sms,
        IconType.Sd, IconType.Power, IconType.Phone, IconType.Bluetooth,
        IconType.Post, IconType.Phone2, IconType.Encryption, IconType.Security,
        IconType.Rotate, IconType.Headphones, IconType.PhoneAndroid, IconType.Keyboard
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Education, [
        IconType.School, IconType.City, IconType.Library,
        IconType.Book, IconType.Poll, IconType.Business, IconType.Inclusive,
        IconType.Pdf, IconType.Attach_file, IconType.Calculate
      ]),
    ]
  )
  protected formGroup!: FormGroup

  constructor(protected location: Location,
              protected route: ActivatedRoute,
              private categoryService: CategoryService,
              private snackBar: MatSnackBar,
              private readonly userCategoryService: UserCategoryService,
              private userService: UserService) { }

  ngOnInit() {
    this.route.params.subscribe({
      next: (value) => {
        const type = value['type']
        this.title = `Add ${type} category`
        this.currentCategory
        this.formGroup = new FormGroup({
          name: new FormControl('', Validators.required),
          icon: new FormControl(this.currentCategory.groups[0].icons[0], Validators.required),
          type: new FormControl(type, Validators.required),
          active: new FormControl(true),
          owner: new FormControl(this.userService.getUserEmail())
        })
      }
    })
  }

  protected exit = () => {
    this.location.back()
  }

  protected updateIcon = (icon: IconType) => {
    this.formGroup.get('icon')?.setValue(icon)
    this.inputCategoryName?.nativeElement.focus()
  }

  protected save = () => {
    const category: CategoryModel = this.formGroup.getRawValue()
    this.categoryService.create(category).then((result) => {
      const userCategory = new UserCategoryModel(category.active, result.id)
      this.userCategoryService.upsertCategory(userCategory).then((response) => {
        category.id = response!.id
        this.snackBar.open('Category was created', '', { duration: 3000 })
        this.userService.setCategory(category)
        this.location.back()
      })
    })
  }
}
