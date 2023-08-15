import { Outlet, Link } from 'react-router-dom'

export default function MainLayout() {
	return ( <>
		<p>Root layout</p>
		<Link to={""}>Home</Link>
		<Link to={"data"}>Data View</Link>
		<Outlet />
	</> )
}