import { defineConfig, type PluginOption } from 'vite';
import path from "node:path";
import type { RouteObject, LoaderFunction } from 'react-router'

//plugins
import react from '@vitejs/plugin-react'
import pages from 'vite-plugin-pages'

function TestServerPlugin() : PluginOption {
	return {
		name: 'test-server-plugin',
		apply: "serve",

		configureServer( server ) {
			let state = 0;
			server.middlewares.use( "/api/state", async (req, res, next) => {
				if( req.method === "GET" ) {
					res.end( JSON.stringify({
						state: state,
					}));
				} else if( req.method === 'POST' ) {
					const body = await new Promise((resolve) => {
						const bodyParts = [];
						let body;
						req.on('data', (chunk) => {
							bodyParts.push(chunk);
						}).on('end', () => {
							body = Buffer.concat(bodyParts).toString();
							resolve(body)
						});
					});
					
					const newState = JSON.parse( body as string ).state;
					if (newState > 20) {
						res.statusCode = 400
					} else {
						state = newState;
						console.log( state )
						res.statusCode = 200
					}
					res.end()
				} else {
					next()
				}
			})
		}
	}
}

const PageExtension = '.tsx'

const LayoutPageName = '_layout'
const LayoutPageRegex = new RegExp( `^${LayoutPageName}`, 'si' );

const ErrorPageName = '404'
const ErrorPageRegex = new RegExp( `^${ErrorPageName}`, 'si' );

const LoaderSuffix = 'load'
const LoaderPageRegex = new RegExp( `.${LoaderSuffix}$`, 'si' );

function checkRoute( route:RouteObject ) {
	// add loader for pages matching '*.load.tsx'
	if( LoaderPageRegex.test(route.path) ) {

		// remove suffix from path
		route.path = route.path.replace(LoaderPageRegex, '');
		// add path page path to loader
		route.loader = (route.element as unknown) as LoaderFunction;
	}

	// manual 'index' -> '/'
	if( route.path === 'index' ) {
		route.path = '';
	}

	if( typeof route.children !== 'undefined' && route.children.length > 0 ) {

		// _layout page in folder as layout (parent) for path
		const layout = route.children.find((value) => LayoutPageRegex.test(value.path) )
		if( typeof layout !== 'undefined' ) {
			// remove layout route
			route.children = route.children.filter(value => value !== layout)

			// move layout into parent
			route.element = layout.element;
		}

		// 404 error page in folder catch-all route
		const errorPage = route.children.find((value) => ErrorPageRegex.test(value.path) )
		if( typeof errorPage !== 'undefined' ) {

			// move layout into parent
			route.children.push({
				...errorPage,
				path: "*",
			});
		}

		// deep
		route.children = route.children.map( child => checkRoute( child ) )
	}
	
	return route
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TestServerPlugin(),
		react(),
		pages({
			resolver: "react",
			extensions: ["tsx"],//"page.tsx"
			onRoutesGenerated(any_routes) {
				const routes: RouteObject[] = [
					{
						path: '/',
						element: `/src/${LayoutPageName}.tsx`,
						children: any_routes as RouteObject[]
					}/* ,
					{
						path: '*',
						element: `/src/${ErrorPageName}.tsx`
					} */
				];

				// root catch-all route '/*' error page
				routes[0].children.push({
					path: '*',
					element: `/src/pages/${ErrorPageName}.tsx`
				})

				// add support for _layout and 404 pages (deeply)
				for (const route of routes[0].children) {
					checkRoute( route );
				}

				//console.log(routes)
				//console.log(routes[0].children)
				//console.log(routes[0].children[2].children)
				return routes;
			},
			onClientGenerated(clientCode) {
				let code = clientCode
				
				let error_variables: string[] = [];
				let loader_variables: string[] = [];

				// add support for the route errorElement property
				// 1. get all error page paths from errorElement property's
				// 2. deduplicate imports
				// 3. replace file path with React.createElement
				// 4. write imports
				// another subgroup value match regex: a-z A-Z \d\/\-_
				{
					const matches = code.matchAll(/"errorElement":"(.[^"]+)"/gm)
					const getVariableName = (index: number) => `__pages_import_error_${index}__`;
					for (const match of matches) {
						let index = error_variables.indexOf( match[1] );
						if( index === -1 ) {
							index = error_variables.push( match[1] ) - 1;
						}

						code = code.replace( match[0], `"errorElement":React.createElement(${getVariableName(index)})` )
					}

					if( error_variables.length > 0 ) {
						error_variables = error_variables.map( (value, index) => `import ${getVariableName(index)} from "${value}";` )
					}
				}

				// add route loader support
				{
					const matches = code.matchAll(/"loader":"(.[^"]+)"/gm)
					const getVariableName = (index: number) => `__pages_import_loader_${index}__`;
					for (const match of matches) {
						let index = loader_variables.indexOf( match[1] );
						if( index === -1 ) {
							index = loader_variables.push( match[1] ) - 1;
						}

						code = code.replace( match[0], `"loader":${getVariableName(index)}` )
					}

					if( loader_variables.length > 0 ) {
						loader_variables = loader_variables.map( (value, index) => `import { loader as ${getVariableName(index)} } from "${value}";` )
					}
				}

				// add imports of loaders and error pages
				code = code.replace(`import React from "react";`, `import React from "react";${
					error_variables.length > 0 ? `\n\n${error_variables.join('\n')}` : ''}${
					loader_variables.length > 0 ? `\n\n${loader_variables.join('\n')}` : ''}\n`)

				// change import of root layout '/' from async lazy to sync/static (workaround)
				// explanation: vite-plugin-pages has a default importMode function that pre-determines based on page paths if their asynchronously loaded or not
				// for some reason this function decides that the root layout route needs to be async, which it should not be, makes no sense
				code = code.replace(`const __pages_import_0__ = React.lazy(() => import("/src/_layout.tsx"))`, `import __pages_import_0__ from "/src/_layout.tsx"`)
				code = code.replace(`const __pages_import_1__ = React.lazy(() => import("/src/pages/404.tsx"))`, `import __pages_import_1__ from "/src/pages/404.tsx"`)

				//console.log(code)
				return code
			},
		}),
	],
	resolve: {
		alias: {
		"@": path.resolve(__dirname, "./src"),
		}
	}
})
