import { Outlet } from 'react-router'
import { Link } from "react-router-dom";

export default function Layout() {
	return ( <>
		<Link to="other">Other Data View</Link>
		<Link to="test">Broken Link</Link>
		<Outlet />
	</>	)
}