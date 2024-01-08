import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';
import { take } from 'rxjs';
import { ConfigurationModel } from '../models/configuration.model';

export const ConfigResolver: ResolveFn<ConfigurationModel> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const userService = inject(UserService)
  return userService.getUserConfiguration$().pipe(take(1));
};
