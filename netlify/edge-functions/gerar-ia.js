export default async (request, context) => {
  // 1. Configurações e Chave (vinda do Environment Variables do Netlify)
  const API_KEY = Deno.env.get("GROQ_API_KEY");
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";
  
  // 2. Identificação do Usuário (IP + Cookie ID)
  const userIP = context.ip;
  const cookies = context.cookies;
  let userId = cookies.get("user-id");

  if (!userId) {
    userId = crypto.randomUUID();
    context.cookies.set({
      name: "user-id",
      value: userId,
      path: "/",
      httpOnly: true,
      maxAge: 3600 * 24 * 365, // 1 ano
    });
  }

  // 3. Lógica de Rate Limit (5 requisições por hora)
  const rateLimitCookie = cookies.get("rate-limit-data");
  let limitData = rateLimitCookie ? JSON.parse(rateLimitCookie) : { count: 0, startTime: Date.now() };

  // Resetar o contador se passou 1 hora
  if (Date.now() - limitData.startTime > 3600000) {
    limitData = { count: 0, startTime: Date.now() };
  }

  if (limitData.count >= 5) {
    return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em 1 hora." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Processar a requisição
  try {
    const { prompt } = await request.json();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Voce é um gerador de HTML e CSS. Responda SOMENTE com codigo puro, Nunca use crases, markdown ou explicações. Formato: primeiro <style> com o CSS, depois HTML."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    // 5. Atualizar contador de Rate Limit no Cookie
    limitData.count++;
    context.cookies.set({
      name: "rate-limit-data",
      value: JSON.stringify(limitData),
      path: "/",
      maxAge: 3600, // Expira em 1 hora
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), { status: 500 });
  }
};

export const config = { path: "/gerar-codigo" };