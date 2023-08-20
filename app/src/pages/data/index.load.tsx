import { redirect, useLoaderData } from 'react-router';
import type { LoaderFunction, LoaderDataType } from 'react-router-swr';

export const loader: LoaderFunction<number> = async (args) => {
	console.log('loader running');
	console.log(args);
	try {
		const result = await (await fetch('/api/state')).json();

		console.log('loader finished');
		return result.state as number;
	} catch (error) {
		redirect('error?code=400&message=failed to fetch state', 307);
	}
};

export default function DataView() {
	const count = useLoaderData() as LoaderDataType<typeof loader>;

	return (
		<>
			<h1>DataView</h1>
			<div className="card">
				<p>Some Data:</p>
				count is {count ?? 0}
			</div>
		</>
	);
}
