import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app.routing';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SelectYearMonthComponent } from './components/select-year-mount/select-year-month.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { CategoryConfigurationComponent } from './components/category-configuration/category-configuration.component';
import { CategoryRowComponent } from './components/category-row/category-row.component';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterMovementComponent } from './components/register-movement/register-movement.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { LoginComponent } from './components/login/login.component';
import { MovementComponent } from './components/movement/movement.component';

import localEs from '@angular/common/locales/es'
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common'
import { MovementDetailComponent } from './components/movement-detail/movement-detail.component';
import { DialogDeleteComponent } from './components/dialog-delete/dialog-delete.component';
import { ImportMovementComponent } from './components/import-movement/import-movement.component';
import { DialogUploadMovementComponent } from './components/dialog-upload-movement/dialog-upload-movement.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ExportMovementComponent } from './components/export-movement/export-movement.component';
import { UserGuard } from './guards/user.guard';
import { UserService } from './services/user.service';
import { NgChartsModule } from 'ng2-charts';
import { ReportMonthComponent } from './components/report-month/report-month.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomColorDirective } from './directive/custom-color.directive';
import { EditCategoryComponent } from './components/edit-category/edit-category.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { EnumArrayLoopPipe } from './directive/enum-array-loop.pipe';
import { AnnualReportComponent } from './components/annual-report/annual-report.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { RelatedMovementsComponent } from './components/related-movements/related-movements.component';
import { UpsertRelatedMovementComponent } from './components/upsert-related-movement/upsert-related-movement.component';
import { RelatedMovementDetailComponent } from './components/related-movement-detail/related-movement-detail.component';
import { DialogAddMovementComponent } from './components/dialog-add-movement/dialog-add-movement.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TitleStrategy } from '@angular/router';
import { PageTitleStrategyService } from './services/page-title-strategy.service';

registerLocaleData(localEs, 'es')
registerLocaleData(localeEn, 'en')


@NgModule({
  declarations: [
    AppComponent,
    PrincipalComponent,
    SelectYearMonthComponent,
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
    LogoutComponent,
    ReportMonthComponent,
    EditCategoryComponent,
    AboutUsComponent,
    ConfigurationComponent,
    CustomColorDirective,
    EnumArrayLoopPipe,
    AnnualReportComponent,
    RelatedMovementsComponent,
    UpsertRelatedMovementComponent,
    RelatedMovementDetailComponent,
    DialogAddMovementComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
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
    MatExpansionModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    NgxMaskDirective,
    NgxMaskPipe,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !environment.production }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: LOCALE_ID, useValue: 'en' },
    UserService,
    UserGuard,
    provideEnvironmentNgxMask(),
    {
      provide: TitleStrategy,
      useClass: PageTitleStrategyService,
    },
  ],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
