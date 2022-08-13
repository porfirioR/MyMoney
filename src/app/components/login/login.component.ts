import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.login()
  }

  private login = () => {
    this.authService
      .loginWithGoogle()
      .then((x: UserCredential) => {
        console.log(x)
        this.router.navigate([''])
      })
      .catch((x) => console.log(x));
  };
}
