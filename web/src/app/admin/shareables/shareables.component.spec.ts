import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareablesComponent } from './shareables.component';

describe('ShareablesComponent', () => {
  let component: ShareablesComponent;
  let fixture: ComponentFixture<ShareablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
