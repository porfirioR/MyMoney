import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, combineLatestAll, combineLatestWith, concat, concatMap, endWith, forkJoin, merge, Observable, take, tap, timeout, zip } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { ExportRequestModel } from '../../models/export-request.model';
import { environment } from '../../../environments/environment';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';
import { MovementModel } from 'src/app/models/movement.model';

@Component({
  selector: 'app-export-movement',
  templateUrl: './export-movement.component.html',
  styleUrls: ['./export-movement.component.scss']
})
export class ExportMovementComponent implements OnInit {
  protected minDate = new Date('2015-01-01:00:00:00')
  protected loading = false
  protected formGroup: FormGroup = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    categories: new FormControl('', [Validators.required])
  })
  private temporal:MovementModel[] = []
  protected categories = CategoryType
  private request!: ExportRequestModel
  constructor(private readonly location: Location,
              private readonly userService: UserService,
              private readonly movementService: MovementService) { }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected export = () => {
    this.temporal = []
    this.loading = true
    this.request = this.formGroup.getRawValue() as ExportRequestModel
    const movements$ = this.request.categories.map(x => this.movementService.getMovementToExport(x, this.request.startDate, this.request.endDate))
    combineLatest(movements$).subscribe({
      next: (response: MovementModel[][] | MovementModel[]) => {
        console.log(response);
        this.temporal = this.temporal.concat(response.flatMap(x => x))
      }, error: (e) => {
        this.loading = false
        console.error(e);
        throw e;
      }
    })
    
    setTimeout(() => {
      const unique = this.temporal.filter((x, i, self) => i !== self.indexOf(x))
      console.log(this.temporal);
      console.log(unique);
      
      this.loading = false
      // this.returnExport(this.temporal)
    }, 10000);
  }

  private convertDate = (x: Date) => `${x.getFullYear()}-${(x.getMonth() + 1)}-${x.getDate()}`;

  private returnExport = (movementList: MovementModel[]) => {
    const csvHeader = environment.header
    let movementsToExport = movementList.sort((a, b) => a.time - b.time).map(x =>
      [
        new Date(x.time).toLocaleDateString(),
        x.type,
        this.userService.getActiveCategories().find(y => y.id === x.categoryId)?.name,
        x.memorandum,
        x.amount
      ].join(',')
    ).join('\r\n')
    movementsToExport = `${csvHeader}\r\n`.concat(movementsToExport)
    const encodedUri = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURI(movementsToExport)}`
    const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    a.href = encodedUri
    a.download = `${this.convertDate(this.request.startDate)}-${this.convertDate(this.request.endDate)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
