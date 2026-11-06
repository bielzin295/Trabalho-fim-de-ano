// ============================================================
// CÓDIGO DO SITE
// Menu, janelas de login/cadastro, lista de freelancers
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ----- Janelas de login e cadastro -----
const modalLogin = document.getElementById('modalLogin');
const modalCadastro = document.getElementById('modalCadastro');

function fecharModais() {
  modalLogin.classList.remove('open');
  modalCadastro.classList.remove('open');
}

function entrar() {
  fecharModais();
  document.getElementById('loginMsg').className = 'auth-msg';
  modalLogin.classList.add('open');
  document.getElementById('loginEmail').focus();
}

function cadastrarCliente() {
  abrirCadastro('cliente');
}

function cadastrarFreelancer() {
  abrirCadastro('freelancer');
}

document.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', fecharModais));
[modalLogin, modalCadastro].forEach(m => {
  m.addEventListener('click', (e) => { if (e.target === m) fecharModais(); });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModais(); });

// ----- Dropdown do botão "Cadastrar" -----
const cadastroBtn = document.getElementById('cadastroBtn');
const cadastroMenu = document.getElementById('cadastroMenu');
cadastroBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  cadastroMenu.classList.toggle('open');
});
document.addEventListener('click', () => cadastroMenu.classList.remove('open'));
cadastroMenu.addEventListener('click', (e) => e.stopPropagation());

const spCities = ["São Paulo","Campinas","Santos","Sorocaba","Ribeirão Preto","São José dos Campos","Sumaré","Osasco"];

// ----- Mensagem de aviso dentro das janelas -----
function mostrarMsg(el, texto, tipo) {
  el.textContent = texto;
  el.className = 'auth-msg ' + tipo;
}

// ----- Abas "Sou cliente" / "Sou freelancer" no cadastro -----
const camposFreelancer = document.getElementById('camposFreelancer');
const tabCliente = document.getElementById('tabCliente');
const tabFreelancer = document.getElementById('tabFreelancer');
const cadSubtitulo = document.getElementById('cadSubtitulo');

let tipoConta = 'cliente';

function aplicarTipo() {
  tabCliente.classList.toggle('active', tipoConta === 'cliente');
  tabFreelancer.classList.toggle('active', tipoConta === 'freelancer');
  camposFreelancer.classList.toggle('hidden', tipoConta !== 'freelancer');
  cadSubtitulo.textContent = tipoConta === 'freelancer'
    ? 'Mostre seu trabalho e receba contatos de clientes de todo o estado.'
    : 'Encontre freelancers de São Paulo para o seu projeto.';
}

function abrirCadastro(tipo) {
  fecharModais();
  tipoConta = tipo;
  aplicarTipo();
  document.getElementById('cadMsg').className = 'auth-msg';
  modalCadastro.classList.add('open');
  document.getElementById('cadNome').focus();
}

tabCliente.addEventListener('click', () => { tipoConta = 'cliente'; aplicarTipo(); });
tabFreelancer.addEventListener('click', () => { tipoConta = 'freelancer'; aplicarTipo(); });

// ----- Lista de freelancers -----
const freelancers = []; // será preenchido com os dados do banco (Supabase)

const cats = ["Todos", ...new Set(freelancers.map(f=>f.cat))];
let activeCat = "Todos";

function renderFilters(){
  const el = document.getElementById('filters');
  el.innerHTML = cats.map(c=>`<button class="chip ${c===activeCat?'active':''}" data-cat="${c}">${c}</button>`).join('');
  el.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{ activeCat = btn.dataset.cat; renderFilters(); renderGrid(); });
  });
}

function renderGrid(){
  const list = activeCat === "Todos" ? freelancers : freelancers.filter(f=>f.cat===activeCat);
  if (!list.length) {
    document.getElementById('freelancerGrid').innerHTML = '<p style="color:var(--muted);">Nenhum freelancer cadastrado ainda.</p>';
    return;
  }
  document.getElementById('freelancerGrid').innerHTML = list.map(f=>`
    <div class="card">
      <div class="card-top"><div class="avatar"></div><div><h3>${f.name}</h3><div class="role">${f.role} · ${f.city}</div></div></div>
      <p class="desc">${f.desc}</p>
      <div class="card-foot"><span class="rate">${f.rate}</span><span class="stars">${f.stars}</span></div>
    </div>`).join('');
}

renderFilters();
renderGrid();

// ----- Formulários de login e cadastro -----
// Por enquanto eles só validam os campos. A ligação com o banco de dados
// (login e criação de conta) será feita depois, nos dois pontos marcados "TODO".
const loginForm = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMsg');
const cadastroForm = document.getElementById('cadastroForm');
const cadMsg = document.getElementById('cadMsg');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  if (!email || !senha) {
    mostrarMsg(loginMsg, 'Preencha e-mail e senha.', 'erro');
    return;
  }

  // TODO: aqui entra o login com o banco de dados
  mostrarMsg(loginMsg, 'Login ainda não disponível: falta conectar ao banco de dados.', 'erro');
});

cadastroForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('cadNome').value.trim();
  const email = document.getElementById('cadEmail').value.trim();
  const senha = document.getElementById('cadSenha').value;
  const senha2 = document.getElementById('cadSenha2').value;
  const telefone = document.getElementById('cadTelefone').value.trim();

  if (!nome || !email || !senha || !telefone) {
    mostrarMsg(cadMsg, 'Preencha todos os campos obrigatórios.', 'erro');
    return;
  }
  // Telefone brasileiro: DDD + número = 10 ou 11 dígitos
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11) {
    mostrarMsg(cadMsg, 'Digite um telefone válido com DDD. Ex.: (11) 90000-0000.', 'erro');
    return;
  }
  if (senha.length < 6) {
    mostrarMsg(cadMsg, 'A senha precisa ter pelo menos 6 caracteres.', 'erro');
    return;
  }
  if (senha !== senha2) {
    mostrarMsg(cadMsg, 'As senhas não conferem.', 'erro');
    return;
  }

  // TODO: aqui entra a criação da conta no banco de dados
  mostrarMsg(cadMsg, 'Cadastro ainda não disponível: falta conectar ao banco de dados.', 'erro');
});