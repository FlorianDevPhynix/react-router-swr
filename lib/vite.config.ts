import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [],
	build: {
		sourcemap: true,
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, 'src/index.tsx'),
			name: 'react-router-swr',
			// the proper extensions will be added
			fileName: 'react-router-swr',
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ['react'],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					react: 'React',
				},
			},
		},
	},
});
