import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BulkOrderScanPage } from './bulk-order-scan.page';

describe('BulkOrderScanPage', () => {
  let component: BulkOrderScanPage;
  let fixture: ComponentFixture<BulkOrderScanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkOrderScanPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BulkOrderScanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
