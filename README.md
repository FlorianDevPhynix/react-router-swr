# React-Router-SWR

Combine React Router's load before navigate, with SWR's cache, mutate and revalidate.

## Quick Start

Construct a loader with `makeLoader` and get access to the data in your page component through SWR from `useLoaderSWR`.
This data will be `prefetched` by React Router and can then be revalidated with SWR.

> Make sure this loader is registered to the routes it's data is used in.

```ts
import { makeLoader, useLoaderSWR } from 'react-router-swr';

const { loader, swrData } = makeLoader('/api/state', async (args) => {
  try {
    const result = await (await fetch(args.key)).json();
    return result.state as number;
  } catch (error) {
    redirect('error?code=400&message=failed to fetch state', 307);
  }
  return 0;
});

export { loader };

export default function DataComponent() {
  const { count } = useLoaderSWR(swrData, { keepPreviousData: true });

  return ( <>
    <h1>Data Component</h1>
    <p>Count: {count}</p>
  </> );
}
```

## React Router typesafe loader

Use the utility type `LoaderDataType` to make React Router's `useLoaderData` hook easily typesafe.

```ts
import type { LoaderFunction, LoaderDataType } from 'react-router-swr';

export const loader: LoaderFunction<number> = async (args) => {
  try {
    const result = await (await fetch('/api/state')).json();
    return result.state as number;
  } catch (error) {
    redirect('error?code=400&message=failed to fetch state', 307);
  }
};

export default function DataComponent() {
  const count = useLoaderData() as LoaderDataType<typeof loader>;

  return (
    <>
    <h1>Data Component</h1>
    <p>Count: {count ?? 0}</p>
    </>
  );
}
```

## License

The MIT License.
