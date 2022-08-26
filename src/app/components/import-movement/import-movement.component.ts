import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-import-movement',
  templateUrl: './import-movement.component.html',
  styleUrls: ['./import-movement.component.scss']
})
export class ImportMovementComponent implements OnInit {
  protected fileName!: string
  protected file!: File

  constructor(private readonly location: Location) { }
  
  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected onFileSelected = (event: Event) => {
    const input = (event.target) as HTMLInputElement
    const file = input.files?.item(0)
    if (file && file.type == 'text/csv') {
      this.file = file;
    //   const formData = new FormData();
    //   formData.append("thumbnail", file);
    //   const upload$ = this.http.post("/api/thumbnail-upload", formData);
    //   upload$.subscribe();
    }
  }

  protected processFile = () => {
    const reader = new FileReader();
    reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
      const result = event?.target?.result;
      // Do something with result
    });
  
    reader.addEventListener('progress', (event) => {
      if (event.loaded && event.total) {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Progress: ${Math.round(percent)}`);
      }
    });
    reader.readAsDataURL(this.file);
  }
}
