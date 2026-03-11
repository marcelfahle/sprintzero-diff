export function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://diff.sprintzero.sh/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
