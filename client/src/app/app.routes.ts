import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AddcarsComponent } from './addcars/addcars.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'addcars', component: AddcarsComponent}
];
