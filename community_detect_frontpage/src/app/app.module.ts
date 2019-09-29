import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './login/login.component';
import {ContainerComponent} from './container/container.component';
import {SidebarComponent} from './container/sidebar/sidebar.component';
import {HeaderComponent} from './container/header/header.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ProcessGraphComponent} from './process-graph/process-graph.component';
import {GraphFormComponent} from './graph-form/graph-form.component';
import { GraphShowComponent } from './graph-show/graph-show.component';
import { GraphComponent } from './graph/graph.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ContainerComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    ProcessGraphComponent,
    GraphFormComponent,
    GraphShowComponent,
    GraphComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
