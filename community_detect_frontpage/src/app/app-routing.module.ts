import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {ContainerComponent} from './container/container.component';
import {HeaderComponent} from './container/header/header.component';
import {SidebarComponent} from './container/sidebar/sidebar.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ProcessGraphComponent} from './process-graph/process-graph.component';
import {GraphFormComponent} from './graph-form/graph-form.component';
import {GraphComponent} from './graph/graph.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: 'container', component: ContainerComponent,
    children: [
      {path: 'login', component: LoginComponent},
      {path: 'header', component: HeaderComponent},
      {path: 'sidebar', component: SidebarComponent},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'process-graph', component: ProcessGraphComponent},
      {path: 'graph-form', component: GraphFormComponent},
      {path: 'graph', component: GraphComponent},
    ]
  },
  {path: '', redirectTo: '/container/graph-form', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
