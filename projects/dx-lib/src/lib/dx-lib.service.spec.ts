import { TestBed } from '@angular/core/testing';

import { DxLibService } from './dx-lib.service';

describe('DxLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DxLibService = TestBed.get(DxLibService);
    expect(service).toBeTruthy();
  });
});
