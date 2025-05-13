import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsallComponent } from './carsall.component';

describe('CarsallComponent', () => {
  let component: CarsallComponent;
  let fixture: ComponentFixture<CarsallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
