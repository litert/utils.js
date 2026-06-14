/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { ErrorRateCircuitBreakerCounter } from './CircuitBreaker.ErrorRateCounter.js';

NodeTest.describe('Module Concurrent - Class ErrorRateCircuitBreakerCounter', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: Should block when error rate exceeds threshold', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });

        counter.record(false); // 1/1 = 100% but minRequest=2 not met
        NodeAssert.strictEqual(counter.isBlocked(), false);

        counter.record(true); // 1/2 = 50% — exactly >= 0.5, blocked
        NodeAssert.strictEqual(counter.isBlocked(), true);

        counter.reset();

        counter.record(true); // 0/1 errors
        counter.record(true); // 0/2 errors
        counter.record(false); // 1/3 = 33.3% < 50%
        NodeAssert.strictEqual(counter.isBlocked(), false);

        counter.record(false); // 2/4 = 50% >= 50%
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-M-00002: Should not block when error rate is below threshold', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });

        counter.record(true);
        counter.record(true);
        counter.record(false); // 1/3 = 33.3% < 50%

        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('B-M-00003: Should not block when minRequest not met', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.1,
            minRequest: 10,
        });

        // 9 failures out of 9 = 100% but only 9 requests < minRequest 10
        for (let i = 0; i < 9; i++) {
            counter.record(false);
        }

        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('B-M-00004: Should block exactly at minRequest with sufficient error rate', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 4,
        });

        counter.record(false);
        counter.record(false);
        counter.record(true);
        counter.record(false); // 3/4 = 75% >= 50%, minRequest=4 met

        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-M-00005: Should reset both counters', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });

        counter.record(false);
        counter.record(false);
        NodeAssert.strictEqual(counter.isBlocked(), true);

        counter.reset();
        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('B-M-00006: Should accept custom createCounter factory', () => {

        let factoryCalls = 0;
        const counters: Array<{ increases: number; resets: number }> = [];

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 1,
            createCounter: () => {
                factoryCalls++;
                const state = { increases: 0, resets: 0 };
                counters.push(state);
                return {
                    increase: () => { state.increases++; return state.increases; },
                    reset: () => { state.resets++; },
                    getTotal: () => state.increases,
                };
            },
        });

        // Factory should be called twice: once for total, once for error
        NodeAssert.strictEqual(factoryCalls, 2);
        NodeAssert.strictEqual(counters.length, 2);

        counter.record(false); // total++, error++
        counter.record(true);  // total++ only

        NodeAssert.strictEqual(counters[0].increases, 2); // total counter
        NodeAssert.strictEqual(counters[1].increases, 1); // error counter

        counter.reset();

        NodeAssert.strictEqual(counters[0].resets, 1);
        NodeAssert.strictEqual(counters[1].resets, 1);
    });

    // ─── Black-Box: Failure Flow ─────────────────────────

    NodeTest.it('B-F-00001: Should throw RangeError for errorRateThreshold <= 0', () => {

        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 0, minRequest: 1 }),
            { name: 'RangeError' }
        );
        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: -0.5, minRequest: 1 }),
            { name: 'RangeError' }
        );
    });

    NodeTest.it('B-F-00002: Should throw RangeError for errorRateThreshold >= 1', () => {

        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 1, minRequest: 1 }),
            { name: 'RangeError' }
        );
        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 1.5, minRequest: 1 }),
            { name: 'RangeError' }
        );
    });

    NodeTest.it('B-F-00003: Should throw RangeError for NaN errorRateThreshold', () => {

        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: NaN, minRequest: 1 }),
            { name: 'RangeError' }
        );
    });

    NodeTest.it('B-F-00004: Should throw RangeError for non-integer minRequest', () => {

        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 0.5, minRequest: 1.5 }),
            { name: 'RangeError' }
        );
    });

    NodeTest.it('B-F-00005: Should throw RangeError for negative minRequest', () => {

        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 0.5, minRequest: -1 }),
            { name: 'RangeError' }
        );
    });

    // ─── Black-Box: Edge Cases ───────────────────────────

    NodeTest.it('B-E-00001: Should allow minRequest of 0', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 0,
        });

        // minRequest=0 means any error rate is checked immediately
        counter.record(false); // 1/1 = 100% >= 50%
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-E-00002: Should handle exact threshold boundary', () => {

        // errorRateThreshold = 0.5, exactly 50% error rate
        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });

        counter.record(false);
        counter.record(true); // 1/2 = 0.5, which is >= 0.5

        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('B-E-00003: Should handle all-success scenario', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });

        counter.record(true);
        counter.record(true);
        counter.record(true);

        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('B-E-00004: Should handle all-failure scenario', () => {

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 2,
        });

        counter.record(false);
        counter.record(false);

        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    // ─── White-Box: Main Flow ────────────────────────────

    NodeTest.it('W-M-00001: Should call increase() on totalCounter for every record', () => {

        // Targets line 101: `this._totalCounter.increase()`
        let totalIncreases = 0;
        let errorIncreases = 0;
        let factoryCallCount = 0;

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 1,
            createCounter: () => {
                factoryCallCount++;
                const isTotal = factoryCallCount === 1;
                return {
                    increase: () => {
                        if (isTotal) { totalIncreases++; } else { errorIncreases++; }
                        return isTotal ? totalIncreases : errorIncreases;
                    },
                    reset: () => {
                        if (isTotal) { totalIncreases = 0; } else { errorIncreases = 0; }
                    },
                    getTotal: () => isTotal ? totalIncreases : errorIncreases,
                };
            },
        });

        counter.record(true);  // total++ only
        counter.record(false); // total++, error++
        counter.record(true);  // total++ only

        NodeAssert.strictEqual(totalIncreases, 3);
        NodeAssert.strictEqual(errorIncreases, 1);
    });

    NodeTest.it('W-M-00002: Should return false from isBlocked when total < minRequest', () => {

        // Targets lines 111-113: the `total < this._minRequest` guard
        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.01, // very low threshold
            minRequest: 5,
        });

        for (let i = 0; i < 4; i++) {
            counter.record(false); // 100% error rate but < minRequest
        }

        NodeAssert.strictEqual(counter.isBlocked(), false);
    });

    NodeTest.it('W-M-00003: Should compute error/total >= threshold for isBlocked', () => {

        // Targets line 116: the division and comparison
        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.25,
            minRequest: 4,
        });

        // 1/4 = 0.25 >= 0.25 → blocked
        counter.record(true);
        counter.record(true);
        counter.record(true);
        counter.record(false);

        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    // ─── White-Box: Failure Flow ─────────────────────────

    NodeTest.it('W-F-00001: Should throw RangeError with descriptive message for bad threshold', () => {

        // Targets line 85-88: the RangeError message
        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 0, minRequest: 1 }),
            (err: Error) => {
                NodeAssert.strictEqual(err.name, 'RangeError');
                NodeAssert.ok(err.message.includes('errorRateThreshold'));
                return true;
            }
        );
    });

    NodeTest.it('W-F-00002: Should throw RangeError with descriptive message for bad minRequest', () => {

        // Targets line 92: the RangeError message
        NodeAssert.throws(
            () => new ErrorRateCircuitBreakerCounter({ errorRateThreshold: 0.5, minRequest: -1 }),
            (err: Error) => {
                NodeAssert.strictEqual(err.name, 'RangeError');
                NodeAssert.ok(err.message.includes('minRequest'));
                return true;
            }
        );
    });

    // ─── White-Box: Edge Cases ───────────────────────────

    NodeTest.it('W-E-00001: Should handle threshold very close to 0', () => {

        // Just above 0 — the `<= 0` check should not trigger
        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: Number.MIN_VALUE,
            minRequest: 1,
        });

        counter.record(false); // 1/1 = 1.0 >= MIN_VALUE
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('W-E-00002: Should handle threshold very close to 1', () => {

        // Just below 1 — the `>= 1` check should not trigger
        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 1 - Number.EPSILON,
            minRequest: 1,
        });

        counter.record(false); // 1/1 = 1.0 >= (1 - EPSILON)
        NodeAssert.strictEqual(counter.isBlocked(), true);
    });

    NodeTest.it('W-E-00003: Should reset both internal counters independently', () => {

        let totalResets = 0;
        let errorResets = 0;
        let factoryCallCount = 0;

        const counter = new ErrorRateCircuitBreakerCounter({
            errorRateThreshold: 0.5,
            minRequest: 1,
            createCounter: () => {
                factoryCallCount++;
                const isTotal = factoryCallCount === 1;
                return {
                    increase: () => 1,
                    reset: () => { if (isTotal) { totalResets++; } else { errorResets++; } },
                    getTotal: () => 0,
                };
            },
        });

        counter.reset();

        NodeAssert.strictEqual(totalResets, 1);
        NodeAssert.strictEqual(errorResets, 1);
    });

    // ─── White-Box: Update Compatibility ─────────────────

    NodeTest.it('W-U-00001: Should preserve isBlocked behavior for representative input patterns', () => {

        /**
         * @undocumented
         * Captures the current isBlocked behavior across various record sequences.
         */
        const cases: Array<{ records: boolean[]; threshold: number; minReq: number; expected: boolean }> = [
            { records: [true, true, true], threshold: 0.5, minReq: 3, expected: false },
            { records: [false, false, false], threshold: 0.5, minReq: 3, expected: true },
            { records: [true, false, true, false], threshold: 0.5, minReq: 4, expected: true },
            { records: [true, true, false], threshold: 0.5, minReq: 5, expected: false },
            { records: [false], threshold: 0.5, minReq: 1, expected: true },
            { records: [true], threshold: 0.5, minReq: 1, expected: false },
        ];

        for (const { records, threshold, minReq, expected } of cases) {

            const counter = new ErrorRateCircuitBreakerCounter({
                errorRateThreshold: threshold,
                minRequest: minReq,
            });

            for (const success of records) {
                counter.record(success);
            }

            NodeAssert.strictEqual(
                counter.isBlocked(),
                expected,
                `records=[${records}] threshold=${threshold} minReq=${minReq}`
            );
        }
    });
});
