import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AddcarsComponent } from './addcars/addcars.component';
import { AuthGuard } from './auth.guard';
import { CarsComponent } from './cars/cars.component';
import { CarsallComponent } from './carsall/carsall.component';
import { WalletComponent } from './wallet/wallet.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'addcars', component: AddcarsComponent, canActivate: [AuthGuard] },
  { path: 'cars/:id', component: CarsComponent },
  { path: 'carsall/:brand', component: CarsallComponent },
  { path: 'carsall/:brand/:model', component: CarsallComponent },
  { path: 'my/wallet', component: WalletComponent },
];