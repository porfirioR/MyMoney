import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

// Shared toolbar for every screen: side menu screens show the menu button, inner screens show a back button.
// Toolbar buttons are projected with the toolbarActions attribute.
@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {
  @Input() title = ''
  @Input() backButton = false
  @Input() year?: number
  @Output() back = new EventEmitter<void>()
  @ViewChild(MatSidenav) private sidenav?: MatSidenav

  protected toggleMenu = (): void => {
    this.sidenav?.toggle()
  }
}
