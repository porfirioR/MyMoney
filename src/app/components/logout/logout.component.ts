import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  protected title = environment.title
  constructor(private readonly router: Router) { }

  ngOnInit(): void { }

  protected goToLogin = (): void => {
    this.router.navigate(['login'])
  }
}
