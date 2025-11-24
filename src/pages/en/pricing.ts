// Redirect /pricing to /post-a-job (EN version)
export const GET = () => {
    return new Response(null, {
        status: 301,
        headers: {
            Location: '/post-a-job',
        },
    });
};
