import { useEffect } from 'react';
import { redirect } from 'react-router';

import { makeLoader, useLoaderSWR } from 'react-router-swr';

const { loader, swrData } = makeLoader('/api/state', async (args) => {
	console.log('loader running');
	console.log(args);
	try {
		//await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
		const result = await (await fetch(args.key)).json();

		console.log('loader finished');
		return result.state as number;
	} catch (error) {
		redirect('error?code=400&message=failed to fetch state', 307);
	}
	return 0;
});

export { loader };

export default function DataView() {
	const { data, mutate } = useLoaderSWR(swrData, { keepPreviousData: true });

	async function setCounter(value: number) {
		await mutate(
			async () => {
				await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
				const result = await fetch('/api/state', {
					method: 'POST',
					body: JSON.stringify({ state: value }),
				});
				if (result.status !== 200)
					throw new Error('new state was rejected by backend');
				return value;
			},
			{ optimisticData: value, revalidate: true }
		);
	}

	const delay = 5 * 1000;

	useEffect(() => {
		const handler = setTimeout(() => {
			setCounter(data);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [data, delay]);

	return (
		<>
			<h1>DataView</h1>
			<div className="card">
				<p>Some Data:</p>
				{/* <button onClick={() => setCount((count) => count != undefined ? count + 1 : 0) }>
				count is {count ?? 0}
			</button> */}
				<button
					onClick={() =>
						mutate(data ? data - 1 : -1, { revalidate: false })
					}
				>
					-
				</button>
				count is {data ?? 0}
				<button
					onClick={() =>
						mutate(data ? data + 1 : 1, { revalidate: false })
					}
				>
					+
				</button>
			</div>
		</>
	);
}
