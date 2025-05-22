import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-wallet',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent {

  constructor(
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Кошелек');

    this.metaService.updateTag({
      name: 'description',
      content: 'Кошелек пользователя'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'баланс, пополнить',
    });
  }
}