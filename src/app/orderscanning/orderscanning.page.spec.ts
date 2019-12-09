import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderscanningPage } from './orderscanning.page';

describe('OrderscanningPage', () => {
  let component: OrderscanningPage;
  let fixture: ComponentFixture<OrderscanningPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderscanningPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderscanningPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
