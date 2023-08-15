import React from 'react'
import ReactDOM from 'react-dom/client'
import { Suspense } from 'react'

import route_data from '~react-pages'
import {
	RouterProvider,
	createBrowserRouter,
} from 'react-router-dom'

import './index.scss'
//import ErrorPage from './404'

console.log(route_data)
const router = createBrowserRouter(route_data);
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Suspense fallback={<p>Loading...</p>}>
			<RouterProvider router={router} /* fallbackElement={<ErrorPage />} */ />
		</Suspense>
	</React.StrictMode>,
)
