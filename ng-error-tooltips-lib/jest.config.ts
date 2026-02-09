
module.exports = {
    preset: 'jest-preset-angular',
    maxWorkers: "4", // Use 4 threads for parallel test runs
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/dist/',
    ],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    moduleNameMapper: {
		'^@lib/(.*)$': '<rootDir>/src/lib/$1',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
		'<rootDir>/projects/ng-error-tooltips/src/**/*.{ts,js}',
		'!<rootDir>/projects/ng-error-tooltips/src/public-api.ts',
		'!<rootDir>/projects/ng-error-tooltips/src/lib/mocks/*.ts', // Exclude mocks
		'!<rootDir>/projects/ng-error-tooltips/src/lib/tooltip/placement.type.ts', // Exclude simple type definition
	  	'!<rootDir>/projects/ng-error-tooltips/src/lib/provide-error-tooltips.ts', // Exclude provider function (logic is minimal and hard to cover)
      	'!<rootDir>/projects/ng-error-tooltips/src/**/*.spec.ts', // Exclude test files
    ],
    coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
};
