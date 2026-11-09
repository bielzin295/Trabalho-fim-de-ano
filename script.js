
// ============================================================
// CÓDIGO DO SITE
// Menu, login, cadastro, perfil e lista de freelancers
// ============================================================

// CONFIGURAÇÃO DA API
const USAR_API = true;
const API_URL = 'http://127.0.0.1:8000';

document.getElementById('year').textContent = new Date().getFullYear();

// ----- Janelas -----
const modalLogin = document.getElementById('modalLogin');
const modalCadastro = document.getElementById('modalCadastro');
const modalPerfil = document.getElementById('modalPerfil');
const modalExcluir = document.getElementById('modalExcluir');

function fecharModais() {
  modalLogin.classList.remove('open');
  modalCadastro.classList.remove('open');
  modalPerfil.classList.remove('open');
  modalExcluir.classList.remove('open');
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

document.querySelectorAll('[data-fechar]').forEach(b =>
  b.addEventListener('click', fecharModais)
);

[modalLogin, modalCadastro, modalExcluir].forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) fecharModais();
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') fecharModais();
});

// ----- Menu de cadastro -----
const cadastroBtn = document.getElementById('cadastroBtn');
const cadastroMenu = document.getElementById('cadastroMenu');

cadastroBtn.addEventListener('click', e => {
  e.stopPropagation();
  cadastroMenu.classList.toggle('open');
});

document.addEventListener('click', () =>
  cadastroMenu.classList.remove('open')
);

cadastroMenu.addEventListener('click', e => e.stopPropagation());

const spCities = [
  "São Paulo", "Campinas", "Santos", "Sorocaba",
  "Ribeirão Preto", "São José dos Campos", "Sumaré", "Osasco"
];

// ----- Mensagens -----
function mostrarMsg(el, texto, tipo) {
  el.textContent = texto;
  el.className = 'auth-msg ' + tipo;
}

// ----- Tipo de cadastro -----
const camposFreelancer = document.getElementById('camposFreelancer');
const tabCliente = document.getElementById('tabCliente');
const tabFreelancer = document.getElementById('tabFreelancer');
const cadSubtitulo = document.getElementById('cadSubtitulo');

let tipoConta = 'cliente';

