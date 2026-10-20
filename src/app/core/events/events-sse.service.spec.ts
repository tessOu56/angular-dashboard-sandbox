import { TestBed } from '@angular/core/testing';
import { EventsSseService } from './events-sse.service';
import { MockBackendService } from '../mock/mock-backend.service';

describe('EventsSseService', () => {
    beforeEach(() => {
        vi.useFakeTimers({ advanceTimeDelta: 1, shouldAdvanceTime: true });
    });
    afterEach(() => {
        vi.useRealTimers();
    });
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

    it('appends mock stream events over time', async () => {
        service.start('mock');
        const initial = service.eventCount();
        await vi.advanceTimersByTimeAsync(1600);
        expect(service.eventCount()).toBeGreaterThan(initial);
        service.stop();
        expect(service.isConnected()).toBe(false);
    });

    it('uses the mock stream for loopback URLs', () => {
        service.start('http://localhost:3000/api/events/stream');
        expect(service.isConnected()).toBe(true);
        expect(service.error()).toBeNull();
    });

    it('rejects untrusted EventSource URLs instead of connecting', () => {
        service.start('https://evil.example/events?x=localhost');
        expect(service.isConnected()).toBe(false);
        expect(service.error()).toBe('SSE URL is not allowed');
    });
});
