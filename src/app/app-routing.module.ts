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

const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
    ...canActivate( () => redirectUnauthorizedTo(['/logout'])),
  },
  {
    path: 'category',
    component: CategoryConfigurationComponent,
  },
  {
    path: 'category/new-category/:type',
    component: NewCategoryComponent,
  },
  {
    path: 'register-movement',
    component: RegisterMovementComponent,
  },
  {
    path: 'details/:id',
    component: MovementDetailComponent,
  },
  {
    path: 'movement-update/:id',
    component: RegisterMovementComponent
  },
  {
    path: 'import',
    component: ImportMovementComponent
  },
  {
    path: 'export',
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
