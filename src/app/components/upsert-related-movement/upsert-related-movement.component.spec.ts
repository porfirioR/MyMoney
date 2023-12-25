/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UpsertRelatedMovementComponent } from './upsert-related-movement.component';

describe('UpsertRelatedMovementComponent', () => {
  let component: UpsertRelatedMovementComponent;
  let fixture: ComponentFixture<UpsertRelatedMovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpsertRelatedMovementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertRelatedMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
