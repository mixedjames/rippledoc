export function test(m: string): number {
  if (m === 'farts') {
    m = 'Censored';
  }

  console.log(m);
  return 42;
}
