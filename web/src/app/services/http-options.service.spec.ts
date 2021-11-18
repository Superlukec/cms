import { TestBed } from '@angular/core/testing';

import { HttpOptionsService } from './http-options.service';

describe('HttpOptionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpOptionsService = TestBed.get(HttpOptionsService);
    expect(service).toBeTruthy();
  });
});
