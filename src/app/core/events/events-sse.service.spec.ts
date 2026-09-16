import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventsSseService } from './events-sse.service';
import { MockBackendService } from '../mock/mock-backend.service';

describe('EventsSseService', () => {
  let service: EventsSseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventsSseService, MockBackendService],
    });
    service = TestBed.inject(EventsSseService);
  });

  afterEach(() => {
    service.stop();
  });

  it('seeds mock events and marks the stream connected', () => {
    service.start('mock');
    expect(service.isConnected()).toBe(true);
    expect(service.eventCount()).toBeGreaterThan(0);
    expect(service.criticalEvents().length + service.highSeverityEvents().length).toBeGreaterThan(0);
  });

  it('appends mock stream events over time', fakeAsync(() => {
    service.start('mock');
    const initial = service.eventCount();
    tick(1600);
    expect(service.eventCount()).toBeGreaterThan(initial);
    service.stop();
    expect(service.isConnected()).toBe(false);
  }));
});
