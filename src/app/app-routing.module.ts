import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryConfigurationComponent } from './components/category-configuration/category-configuration.component';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { PrincipalComponent } from './components/principal/principal.component';
import { RegisterMovementComponent } from './components/register-movement/register-movement.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard'
import { LoginComponent } from './components/login/login.component';
import { MovementDetailComponent } from './components/movement-detail/movement-detail.component';
import { ImportMovementComponent } from './components/import-movement/import-movement.component';
import { ExportMovementComponent } from './components/export-movement/export-movement.component';
import { LogoutComponent } from './components/logout/logout.component';
import { UserGuard } from './guards/user.guard';
import { ReportMonthComponent } from './components/report-month/report-month.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
    ...canActivate(() => redirectUnauthorizedTo(['/logout'])),
    title: environment.title
  },
  {
    path: 'category',
    canActivate: [UserGuard],
    component: CategoryConfigurationComponent,
    title: 'Category'
  },
  {
    path: 'category/new-category/:type',
    canActivate: [UserGuard],
    component: NewCategoryComponent,
    title: 'New category'
  },
  {
    path: 'register-movement',
    canActivate: [UserGuard],
    component: RegisterMovementComponent,
    title: 'Register movement'
  },
  {
    path: 'details/:id',
    canActivate: [UserGuard],
    component: MovementDetailComponent,
    title: 'Details'
  },
  {
    path: 'movement-update/:id',
    canActivate: [UserGuard],
    component: RegisterMovementComponent,
    title: 'Movement update'
  },
  {
    path: 'import',
    canActivate: [UserGuard],
    component: ImportMovementComponent,
    title: 'Import'
  },
  {
    path: 'export',
    canActivate: [UserGuard],
    component: ExportMovementComponent,
    title: 'Export'
  },
  {
    path: 'report-month/:type',
    canActivate: [UserGuard],
    component: ReportMonthComponent,
    title: 'Report'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },
  {
    path: 'logout',
    component: LogoutComponent,
    title: 'Logout'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
