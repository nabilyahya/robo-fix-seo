export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "missing_token" }),
        { status: 400 }
      );
    }

    const form = new FormData();
    form.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    form.append("response", token);

    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: form,
      }
    );
    const data = await resp.json();

    if (data?.success) {
      const res = new Response(JSON.stringify({ ok: true }), { status: 200 });
      // Cookie صالحة 15 دقيقة
      res.headers.set(
        "Set-Cookie",
        "tsok=1; Max-Age=900; Path=/; SameSite=Lax; Secure; HttpOnly"
      );
      return res;
    }

    return new Response(JSON.stringify({ ok: false, data }), { status: 400 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "server_error" }), {
      status: 500,
    });
  }
}
