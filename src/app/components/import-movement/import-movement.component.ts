import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { ImportMovementRequestModel } from '../../models/import-movement-request.model';
import { MovementModel } from '../../models/movement.model';
import { CategoryModel } from '../../models/category.model';
import { CategoryType } from '../../enums/category-type.enum';
import { environment } from '../../../environments/environment';
import { DialogUploadMovementComponent } from '../dialog-upload-movement/dialog-upload-movement.component';

@Component({
  selector: 'app-import-movement',
  templateUrl: './import-movement.component.html',
  styleUrls: ['./import-movement.component.scss']
})
export class ImportMovementComponent implements OnInit {
  protected fileName!: string
  protected file?: File
  protected csvHeader = environment.header;
  private importRequest: MovementModel[] = []
  protected errorMessageList: string[] = []
  protected loading = false
  protected openPopUp = false

  constructor(
    private readonly location: Location,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private translate: TranslateService
  ) { }
  
  ngOnInit() { }

  protected exit = () => {
    this.location.back()
  }

  protected onFileSelected = (event: Event) => {
    const input = (event.target) as HTMLInputElement
    const file = input.files?.item(0)
    if (file) {
      switch (file.type) {
        case 'text/csv':
          this.file = file;
          this.errorMessageList = []
          this.openPopUp = false
          this.importRequest = []
        break;
        default:
          this.openPopUp = false
          this.file = undefined
          break;
      }
    }
  }

  protected processFile = () => {
    const reader = new FileReader();
    reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
      this.errorMessageList = []
      this.loading = true
      const result = event?.target?.result
      const content = result as string
      const rows = content.split('\n')
      if (rows.length === 0) {
        this.loading = false
        this.openPopUp = false
        this.snackBar.open(this.translate.instant('import-movement-messages.empty-file'), '', { duration: 3000 })
        return
      } else if (!rows.shift()?.startsWith(this.csvHeader)) {
        this.loading = false
        this.openPopUp = false
        this.snackBar.open(this.translate.instant('import-movement-messages.invalid-row'), '', { duration: 3000 })
        return
      }
      rows.forEach((x, i) => {
        const importMovement = this.checkImportMovementRow(i + 1, x.split(','))
        if ((typeof(importMovement) === typeof(this.errorMessageList) && (importMovement as string[]).length > 0)) {
          const message = importMovement as string[]
          this.errorMessageList = this.errorMessageList.concat(message)
          this.importRequest = []
        } else if (this.errorMessageList.length === 0) {
          const importMovementRequest = importMovement as ImportMovementRequestModel
          const category = this.userService.getActiveCategories().find(x => x.name === importMovementRequest.category) as CategoryModel
          const request: MovementModel = {
            amount: Number(importMovementRequest.amount),
            type: importMovementRequest.type === CategoryType.expense ? CategoryType.expense : CategoryType.income,
            time: new Date(`${importMovementRequest.date!} 00:00:00`).getTime(),
            categoryId: category.id,
            categoryName: category.name,
            icon: category.icon,
            memorandum: importMovementRequest.memorandum
          }
          this.importRequest.push(request)
        }
      })

      if (this.errorMessageList.length === 0 && this.importRequest.length > 0) {
        this.openPopUp = true
      }
      this.loading = false
    })
    reader.readAsText(this.file as File);
  }

  protected openDialog = () => {
    const dialogRef = this.dialog.open(DialogUploadMovementComponent, {
      width: '400px',
      data: this.importRequest
    })

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.openPopUp = false
        this.file = undefined
        this.importRequest = []
        this.snackBar.open(this.translate.instant('import-movement-messages.loaded'), '', { duration: 10000 })
      }
    })
  }

  private checkImportMovementRow = (index: number, rowMovement: string[]): ImportMovementRequestModel | string[]  => {
    let invalid = false
    let errors: string[] = []
    if (rowMovement.length !== 5) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-length', {length: rowMovement.length, index: index}))
    }
    const importMovement: ImportMovementRequestModel =  {
      date: rowMovement.shift(),
      type: rowMovement.shift(),
      category: rowMovement.shift(),
      memorandum: rowMovement.shift(),
      amount: rowMovement.shift()
    }
    if (!(importMovement.date && importMovement.type && importMovement.category && importMovement.amount)) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.empty-row', {index: index}))
    }
    const dateArray = importMovement.date?.split('/')
    if (dateArray && dateArray.length !== 3) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-column-date', {date: importMovement.date, index: index}))
    }
    const year = Number((dateArray!).shift())
    const month = Number((dateArray!).shift())
    const day = Number((dateArray!).shift())
    if (!Number.isInteger(year) || year < 2015) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-year', {year: year, index: index}))
    } else if(!Number.isInteger(month) || month < 1 || month > 12) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-month', {month: month, index: index}))
    } else if(!Number.isInteger(day) || day < 0 || day > 31 || (![1, 3, 5, 7, 8, 10, 12].includes(month) && day > 30)) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-day', {day: day, index: index}))
    } else if (CategoryType.expense.toLowerCase() !== importMovement.type?.toLowerCase() && CategoryType.income.toLowerCase() !== importMovement.type?.toLowerCase()) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-type', {type: importMovement.type, index: index}))
    }
    const num = Number(importMovement.amount)
    if (!Number.isInteger(num) || num === 0) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-amount', {num: num, index: index}))
    }
    if (!this.userService.getActiveCategories().find(x => x.name === importMovement.category)) {
      invalid = true
      errors.push(this.translate.instant('import-movement-messages.invalid-category', {category: importMovement.category, index: index}))
    }
    return invalid ? errors : importMovement
  }
}
