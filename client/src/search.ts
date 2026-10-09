import { debounceTime, distinctUntilChanged, from, switchMap, type Observable } from "rxjs"

export function bindSearch<T>(
  query$: Observable<string>,
  load: (query: string) => Promise<T>,
  receive: (value: T) => void,
): () => void {
  const subscription = query$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((query) => from(load(query))),
    )
    .subscribe(receive)
  return () => subscription.unsubscribe()
}
