import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { CarbrandComponent } from "../carbrand/carbrand.component";
import { MainComponent } from "../main/main.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CarbrandComponent, MainComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