function aplicarTipo() {
  tabCliente.classList.toggle('active', tipoConta === 'cliente');
  tabFreelancer.classList.toggle('active', tipoConta === 'freelancer');

  camposFreelancer.classList.toggle(
    'hidden',
    tipoConta !== 'freelancer'
  );

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

tabCliente.addEventListener('click', () => {
  tipoConta = 'cliente';
  aplicarTipo();
});

tabFreelancer.addEventListener('click', () => {
  tipoConta = 'freelancer';
  aplicarTipo();
});

// ----- Lista de freelancers -----
function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function renderGrid() {
  const lista = lerLS(CHAVE_CONTAS, [])
    .filter(c => c.tipo === 'freelancer');

  const grid = document.getElementById('freelancerGrid');

  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML =
      '<p style="color:var(--muted);">Nenhum freelancer cadastrado ainda.</p>';
    return;
  }

  grid.innerHTML = lista.map((f, i) => `
    <div class="card">
      <div class="card-top">
        <div class="perfil-foto" style="width:44px;height:44px;" data-i="${i}"></div>
        <div>
          <h3>${esc(f.nome)}</h3>
          <div class="role">Freelancer</div>
        </div>
      </div>
      <p class="desc">
        ${esc(f.descricao) || 'Este freelancer ainda não escreveu uma descrição.'}
      </p>
      <div class="card-foot">
        <span class="rate">
          ${f.valorHora ? 'R$ ' + esc(f.valorHora) + '/hora' : 'Valor a combinar'}
        </span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.perfil-foto[data-i]').forEach(el => {
    pintarFoto(el, lista[Number(el.dataset.i)].foto);
  });
}

// ----- LocalStorage -----
const CHAVE_CONTAS = 'fp_contas';
const CHAVE_SESSAO = 'fp_sessao';

function lerLS(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao;
  } catch (e) {
    return padrao;
  }
}

function gravarLS(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (e) {
    return false;
  }
}

function apagarLS(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (e) {}
}

function buscarConta(email) {
  return lerLS(CHAVE_CONTAS, [])
    .find(c => c.email === email.toLowerCase());
}

function salvarConta(conta) {
  const contas = lerLS(CHAVE_CONTAS, []);
  contas.push(conta);
  return gravarLS(CHAVE_CONTAS, contas);
}

// ----- Comunicação com o backend -----
const CHAVE_SESSAO_API = 'fp_sessao_api';

async function apiFetch(caminho, { metodo = 'GET', corpo, token } = {}) {
  const cabecalhos = {
    'Content-Type': 'application/json'
  };

  if (token) {
    cabecalhos['Authorization'] = 'Bearer ' + token;
  }

  let resposta;

  try {
    resposta = await fetch(API_URL + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      dados: null,
      semConexao: true
    };
  }

  let dados = null;

  try {
    dados = await resposta.json();
  } catch (e) {}

  return {
    ok: resposta.ok,
    status: resposta.status,
    dados
  };
}

function mensagemErroApi(res, padrao) {
  if (res.semConexao) {
    return 'Não foi possível conectar ao servidor (' +
      API_URL + '). Confira se o backend está ligado.';
  }

  const detalhe = res.dados && res.dados.detail;

  if (typeof detalhe === 'string') return detalhe;

  if (Array.isArray(detalhe) && detalhe.length && detalhe[0].msg) {
    return detalhe[0].msg;
  }

  return padrao + ' (erro ' + res.status + ').';
}

function lerTokenDoLogin(dados) {
  return dados && typeof dados.access_token === 'string'
    ? dados.access_token
    : null;
}

async function buscarPerfilApi(email, token) {
  const res = await apiFetch('/perfis/', { token });

  if (!res.ok) return null;

  const lista = Array.isArray(res.dados)
    ? res.dados
    : (res.dados && Array.isArray(res.dados.data)
      ? res.dados.data
      : null);

  if (!lista) {
    console.warn('Formato do GET /perfis/ não reconhecido:', res.dados);
    return null;
  }

  return lista.find(p =>
    p.email && p.email.toLowerCase() === email.toLowerCase()
  ) || null;
}

async function loginApi(email, senha, dadosCadastro) {
  const res = await apiFetch('/login', {
    metodo: 'POST',
    corpo: { email, senha }
  });

  if (!res.ok) {
    return { erro: mensagemErroApi(res, 'Não foi possível entrar') };
  }

  const token = lerTokenDoLogin(res.dados);

  if (!token) {
    console.log('Resposta do /login:', res.dados);
    return {
      erro: 'O servidor não retornou o token de acesso.'
    };
  }

  const base = dadosCadastro ||
    (await buscarPerfilApi(email, token)) || {};

  gravarLS(CHAVE_SESSAO_API, {
    token,
    email,
    nome: base.nome || email.split('@')[0],
    tipo: base.tipo || null,
    telefone: base.telefone || null,
    descricao: base.descricao || null,
    valorHora: base.valor_hora ?? null
  });

  atualizarTopo();
  return { ok: true };
}

function sessaoAtual() {
  return lerLS(
    USAR_API ? CHAVE_SESSAO_API : CHAVE_SESSAO,
    null
  );
}

// ============================================================
// CONTADOR DE FREELANCERS
// ============================================================

async function atualizarContagem() {
  const elemento = document.getElementById('statFreelancers');

  if (!elemento) return;

  if (!USAR_API) {
    const total = lerLS(CHAVE_CONTAS, [])
      .filter(c => c.tipo === 'freelancer').length;

    elemento.textContent = total.toLocaleString('pt-BR');
    return;
  }

  elemento.textContent = '...';

  const res = await apiFetch('/contagem-freelancers');

  if (!res.ok) {
    elemento.textContent = '—';
    console.error('Erro ao contar freelancers:', res.dados);
    return;
  }

  const total = Number(
    res.dados && res.dados.total_freelancers
  );

  if (!Number.isFinite(total)) {
    elemento.textContent = '—';
    console.error('Resposta inválida:', res.dados);
    return;
  }

  elemento.textContent = total.toLocaleString('pt-BR');
}

// ----- Fotos -----
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

        canvas.width = lado;
        canvas.height = lado;

        const menor = Math.min(img.width, img.height);
        const x = (img.width - menor) / 2;
        const y = (img.height - menor) / 2;

        canvas.getContext('2d').drawImage(
          img, x, y, menor, menor, 0, 0, lado, lado
        );

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      img.src = leitor.result;
    };

    leitor.readAsDataURL(arquivo);
  });
}

function pintarFoto(el, foto) {
  if (!el) return;

  if (foto) {
    el.classList.remove('sem-foto');
    el.style.backgroundImage = 'url(' + foto + ')';
    el.innerHTML = '';
  } else {
    el.classList.add('sem-foto');
    el.style.backgroundImage = '';
    el.innerHTML = `
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
        <circle cx="12" cy="9" r="4.2" fill="currentColor"/>
        <path d="M3.5 22c0-5 3.8-8 8.5-8s8.5 3 8.5 8z" fill="currentColor"/>
      </svg>
    `;
  }
}

// ----- Topo do site -----
const areaVisitante = document.getElementById('areaVisitante');
const areaUsuario = document.getElementById('areaUsuario');
const nomeUsuario = document.getElementById('nomeUsuario');

function atualizarTopo() {
  const sessao = sessaoAtual();

  if (sessao) {
    nomeUsuario.textContent = 'Olá, ' + sessao.nome.split(' ')[0];

    const conta = USAR_API ? null : buscarConta(sessao.email);

    pintarFoto(
      document.getElementById('fotoUsuario'),
      conta && conta.foto
    );

    areaVisitante.classList.add('hidden');
    areaUsuario.classList.remove('hidden');
  } else {
    areaVisitante.classList.remove('hidden');
    areaUsuario.classList.add('hidden');
  }
}

function iniciarSessao(conta) {
  gravarLS(CHAVE_SESSAO, {
    nome: conta.nome,
    email: conta.email,
    tipo: conta.tipo
  });

  atualizarTopo();
}

// ----- Sair da conta -----
document.getElementById('btnSair').addEventListener('click', () => {
  fecharModais();
  apagarLS(CHAVE_SESSAO);
  apagarLS(CHAVE_SESSAO_API);
  atualizarTopo();
});

// ----- Formulário de login -----
const loginForm = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMsg');
const cadastroForm = document.getElementById('cadastroForm');
const cadMsg = document.getElementById('cadMsg');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  if (!email || !senha) {
    mostrarMsg(loginMsg, 'Preencha e-mail e senha.', 'erro');
    return;
  }

  if (USAR_API) {
    const botao = document.getElementById('btnEntrar');

    botao.disabled = true;
    botao.textContent = 'Entrando...';

    const r = await loginApi(email, senha);

    botao.disabled = false;
    botao.textContent = 'Entrar';

    if (r.erro) {
      mostrarMsg(loginMsg, r.erro, 'erro');
      return;
    }

    loginForm.reset();
    fecharModais();

    atualizarContagem();
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

// ----- Formulário de cadastro -----
cadastroForm.addEventListener('submit', async e => {
  e.preventDefault();

  const nome = document.getElementById('cadNome').value.trim();
  const email = document.getElementById('cadEmail').value.trim();
  const senha = document.getElementById('cadSenha').value;
  const senha2 = document.getElementById('cadSenha2').value;
  const telefone = document.getElementById('cadTelefone').value.trim();
  const valorHora = document.getElementById('cadValorHora').value;
  const descricao = document.getElementById('cadDescricao').value.trim();

  if (!nome || !email || !senha || !telefone) {
    mostrarMsg(cadMsg, 'Preencha todos os campos obrigatórios.', 'erro');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    mostrarMsg(cadMsg, 'Digite um e-mail válido.', 'erro');
    return;
  }

  const digitos = telefone.replace(/\D/g, '');

  if (digitos.length < 10 || digitos.length > 11) {
    mostrarMsg(
      cadMsg,
      'Digite um telefone válido com DDD. Ex.: (11) 90000-0000.',
      'erro'
    );
    return;
  }

  if (senha.length < 8) {
    mostrarMsg(cadMsg, 'A senha precisa ter pelo menos 8 caracteres.', 'erro');
    return;
  }

  if (senha !== senha2) {
    mostrarMsg(cadMsg, 'As senhas não conferem.', 'erro');
    return;
  }

  if (USAR_API) {
    const corpo = {
      nome,
      email,
      senha,
      telefone,
      tipo: tipoConta
    };

    if (tipoConta === 'freelancer') {
      if (descricao) corpo.descricao = descricao;
      if (valorHora) corpo.valor_hora = Number(valorHora);
    }

    const botao = document.getElementById('btnCadastrar');

    botao.disabled = true;
    botao.textContent = 'Criando conta...';

    const res = await apiFetch('/cadastro', {
      metodo: 'POST',
      corpo
    });

    if (!res.ok) {
      botao.disabled = false;
      botao.textContent = 'Criar conta';

      mostrarMsg(
        cadMsg,
        mensagemErroApi(res, 'Não foi possível criar a conta'),
        'erro'
      );

      return;
    }

    const r = await loginApi(email, senha, {
      nome,
      tipo: tipoConta,
      telefone,
      descricao: corpo.descricao || null,
      valor_hora: corpo.valor_hora ?? null
    });

    botao.disabled = false;
    botao.textContent = 'Criar conta';

    if (r.erro) {
      mostrarMsg(
        cadMsg,
        'Conta criada! Não foi possível entrar automaticamente: ' + r.erro,
        'ok'
      );

      return;
    }

    cadastroForm.reset();
    fecharModais();

    atualizarContagem();
    return;
  }

  if (buscarConta(email)) {
    mostrarMsg(cadMsg, 'Este e-mail já está cadastrado.', 'erro');
    return;
  }

  let foto = null;

  const arquivoFoto = document.getElementById('cadFoto').files[0];

  if (arquivoFoto) {
    if (!arquivoFoto.type.startsWith('image/')) {
      mostrarMsg(
        cadMsg,
        'A foto de perfil precisa ser uma imagem (JPG ou PNG).',
        'erro'
      );
      return;
    }

    try {
      foto = await lerFoto(arquivoFoto);
    } catch (err) {
      mostrarMsg(
        cadMsg,
        'Não foi possível ler essa foto. Tente outra imagem.',
        'erro'
      );
      return;
    }
  }

  const conta = {
    nome,
    email: email.toLowerCase(),
    senha,
    telefone,
    tipo: tipoConta,
    foto,
    valorHora: tipoConta === 'freelancer' && valorHora
      ? Number(valorHora)
      : null,
    descricao: tipoConta === 'freelancer' ? descricao : null
  };

  if (!salvarConta(conta)) {
    mostrarMsg(
      cadMsg,
      'Não foi possível salvar a conta neste navegador.',
      'erro'
    );
    return;
  }

  atualizarContagem();
  renderGrid();
  iniciarSessao(conta);
  cadastroForm.reset();
  fecharModais();
});

// ----- Minha conta -----
const perfilForm = document.getElementById('perfilForm');
const perfMsg = document.getElementById('perfMsg');
const fotoPerfilPreview = document.getElementById('fotoPerfilPreview');

let fotoNova;

function atualizarConta(email, mudancas) {
  const contas = lerLS(CHAVE_CONTAS, []);
  const i = contas.findIndex(c => c.email === email);

  if (i === -1) return false;

  contas[i] = { ...contas[i], ...mudancas };

  return gravarLS(CHAVE_CONTAS, contas);
}

function abrirPerfil() {
  const sessao = sessaoAtual();

  const conta = !sessao ? null : USAR_API
    ? {
        nome: sessao.nome,
        email: sessao.email,
        telefone: sessao.telefone,
        tipo: sessao.tipo,
        valorHora: sessao.valorHora,
        descricao: sessao.descricao,
        foto: null
      }
    : buscarConta(sessao.email);

  if (!conta) return;

  fecharModais();
  fotoNova = undefined;
  perfilForm.reset();

  perfMsg.className = 'auth-msg';

  document.getElementById('perfNome').value = conta.nome;
  document.getElementById('perfEmail').value = conta.email;
  document.getElementById('perfTelefone').value = conta.telefone || '';

  const ehFreelancer = conta.tipo === 'freelancer';

  document.getElementById('perfCamposFreelancer')
    .classList.toggle('hidden', !ehFreelancer);

  document.getElementById('perfSubtitulo').textContent = ehFreelancer
    ? 'Veja e atualize as informações do seu cadastro de freelancer.'
    : 'Veja e atualize as informações do seu cadastro.';

  if (ehFreelancer) {
    document.getElementById('perfValorHora').value =
      conta.valorHora ?? '';

    document.getElementById('perfDescricao').value =
      conta.descricao || '';
  }

  pintarFoto(fotoPerfilPreview, conta.foto);

  perfilForm.querySelectorAll('input:not(#perfEmail), textarea')
    .forEach(el => {
      el.disabled = USAR_API;
    });

  perfilForm.querySelector('button[type=submit]').disabled = USAR_API;
  document.getElementById('btnRemoverFoto').disabled = USAR_API;
  document.getElementById('btnExcluirConta').disabled = USAR_API;

  if (USAR_API) {
    mostrarMsg(
      perfMsg,
      'Editar o perfil e excluir a conta ainda não estão disponíveis no backend.',
      'ok'
    );
  }

  modalPerfil.classList.add('open');
}

document.getElementById('fotoUsuario')
  .addEventListener('click', abrirPerfil);

document.getElementById('perfFoto').addEventListener('change', async e => {
  const arquivo = e.target.files[0];

  if (!arquivo) return;

  if (!arquivo.type.startsWith('image/')) {
    mostrarMsg(
      perfMsg,
      'A foto de perfil precisa ser uma imagem (JPG ou PNG).',
      'erro'
    );

    e.target.value = '';
    return;
  }

  try {
    fotoNova = await lerFoto(arquivo);
    pintarFoto(fotoPerfilPreview, fotoNova);
    perfMsg.className = 'auth-msg';
  } catch (err) {
    mostrarMsg(
      perfMsg,
      'Não foi possível ler essa foto. Tente outra imagem.',
      'erro'
    );
  }
});

document.getElementById('btnRemoverFoto').addEventListener('click', () => {
  fotoNova = null;
  document.getElementById('perfFoto').value = '';
  pintarFoto(fotoPerfilPreview, null);
});

perfilForm.addEventListener('submit', e => {
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
    mostrarMsg(
      perfMsg,
      'Digite um telefone válido com DDD. Ex.: (11) 90000-0000.',
      'erro'
    );
    return;
  }

  const mudancas = { nome, telefone };

  if (conta.tipo === 'freelancer') {
    const valor = document.getElementById('perfValorHora').value;

    mudancas.valorHora = valor ? Number(valor) : null;
    mudancas.descricao = document.getElementById('perfDescricao').value.trim();
  }

  if (fotoNova !== undefined) {
    mudancas.foto = fotoNova;
  }

  if (!atualizarConta(conta.email, mudancas)) {
    mostrarMsg(
      perfMsg,
      'Não foi possível salvar as alterações neste navegador.',
      'erro'
    );
    return;
  }

  gravarLS(CHAVE_SESSAO, { ...sessao, nome });
  atualizarTopo();
  renderGrid();

  fotoNova = undefined;

  mostrarMsg(perfMsg, 'Perfil atualizado!', 'ok');
});

// ----- Excluir conta -----
const exForm = document.getElementById('exForm');
const exMsg = document.getElementById('exMsg');
const exSenha = document.getElementById('exSenha');

let exEtapa = 1;

function abrirExcluir() {
  exEtapa = 1;
  exForm.reset();
  exMsg.className = 'auth-msg';

  document.getElementById('exPasso').textContent =
    'Confirmação 1 de 2';

  document.getElementById('exRotulo').textContent =
    'Digite sua senha';

  document.getElementById('exBtn').textContent = 'Continuar';

  modalExcluir.classList.add('open');
  exSenha.focus();
}

document.getElementById('btnExcluirConta')
  .addEventListener('click', abrirExcluir);

document.querySelectorAll('[data-fechar-excluir]').forEach(b => {
  b.addEventListener('click', () =>
    modalExcluir.classList.remove('open')
  );
});

exForm.addEventListener('submit', e => {
  e.preventDefault();

  const sessao = lerLS(CHAVE_SESSAO, null);
  const conta = sessao && buscarConta(sessao.email);

  if (!conta) {
    modalExcluir.classList.remove('open');
    return;
  }

  if (!exSenha.value) {
    mostrarMsg(exMsg, 'Digite a sua senha.', 'erro');
    return;
  }

  if (exSenha.value !== conta.senha) {
    mostrarMsg(exMsg, 'Senha incorreta.', 'erro');
    return;
  }

  if (exEtapa === 1) {
    exEtapa = 2;
    exForm.reset();
    exMsg.className = 'auth-msg';

    document.getElementById('exPasso').textContent =
      'Confirmação 2 de 2';

    document.getElementById('exRotulo').textContent =
      'Digite sua senha novamente para excluir a conta';

    document.getElementById('exBtn').textContent =
      'Excluir definitivamente';

    exSenha.focus();
    return;
  }

  const restantes = lerLS(CHAVE_CONTAS, [])
    .filter(c => c.email !== conta.email);

  gravarLS(CHAVE_CONTAS, restantes);
  apagarLS(CHAVE_SESSAO);

  fecharModais();
  atualizarTopo();
  atualizarContagem();
  renderGrid();
});

// ----- Inicialização -----
atualizarTopo();
atualizarContagem();
renderGrid();

// ----- Logo: voltar ao início -----
document.getElementById('logoInicio').addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ----- Botões principais -----
document.getElementById('heroContratar').addEventListener('click', e => {
  e.preventDefault();
  cadastrarCliente();
});

document.getElementById('heroFreelancer').addEventListener('click', e => {
  e.preventDefault();
  cadastrarFreelancer();
});
