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
