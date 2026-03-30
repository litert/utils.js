/* eslint-disable */
import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import { E_RATE_LIMITED, E_BREAKER_OPENED } from './Errors.js';

NodeTest.describe('Module Concurrent - Errors', () => {

    // ─── Black-Box: Main Flow ────────────────────────────

    NodeTest.it('B-M-00001: E_RATE_LIMITED should be an instance of Error', () => {

        const err = new E_RATE_LIMITED();
        NodeAssert.ok(err instanceof Error);
    });

    NodeTest.it('B-M-00002: E_RATE_LIMITED should have message "The rate limit has been exceeded."', () => {

        const err = new E_RATE_LIMITED();
        NodeAssert.strictEqual(err.message, 'The rate limit has been exceeded.');
    });

    NodeTest.it('B-M-00003: E_RATE_LIMITED should have name "rate_limited"', () => {

        const err = new E_RATE_LIMITED();
        NodeAssert.strictEqual(err.name, 'rate_limited');
    });

    NodeTest.it('B-M-00004: E_BREAKER_OPENED should be an instance of Error', () => {

        const err = new E_BREAKER_OPENED();
        NodeAssert.ok(err instanceof Error);
    });

    NodeTest.it('B-M-00005: E_BREAKER_OPENED should have message "The breaker is open."', () => {

        const err = new E_BREAKER_OPENED();
        NodeAssert.strictEqual(err.message, 'The breaker is open.');
    });

    NodeTest.it('B-M-00006: E_BREAKER_OPENED should have name "breaker_opened"', () => {

        const err = new E_BREAKER_OPENED();
        NodeAssert.strictEqual(err.name, 'breaker_opened');
    });
});
