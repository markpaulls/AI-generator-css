export default async (request, context) => {
  try {
    const API_KEY = Deno.env.get("GROQ_API_KEY");
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    // 1. Verificação da requisição
    if (request.method !== "POST") {
      return new Response("Método não permitido", { status: 405 });
    }

    const { prompt } = await request.json();

    // 2. Chamada para o Groq
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Voce é um gerador de HTML e CSS puro." },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    // 3. Retorno para o frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/gerar-codigo" };