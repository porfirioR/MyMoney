import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  protected title = environment.title
  constructor(private readonly location: Location) { }

  ngOnInit() {
  }

  protected exit = () => {
    this.location.back()
  }
}
