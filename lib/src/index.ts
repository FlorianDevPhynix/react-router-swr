/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	useLoaderData as useUnsafeLoaderData,
	LoaderFunctionArgs,
} from 'react-router';
import { useParams } from 'react-router-dom';

import useSWR, { preload } from 'swr';
import type { SWRResponse, SWRConfiguration } from 'swr';

// loader
export type LoaderReturnDataType<Data> = Data | undefined | void;
export type LoaderFunction<Data> = (
	args: LoaderFunctionArgs
) => Promise<LoaderReturnDataType<Data>> | LoaderReturnDataType<Data>;

// useLoaderData
export type LoaderDataType<T extends LoaderFunction<unknown>> = Exclude<
	ReturnType<T>,
	Promise<ReturnType<T>>
>;

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
