module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        '<rootDir>/src/app/*.{ts,js}',
        '!<rootDir>/src/app/*.routes.ts', // Exclude route-files
    ],
    coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
    moduleNameMapper: {
      '^@ng-error-tooltips$': '<rootDir>/../ng-error-tooltips-lib/projects/ng-error-tooltips/src/public-api.ts'
    },
    resolver: 'jest-ts-webcompat-resolver'
};