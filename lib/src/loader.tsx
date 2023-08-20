/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	useLoaderData as useUnsafeLoaderData,
	LoaderFunctionArgs,
} from 'react-router';
import { useParams } from 'react-router-dom';

import useSWR, { preload } from 'swr';
import type { SWRResponse, SWRConfiguration } from 'swr';

// loader
export type { LoaderFunctionArgs };
//export type LoaderReturnDataType<Data> = Data | undefined | void;
export type LoaderFunction<Data> = (
	args: LoaderFunctionArgs
) => Promise<Data | undefined | void> | Data | undefined | void;

/**
 * Infer the data type of a loader function.
 *
 * @example
 * ```
 * import type { LoaderFunction, LoaderDataType } from 'react-router-swr';
 *
 * export const loader: LoaderFunction<number> = async (args) => {
 * 	try {
 * 		const result = await (await fetch('/api/state')).json();
 * 		return result.state as number;
 * 	} catch (error) {
 * 		redirect('error?code=400&message=failed to fetch state', 307);
 * 	}
 * };
 *
 * export default function DataComponent() {
 * 	const count = useLoaderData() as LoaderDataType<typeof loader>;
 *
 * 	return (
 * 		<>
 * 			<h1>Data Component</h1>
 * 			<p>Count: {count ?? 0}</p>
 * 		</>
 * 	);
 * }
 * ```
 */
export type LoaderDataType<
	T extends LoaderFunction<unknown>,
	R = Exclude<ReturnType<T>, Promise<ReturnType<T>>>,
> = R;

/**
 * Typesafe loader data hook for React Router.
 *
 * @experimental Does not work right now! Use {@link LoaderDataType} instead.
 *
 * @throws if the loader was never registered or failed.
 *
 * @returns The data from the current route's loader function.
 *
 * # Warning!
 *
 * Only use if you ensured that the loader is registered to the current route.
 *
 * If the loader fails, you should either use [errorElements](https://reactrouter.com/en/main/route/error-element)
 * or [redirect](https://reactrouter.com/en/main/fetch/redirect) to an error page.
 *
 * @example
 * ```tsx
 * import { type LoaderFunction, useLoaderData } from 'react-router-swr';
 * import { redirect } from 'react-router';
 *
 * export const loader: LoaderFunction<number> = async (args) => {
 *     try {
 *         const result = await (await fetch("/api/state")).json();
 *         return result.state as number;
 *     } catch (error) {
 *         redirect('error?code=400&message=failed to fetch state', 307)
 *     }
 * }
 *
 * export default DataComponent() {
 *     const count = useLoaderData<typeof loader>();
 *
 *     return ( <>
 *         <h1>Data Component</h1>
 *         <p>Count: {count}</p>
 *     </> )
 * }
 * ```
 */
export function useLoaderData<T extends LoaderFunction<unknown>>() {
	return useUnsafeLoaderData() as LoaderDataType<T>;
}

//
export type SWRLoaderFunction<Data> = (
	args: LoaderFunctionArgs
) => Promise<Data> | Data;

// key
export type ArgumentsTuple =
	| [string, ...unknown[]]
	| readonly [string, ...unknown[]];
export type ArgumentsObject = {
	key: string;
	[name: string]: any;
};
export type Arguments = string | ArgumentsTuple | ArgumentsObject;
export type Key = Arguments | (() => Arguments);

// fetcher
export type FetcherArg<SWRKey extends Key = Key> = {
	key: SWRKey;
	/**
	 * Route params parsed by react-router from dynamic segments and passed to your loader.
	 */
	params: Record<string, string | undefined>;
	request: {
		/**
		 * current URL
		 */
		url: string;
	};
};
export type TypedRespone<Data = unknown, Error = any> = {
	data: Data;
	error: Error;
};
export type FetcherResponse<Data = unknown> = Data | Promise<Data>;
export type Fetcher<Data = unknown, SWRKey extends Key = Key> = (
	arg: FetcherArg<SWRKey>
) => FetcherResponse<Data>;

export type SWRData<Data = any, SWRKey extends Key = Key> = {
	key: SWRKey;
	fetcher: Fetcher<Data, SWRKey>;
};

