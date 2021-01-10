import { Observable, Subject } from "rxjs";
import { ajax } from "rxjs/ajax";

function cacheOnComplete() {
  return function<T>(source: Observable<T>): Observable<T> {
    let hasLastFailed = true,
      inProgress = false,
      lastEmittedValue: T,
      subject;

    return new Observable<T>(destination => {
      if (!inProgress) {
        if (hasLastFailed) {
          console.log("!inProgress && hasLastFailed");
          subject = new Subject<T>();
          subject.subscribe(destination);
          inProgress = true;
          source.subscribe({
            next(value) {
              console.log("source next");
              lastEmittedValue = value;
              subject.next(value);
            },
            error(error) {
              console.log("source error");
              hasLastFailed = true;
              inProgress = false;
              subject.error(error);
            },
            complete() {
              console.log("source complete");
              hasLastFailed = false;
              inProgress = false;
              subject.complete();
            }
          });
        } else {
          console.log("!inProgress && !hasLastFailed");
          destination.next(lastEmittedValue);
          destination.complete();
        }
      } else {
        console.log("inProgress");
        subject.subscribe(destination);
      }
    });
  };
}

const httpcall = ajax("https://httpstat.us/200?sleep=50").pipe(
  cacheOnComplete()
);

let one, two, three;
httpcall.subscribe(
  val => {
    one = val;
    console.log("next one: ", val);
  },
  val => {
    one = val;
    console.log("error one: ", val);
  }
);

httpcall.subscribe(
  val => {
    two = val;
    console.log("next two: ", val);
  },
  val => {
    two = val;
    console.log("error two: ", val);
  }
);

setTimeout(() => {
  httpcall.subscribe(
    val => {
      three = val;
      console.log("next three: ", val);
    },
    val => {
      three = val;
      console.log("error three: ", val);
    }
  );
}, 1000);

setTimeout(() => {
  console.log(one === two);
  console.log(two === three);
}, 2000);
