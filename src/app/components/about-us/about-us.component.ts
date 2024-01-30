import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent {
  protected title = environment.title
  constructor(
    private router: Router,
  ) { }

  protected exit = (): void => {
    this.router.navigate([''])
  }
}
