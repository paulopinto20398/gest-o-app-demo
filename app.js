const nomeInput = document.getElementById("nome");
const idadeInput = document.getElementById("idade");
const nacionalidadeInput = document.getElementById("nacionalidade");
const guardarBtn = document.getElementById("guardar");
const lista = document.getElementById("lista-beneficiarios");

const API_URL = "http://localhost:4000/usuarios";

// Função para carregar os beneficiários
async function carregarBeneficiarios() {
  lista.innerHTML = "";
  const res = await fetch(API_URL);
  const dados = await res.json();
  dados.forEach(b => {
    const li = document.createElement("li");
    li.textContent = `${b.nome} (${b.idade} anos) - ${b.nacionalidade}`;
    lista.appendChild(li);
  });
}

// Evento do botão Guardar
guardarBtn.addEventListener("click", async () => {
  const nome = nomeInput.value.trim();
  const idade = idadeInput.value.trim();
  const nacionalidade = nacionalidadeInput.value.trim();

  if (!nome || !idade || !nacionalidade) {
    alert("Preenche todos os campos!");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, idade: Number(idade), nacionalidade })
    });
    if (res.ok) {
      alert("Beneficiário adicionado!");
      nomeInput.value = "";
      idadeInput.value = "";
      nacionalidadeInput.value = "";
      carregarBeneficiarios(); // Atualiza a lista
    } else {
      alert("Erro ao guardar");
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao guardar");
  }
});

// Carrega a lista ao iniciar
carregarBeneficiarios();
