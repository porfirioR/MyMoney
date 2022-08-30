import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private readonly router: Router) { }

  ngOnInit() {
  }

  protected goToLogin = () => {
    this.router.navigate(['login'])

  }
}
