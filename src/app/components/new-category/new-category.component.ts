import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { CategoryType } from 'src/app/enums/category-type.enum';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit {
  protected type!: string;

  constructor(protected location: Location, protected route: ActivatedRoute) {
    route.params.pipe(take(1)).subscribe({
      next: (value) => {
        this.type = value['type'];
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
}
