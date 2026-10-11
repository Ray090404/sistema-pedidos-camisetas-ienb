
const SUPABASE_URL = "https://nhudsgssdfampcypbbzu.supabase.co";
const SUPABASE_KEY = "sb_publishable_nTwL5BHAj7xINzEqD7Z5HA_LHqdU5hS";

const form = document.getElementById("formCamisa");
const botao = document.getElementById("btnEnviar");
const mensagem = document.getElementById("mensagem");
const campoNome = document.getElementById("nome");
const campoModelo = document.getElementById("modelo");
const campoTamanho = document.getElementById("tamanho");
const avisoTamanho = document.getElementById("avisoTamanho");

function mostrarMensagem(texto, sucesso = false) {
    mensagem.className = "";
    mensagem.textContent = texto;
    mensagem.style.color = sucesso ? "#187443" : "#c62828";
}

function atualizarTamanhos() {
    const modelo = campoModelo.value;
    const anterior = campoTamanho.value;

    campoTamanho.replaceChildren();

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = modelo
        ? "Selecione o tamanho"
        : "Selecione primeiro o modelo";

    campoTamanho.appendChild(inicial);

    if (!modelo) {
        campoTamanho.disabled = true;
        avisoTamanho.textContent =
            "Escolha o modelo para visualizar os tamanhos disponíveis.";
        return;
    }

    campoTamanho.disabled = false;

    const tamanhos = modelo === "Baby look"
        ? ["P", "M", "G", "GG"]
        : ["P", "M", "G", "GG", "EXG"];

    tamanhos.forEach(tamanho => {
        const opcao = document.createElement("option");
        opcao.value = tamanho;
        opcao.textContent = tamanho === "EXG"
            ? "EXG "
            : tamanho;

        campoTamanho.appendChild(opcao);
    });

    campoTamanho.value = tamanhos.includes(anterior)
        ? anterior
        : "";

    avisoTamanho.textContent = modelo === "Baby look"
        ? "Baby look disponível do P ao GG."
        : "Tamanhos disponíveis do P ao EXG (Extra G).";
}

function criarPopupSucesso() {
    if (document.getElementById("popupSucesso")) return;

    const estilo = document.createElement("style");

    estilo.textContent = `
        #popupSucesso {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(8,23,45,.68);
            backdrop-filter: blur(6px);
            opacity: 0;
            visibility: hidden;
            transition: opacity .3s, visibility .3s;
        }

        #popupSucesso.visivel {
            opacity: 1;
            visibility: visible;
        }

        .popup-cartao {
            width: 100%;
            max-width: 380px;
            padding: 36px 26px;
            text-align: center;
            background: white;
            border: 1px solid #d7b66b;
            border-radius: 24px;
            box-shadow: 0 25px 80px #0004;
            transform: scale(.7) translateY(25px);
            transition: transform .4s cubic-bezier(.2,.9,.25,1.3);
        }

        #popupSucesso.visivel .popup-cartao {
            transform: scale(1) translateY(0);
        }

        .sucesso-icone {
            width: 82px;
            height: 82px;
            margin: 0 auto 22px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            color: white;
            background: linear-gradient(135deg,#2c9a68,#12603e);
            font-size: 44px;
            animation: pulsarSucesso 1.2s ease-in-out infinite;
        }

        .popup-cartao h2 {
            color: #142b4a;
            font-size: 25px;
            margin-bottom: 12px;
        }

        .popup-cartao p {
            color: #64748b;
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 24px;
        }

        .popup-cartao button {
            width: 100%;
            padding: 14px;
            border: 0;
            border-radius: 11px;
            background: linear-gradient(135deg,#285b91,#142b4a);
            color: white;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
        }

        @keyframes pulsarSucesso {
            0%,100% { box-shadow: 0 0 0 8px #e6f5ec; }
            50% { box-shadow: 0 0 0 14px #e6f5ec; }
        }

        @media (prefers-reduced-motion: reduce) {
            #popupSucesso,
            .popup-cartao,
            .sucesso-icone {
                animation: none !important;
                transition: none !important;
            }
        }
    `;

    document.head.appendChild(estilo);

    const popup = document.createElement("div");
    popup.id = "popupSucesso";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "true");

    popup.innerHTML = `
        <div class="popup-cartao">
            <div class="sucesso-icone">✓</div>
            <h2>Pedido enviado!</h2>
            <p>
                Sua resposta foi enviada com sucesso!<br>
                Obrigado por participar do nosso congresso.
            </p>
            <button type="button" id="fecharPopup">Continuar</button>
        </div>
    `;

    document.body.appendChild(popup);

    const fechar = () => popup.classList.remove("visivel");

    popup.querySelector("#fecharPopup")
        .addEventListener("click", fechar);

    popup.addEventListener("click", evento => {
        if (evento.target === popup) fechar();
    });
}

function mostrarPopupSucesso() {
    criarPopupSucesso();

    const popup = document.getElementById("popupSucesso");
    popup.classList.add("visivel");

    document.getElementById("fecharPopup").focus();
}

if (
    !form || !botao || !mensagem || !campoNome ||
    !campoModelo || !campoTamanho || !avisoTamanho
) {
    console.error("Erro: confira os IDs dos campos no index.html.");

} else if (!window.supabase) {
    mostrarMensagem(
        "O Supabase não carregou. Verifique a conexão e atualize a página."
    );

} else {
    const db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    campoModelo.addEventListener("change", atualizarTamanhos);
    atualizarTamanhos();

    form.addEventListener("submit", async evento => {
        evento.preventDefault();

        const nome = campoNome.value.trim();
        const modelo = campoModelo.value;
        const tamanho = campoTamanho.value;

        if (!nome || !modelo || !tamanho) {
            mostrarMensagem("Preencha todos os campos.");
            return;
        }

        const tamanhosPermitidos = modelo === "Baby look"
            ? ["P", "M", "G", "GG"]
            : ["P", "M", "G", "GG", "EXG"];

        if (!tamanhosPermitidos.includes(tamanho)) {
            mostrarMensagem("Tamanho inválido para o modelo escolhido.");
            return;
        }

        botao.disabled = true;
        botao.textContent = "Enviando...";
        mensagem.textContent = "";

        try {
            const { error } = await db
                .from("pedidos_camisas")
                .insert([{ nome, modelo, tamanho }]);

            if (error) throw error;

            form.reset();
            atualizarTamanhos();
            mostrarPopupSucesso();

        } catch (erro) {
            console.error("Erro ao salvar pedido:", erro);

            if (erro.code === "42501") {
                mostrarMensagem(
                    "O Supabase recusou o cadastro por uma regra de segurança (RLS)."
                );
            } else if (erro.code === "23502") {
                mostrarMensagem(
                    "O banco exige um campo que não foi preenchido."
                );
            } else {
                mostrarMensagem(
                    `Falha ao salvar: ${
                        erro.message || "verifique a conexão com o Supabase"
                    }`
                );
            }

        } finally {
            botao.disabled = false;
            botao.textContent = "Enviar resposta";
        }
    });
}
