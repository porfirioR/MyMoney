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

const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
    ...canActivate(() => redirectUnauthorizedTo(['/logout'])),
  },
  {
    path: 'category',
    component: CategoryConfigurationComponent,
  },
  {
    path: 'category/new-category/:type',
    canActivate: [UserGuard],
    component: NewCategoryComponent,
  },
  {
    path: 'register-movement',
    canActivate: [UserGuard],
    component: RegisterMovementComponent,
  },
  {
    path: 'details/:id',
    canActivate: [UserGuard],
    component: MovementDetailComponent,
  },
  {
    path: 'movement-update/:id',
    canActivate: [UserGuard],
    component: RegisterMovementComponent
  },
  {
    path: 'import',
    canActivate: [UserGuard],
    component: ImportMovementComponent
  },
  {
    path: 'export',
    canActivate: [UserGuard],
    component: ExportMovementComponent
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'logout',
    component: LogoutComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
