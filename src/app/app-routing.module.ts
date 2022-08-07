import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryConfigurationComponent } from './components/category-configuration/category-configuration.component';
import { PrincipalComponent } from './components/principal/principal.component';

const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
  },
  {
    path: 'category',
    component: CategoryConfigurationComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
