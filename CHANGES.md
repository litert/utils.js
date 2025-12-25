# CHANGES

## v1.6.0

- feat(pkg:concurrent): added utility class `MemoryMutex`

## v1.5.0

- feat(pkg:ts-types): added helper type `IInstanceOf`
- fix(pkg:string): renamed API `String.includeEvilSpaceChars` to `String.includeEvilWhitespaceChars`

    > The old API is kept for backward compatibility, but will be removed in future releases.

- fix(pkg:string): renamed API `String.replaceEvilSpaceChars` to `String.replaceEvilWhitespaceChars`

    > The old API is kept for backward compatibility, but will be removed in future releases.

## v1.4.0

- feat(pkg:concurrent): added utility class `SlideWindowCounter`
- feat(pkg:concurrent): added utility class `CountingRateLimiter`
- feat(pkg:concurrent): added utility class `TokenBucketRateLimiter`
- feat(pkg:concurrent): added utility class `TokenBucketRateLimiterManager`
- feat(pkg:concurrent): added utility class `LeakyBucketRateLimiter`
- feat(pkg:concurrent): added utility class `LeakyBucketRateLimiterManager`
- feat(pkg:ts-types): added helper type `IJsonSafeValue`
- feat(pkg:ts-types): added helper type `IMaybeArray`
- feat(pkg:concurrent): added utility class `ManualBreaker`
- feat(pkg:concurrent): added utility class `CircuitBreaker`

## v1.3.0

- feat(pkg:test): add API `Test.autoTick`
- feat(pkg:async): added utility class `AbortTimeoutController`
- feat(pkg:concurrent): added utility class `ThrottleController`
- feat(pkg:concurrent): added utility class `DebounceController`
- feat(pkg:concurrent): added utility class `FiberPool`
- feat(pkg:async): added API `Async.sleep`, with timer safety
- feat(pkg:async): added API `Async.autoRetry`, with exponential backoff and jitter supports.
- fix(pkg:network): export API `Network.isValidIPv4Address`
- feat(pkg:network): add API `Network.isValidMacAddress`
- feat(pkg:string): add API `String.isEmailAddress`

## v1.2.1

- feat(pkg:network): added API `Network.isValidIPv4Address`
- feat(pkg:async): added utility class `FiberController`
- feat(pkg:async): added utility class `PromiseController`
- feat(pkg:async): added utility class `BackgroundRunner`
- feat(pkg:async): added API `Async.withTimeout`

## v1.1.1

- build(doc): initialized project documents
- feat(pkg:string): added name casing detection APIs
- feat(pkg:string): added API `String.toChunksBackward`
- feat(pkg:string): added API `String.toChunks`
- fix(project): added missing metadata of packages
