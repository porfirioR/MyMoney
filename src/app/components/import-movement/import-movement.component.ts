import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-import-movement',
  templateUrl: './import-movement.component.html',
  styleUrls: ['./import-movement.component.scss']
})
export class ImportMovementComponent implements OnInit {
  protected fileName!: string
  protected file?: File
  protected csvHeader = 'Date,Expense/Income,Category,Memorandum,Amount';
  constructor(private readonly location: Location, private readonly category: CategoryService,
    private readonly snackBar: MatSnackBar,) { }
  
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
          break;
        default:
          this.file = undefined
          break;
      }
    //   const formData = new FormData();
    //   formData.append("thumbnail", file);
    //   const upload$ = this.http.post("/api/thumbnail-upload", formData);
    //   upload$.subscribe();
    }
  }

  protected processFile = () => {
    //https://web.dev/i18n/es/read-files/
    const reader = new FileReader();
    reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
      const result = event?.target?.result
      // Do something with result
      const content = result as string
      const rows = content.split('\n')
      if (rows[0] !== this.csvHeader) {
        this.snackBar.open('Invalid first row', '', { duration: 3000 })
        return
      }
      console.log(result as string)
      
    });
  
    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Progress: ${Math.round(percent)}`);
      }
    });
    reader.readAsText(this.file as File);
  }

  private aux = () => {
    
  }
}
