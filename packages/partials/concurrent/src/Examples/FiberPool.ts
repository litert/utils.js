/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BackgroundRunner } from '@litert/utils-async';
import * as NodeTimers from 'node:timers/promises';
import { FiberPool } from '..';

const fp = new FiberPool({
    maxFibers: 5,
});

const bgRunner = new BackgroundRunner();

bgRunner.run(async () => {

    const fn = async (data: number): Promise<void> => {

        await NodeTimers.setTimeout(1000);
        console.log(`[${new Date().toISOString()}] Running function with data: ${data}, Idle Fibers: ${fp.idleFibers}, Busy Fibers: ${fp.busyFibers}`);
    };

    const pr: Array<Promise<void>> = [];
    for (let i = 0; i < 6; i++) {
        pr.push(fp.run({
            function: fn,
            data: i
        }));
        console.log(`[${new Date().toISOString()}] Idle Fibers: ${fp.idleFibers}, Busy Fibers: ${fp.busyFibers}`);

    }

    await Promise.allSettled(pr);
    console.log(`[${new Date().toISOString()}] Idle Fibers: ${fp.idleFibers}, Busy Fibers: ${fp.busyFibers}`);
    fp.close();
    console.log('Fiber pool closed.');
});
