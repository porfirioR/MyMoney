import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-import-movement',
  templateUrl: './import-movement.component.html',
  styleUrls: ['./import-movement.component.scss']
})
export class ImportMovementComponent implements OnInit {
  protected fileName!: string

  constructor(private readonly location: Location) { }
  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected onFileSelected = (event: Event) => {
    const input =(event.target) as HTMLInputElement
    const file = input.files?.item(0)
    if (file) {
      this.fileName = file.name;
    //   const formData = new FormData();
    //   formData.append("thumbnail", file);
    //   const upload$ = this.http.post("/api/thumbnail-upload", formData);
    //   upload$.subscribe();
    }
  }
}
