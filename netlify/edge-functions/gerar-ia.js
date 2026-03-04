import { Context } from "[https://edge.netlify.com](https://edge.netlify.com)";

export default async (request, context) => {
  const userIP = context.ip;
  const userCookie = context.cookies.get("marcos-dev-id") || "new-user";
  
  if (request.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  try {
    const { prompt } = await request.json();
    const apiKey = Deno.env.get("GROQ_API_KEY");

    const response = await fetch("[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, // Baixamos a temperatura para a IA ser menos "criativa" com textos
        messages: [
          { 
            role: "system", 
            content: "Você é um terminal de código puro. Responda APENAS com código HTML e CSS. PROIBIDO: Usar markdown, usar crases (```), escrever qualquer texto explicativo ou saudações. Se o usuário pedir uma animação, entregue o <style> com @keyframes e o HTML necessário. Sua resposta deve começar diretamente com <style> ou <div>." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite da API atingido" }), { status: 429 });
    }

    // Criamos a resposta para poder setar o cookie
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
        maxAge: 3600 * 24 * 7,
      });
    }

    return res;

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
  }
};

export const config = { path: "/api/gerar" };