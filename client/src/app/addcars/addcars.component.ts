import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-addcars',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './addcars.component.html',
  styleUrls: ['./addcars.component.scss'],
})
export class AddcarsComponent {
  brands = [
    {
      name: 'Lada (ВАЗ)',
      logo: 'https://avatars.mds.yandex.net/get-verba/216201/2a0000018dc08f7b4ccd9af125955b697894/logo',
    },
    {
      name: 'Audi',
      logo: 'https://avatars.mds.yandex.net/get-verba/3587101/2a00000179af710f40b85f9c3aedb68201fd/logo',
    },
    {
      name: 'Bmw',
      logo: 'http://localhost:4200/assets/carbrands/dealer_logo-1.png',
    },
    {
      name: 'Hyundai',
      logo: 'https://avatars.mds.yandex.net/get-verba/1030388/2a00000179b3bf9ed4cee7a9032a7849da57/logo',
    },
    {
      name: 'Kia',
      logo: 'https://avatars.mds.yandex.net/get-verba/1540742/2a0000017bf2918f10c96b31e51ef37dc206/logo',
    },
    {
      name: 'Mercedes',
      logo: 'https://avatars.mds.yandex.net/get-verba/997355/2a00000179b3dd6837b829e20043c2907396/logo',
    },
    {
      name: 'Nissan',
      logo: 'https://avatars.mds.yandex.net/get-verba/3587101/2a00000179b3e3855153a7ad4c6acf51a351/logo',
    },
    {
      name: 'Renault',
      logo: 'https://avatars.mds.yandex.net/get-verba/216201/2a00000179b3fdd269874274123e895b4dfa/logo',
    },
    {
      name: 'Toyota',
      logo: 'https://avatars.mds.yandex.net/get-verba/3587101/2a00000179b4143e937258ee2d1943c201f0/logo',
    },
    {
      name: 'Skoda',
      logo: 'https://avatars.mds.yandex.net/get-verba/997355/2a00000179b408cdfb64617747069ec1bf81/logo',
    },
    {
      name: 'Volkswagen',
      logo: 'https://avatars.mds.yandex.net/get-verba/1030388/2a00000179b420adde531d67793944f45252/logo',
    },
  ];

  brandModels: { [key: string]: string[] } = {
    'Lada (ВАЗ)': [
      '2101', '2104', '2105', '2106', '2107', '2109', '21099', '2110', '2111', '2112', '2113', '2114', '2115',
      '2121 (4x4)', '2131 (4x4)', 'Granta', 'Kalina', 'Largus', 'Niva', 'Niva Legend', 'Priora', 'Vesta', 'XRAY',
    ],
    Audi: [
      '100', '80', 'A1', 'A3', 'A4', 'A4 allroad', 'A5', 'A6', 'A6 allroad', 'A7', 'A8', 'Q3', 'Q5', 'Q5 Sportback',
      'Q7', 'Q8', 'RS 5', 'RS Q8', 'S5', 'S8', 'SQ5', 'TT', 'e-tron',
    ],
    Bmw: [
      '1 серии', '2 серии', '3 серии', '4 серии', '5 серии', '6 серии', '7 серии', '8 серии', 'M3', 'M4', 'M5',
      'X1', 'X2', 'X3', 'X3 M', 'X4', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'Z4', 'i3',
    ],
    Hyundai: [
      'Accent', 'Avante', 'Creta', 'Elantra', 'Getz', 'Grand Starex', 'Grandeur', 'H-1', 'Kona', 'Matrix', 'Palisade',
      'Santa Fe', 'Solaris', 'Sonata', 'Starex', 'Staria', 'Terracan', 'Tucson', 'Veloster', 'i20', 'i30', 'i40', 'ix35',
    ],
    Kia: [
      'Carens', 'Carnival', 'Ceed', 'Cerato', 'Forte', 'K3', 'K5', 'K7', 'K8', 'Magentis', 'Mohave', 'Morning',
      'Optima', 'Picanto', 'Quoris', 'Rio', 'Seltos', 'Sorento', 'Soul', 'Spectra', 'Sportage', 'Stinger', 'Venga',
    ],
    Mercedes: [
      'A-Класс', 'AMG GT', 'B-Класс', 'C-Класс', 'CLA', 'CLS', 'E-Класс', 'G-Класс', 'G-Класс AMG', 'GL-Класс', 'GLA',
      'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLE Coupe AMG', 'GLK-Класс', 'GLS', 'M-Класс', 'Maybach S-Класс', 'S-Класс',
      'V-Класс', 'Vito',
    ],
    Nissan: [
      'AD', 'Almera', 'Almera Classic', 'Cube', 'Juke', 'Leaf', 'March', 'Maxima', 'Micra', 'Murano', 'Note', 'Pathfinder',
      'Patrol', 'Primera', 'Qashqai', 'Qashqai+2', 'Serena', 'Sunny', 'Teana', 'Terrano', 'Tiida', 'Wingroad', 'X-Trail',
    ],
    Renault: [
      'Arkana', 'Clio', 'Dokker', 'Duster', 'Espace', 'Fluence', 'Kadjar', 'Kangoo', 'Kaptur', 'Koleos', 'Laguna',
      'Latitude', 'Logan', 'Megane', 'Sandero', 'Scenic', 'Symbol', 'Talisman', 'Trafic',
    ],
    Toyota: [
      'Allion', 'Alphard', 'Auris', 'Avensis', 'C-HR', 'Caldina', 'Camry', 'Corolla', 'Corona', 'Crown', 'Harrier',
      'Highlander', 'Hilux', 'Land Cruiser', 'Land Cruiser Prado', 'Mark II', 'Passo', 'Prius', 'RAV4', 'Sienta', 'Vitz',
      'Wish', 'Yaris',
    ],
    Skoda: [
      'Fabia', 'Felicia', 'Kamiq', 'Karoq', 'Kodiaq', 'Kodiaq GT', 'Octavia', 'Octavia RS', 'Rapid', 'Roomster',
      'SuperAdvisors', 'Yeti',
    ],
    Volkswagen: [
      'Amarok', 'Arteon', 'Bora', 'Caddy', 'Caravelle', 'Golf', 'Golf GTI', 'Golf Plus', 'ID.4', 'Jetta', 'Multivan',
      'Passat', 'Passat (North America and China)', 'Passat CC', 'Polo', 'Sharan', 'Talagon', 'Tayron', 'Teramont',
      'Tiguan', 'Touareg', 'Touran', 'Transporter',
    ],
  };

