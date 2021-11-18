import { TestBed } from '@angular/core/testing';

import { SlugifyService } from './slugify.service';

describe('SlugifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SlugifyService = TestBed.get(SlugifyService);
    expect(service).toBeTruthy();
  });
});
