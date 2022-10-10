import { Component, OnInit } from '@angular/core';
import { CategoryModel } from '../../models/category.model';
import { Location } from '@angular/common'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { combineLatest, take } from 'rxjs';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {
  protected category?: CategoryModel
  protected formGroup: FormGroup = new FormGroup({
    color: new FormControl('', Validators.required),
    backgroundColor: new FormControl('#fff', Validators.required),
    order: new FormControl(0, Validators.min(0))
  })

  constructor(private readonly location: Location,
    private readonly userService: UserService,
    private readonly activatedRoute: ActivatedRoute,
    ) {
      combineLatest([this.activatedRoute.params,  this.userService.getActiveCategories$().pipe(take(1))]).subscribe({
        next: ([params, categories]) => {
          this.category = categories.find(x => x.id === params['id'])
          if (!this.category) {
            this.exit()
          }
        }, error: (e) => {
          throw e;
        }
      })
    }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
  }

}
