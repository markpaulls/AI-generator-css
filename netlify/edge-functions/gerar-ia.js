export default async (request, context) => {
  
  const userCookie = context.cookies.get("marcos-dev-id") || "new-user";
  
  if (request.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    const apiKey = Deno.env.get("GROQ_API_KEY");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, 
        messages: [
          { 
            role: "system", 
            content: "Você é um terminal de código puro. Responda APENAS com código HTML e CSS. PROIBIDO: Usar markdown, usar crases (```), escrever qualquer texto explicativo ou saudações. Se o usuário pedir uma animação, entregue o <style> com @keyframes e o HTML necessário. Sua resposta deve começar diretamente com <style> ou <div>." },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    const res = new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

   
    if (userCookie === "new-user") {
      context.cookies.set({
        name: "marcos-dev-id",
        value: crypto.randomUUID(),
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 3600 * 24 * 7,
      });
    }

    return res;

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno no servidor" }), { status: 500 });
  }
};

export const config = { path: "/api/gerar" };