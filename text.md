// css project - 2026
// BY MARCOSDEV

let APIkey = ''
let APIurl = 'https://api.groq.com/openai/v1/chat/completions'

let blocoCodigo = document.querySelector(".bloco-codigo")
let resultadoCodigo = document.querySelector(".resultado-codigo")
let botao = document.querySelector(".botao-gerar")
let btnCopy = document.querySelector('.btn-copy');
let codigoTexto = document.getElementById('codigoTexto');
let toast = document.getElementById('toast');

let carregando = false;

// Função de Notificação Dinâmica
function dispararNotificacao(mensagem) {
    toast.innerText = mensagem; // Define o texto dinamicamente
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

async function gerarCodigo() {
    let textoUsuario = document.querySelector(".caixa-texto").value


    // VALIDAÇÃO: Sem alert feio!
    if (!textoUsuario || textoUsuario.trim().length < 5) {
        dispararNotificacao("O PROMPT precisa ter pelo menos 5 caracteres!");
        return;
    }


    if (APIkey === '') {
        dispararNotificacao('Preencha sua chave API, no caminho script.js')
        return;
    }

    // RATE LIMIT
    if (carregando) {
        dispararNotificacao(" Calma! Já estou gerando seu código...");
        return;
    }

    carregando = true;
    botao.innerText = "Gerando... ⏳";
    botao.style.opacity = "0.6";

    try {
        let response = await fetch(APIurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chave}`
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "Voce é um gerador de HTML e CSS. Responda SOMENTE com codigo puro, Nunca use crases, markdown ou explicações. Formato: primeiro <style> com o CSS, depois HTML. Se pedir animação, use @keyframes."
                    },
                    {
                        "role": "user",
                        "content": textoUsuario
                    }
                ],
            })
        })

        let dados = await response.json();
        let resultado = dados.choices[0].message.content;


        let estiloBase = `
        <style>
        body { 
        background: #030303;
        font-family: 
        sans-serif; 
        display: 
        flex;
        justify-content: center; }
        </style>`;

        blocoCodigo.textContent = resultado
        resultadoCodigo.srcdoc = estiloBase + resultado;

        dispararNotificacao(" Código gerado com sucesso!");

    } catch (erro) {
        dispararNotificacao("Erro ao conectar com a IA.");
        console.error(erro);
    } finally {
        carregando = false;
        botao.innerText = "Gerar Código 📐";
        botao.style.opacity = "1";
    }
}

function copiarTexto() {
    const texto = codigoTexto.innerText;

    if (texto.length > 0) {
        navigator.clipboard.writeText(texto).then(() => {
            dispararNotificacao(" Copiado para a área de transferência!");
        }).catch(err => {
            dispararNotificacao(" Erro ao copiar código.");
        });
    } else {
        dispararNotificacao(" Não há código para copiar.");
    }
}



document.addEventListener('copy', (e) => {
    // Verifica se o foco está fora das áreas permitidas
    const areaPermitida = e.target.closest('.caixa-texto') ||
        e.target.closest('.bloco-codigo') ||
        e.target.closest('.resultado-codigo');

    if (!areaPermitida) {
        e.preventDefault();
        dispararNotificacao("© Marcos Laber");
    }
});

// Bloqueia o Menu de Contexto (Botão Direito) fora das áreas de código
document.addEventListener('contextmenu', (e) => {
    const areaPermitida = e.target.closest('.caixa-texto') ||
        e.target.closest('.bloco-codigo') ||
        e.target.closest('.resultado-codigo');

    if (!areaPermitida) {
        e.preventDefault();
        dispararNotificacao("© Marcos Laber");
    }
});

// EVENTS LISTENERS //
botao.addEventListener("click", gerarCodigo)
btnCopy.addEventListener('click', copiarTexto);
codigoTexto.addEventListener('dblclick', copiarTexto);