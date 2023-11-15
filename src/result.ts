import { Observable, type OperatorFunction } from 'rxjs';

export type Result<T> = OkResult<T> | ErrorResult<T>;

export const ok = <T>(value: T): Result<T> => new OkResult(value);
export const error = <T>(error: unknown): Result<T> => new ErrorResult(error);

/**
 * Maps the values emitted by an Observable to a Result.
 */
export const toResult = <T>(): OperatorFunction<T, Result<T>> => {
  return (observable: Observable<T>) => {
    return new Observable<Result<T>>((observer) => {
      return observable.subscribe({
        next: (value) => {
          observer.next(ok(value));
        },
        error: (value) => {
          observer.next(error(value));
        },
        complete: () => {
          observer.complete();
        },
      });
    });
  };
};

class OkResult<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isOk(): this is OkResult<T> {
    return true;
  }

  isError(): this is ErrorResult<T> {
    return false;
  }

  equalTo(result: Result<T>): boolean {
    return result.isOk() && result.valueOf() === this.value;
  }

  orThrow(): T {
    return this.value;
  }

  valueOf(): T {
    return this.value;
  }
}

class ErrorResult<T> {
  private readonly error: unknown;

  constructor(error: unknown) {
    this.error = error;
  }

  isOk(): this is OkResult<T> {
    return false;
  }

  isError(): this is ErrorResult<T> {
    return true;
  }

  equalTo(result: Result<T>): boolean {
    return result.isError() && result.valueOf() === this.error;
  }

  orThrow(): never {
    throw this.error;
  }

  valueOf() {
    return this.error;
  }
}
