import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { ImportMovementRequestModel } from '../../models/import-movement-request.model';
import { CategoryType } from '../../enums/category-type.enum';
import { MovementModel } from '../../models/movement.model';
import { CategoryModel } from '../../models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogUploadMovementComponent } from '../dialog-upload-movement/dialog-upload-movement.component';
import { environment } from '../../../environments/environment';

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

  constructor(private readonly location: Location,
              private readonly userService: UserService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog) { }
  
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
        this.snackBar.open('Empty file', '', { duration: 3000 })
        return
      } else if (!rows.shift()?.startsWith(this.csvHeader)) {
        this.loading = false
        this.openPopUp = false
        this.snackBar.open('Invalid first row', '', { duration: 3000 })
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
            time: new Date(`${importMovementRequest.date as string} 00:00:00`).getTime(),
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
        this.snackBar.open('Load all movement was successful', '', { duration: 10000 })
      }
    })
  }

  private checkImportMovementRow = (index: number, rowMovement: string[]): ImportMovementRequestModel | string[]  => {
    let invalid = false
    let errors: string[] = []
    if (rowMovement.length !== 5) {
      invalid = true
      errors.push(`Invalid column length, expected 5 and count ${rowMovement.length} in row ${index}`)
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
      errors.push(`Invalid column value, expected some value but was empty in row ${index}`)
    }
    const dateArray = importMovement.date?.split('/')
    if (dateArray && dateArray.length !== 3) {
      invalid = true
      errors.push(`Invalid column date, expected yyyy/mm/dd but was ${importMovement.date} in row ${index}`)
    }
    const year = Number((dateArray as string[]).shift())
    const month = Number((dateArray as string[]).shift())
    const day = Number((dateArray as string[]).shift())
    if (!Number.isInteger(year) || year < 2015) {
      invalid = true
      errors.push(`Invalid year, expected min year 2015 but was ${year} in row ${index}`)
    } else if(!Number.isInteger(month) || month < 1 || month > 12) {
      invalid = true
      errors.push(`Invalid month ${month} in row ${index}`)
    } else if(!Number.isInteger(day) || day < 0 || day > 31 || (![1, 3, 5, 7, 8, 10, 12].includes(month) && day > 30)) {
      invalid = true
      errors.push(`Invalid day ${day} in row ${index}`)
    } else if (CategoryType.expense !== importMovement.type && CategoryType.income !== importMovement.type) {
      invalid = true
      errors.push(`Invalid type, expected ${CategoryType.expense} || ${CategoryType.income} but was ${importMovement.type} in row ${index}`)
    }
    const num = Number(importMovement.amount)
    if (!Number.isInteger(num) || num === 0) {
      invalid = true
      errors.push(`Invalid amount ${num} in row ${index}`)
    }
    if (!this.userService.getActiveCategories().find(x => x.name === importMovement.category)) {
      invalid = true
      errors.push(`Invalid category ${importMovement.category} as inactive or not exist in row ${index}`)
    }
    return invalid ? errors : importMovement
  }
}
