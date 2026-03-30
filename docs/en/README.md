# API Reference — @litert/utils

[TOC]

## Overview

`@litert/utils` is a collection of utility libraries for JavaScript/TypeScript, organized as individual packages. Each package focuses on a specific concern and can be installed independently. All packages are available under the `@litert/` scope.

## Namespaces

| Namespace | Package | Description |
| --- | --- | --- |
| [`Array`](./namespaces/array/README.md) | `@litert/utils-array` | Array utility functions: deduplication, chunking, and dictionary transformation. |
| [`Async`](./namespaces/async/README.md) | `@litert/utils-async` | Asynchronous utilities: sleep, timeout, abort-signal binding, auto-retry, and promise/fiber management. |
| [`Concurrent`](./namespaces/concurrent/README.md) | `@litert/concurrent` | Concurrency primitives: rate limiters, circuit breakers, debounce/throttle controllers, mutexes, and fiber pools. |
| [`flow-control`](./namespaces/flow-control/README.md) | `@litert/utils-flow-control` | Flow-control helpers: expression-style try-catch and conditional value selection. |
| [`Network`](./namespaces/network/README.md) | `@litert/utils-network` | Network validation and parsing: IPv4, IPv6, and MAC address utilities. |
| [`Number`](./namespaces/number/README.md) | `@litert/utils-number` | Number utilities: unit conversion and random number generation. |
| [`Object`](./namespaces/object/README.md) | `@litert/utils-object` | Object utilities: deep merge, property copy/pick, constructor reflection, and subclass checking. |
| [`String`](./namespaces/string/README.md) | `@litert/utils-string` | String utilities: case conversion, line handling, HTML escaping, random generation, email validation, and unit parsing. |
| [`Test`](./namespaces/test/README.md) | `@litert/utils-test` | Test helpers for Node.js built-in test runner: automatic mock-timer advancement. |
| [`ts-types`](./namespaces/ts-types/README.md) | `@litert/utils-ts-types` | Static TypeScript utility types for use in generic constraints and type-level programming. |