/**
 * Share a single data loading function between React Router and SWR.
 *
 * @param key - The static key to be used with SWR and all requests.
 * @param fetcher - Function to load data in a React Router route loader and SWR.
 * @returns A object with the React Router loader function and data for {@link useLoaderSWR}.
 *
 * @throws if the loader was never registered or failed.
 *
 * # Warning!
 *
 * Only use if you ensured that the loader is registered to the current route.
 *
 * If the loader fails, you should either use [errorElements](https://reactrouter.com/en/main/route/error-element)
 * or [redirect](https://reactrouter.com/en/main/fetch/redirect) to an error page.
 *
 * @example
 * ```
 * import { makeLoader } from 'react-router-swr';
 *
 * const { loader, swrData } = makeLoader('/api/state', async (args) => {
 *  try {
 * 		const result = await (await fetch(args.key)).json();
 * 		return result.state as number;
 * 	} catch (error) {
 * 		redirect('error?code=400&message=failed to fetch state', 307);
 * 	}
 * 	return 0;
 * });
 *
 * export { loader };
 * ```
 */
export function makeLoader<
	Data = any,
	/* Error = any, */ SWRKey extends Key = Key,
>(
	key: SWRKey,
	fetcher: Fetcher<Data, SWRKey>
): { loader: SWRLoaderFunction<Data>; swrData: SWRData<Data, SWRKey> } {
	return {
		loader: async (args) => {
			return preload(
				{
					key,
					params: args.params,
					request: {
						url: args.request.url,
					},
				},
				fetcher
			);
		},
		swrData: {
			key,
			fetcher,
		},
	};
}

// hook
export type SWRLoaderOptions<Data> = SWRConfiguration<
	Data,
	Error,
	Fetcher<Data, Key>
>;
export type BlockingData<
	Data = any,
	Options = SWRLoaderOptions<Data>,
> = Options extends undefined
	? false
	: Options extends {
			suspense: true;
	  }
	? true
	: Options extends {
			fallbackData: Data;
	  }
	? true
	: Options extends {
			keepPreviousData: true;
	  }
	? true
	: false;

export interface SWRLoaderResponse<Data = any, Error = any, Config = any>
	extends Omit<SWRResponse<Data, Error, Config>, 'data'> {
	data: BlockingData<Data, Config> extends true ? Data : Data | undefined;
}

/**
 * Use the data function passed to {@link makeLoader} with SWR.
 *
 * @param swrData - The data object being returned by {@link makeLoader}. Is used to infer the key and data types.
 * @param config - {@link https://swr.vercel.app/docs/options | SWRConfiguration}
 * @returns {} {@link https://swr.vercel.app/docs/api#return-values | SWRResponse}
 *
 * @throws if the loader was never registered or failed.
 *
 * # Warning!
 *
 * Only use if you ensured that the used loader is registered to the current route.
 *
 * If the loader fails, you should either use [errorElements](https://reactrouter.com/en/main/route/error-element)
 * or [redirect](https://reactrouter.com/en/main/fetch/redirect) to an error page.
 *
 * @example
 * ```
 * import { useLoaderSWR } from 'react-router-swr';
 *
 * export default function DataComponent() {
 *	const { count } = useLoaderSWR(swrData, { keepPreviousData: true });
 *
 *	return ( <>
 * 		<h1>Data Component</h1>
 * 		<p>Count: {count}</p>
 *	</> );
 * }
 * ```
 */
export function useLoaderSWR<
	Data = any,
	Error = any,
	SWRKey extends Key = Key,
	SWROptions extends
		| SWRConfiguration<Data, Error, Fetcher<Data, SWRKey>>
		| undefined =
		| SWRConfiguration<Data, Error, Fetcher<Data, SWRKey>>
		| undefined,
>(
	swrData: SWRData<Data, SWRKey>,
	config?: SWROptions
): SWRLoaderResponse<Data, Error, SWROptions> {
	const params = useParams();

	return useSWR(
		{
			key: swrData.key,
			params: params,
			request: {
				url: location.toString(),
			},
		},
		swrData.fetcher,
		config
	);
}
