import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, debounceTime, filter } from 'rxjs';
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
  @ViewChild("inputCategoryName") inputCategoryName?: ElementRef
  protected title!: string
  private categoryNames: string[] = []
  protected currentCategory: NewCategoryModel = new NewCategoryModel(
    CategoryType.income,
    [
      new NewCategoryGroupModel(CategoryGroupIconType.Food, [
        IconType.FastFood, IconType.Cake, IconType.Coffee, IconType.Pizza,
        IconType.Restaurant, IconType.Smoking, IconType.RestaurantMenu, IconType.Bar,
        IconType.SportsBar, IconType.BakeryDining, IconType.RoomService
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Transport, [
        IconType.Gas, IconType.Train, IconType.Toys, IconType.Airport,
        IconType.Bike, IconType.Bus, IconType.Bus2, IconType.Car, IconType.Taxi,
        IconType.Shipping, IconType.DirectionsBoat
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Shopping, [
        IconType.ShoppingCart, IconType.Mall, IconType.CreditCard, IconType.Offer,
        IconType.Monetization, IconType.Store, IconType.Savings, IconType.Receipt,
        IconType.CurrencyExchange, IconType.Luggage, IconType.Payment, IconType.Loyalty,
        IconType.Wallet, IconType.BalanceWallet, IconType.Key
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Entertainment, [
        IconType.Movie, IconType.Casino, IconType.Pool, IconType.Golf, IconType.Fitness,
        IconType.Sports, IconType.Tennis, IconType.Surfing, IconType.Baseball,
        IconType.Roller, IconType.Audiotrack, IconType.ColorLens, IconType.HotTub
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Maps, [
        IconType.Beach, IconType.Ice, IconType.Mountain, IconType.Place,
        IconType.MyLocation, IconType.Map, IconType.Event, IconType.Parking,
        IconType.Church, IconType.Flag, IconType.Cloud
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Medical, [
        IconType.Hospital, IconType.Pharmacy, IconType.Recycling, IconType.Mask
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Family, [
        IconType.Marry, IconType.Child, IconType.Baby, IconType.Pregnant,
        IconType.Diversity, IconType.People, IconType.Spa, IconType.Hotel,
        IconType.Home, IconType.Florist, IconType.Old, IconType.OldWoman,
        IconType.Man, IconType.Woman, IconType.Transgender, IconType.Pets
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Electronic, [
        IconType.Tv, IconType.Print, IconType.Computer, IconType.Kitchen,
        IconType.Camera, IconType.Sync, IconType.Wifi, IconType.Sms,
        IconType.Sd, IconType.Power, IconType.Phone, IconType.Bluetooth,
        IconType.Post, IconType.Phone2, IconType.Encryption, IconType.Security,
        IconType.Rotate, IconType.Headphones, IconType.PhoneAndroid, IconType.Keyboard,
        IconType.Cast, IconType.CastConnected, IconType.Memory
      ]),
      new NewCategoryGroupModel(CategoryGroupIconType.Education, [
        IconType.School, IconType.City, IconType.Library,
        IconType.Book, IconType.Poll, IconType.Business, IconType.Inclusive,
        IconType.Pdf, IconType.Attach_file, IconType.Calculate,
        IconType.NewFolder, IconType.Folder
      ])
    ]
  )
  protected formGroup!: FormGroup
  protected sameName: boolean = false

  constructor(
    protected location: Location,
    protected route: ActivatedRoute,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private readonly userCategoryService: UserCategoryService,
    private userService: UserService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
    combineLatest([this.route.params, this.userService.getAllCategories$()]).subscribe({
      next: ([value, categories]) => {
        const type = value['type']
        this.title = this.translateService.instant('category-messages.add', {type: this.translateService.instant(type)})
        this.currentCategory
        this.formGroup = new FormGroup({
          name: new FormControl('', Validators.required),
          icon: new FormControl(this.currentCategory.groups[0].icons[0], Validators.required),
          type: new FormControl(type, Validators.required),
          active: new FormControl(true),
          owner: new FormControl(this.userService.getUserEmail())
        })
        this.categoryNames = categories.map(x => x.name.toLowerCase())
      }
    })
    this.formGroup.controls['name'].valueChanges.pipe(debounceTime(500), filter(x => x.length > 3)).subscribe({
      next: (name) => {
        if (this.categoryNames.includes(name.toLowerCase()) || this.categoryNames.includes(`${this.translateService.instant(name.toLowerCase())} ${this.translateService.instant('(user)')}`)) {
          this.formGroup.controls['name'].setErrors({'sameName': true})
          this.formGroup.controls['name'].markAsTouched()
        }
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
    this.categoryService.create(category).then((categoryReference) => {
      const userCategoryModel = new UserCategoryModel(category.active, categoryReference.id, category.owner)
      this.userCategoryService.upsertCategory(userCategoryModel).then((userCategoryReference) => {
        category.id = categoryReference!.id
        userCategoryModel.id = userCategoryReference?.id
        this.snackBar.open(this.translateService.instant('category-messages.created'), '', { duration: 3000 })
        this.userService.setCategory(category)
        this.userService.setUserCategory(userCategoryModel)
        this.location.back()
      })
    })
  }
}
