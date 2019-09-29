import { TestBed } from '@angular/core/testing';

import { ProcessGraphService } from './process-graph.service';

describe('ProcessGraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProcessGraphService = TestBed.get(ProcessGraphService);
    expect(service).toBeTruthy();
  });
});
