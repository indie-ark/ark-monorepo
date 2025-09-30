# chronoperates-web TODO

- [ ] ESLint config syntax error (eslint.config.js:6). Remove globalIgnores import and use ignores array
- [ ] No linting configured (package.json:10). Add eslint script to run linting
- [ ] Migrate fetch to axios (src/App.tsx:47, src/components/DownloadSection.tsx:19). Replace fetch with axios and add timeout
- [ ] Hardcoded API URL (src/App.tsx:47, src/components/DownloadSection.tsx:19). Create src/config.ts with VITE_API_URL
- [ ] No tests configured (package.json:9). Install vitest and react-testing-library
- [ ] No error boundary. Add React error boundary component wrapping App
- [ ] No retry logic for API failures. Add retry with exponential backoff (axios-retry)
