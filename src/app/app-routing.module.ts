import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryConfigurationComponent } from './components/category-configuration/category-configuration.component';
import { NewCategoryComponent } from './components/new-category/new-category.component';
import { PrincipalComponent } from './components/principal/principal.component';

const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
  },
  {
    path: 'category',
    component: CategoryConfigurationComponent,
  },
  {
    path: 'category/new-category/:type',
    component: NewCategoryComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
