import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, take } from 'rxjs';
import { CategoryType } from '../../enums/category-type.enum';
import { ExportRequestModel } from '../../models/export-request.model';
import { environment } from '../../../environments/environment';
import { MovementService } from '../../services/movement.service';
import { UserService } from '../../services/user.service';

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
  protected categories = CategoryType
  constructor(private readonly location: Location,
              private readonly userService: UserService,
              private readonly movementService: MovementService) { }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected export = () => {
    this.loading = true
    const request = this.formGroup.getRawValue() as ExportRequestModel
    const movements$ = request.categories.map(x => this.movementService.getMovementToExport(x, request.startDate, request.endDate))
    combineLatest(movements$).pipe(take(1)).subscribe({
      next: (response) => {
        const movementList = response.flatMap(x => x)
        const csvHeader = environment.header
        let movementsToExport = movementList.map(x =>
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
        a.download = `${this.convertDate(request.startDate)}-${this.convertDate(request.endDate)}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        this.loading = false
      }, error: (e) => {
        this.loading = false
        console.error(e);
        throw e;
      }
    })
  }

  private convertDate = (x: Date) => `${x.getFullYear()}-${(x.getMonth() + 1)}-${x.getDate()}`;

}
