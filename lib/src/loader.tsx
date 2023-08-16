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

// useLoaderData
export type LoaderDataType<
	T extends LoaderFunction<unknown>,
	R = Exclude<ReturnType<T>, Promise<ReturnType<T>>>,
> = R;

/**
 * Typesafe loader data hook for React Router.
 *
 * @throws if the loader was never registered or failed.
 *
 * @returns The data from the current route's loader function.
 *
 * # Warning!
 *
 * Only use if you ensured that the loader is registered to the current route.
 *
 * If the loader fails, you also should either use [errorElements](https://reactrouter.com/en/main/route/error-element)
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
 *     const state = useLoaderData<typeof loader>();
 *
 *     return ( <>
 *         <h1>Data Component>
 *         <p>{state}</p>
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
 * @param key
 * @param fetcher
 * @returns
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
