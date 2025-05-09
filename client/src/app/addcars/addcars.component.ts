import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-addcars',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, NgIf],
  templateUrl: './addcars.component.html',
  styleUrls: ['./addcars.component.scss'] 
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

  
  brandModels: { [key: string]: string[] } = {
    'Lada (ВАЗ)': [
      '2101', '2104', '2105', '2106', '2107', '2109', '21099',
      '2110', '2111', '2112', '2113', '2114', '2115',
      '2121 (4x4)', '2131 (4x4)', 'Granta', 'Kalina', 'Largus',
      'Niva', 'Niva Legend', 'Priora', 'Vesta', 'XRAY'
    ],
    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
    'Bmw': ['3 Series', '5 Series', 'X3', 'X5'],
    'Hundai': ['Solaris', 'Tucson', 'Santa Fe'],
    'Kia': ['Rio', 'Sportage', 'Optima'],
    'Mercedes': ['C-Class', 'E-Class', 'S-Class'],
    'Nissan': ['Qashqai', 'X-Trail', 'Sentra'],
    'Renault': ['Duster', 'Logan', 'Sandero'],
    'Toyota': ['Camry', 'Corolla', 'RAV4'],
    'Skoda': ['Octavia', 'Rapid', 'Kodiaq'],
    'Volkswagen': ['Polo', 'Tiguan', 'Passat']
  };

  searchTerm: string = ''; 
  filteredBrands = [...this.brands]; 
  selectedBrand: string | null = null; 
  modelSearchTerm: string = ''; 
  filteredModels: string[] = []; 

  
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

  
  selectBrand(brandName: string) {
    this.selectedBrand = brandName;
    this.searchTerm = ''; 
    this.filteredBrands = [...this.brands]; 
    this.modelSearchTerm = ''; 
    this.filteredModels = this.brandModels[brandName] || []; 
  }

  
  filterModels() {
    const search = this.modelSearchTerm.toLowerCase().trim();
    if (!this.selectedBrand) return;
    if (!search) {
      this.filteredModels = this.brandModels[this.selectedBrand] || [];
    } else {
      this.filteredModels = (this.brandModels[this.selectedBrand] || []).filter(model =>
        model.toLowerCase().includes(search)
      );
    }
  }

  
  clearSelection() {
    this.selectedBrand = null;
    this.modelSearchTerm = '';
    this.filteredModels = [];
  }

  
  getSelectedBrandLogo(): string {
    const brand = this.brands.find(b => b.name === this.selectedBrand);
    return brand ? brand.logo : 'assets/placeholder-logo.png'; 
  }

  
  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder-logo.png'; 
  }
}