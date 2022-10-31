import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NumberType } from '../../enums/number-type.enum';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  protected numberType = NumberType
  protected amount = 1000000000

  protected formGroup: FormGroup = new FormGroup({
    numberType: new FormControl(this.numberType.English)
  })
  constructor(private readonly location: Location) { }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }

  protected save = () => {
    // this.location.back()

  }
}
