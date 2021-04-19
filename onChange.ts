import { interval, Observable } from "rxjs";
import { bufferCount, filter, map, startWith } from "rxjs/operators";

// Will generate a sequence of alternating 0 and 1 at random interval
interval(1000)
  .pipe(
    map(x => Math.floor(Math.random() * 10) % 2),
    onChange()
  )
  .subscribe(x => console.log(x));

function onChange() {
  return function<T>(source: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      source
        .pipe(
          startWith(null),
          bufferCount(2, 1),
          filter(v => v[0] !== v[1]),
          map(v => v[1])
        )
        .subscribe({
          next(value) {
            if (value !== undefined && value !== null) {
              subscriber.next(value);
            }
          },
          error(error) {
            subscriber.error(error);
          },
          complete() {
            subscriber.complete();
          }
        });
    });
  };
}
