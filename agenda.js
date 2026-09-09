// Agenda de Consultas — versão 1.0.0
// As consultas ficam no localStorage do navegador. Nada sai da máquina.

const CHAVE = "agenda-consultas";

const formulario = document.getElementById("formulario");
const mensagem = document.getElementById("mensagem");
const lista = document.getElementById("lista");
const aviso = document.getElementById("aviso");

let memoria = [];
let temArmazenamento = true;

function semArmazenamento() {
  temArmazenamento = false;
  if (aviso) aviso.hidden = false;
}

function carregar() {
  if (!temArmazenamento) return memoria;
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? JSON.parse(salvo) : [];
  } catch (erro) {
    semArmazenamento();
    return memoria;
  }
}

function salvar(consultas) {
  memoria = consultas;
  if (!temArmazenamento) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(consultas));
  } catch (erro) {
    semArmazenamento();
  }
}

function horarioOcupado(consultas, nova) {
  return consultas.some(
    (c) => c.data === nova.data && c.hora === nova.hora && c.profissional === nova.profissional
  );
}

function contarConsultasNoDia(consultas, profissional, data) {
  return consultas.filter(
    (c) => c.profissional === profissional && c.data === data
  ).length;
}

function renderizar() {
  const consultas = carregar().sort((a, b) =>
    (a.data + a.hora).localeCompare(b.data + b.hora)
  );

  lista.innerHTML = "";

  if (consultas.length === 0) {
    lista.innerHTML = '<tr><td colspan="4" class="vazio">Nenhuma consulta agendada.</td></tr>';
    return;
  }

  for (const c of consultas) {
    const linha = document.createElement("tr");
    linha.innerHTML = `<td>${c.data}</td><td>${c.hora}</td><td>${c.profissional}</td><td>${c.paciente}</td>`;
    lista.appendChild(linha);
  }
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nova = {
    paciente: document.getElementById("paciente").value.trim(),
    profissional: document.getElementById("profissional").value,
    data: document.getElementById("data").value,
    hora: document.getElementById("hora").value,
  };

  const consultas = carregar();

  if (horarioOcupado(consultas, nova)) {
    mensagem.textContent = `O horário das ${nova.hora} já está ocupado para esta profissional.`;
    return;
  }

  consultas.push(nova);
  salvar(consultas);

  const totalNoDia = contarConsultasNoDia(consultas, nova.profissional, nova.data);
  mensagem.textContent = `Consulta agendada. ${nova.profissional} possui ${totalNoDia} consulta(s) no dia ${nova.data}.`;

  formulario.reset();
  renderizar();
});

renderizar();