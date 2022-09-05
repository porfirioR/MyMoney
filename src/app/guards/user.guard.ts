import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService, private readonly router: Router) { }

  canActivate(): Promise<boolean> | boolean {
    return new Promise((resolve) => {
      if(!this.userService.item) {
        resolve(false)
        this.router.navigate([''])
      } else {
        resolve(true)
      }
    })
  }
}
