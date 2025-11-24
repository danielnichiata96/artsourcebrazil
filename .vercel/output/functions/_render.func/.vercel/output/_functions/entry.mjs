import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_8ofADQ2t.mjs';
import { manifest } from './manifest_BuiWfBB0.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/api/vagas.json.astro.mjs');
const _page4 = () => import('./pages/blog/_slug_.astro.mjs');
const _page5 = () => import('./pages/blog.astro.mjs');
const _page6 = () => import('./pages/blog.xml.astro.mjs');
const _page7 = () => import('./pages/category/_slug_.astro.mjs');
const _page8 = () => import('./pages/companies.astro.mjs');
const _page9 = () => import('./pages/company/_slug_.astro.mjs');
const _page10 = () => import('./pages/contact.astro.mjs');
const _page11 = () => import('./pages/en/about.astro.mjs');
const _page12 = () => import('./pages/en/blog.astro.mjs');
const _page13 = () => import('./pages/en/companies.astro.mjs');
const _page14 = () => import('./pages/en/pricing.astro.mjs');
const _page15 = () => import('./pages/en/vagas.astro.mjs');
const _page16 = () => import('./pages/en.astro.mjs');
const _page17 = () => import('./pages/jobs/_id_-_slug_.astro.mjs');
const _page18 = () => import('./pages/jobs.json.astro.mjs');
const _page19 = () => import('./pages/jobs.xml.astro.mjs');
const _page20 = () => import('./pages/og/_slug_.astro.mjs');
const _page21 = () => import('./pages/post-a-job/preview.astro.mjs');
const _page22 = () => import('./pages/post-a-job/success.astro.mjs');
const _page23 = () => import('./pages/post-a-job.astro.mjs');
const _page24 = () => import('./pages/precos.astro.mjs');
const _page25 = () => import('./pages/privacy.astro.mjs');
const _page26 = () => import('./pages/terms.astro.mjs');
const _page27 = () => import('./pages/vagas.astro.mjs');
const _page28 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/api/vagas.json.ts", _page3],
    ["src/pages/blog/[slug].astro", _page4],
    ["src/pages/blog/index.astro", _page5],
    ["src/pages/blog.xml.ts", _page6],
    ["src/pages/category/[slug].astro", _page7],
    ["src/pages/companies.astro", _page8],
    ["src/pages/company/[slug].astro", _page9],
    ["src/pages/contact.astro", _page10],
    ["src/pages/en/about.astro", _page11],
    ["src/pages/en/blog/index.astro", _page12],
    ["src/pages/en/companies.astro", _page13],
    ["src/pages/en/pricing.ts", _page14],
    ["src/pages/en/vagas.astro", _page15],
    ["src/pages/en/index.astro", _page16],
    ["src/pages/jobs/[id]-[slug].astro", _page17],
    ["src/pages/jobs.json.ts", _page18],
    ["src/pages/jobs.xml.ts", _page19],
    ["src/pages/og/[slug].ts", _page20],
    ["src/pages/post-a-job/preview.astro", _page21],
    ["src/pages/post-a-job/success.astro", _page22],
    ["src/pages/post-a-job.astro", _page23],
    ["src/pages/precos.ts", _page24],
    ["src/pages/privacy.astro", _page25],
    ["src/pages/terms.astro", _page26],
    ["src/pages/vagas.astro", _page27],
    ["src/pages/index.astro", _page28]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "6e0abbd3-1aca-4d93-b9f1-b40d08a138c1",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
