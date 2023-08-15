import {
	useLocation,
	useSearchParams
	/* Link */
} from 'react-router-dom';

export type ErrorData = {
	code: '404' | '502',
	message: string
}

export default function ErrorPage() {
	const location = useLocation()
	const [search] = useSearchParams()
	
	const params = {
		code: search.get("code"),
		message: search.get("message")
	}
	if( typeof params !== 'undefined' ) {
		return ( <>
			<h1>Error {params.code && ` - ${params.code}`}</h1>
			{params.message ? params.message : 
			params.code ? `unknown error with code ${params.code}` : `Page "${location.pathname}" does not exist` }
		</> )
	} else {
		return ( <>
			<h1>Error - 404</h1>
			"{location.pathname}" does not exist
		</> )
	}
}
