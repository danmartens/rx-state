export function compose<
  C1 extends (input: any) => any,
  C2 extends (input: ReturnType<C1>) => any,
>(fn1: C1, fn2: C2): (input: Parameters<C1>[0]) => ReturnType<C2>;

export function compose<
  C1 extends (input: any) => any,
  C2 extends (input: ReturnType<C1>) => any,
  C3 extends (input: ReturnType<C2>) => any,
>(fn1: C1, fn2: C2, fn3: C3): (input: Parameters<C1>[0]) => ReturnType<C3>;

export function compose<
  C1 extends (input: any) => any,
  C2 extends (input: ReturnType<C1>) => any,
  C3 extends (input: ReturnType<C2>) => any,
>(fn1: C1, fn2: C2, fn3?: C3) {
  if (fn3 !== undefined) {
    return (input: Parameters<C1>[0]) => fn3(fn2(fn1(input))) as ReturnType<C3>;
  }

  return (input: Parameters<C1>[0]) => fn2(fn1(input)) as ReturnType<C2>;
}
