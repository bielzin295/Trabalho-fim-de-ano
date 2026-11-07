// ============================================================
// CÓDIGO DO SITE
// Menu, janelas de login/cadastro, lista de freelancers
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ----- Janelas de login e cadastro -----
const modalLogin = document.getElementById('modalLogin');
const modalCadastro = document.getElementById('modalCadastro');
const modalPerfil = document.getElementById('modalPerfil');

function fecharModais() {
  modalLogin.classList.remove('open');
  modalCadastro.classList.remove('open');
  modalPerfil.classList.remove('open');
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
[modalLogin, modalCadastro, modalPerfil].forEach(m => {
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

// ----- MODO DEMONSTRAÇÃO (sem banco de dados) -----
// As contas ficam salvas só neste navegador (localStorage), para mostrar a
// experiência do usuário. Quando o banco estiver pronto, é só trocar as funções
// contaExiste / salvarConta / buscarConta / (sessão) pelas chamadas ao banco.
// ATENÇÃO: as senhas aqui ficam sem proteção. Isso é só para demonstração.
const CHAVE_CONTAS = 'fp_contas';
const CHAVE_SESSAO = 'fp_sessao';

function lerLS(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; }
  catch (e) { return padrao; }
}
function gravarLS(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
  catch (e) { return false; }
}
function apagarLS(chave) {
  try { localStorage.removeItem(chave); } catch (e) {}
}

function buscarConta(email) {
  return lerLS(CHAVE_CONTAS, []).find(c => c.email === email.toLowerCase());
}
function salvarConta(conta) {
  const contas = lerLS(CHAVE_CONTAS, []);
  contas.push(conta);
  return gravarLS(CHAVE_CONTAS, contas);
}

// ----- Contagem de freelancers ativos (conta os freelancers cadastrados) -----
function atualizarContagem() {
  const total = lerLS(CHAVE_CONTAS, []).filter(c => c.tipo === 'freelancer').length;
  document.getElementById('statFreelancers').textContent = total.toLocaleString('pt-BR');
}

// ----- Foto de perfil: reduz a imagem para não ocupar muito espaço no navegador -----
function lerFoto(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject();
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject();
      img.onload = () => {
        const lado = 256;
        const canvas = document.createElement('canvas');
        canvas.width = lado; canvas.height = lado;
        // recorta o centro da imagem em formato quadrado
        const menor = Math.min(img.width, img.height);
        const x = (img.width - menor) / 2, y = (img.height - menor) / 2;
        canvas.getContext('2d').drawImage(img, x, y, menor, menor, 0, 0, lado, lado);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

// Desenha a foto da pessoa; sem foto, mostra o bonequinho padrão
function pintarFoto(el, foto) {
  if (foto) {
    el.classList.remove('sem-foto');
    el.style.backgroundImage = 'url(' + foto + ')';
    el.innerHTML = '';
  } else {
    el.classList.add('sem-foto');
    el.style.backgroundImage = '';
    el.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><circle cx="12" cy="9" r="4.2" fill="currentColor"/><path d="M3.5 22c0-5 3.8-8 8.5-8s8.5 3 8.5 8z" fill="currentColor"/></svg>';
  }
}

// ----- Topo do site: mostra nome e botão Sair quando a pessoa está logada -----
const areaVisitante = document.getElementById('areaVisitante');
const areaUsuario = document.getElementById('areaUsuario');
const nomeUsuario = document.getElementById('nomeUsuario');

function atualizarTopo() {
  const sessao = lerLS(CHAVE_SESSAO, null);
  if (sessao) {
    nomeUsuario.textContent = 'Olá, ' + sessao.nome.split(' ')[0];
    const conta = buscarConta(sessao.email);
    pintarFoto(document.getElementById('fotoUsuario'), conta && conta.foto);
    areaVisitante.classList.add('hidden');
    areaUsuario.classList.remove('hidden');
  } else {
    areaVisitante.classList.remove('hidden');
    areaUsuario.classList.add('hidden');
  }
}

function iniciarSessao(conta) {
  gravarLS(CHAVE_SESSAO, { nome: conta.nome, email: conta.email, tipo: conta.tipo });
  atualizarTopo();
}

// Menu da conta: abre ao clicar no boneco (a opção "Sair" fica no final do menu)
const fotoUsuario = document.getElementById('fotoUsuario');
const menuUsuario = document.getElementById('menuUsuario');
fotoUsuario.addEventListener('click', (e) => {
  e.stopPropagation();
  menuUsuario.classList.toggle('open');
});
document.addEventListener('click', () => menuUsuario.classList.remove('open'));
menuUsuario.addEventListener('click', (e) => e.stopPropagation());

document.getElementById('btnSair').addEventListener('click', (e) => {
  e.preventDefault();
  menuUsuario.classList.remove('open');
  apagarLS(CHAVE_SESSAO);
  atualizarTopo();
});

// ----- Formulários de login e cadastro -----
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

  const conta = buscarConta(email);
  if (!conta || conta.senha !== senha) {
    mostrarMsg(loginMsg, 'E-mail ou senha incorretos.', 'erro');
    return;
  }

  iniciarSessao(conta);
  loginForm.reset();
  fecharModais();
});

cadastroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('cadNome').value.trim();
  const email = document.getElementById('cadEmail').value.trim();
  const senha = document.getElementById('cadSenha').value;
  const senha2 = document.getElementById('cadSenha2').value;
  const telefone = document.getElementById('cadTelefone').value.trim();
  const valorHora = document.getElementById('cadValorHora').value;
  const descricao = document.getElementById('cadDescricao').value.trim();
  const arquivoFoto = document.getElementById('cadFoto').files[0];

  if (!nome || !email || !senha || !telefone) {
    mostrarMsg(cadMsg, 'Preencha todos os campos obrigatórios.', 'erro');
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    mostrarMsg(cadMsg, 'Digite um e-mail válido.', 'erro');
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
  if (buscarConta(email)) {
    mostrarMsg(cadMsg, 'Este e-mail já está cadastrado.', 'erro');
    return;
  }

  let foto = null;
  if (arquivoFoto) {
    if (!arquivoFoto.type.startsWith('image/')) {
      mostrarMsg(cadMsg, 'A foto de perfil precisa ser uma imagem (JPG ou PNG).', 'erro');
      return;
    }
    try { foto = await lerFoto(arquivoFoto); }
    catch (err) {
      mostrarMsg(cadMsg, 'Não foi possível ler essa foto. Tente outra imagem.', 'erro');
      return;
    }
  }

  const conta = {
    nome, email: email.toLowerCase(), senha, telefone, tipo: tipoConta, foto,
    valorHora: tipoConta === 'freelancer' && valorHora ? Number(valorHora) : null,
    descricao: tipoConta === 'freelancer' ? descricao : null
  };
  if (!salvarConta(conta)) {
    mostrarMsg(cadMsg, 'Não foi possível salvar a conta neste navegador.', 'erro');
    return;
  }

  atualizarContagem();
  iniciarSessao(conta);
  cadastroForm.reset();
  fecharModais();
});

// ----- Personalizar perfil (cliente e freelancer) -----
const perfilForm = document.getElementById('perfilForm');
const perfMsg = document.getElementById('perfMsg');
const fotoPerfilPreview = document.getElementById('fotoPerfilPreview');
let fotoNova; // undefined = não mudou | null = remover | texto = foto nova

function atualizarConta(email, mudancas) {
  const contas = lerLS(CHAVE_CONTAS, []);
  const i = contas.findIndex(c => c.email === email);
  if (i === -1) return false;
  contas[i] = { ...contas[i], ...mudancas };
  return gravarLS(CHAVE_CONTAS, contas);
}

function abrirPerfil() {
  const sessao = lerLS(CHAVE_SESSAO, null);
  const conta = sessao && buscarConta(sessao.email);
  if (!conta) return;
  fecharModais();
  fotoNova = undefined;
  perfilForm.reset();
  perfMsg.className = 'auth-msg';
  document.getElementById('perfNome').value = conta.nome;
  document.getElementById('perfEmail').value = conta.email;
  document.getElementById('perfTelefone').value = conta.telefone || '';
  const ehFreelancer = conta.tipo === 'freelancer';
  document.getElementById('perfCamposFreelancer').classList.toggle('hidden', !ehFreelancer);
  document.getElementById('perfSubtitulo').textContent = ehFreelancer
    ? 'Mostre melhor o seu trabalho para os clientes.'
    : 'Atualize seus dados de contato.';
  if (ehFreelancer) {
    document.getElementById('perfValorHora').value = conta.valorHora ?? '';
    document.getElementById('perfDescricao').value = conta.descricao || '';
  }
  pintarFoto(fotoPerfilPreview, conta.foto);
  modalPerfil.classList.add('open');
}

document.getElementById('btnPerfil').addEventListener('click', (e) => {
  e.preventDefault();
  menuUsuario.classList.remove('open');
  abrirPerfil();
});

document.getElementById('perfFoto').addEventListener('change', async (e) => {
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  if (!arquivo.type.startsWith('image/')) {
    mostrarMsg(perfMsg, 'A foto de perfil precisa ser uma imagem (JPG ou PNG).', 'erro');
    e.target.value = '';
    return;
  }
  try {
    fotoNova = await lerFoto(arquivo);
    pintarFoto(fotoPerfilPreview, fotoNova);
    perfMsg.className = 'auth-msg';
  } catch (err) {
    mostrarMsg(perfMsg, 'Não foi possível ler essa foto. Tente outra imagem.', 'erro');
  }
});

document.getElementById('btnRemoverFoto').addEventListener('click', () => {
  fotoNova = null;
  document.getElementById('perfFoto').value = '';
  pintarFoto(fotoPerfilPreview, null);
});

perfilForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const sessao = lerLS(CHAVE_SESSAO, null);
  const conta = sessao && buscarConta(sessao.email);
  if (!conta) return;

  const nome = document.getElementById('perfNome').value.trim();
  const telefone = document.getElementById('perfTelefone').value.trim();
  if (!nome || !telefone) {
    mostrarMsg(perfMsg, 'Preencha nome e telefone.', 'erro');
    return;
  }
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11) {
    mostrarMsg(perfMsg, 'Digite um telefone válido com DDD. Ex.: (11) 90000-0000.', 'erro');
    return;
  }

  const mudancas = { nome, telefone };
  if (conta.tipo === 'freelancer') {
    const valor = document.getElementById('perfValorHora').value;
    mudancas.valorHora = valor ? Number(valor) : null;
    mudancas.descricao = document.getElementById('perfDescricao').value.trim();
  }
  if (fotoNova !== undefined) mudancas.foto = fotoNova;

  if (!atualizarConta(conta.email, mudancas)) {
    mostrarMsg(perfMsg, 'Não foi possível salvar as alterações neste navegador.', 'erro');
    return;
  }
  gravarLS(CHAVE_SESSAO, { ...sessao, nome });
  atualizarTopo();
  fotoNova = undefined;
  mostrarMsg(perfMsg, 'Perfil atualizado!', 'ok');
});

atualizarTopo();
atualizarContagem();

// Clicar em "Freelancer Paulista" (canto esquerdo do topo) volta para o início
document.getElementById('logoInicio').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Botões do começo da página: sempre levam para o cadastro (cliente ou freelancer)
document.getElementById('heroContratar').addEventListener('click', (e) => {
  e.preventDefault();
  cadastrarCliente();
});
document.getElementById('heroFreelancer').addEventListener('click', (e) => {
  e.preventDefault();
  cadastrarFreelancer();
});