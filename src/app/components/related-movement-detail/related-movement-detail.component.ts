import { Component, Input, OnInit } from '@angular/core';
import { LanguageType } from '../../enums/language-type.enum';
import { NumberType } from '../../enums/number-type.enum';
import { RelatedMovementDetailModel } from '../../models/related-movement-detail.model';
import { ConfigurationModel } from '../../models/configuration.model';

@Component({
  selector: 'app-related-movement-detail',
  templateUrl: './related-movement-detail.component.html',
  styleUrls: ['./related-movement-detail.component.scss']
})
export class RelatedMovementDetailComponent implements OnInit {
  @Input() movements: RelatedMovementDetailModel[] = []
  @Input() configuration!: ConfigurationModel
  protected language = LanguageType.English
  protected numberType = NumberType.English

  constructor() { }

  ngOnInit() {
    this.language = this.configuration.language
    this.numberType = this.configuration.number
  }


  protected deletedMovement = (id: string) => {

  }
}
