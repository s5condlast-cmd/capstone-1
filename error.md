10:37:14.824 Running build in Washington, D.C., USA (East) – iad1
10:37:14.825 Build machine configuration: 2 cores, 8 GB
10:37:14.955 Cloning github.com/s5condlast-cmd/capstone-1 (Branch: main, Commit: fc1f486)
10:37:14.956 Previous build caches not available.
10:37:15.151 Cloning completed: 195.000ms
10:37:15.502 Running "vercel build"
10:37:16.276 Vercel CLI 50.42.0
10:37:16.545 Running "install" command: `npm install`...
10:37:52.055 npm warn deprecated next@15.1.0: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
10:37:52.445 
10:37:52.445 added 350 packages, and audited 361 packages in 36s
10:37:52.445 
10:37:52.445 118 packages are looking for funding
10:37:52.445   run `npm fund` for details
10:37:52.533 
10:37:52.534 1 critical severity vulnerability
10:37:52.534 
10:37:52.535 To address all issues, run:
10:37:52.535   npm audit fix --force
10:37:52.535 
10:37:52.536 Run `npm audit` for details.
10:37:52.600 Detected Next.js version: 15.1.0
10:37:52.600 Running "npm run build"
10:37:52.708 
10:37:52.709 > web@0.1.0 build
10:37:52.709 > next build
10:37:52.709 
10:37:52.817 The module 'react' was not found. Next.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install react'
10:37:52.818 The module 'react-dom' was not found. Next.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install react-dom'
10:37:52.966 unhandledRejection [Error: Cannot find module 'react'
10:37:52.967 Require stack:
10:37:52.967 - /vercel/path0/apps/web/node_modules/next/dist/server/app-render/dynamic-rendering.js
10:37:52.967 - /vercel/path0/apps/web/node_modules/next/dist/server/node-environment-extensions/utils.js
10:37:52.967 - /vercel/path0/apps/web/node_modules/next/dist/server/node-environment-extensions/random.js
10:37:52.967 - /vercel/path0/apps/web/node_modules/next/dist/server/node-environment.js
10:37:52.967 - /vercel/path0/apps/web/node_modules/next/dist/build/utils.js
10:37:52.968 - /vercel/path0/apps/web/node_modules/next/dist/build/swc/options.js
10:37:52.968 - /vercel/path0/apps/web/node_modules/next/dist/build/swc/index.js
10:37:52.968 - /vercel/path0/apps/web/node_modules/next/dist/build/analysis/parse-module.js
10:37:52.968 - /vercel/path0/apps/web/node_modules/next/dist/build/analysis/get-page-static-info.js
10:37:52.968 - /vercel/path0/apps/web/node_modules/next/dist/build/index.js
10:37:52.968 - /vercel/path0/apps/web/node_modules/next/dist/cli/next-build.js] {
10:37:52.968   code: 'MODULE_NOT_FOUND',
10:37:52.968   requireStack: [Array]
10:37:52.968 }
10:37:52.985 Error: Command "npm run build" exited with 1