  years: string[] = [
    '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017',
    '2016', '2015', '2014', '2013', '2012', '2011', 'Старше'
  ];

  bodyTypes: string[] = [
    'Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Купе', 'Кабриолет', 'Минивэн', 'Пикап'
  ];

  generations: string[] = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Другое'
  ];

  engines: string[] = [
    'Бензин', 'Дизель', 'Гибрид', 'Электрический'
  ];

  drivetrains: string[] = [
    'Передний', 'Задний', 'Полный'
  ];

  transmissions: string[] = [
    'Механика', 'Автомат', 'Робот', 'Вариатор'
  ];

  modifications: string[] = [
    '150 л.с. (2.0 AMT)', '200 л.с. (2.5 AT)', '100 л.с. (1.6 MT)', 'Другая'
  ];

  colors: string[] = [
    'Белый', 'Черный', 'Серебристый', 'Серый', 'Синий', 'Красный', 'Зеленый',
    'Желтый', 'Оранжевый', 'Коричневый', 'Другой'
  ];

  searchTerm: string = '';
  filteredBrands = [...this.brands];
  selectedBrand: string | null = null;
  modelSearchTerm: string = '';
  filteredModels: string[] = [];
  selectedModel: string | null = null;
  selectedYear: string | null = null;
  selectedBodyType: string | null = null;
  selectedGeneration: string | null = null;
  selectedEngine: string | null = null;
  selectedDrivetrain: string | null = null;
  selectedTransmission: string | null = null;
  selectedModification: string | null = null;
  selectedColor: string | null = null;
  currentStep: number = 1;
  mileage: string = '';
  photos: File[] = [];
  ptsType: string | null = null;
  description: string = '';
  contactName: string = '';
  email: string = '';
  phone: string = '';
  price: number | null = null;

  filterBrands() {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) {
      this.filteredBrands = [...this.brands];
    } else {
      this.filteredBrands = this.brands.filter((brand) =>
        brand.name.toLowerCase().includes(search)
      );
    }
  }

  selectBrand(brandName: string) {
    this.selectedBrand = brandName;
    this.resetAfterBrand();
    this.searchTerm = '';
    this.filteredBrands = [...this.brands];
    this.modelSearchTerm = '';
    this.filteredModels = this.brandModels[brandName] || [];
    this.currentStep = 1;
  }

  selectModel(modelName: string) {
    this.selectedModel = modelName;
    this.resetAfterModel();
    this.modelSearchTerm = modelName;
    this.filteredModels = [];
  }

  selectYear(year: string) {
    this.selectedYear = year;
    this.resetAfterYear();
  }

  selectBodyType(bodyType: string) {
    this.selectedBodyType = bodyType;
    this.resetAfterBodyType();
  }

  selectGeneration(generation: string) {
    this.selectedGeneration = generation;
    this.resetAfterGeneration();
  }

  selectEngine(engine: string) {
    this.selectedEngine = engine;
    this.resetAfterEngine();
  }

  selectDrivetrain(drivetrain: string) {
    this.selectedDrivetrain = drivetrain;
    this.resetAfterDrivetrain();
  }

  selectTransmission(transmission: string) {
    this.selectedTransmission = transmission;
    this.resetAfterTransmission();
  }

  selectModification(modification: string) {
    this.selectedModification = modification;
    this.resetAfterModification();
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  selectPtsType(type: string) {
    this.ptsType = type;
  }

  filterModels() {
    const search = this.modelSearchTerm.toLowerCase().trim();
    if (!this.selectedBrand) return;
    if (!search || this.selectedModel) {
      this.filteredModels = this.selectedModel ? [] : this.brandModels[this.selectedBrand] || [];
    } else {
      this.filteredModels = (this.brandModels[this.selectedBrand] || []).filter(
        (model) => model.toLowerCase().includes(search)
      );
    }
  }

  clearSelection() {
    this.selectedBrand = null;
    this.resetAfterBrand();
    this.searchTerm = '';
    this.modelSearchTerm = '';
    this.filteredModels = [];
    this.filteredBrands = [...this.brands];
    this.currentStep = 1;
    this.mileage = '';
    this.photos = [];
    this.ptsType = null;
    this.description = '';
    this.contactName = '';
    this.email = '';
    this.phone = '';
    this.price = null;
  }

  resetAfterBrand() {
    this.selectedModel = null;
    this.resetAfterModel();
  }

  resetAfterModel() {
    this.selectedYear = null;
    this.resetAfterYear();
  }

  resetAfterYear() {
    this.selectedBodyType = null;
    this.resetAfterBodyType();
  }

  resetAfterBodyType() {
    this.selectedGeneration = null;
    this.resetAfterGeneration();
  }

  resetAfterGeneration() {
    this.selectedEngine = null;
    this.resetAfterEngine();
  }

  resetAfterEngine() {
    this.selectedDrivetrain = null;
    this.resetAfterDrivetrain();
  }

  resetAfterDrivetrain() {
    this.selectedTransmission = null;
    this.resetAfterTransmission();
  }

  resetAfterTransmission() {
    this.selectedModification = null;
    this.resetAfterModification();
  }

  resetAfterModification() {
    this.selectedColor = null;
  }

  getSelectedBrandLogo(): string {
    const brand = this.brands.find((b) => b.name === this.selectedBrand);
    return brand ? brand.logo : 'assets/placeholder-logo.png';
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder-logo.png';
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.photos = Array.from(input.files);
    }
  }

  validateMileage() {
    this.mileage = this.mileage.replace(/[^0-9]/g, '');
  }

  canProceed(step: number): boolean {
    switch (step) {
      case 1:
        return !!(
          this.selectedBrand &&
          this.selectedModel &&
          this.selectedYear &&
          this.selectedBodyType &&
          this.selectedGeneration &&
          this.selectedEngine &&
          this.selectedDrivetrain &&
          this.selectedTransmission &&
          this.selectedModification &&
          this.selectedColor
        );
      case 2:
        return !!this.mileage && Number(this.mileage) > 0;
      case 3:
        return this.photos.length > 0;
      case 4:
        return !!this.ptsType;
      case 5:
        return !!this.description && this.description.trim().length > 0;
      case 6:
        return !!(
          this.contactName &&
          this.contactName.trim().length > 0 &&
          this.email &&
          this.email.trim().length > 0 &&
          this.phone &&
          this.phone.trim().length > 0
        );
      case 7:
        return !!this.price && this.price > 0;
      default:
        return false;
    }
  }

  proceedToNextStep() {
    if (this.currentStep < 7) {
      this.currentStep++;
    }
  }
}