import { g as getJobs } from '../../chunks/getJobs_CuFo9oj8.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ request }) => {
  try {
    const jobs = await getJobs();
    const sortedJobs = jobs.sort(
      (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );
    const response = {
      jobs: sortedJobs,
      count: sortedJobs.length,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(
      JSON.stringify(response, null, 2),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
          // CDN cache for 1 min, serve stale for 30s while revalidating
          "Access-Control-Allow-Origin": "*",
          // Allow CORS for external components
          "Access-Control-Allow-Methods": "GET"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching jobs from Supabase:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch jobs",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
