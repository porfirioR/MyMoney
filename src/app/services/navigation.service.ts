import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private readonly location: Location, private readonly router: Router) { }

  // After a page reload there is no previous screen of the app, so going back would leave it: the fallback is used instead
  public back = (fallback = '/'): void => {
    const navigationId = (this.location.getState() as { navigationId?: number } | null)?.navigationId ?? 1
    if (navigationId > 1) {
      this.location.back()
    } else {
      this.router.navigateByUrl(fallback, { replaceUrl: true })
    }
  }
}
