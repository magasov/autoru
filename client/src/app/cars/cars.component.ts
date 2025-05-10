import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cars',
  imports: [HeaderComponent, RouterLink],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent {

}
