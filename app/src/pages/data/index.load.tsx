/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLoaderData as useUnsafeLoaderData, type LoaderFunctionArgs } from 'react-router';
import { useParams } from 'react-router-dom';

import useSWR, { preload } from 'swr';
import type { SWRResponse, SWRConfiguration } from 'swr';

// loader
type LoaderReturnDataType<Data> = Data | undefined | void;
type LoaderFunction<Data> = (args: LoaderFunctionArgs) => Promise<LoaderReturnDataType<Data>> | LoaderReturnDataType<Data>;

// useLoaderData
type LoaderDataType<T extends LoaderFunction<unknown>> = Exclude<ReturnType<T>, Promise<ReturnType<T>>>

export function useLoaderData<T extends LoaderFunction<unknown>>() {
	return useUnsafeLoaderData() as LoaderDataType<T>
}

//
type SWRLoaderFunction<Data> = (args: LoaderFunctionArgs) => Promise<Data> | Data;

// key
type ArgumentsTuple = [string, ...unknown[]] | readonly [string, ...unknown[]];
type ArgumentsObject = {
	key: string,
	[name: string]: any
};
type Arguments = string | ArgumentsTuple | ArgumentsObject;
type Key = Arguments | (() => Arguments);

// fetcher
type FetcherArg<SWRKey extends Key = Key> = {
	key: SWRKey,
	/**
	 * Route params parsed by react-router from dynamic segments and passed to your loader.
	 */
	params: Record<string, string | undefined>,
	request: {
		/**
		 * current URL
		 */
		url: string
	}
};
type TypedRespone<Data = unknown, Error = any> = { data: Data, error: Error };
type FetcherResponse<Data = unknown> = Data | Promise<Data>;
type Fetcher<Data = unknown, SWRKey extends Key = Key> = (arg: FetcherArg<SWRKey>) => FetcherResponse<Data>;

type SWRData<Data = any, SWRKey extends Key = Key> = {
	key: SWRKey,
	fetcher: Fetcher<Data, SWRKey>
}

export function makeLoader<Data = any, Error = any, SWRKey extends Key = Key>( key: SWRKey, fetcher: Fetcher<Data, SWRKey> )
	: { loader: SWRLoaderFunction<Data>, swrData: SWRData<Data, SWRKey> }
{
	
	return {
		loader: async (args) => {
			return preload( {
				key,
				params: args.params,
				request: {
					url: args.request.url
				}
			}, fetcher )
		},
		swrData: {
			key,
			fetcher
		}
	}
}

// hook
type SWRLoaderOptions<Data> = SWRConfiguration<Data, Error, Fetcher<Data, Key>>
type BlockingData<Data = any, Options = SWRLoaderOptions<Data>> = Options extends undefined ? false : Options extends {
    suspense: true;
} ? true : Options extends {
    fallbackData: Data;
} ? true : Options extends {
    keepPreviousData: true;
} ? true : false;

interface SWRLoaderResponse<Data = any, Error = any, Config = any> extends Omit<SWRResponse<Data, Error, Config>, 'data'> {
	data: BlockingData<Data, Config> extends true ? Data : Data | undefined;
}

function useLoaderSWR<Data = any, Error = any, SWRKey extends Key = Key, 
	SWROptions extends SWRConfiguration<Data, Error, Fetcher<Data, SWRKey>> | undefined = SWRConfiguration<Data, Error, Fetcher<Data, SWRKey>> | undefined
>( swrData: SWRData<Data, SWRKey>, config?: SWROptions ) : SWRLoaderResponse<Data, Error, SWROptions> {
	const params = useParams();

	return useSWR( {
		key: swrData.key,
		params: params,
		request: {
			url: location.toString()
		}
	}, swrData.fetcher, config )
}

/* export const loader: LoaderFunction<number> = async (args) => {
	console.log("loader running")
	console.log(args)
	try {
		const result = await (await fetch("/api/state")).json();
		
		console.log("loader finished")
		return result.state as number;
	} catch (error) {
		redirect('error?code=400&message=failed to fetch state', 307)
	}
} */

const { loader, swrData } = makeLoader( '/api/state', async (args) => {
	console.log("loader running")
	console.log(args)
	try {
		await new Promise(resolve => setTimeout(resolve, 5 * 1000))
		const result = await (await fetch(args.key)).json();
		
		console.log("loader finished")
		return result.state as number;
	} catch (error) {
		redirect('error?code=400&message=failed to fetch state', 307)
	}
	return 0;
} )

export { loader };

export default function DataView() {
	/* const [count, setCount] = useLoader<typeof loader>('', async (value) => {
		fetch("/api/state", { method: 'POST', body: JSON.stringify({ state: value }) });
	} ) */
	const { data, mutate } = useLoaderSWR( swrData, { keepPreviousData: true } )

	async function setCounter( value: number) {
		await mutate( async () => {
			await new Promise(resolve => setTimeout(resolve, 5 * 1000))
			const result = await fetch("/api/state", { method: 'POST', body: JSON.stringify({ state: value }) });
			if (result.status !== 200) throw new Error('new state was rejected by backend');
			return value;
		}, { optimisticData: value, revalidate: false } );
	}

	return ( <>
		<h1>DataView</h1>
		<div className="card">
			<p>
				Some Data: 
			</p>
			{/* <button onClick={() => setCount((count) => count != undefined ? count + 1 : 0) }>
				count is {count ?? 0}
			</button> */}
			<button onClick={() => setCounter(data ? data - 1 : -1)}>
				-
			</button>
				count is {data ?? 0}
			<button onClick={() => setCounter(data ? data + 1 : 1)}>
				+
			</button>
		</div>
	</> )
}
