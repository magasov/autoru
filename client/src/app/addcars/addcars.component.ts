import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-addcars',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, NgIf],
  templateUrl: './addcars.component.html',
  styleUrl: './addcars.component.scss'
})
export class AddcarsComponent {
 
  brands = [
    { name: 'Lada (ВАЗ)', logo: 'https://avatars.mds.yandex.net/get-verba/216201/2a0000018dc08f7b4ccd9af125955b697894/logo' },
    
    { name: 'Audi', logo: 'https://avatars.mds.yandex.net/get-verba/3587101/2a00000179af710f40b85f9c3aedb68201fd/logo' },
    { name: 'Bmw', logo: 'http://localhost:4200/assets/carbrands/dealer_logo-1.png' },
    { name: 'Hundai', logo: 'https://avatars.mds.yandex.net/get-verba/1030388/2a00000179b3bf9ed4cee7a9032a7849da57/logo' },
    { name: 'Kia', logo: 'https://avatars.mds.yandex.net/get-verba/1540742/2a0000017bf2918f10c96b31e51ef37dc206/logo' },
    { name: 'Mercedes', logo: 'https://avatars.mds.yandex.net/get-verba/997355/2a00000179b3dd6837b829e20043c2907396/logo' },
    { name: 'Nissan', logo: 'https://avatars.mds.yandex.net/get-verba/3587101/2a00000179b3e3855153a7ad4c6acf51a351/logo' },
    { name: 'Renault', logo: 'https://avatars.mds.yandex.net/get-verba/216201/2a00000179b3fdd269874274123e895b4dfa/logo' },
    { name: 'Toyota', logo: 'https://avatars.mds.yandex.net/get-verba/3587101/2a00000179b4143e937258ee2d1943c201f0/logo' },
    { name: 'Skoda', logo: 'https://avatars.mds.yandex.net/get-verba/997355/2a00000179b408cdfb64617747069ec1bf81/logo' },
    { name: 'Volkswagen', logo: 'https://avatars.mds.yandex.net/get-verba/1030388/2a00000179b420adde531d67793944f45252/logo' }
  ];

  searchTerm: string = '';
  filteredBrands = [...this.brands];

 
  filterBrands() {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) {
      this.filteredBrands = [...this.brands];
    } else {
      this.filteredBrands = this.brands.filter(brand =>
        brand.name.toLowerCase().includes(search)
      );
    }
  }
}