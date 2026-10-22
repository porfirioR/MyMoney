import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Chart } from 'chart.js';
import { ThemeType } from '../enums/theme-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private static readonly storageKey = 'my-money.theme'
  private static readonly toolbarColors = { light: '#82b366', dark: '#5b7d47' }
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)')
  private readonly darkSubject = new BehaviorSubject<boolean>(false)
  private currentPreference: ThemeType

  // The preference is kept on the device too, so the app opens with the right theme before the configuration loads
  constructor() {
    this.currentPreference = this.readStoredPreference()
    this.media.addEventListener('change', () => {
      if (this.currentPreference === ThemeType.System) {
        this.apply()
      }
    })
    this.apply()
  }

  public get preference(): ThemeType {
    return this.currentPreference
  }

  public get isDark(): boolean {
    return this.darkSubject.value
  }

  public get isDark$(): Observable<boolean> {
    return this.darkSubject.asObservable()
  }

  public use = (theme: ThemeType): void => {
    this.currentPreference = theme
    try {
      localStorage.setItem(ThemeService.storageKey, theme)
    } catch { }
    this.apply()
  }

  // The class goes on <html> so dialogs, menus and the datepicker (rendered in <body>) follow the theme
  private apply = (): void => {
    const dark = this.currentPreference === ThemeType.Dark || (this.currentPreference === ThemeType.System && this.media.matches)
    document.documentElement.classList.toggle('dark-theme', dark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? ThemeService.toolbarColors.dark : ThemeService.toolbarColors.light)
    Chart.defaults.color = dark ? 'rgba(255, 255, 255, 0.7)' : '#666666'
    Chart.defaults.borderColor = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'
    this.darkSubject.next(dark)
  }

  private readStoredPreference = (): ThemeType => {
    try {
      const stored = localStorage.getItem(ThemeService.storageKey) as ThemeType | null
      return stored && Object.values(ThemeType).includes(stored) ? stored : ThemeType.System
    } catch {
      return ThemeType.System
    }
  }
}
