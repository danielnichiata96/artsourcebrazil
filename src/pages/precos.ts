// Redirect /precos to /post-a-job (SEO + Conversion)
export const GET = () => {
    return new Response(null, {
        status: 301,
        headers: {
            Location: '/post-a-job',
        },
    });
};
