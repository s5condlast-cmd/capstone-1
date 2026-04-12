## Error Type
Build Error

## Error Message
Module not found: Can't resolve 'canvg'

## Build Output
./apps/web/node_modules/jspdf/dist/jspdf.es.min.js:267:1432
Module not found: Can't resolve 'canvg'
  265 | ...
  266 | ...
> 267 | ...anvg?Promise.resolve(i.canvg):import("canvg")).catch(function(t){return Pr...
      |                                  ^^^^^^^^^^^^^^^
  268 | ...
  269 | ...
  270 | ...

Import trace:
  Client Component Browser:
    ./apps/web/node_modules/jspdf/dist/jspdf.es.min.js [Client Component Browser]
    ./apps/web/src/app/journal/page.tsx [Client Component Browser]
    ./apps/web/src/app/journal/page.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found

Next.js version: 16.2.3 (Turbopack)
