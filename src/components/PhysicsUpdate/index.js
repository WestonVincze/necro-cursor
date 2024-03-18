import { Subject, interval, map } from "rxjs";

const FPS = 60;

export const PhysicsUpdate = () => {
  let frameLength = 1000 / FPS;
  let lastTimestamp = 0;
  let isRunning = false;

  const updateSubject = new Subject();
  let updateSubscription = null;

  const start = () => {
    if (isRunning) return;

    isRunning = true;

    lastTimestamp = performance.now();

    updateSubscription = interval(frameLength).pipe(
      map(() => {
        const now = performance.now();
        const deltaTime = (now - lastTimestamp) / frameLength;
        lastTimestamp = now;
        return deltaTime;
      })
    ).subscribe(deltaTime => {
      updateSubject.next(deltaTime);
    })
  }

  const pause = () => {
    if (!isRunning) return;

    isRunning = false;
    if (updateSubscription) {
      updateSubscription.unsubscribe();
      updateSubscription = null;
    }
  }

  const stop = () => {
    pause();
    updateSubject.complete();
  }

  const subscribe = (callback) => {
    return updateSubject.subscribe(callback);
  }

  return {
    start,
    pause,
    stop,
    subscribe,
  }
}