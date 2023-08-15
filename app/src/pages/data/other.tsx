import { useState } from 'react'

export default function OtherDataView() {
	const [count, setCount] = useState(0)

	return ( <>
		<h1>OtherDataView</h1>
		<div className="card">
			<p>
				Some Data: 
			</p>
			<button onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</button>
		</div>
	</> )
}
