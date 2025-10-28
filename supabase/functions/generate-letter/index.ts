// Supabase Edge Function: generate-letter
// Phase 11: Shell placeholder for AI letter generation

Deno.serve((_req) => {
  return new Response(
    JSON.stringify({ error: "generate-letter: not implemented" }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
});
