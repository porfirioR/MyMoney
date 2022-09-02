import { Injectable } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService, private readonly router: Router) { }

  canActivate(): boolean {
    if (!getAuth().currentUser || !getAuth().currentUser?.email || (this.userService.getAllCategories().length === 0 || this.userService.getActiveCategories().length === 0 || !this.userService.getUserEmail())) {
      this.router.navigate(['/logout'])
      return false
    }
    return true;
  }
}
