import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PrincipalComponent } from './components/principal/principal.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { SelectYearMountComponent } from './components/select-year-mount/select-year-mount.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { MatListModule } from '@angular/material/list';
import { CategoryConfigurationComponent } from './components/category-configuration/category-configuration.component';
import { CategoryRowComponent } from './components/category-row/category-row.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterMovementComponent } from './components/register-movement/register-movement.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { LoginComponent } from './components/login/login.component';
import { MovementComponent } from './components/movement/movement.component';

import localEs from '@angular/common/locales/es'
import { registerLocaleData } from '@angular/common'
import { MovementDetailComponent } from './components/movement-detail/movement-detail.component';
import { DialogDeleteComponent } from './components/dialog-delete/dialog-delete.component';
import { ImportMovementComponent } from './components/import-movement/import-movement.component';
import { DialogUploadMovementComponent } from './components/dialog-upload-movement/dialog-upload-movement.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NgxMaskModule } from 'ngx-mask';
import { ExportMovementComponent } from './components/export-movement/export-movement.component';
registerLocaleData(localEs, 'es')


@NgModule({
  declarations: [
    AppComponent,
    PrincipalComponent,
    SelectYearMountComponent,
    SideNavComponent,
    CategoryConfigurationComponent,
    CategoryRowComponent,
    NewCategoryComponent,
    RegisterMovementComponent,
    LoginComponent,
    MovementComponent,
    MovementDetailComponent,
    DialogDeleteComponent,
    ImportMovementComponent,
    ExportMovementComponent,
    DialogUploadMovementComponent,
    LogoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatGridListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatMenuModule,
    MatSidenavModule,
    MatRippleModule,
    MatDialogModule,
    MatListModule,
    MatSnackBarModule,
    NgxMaskModule.forRoot(),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), // storage
  ],
  providers: [ { provide: LOCALE_ID, useValue: 'es' } ],
  bootstrap: [AppComponent],
})
export class AppModule {}
