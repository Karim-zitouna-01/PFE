import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {RegisterComponent} from './register/register.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {NavComponent} from './nav/nav.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { UserComponent } from './user/user.component';
import { DataDivisionComponent } from './data-division/data-division.component';
import { DataTransformationComponent } from './data-transformation/data-transformation.component';
import { DataCleaningComponent } from './data-cleaning/data-cleaning.component';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    NavComponent,
    UserComponent,
    DataDivisionComponent,
    DataTransformationComponent,
    DataCleaningComponent,
    DataAnalysisComponent
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
