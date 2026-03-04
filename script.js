// css project - 2026 | BY MARCOSDEV

let blocoCodigo = document.querySelector(".bloco-codigo");
let resultadoCodigo = document.querySelector(".resultado-codigo");
let botao = document.querySelector(".botao-gerar");
let btnCopy = document.querySelector('.btn-copy');
let toast = document.getElementById('toast');
let carregando = false;

function dispararNotificacao(mensagem) {
    toast.innerText = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

async function gerarCodigo() {
    let textoUsuario = document.querySelector(".caixa-texto").value;

    if (!textoUsuario || textoUsuario.trim().length < 5) {
        dispararNotificacao("O PROMPT precisa ter pelo menos 5 caracteres!");
        return;
    }

    if (carregando) {
        dispararNotificacao("Calma! Já estou gerando seu código...");
        return;
    }

    carregando = true;
    botao.innerText = "Gerando... ⏳";
    botao.style.opacity = "0.6";

    try {
        // CHAMADA PARA A EDGE FUNCTION
        const response = await fetch("/gerar-codigo", {
            method: "POST",
            body: JSON.stringify({ prompt: textoUsuario }),
        });

        const dados = await response.json();

        if (response.status === 429) {
            dispararNotificacao(dados.error);
            return;
        }

        let resultado = dados.choices[0].message.content;

        let estiloBase = `
        <style>
            body { background: #030303; color: white; font-family: sans-serif; display: flex; justify-content: center; padding: 20px; }
        </style>`;

        blocoCodigo.textContent = resultado;
        resultadoCodigo.srcdoc = estiloBase + resultado;
        dispararNotificacao("Código gerado com sucesso!");

    } catch (erro) {
        dispararNotificacao("Erro ao conectar com a IA.");
        console.error(erro);
    } finally {
        carregando = false;
        botao.innerText = "Gerar Código 📐";
        botao.style.opacity = "1";
    }
}

// ... Manter suas funções copiarTexto(), Listeners de ContextMenu e Copy ...
function copiarTexto() {
    const texto = blocoCodigo.innerText;
    if (texto.length > 0) {
        navigator.clipboard.writeText(texto).then(() => {
            dispararNotificacao("Copiado para a área de transferência!");
        });
    }
}

botao.addEventListener("click", gerarCodigo);
btnCopy.addEventListener('click', copiarTexto);
blocoCodigo.addEventListener('dblclick', copiarTexto);