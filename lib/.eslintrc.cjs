module.exports = {
	root: true,
	ignorePatterns: ['.eslintrc.cjs', 'vite.config.ts'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		/* 'prettier', */
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		ecmaVersion: 'latest',
		project: './tsconfig.json',
	},
	plugins: [/* 'prettier', */ '@typescript-eslint'],
	rules: {
		//'prettier/prettier': 'error',
		/* '@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/consistent-type-imports': 'warn',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'no-duplicate-imports': 'off', */
	},
};
