import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessGraphComponent } from './process-graph.component';

describe('ProcessGraphComponent', () => {
  let component: ProcessGraphComponent;
  let fixture: ComponentFixture<ProcessGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
