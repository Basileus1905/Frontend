import { TestBed } from '@angular/core/testing';

import { ShoppingItemServiceService } from './shopping-item-service.service';

describe('ShoppingItemServiceService', () => {
  let service: ShoppingItemServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingItemServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
