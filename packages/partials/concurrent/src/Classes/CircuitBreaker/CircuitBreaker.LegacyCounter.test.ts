/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { LegacyCircuitBreakerCounter } from './CircuitBreaker.LegacyCounter.js';

NodeTest.describe('Module Concurrent - Class LegacyCircuitBreakerCounter', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should count failures and block when threshold reached', () => {

        const counter = new LegacyCircuitBreakerCounter(3);

        NodeAssert.strictEqual(counter.isBlocked(), false);

        counter.record(false); // 1 failure
        NodeAssert.strictEqual(counter.isBlocked(), false);

        counter.record(false); // 2 failures
        NodeAssert.strictEqual(counter.isBlocked(), false);

        counter.record(false); // 3 failures — threshold reached
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-M-00002: Should not count successes as failures', () => {

        const counter = new LegacyCircuitBreakerCounter(3);

        counter.record(true);
        counter.record(true);
        counter.record(true);

        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('B-M-00003: Should reset failure count', () => {

        const counter = new LegacyCircuitBreakerCounter(2);

        counter.record(false);
        counter.record(false);
        NodeAssert.strictEqual(counter.isBlocked(), true);

        counter.reset();
        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('B-M-00004: Should accept custom ICounter implementation', () => {

        let increaseCalls = 0;
        let resetCalls = 0;
        let totalValue = 0;

        const mockCounter = {
            increase: () => { increaseCalls++; return ++totalValue; },
            reset: () => { resetCalls++; totalValue = 0; },
            getTotal: () => totalValue,
        };

        const counter = new LegacyCircuitBreakerCounter(5, mockCounter);

        counter.record(false);
        NodeAssert.strictEqual(increaseCalls, 1);

        counter.record(true);
        NodeAssert.strictEqual(increaseCalls, 1); // no increase for success

        counter.reset();
        NodeAssert.strictEqual(resetCalls, 1);
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should use default threshold of 5', () => {

        const counter = new LegacyCircuitBreakerCounter();

        for (let i = 0; i < 4; i++) {
            counter.record(false);
            NodeAssert.strictEqual(counter.isBlocked(), false);
        }

        counter.record(false); // 5th failure
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-E-00002: Should block immediately when threshold is 1', () => {

        const counter = new LegacyCircuitBreakerCounter(1);

        counter.record(false);
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-E-00003: Should handle mixed success and failure records', () => {

        const counter = new LegacyCircuitBreakerCounter(3);

        counter.record(false);
        counter.record(true);
        counter.record(false);
        NodeAssert.strictEqual(counter.isBlocked(), false);

        counter.record(false); // 3rd failure
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    // ─── White-Box: Main Flow ────────────────────────────

    NodeTest.it('W-M-00001: Should delegate increase() only on failure (isFailure path)', () => {

        // Targets the `if (!success)` branch in record()
        let increaseCount = 0;
        const mockCounter = {
            increase: () => { increaseCount++; return increaseCount; },
            reset: () => {},
            getTotal: () => increaseCount,
        };

        const counter = new LegacyCircuitBreakerCounter(10, mockCounter);

        counter.record(true);
        counter.record(true);
        counter.record(false);
        counter.record(true);
        counter.record(false);

        NodeAssert.strictEqual(increaseCount, 2);
    });

    NodeTest.it('W-M-00002: Should delegate reset() to internal counter', () => {

        let resetCalled = false;
        const mockCounter = {
            increase: () => 1,
            reset: () => { resetCalled = true; },
            getTotal: () => 0,
        };

        const counter = new LegacyCircuitBreakerCounter(5, mockCounter);
        counter.reset();

        NodeAssert.strictEqual(resetCalled, true);
    });

    NodeTest.it('W-M-00003: Should compare getTotal() >= threshold for isBlocked', () => {

        // Targets the `>= this._breakThreshold` comparison
        const counter = new LegacyCircuitBreakerCounter(3);

        counter.record(false);
        counter.record(false);
        NodeAssert.strictEqual(counter.isBlocked(), false); // 2 < 3

        counter.record(false);
        NodeAssert.strictEqual(counter.isBlocked(), true); // 3 >= 3
    });
});
