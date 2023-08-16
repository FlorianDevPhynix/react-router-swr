import { Outlet } from 'react-router';
import { Link } from 'react-router-dom';

export default function Layout() {
	return (
		<>
			<Link to="swr">SWR integration</Link>
			<Link to="test">Broken Link</Link>
			<Outlet />
		</>
	);
}
