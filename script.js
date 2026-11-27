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

const telaChat = document.getElementById('telaChat');



function fecharModais() {

     telaChat.classList.remove('open');

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



// A lista pública vem da API. O chat antigo ainda usa contas locais/e-mail.

let freelancersApi = [];

let carregandoFreelancersApi = false;

let freelancersApiCarregados = false;



function renderizarCardsFreelancers(lista, alvoGrid) {

     const grid = alvoGrid || document.getElementById('freelancerGrid');



     if (!grid) return;



     if (!alvoGrid && window.fpFiltrarDestaque) lista = window.fpFiltrarDestaque(lista);

     const sessaoGrid = sessaoAtual();



     const mostrarConversar = !(sessaoGrid && sessaoGrid.tipo === 'freelancer');



     if (!lista.length) {

          grid.innerHTML =

               '<p style="color:var(--muted);">' + (window.fpMsgVazio ? window.fpMsgVazio() : 'Nenhum freelancer cadastrado ainda.') + '</p>';

          return;

     }



     grid.innerHTML = lista.map((f, i) => `

          <div class="card">

               <div class="card-top">

                    <div class="perfil-foto" style="width:44px;height:44px;" data-i="${i}"></div>

                    <div>

                         <h3>${esc(f.nome)}</h3>

                         <div class="role">${esc(f.profissao || 'Freelancer')}</div>${f.cidade ? `<div class="role">${esc(f.cidade)}</div>` : ''}${window.fpEstrelas ? window.fpEstrelas(f) : ''}

                    </div>

               </div>

               <p class="desc">

                    ${esc(f.descricao) || 'Este freelancer ainda não escreveu uma descrição.'}

               </p>

               <div class="card-foot">

                    <span class="rate">

                         ${f.valorHora !== null && f.valorHora !== undefined && f.valorHora !== ''

                              ? 'R$ ' + esc(f.valorHora) + '/h'

                              : 'Valor a combinar'}

                    </span>

                    ${mostrarConversar

                         ? `<button class="btn btn-primary btn-proposta" type="button" data-chave="${esc(f.email || f.id)}" data-nome="${esc(f.nome)}">Proposta</button>`

                         : ''}

               </div>

          </div>

     `).join('');



     grid.querySelectorAll('.perfil-foto[data-i]').forEach(el => {

          pintarFoto(el, lista[Number(el.dataset.i)].foto || null);

     });

}



async function carregarFreelancersApi() {

     const grid = document.getElementById('freelancerGrid');



     if (!grid || carregandoFreelancersApi) return;



     carregandoFreelancersApi = true;



     grid.innerHTML = '<p style="color:var(--muted);">Carregando freelancers...</p>';



     try {

          const resposta = await fetch(API_URL + '/perfis/freelancers', {

               method: 'GET',

               headers: { 'Accept': 'application/json' }

          });



          if (!resposta.ok) {

               throw new Error('A API respondeu com erro ' + resposta.status + '.');

          }



          const dados = await resposta.json();



          if (!Array.isArray(dados)) {

               throw new Error('A API não retornou uma lista válida de freelancers.');

          }



          freelancersApi = dados.map(f => ({

               id: f.id,

               nome: f.nome,

               descricao: f.descricao,

               valorHora: f.valor_hora,

               foto: null,

               email: null,

               profissao: f.profissao || null,

               cidade: f.cidade || null

          }));



          freelancersApiCarregados = true;



          renderizarCardsFreelancers(freelancersApi);



     } catch (erro) {

          console.error('Erro ao carregar freelancers da API:', erro);



          grid.innerHTML = '<p style="color:var(--muted);">Não foi possível carregar os freelancers. Confira se o backend está ligado e tente atualizar a página.</p>';



     } finally {

          carregandoFreelancersApi = false;

     }

}



function renderGrid() {

     if (USAR_API) {

          if (freelancersApiCarregados) {

               renderizarCardsFreelancers(freelancersApi);

          } else {

               carregarFreelancersApi();

          }



          return;

     }



     const lista = lerLS(CHAVE_CONTAS, [])

          .filter(c => c.tipo === 'freelancer');



     renderizarCardsFreelancers(lista);

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



// ----- Sessão atual -----

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



     renderGrid();

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
     const profissao = document.getElementById('cadProfissao').value;
     const cidade = document.getElementById('cadCidade').value;



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

     if (tipoConta === 'freelancer' && (!profissao || !cidade)) {

          mostrarMsg(cadMsg, 'Escolha a sua profissão e a sua cidade.', 'erro');

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

               if (profissao) corpo.profissao = profissao;

               if (cidade) corpo.cidade = cidade;

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

          descricao: tipoConta === 'freelancer' ? descricao : null,

          profissao: tipoConta === 'freelancer' ? profissao : null,

          cidade: tipoConta === 'freelancer' ? cidade : null

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



// ============================================================

// MENSAGENS (CHAT)

// Por enquanto as conversas ficam salvas só neste navegador.

// Quando o backend tiver as rotas de conversas e mensagens,

// só as funções de ler/salvar abaixo precisam ser trocadas.

// ============================================================

const CHAVE_CHAT = 'fp_chat';



const chatLista = document.getElementById('chatLista');

const chatVazio = document.getElementById('chatVazio');

const chatCabeca = document.getElementById('chatCabeca');

const chatMsgs = document.getElementById('chatMsgs');

const chatForm = document.getElementById('chatForm');

const chatTexto = document.getElementById('chatTexto');



let conversaAberta = null;



function lerConversas() {

     return lerLS(CHAVE_CHAT, []);

}



function salvarConversas(conversas) {

     return gravarLS(CHAVE_CHAT, conversas);

}



function meuEmail() {

     const sessao = sessaoAtual();

     return sessao && sessao.email ? sessao.email.toLowerCase() : null;

}



function ultimaAtividade(c) {

     const m = c.mensagens[c.mensagens.length - 1];

     return new Date(m ? m.hora : c.criadaEm).getTime();

}



function conversasDoUsuario() {

     const eu = meuEmail();



     return lerConversas()

          .filter(c => c.cliente.email === eu || c.freelancer.email === eu)

          .sort((a, b) => ultimaAtividade(b) - ultimaAtividade(a));

}



function outraParte(c) {

     return c.cliente.email === meuEmail()

          ? { ...c.freelancer, papel: 'Freelancer' }

          : { ...c.cliente, papel: 'Cliente' };

}



function fotoDoUsuario(email) {

     if (USAR_API) return null;

     const conta = buscarConta(email);

     return conta ? conta.foto : null;

}



function formatarHora(iso) {

     const d = new Date(iso);



     if (d.toDateString() === new Date().toDateString()) {

          return d.toLocaleTimeString('pt-BR', {

               hour: '2-digit',

               minute: '2-digit'

          });

     }



     return d.toLocaleDateString('pt-BR', {

          day: '2-digit',

          month: '2-digit'

     });

}



function renderChat() {

     const eu = meuEmail();

     const conversas = conversasDoUsuario();

     const sessao = sessaoAtual();



     if (!conversas.some(c => c.id === conversaAberta)) {

          conversaAberta = conversas.length ? conversas[0].id : null;

     }



     // Lista de conversas

     if (!conversas.length) {

          chatLista.innerHTML = '<p class="chat-lista-vazio">Você ainda não tem conversas.</p>';

     } else {

          chatLista.innerHTML = conversas.map(c => {

               const outra = outraParte(c);

               const ultima = c.mensagens[c.mensagens.length - 1];



               return `

                    <button type="button" class="chat-item${c.id === conversaAberta ? ' ativa' : ''}" data-id="${esc(c.id)}">

                         <div class="perfil-foto" style="width:44px;height:44px;" data-email="${esc(outra.email)}"></div>

                         <div class="chat-item-txt">

                              <div class="chat-item-linha">

                                   <strong>${esc(outra.nome)}</strong>

                                   <span>${ultima ? esc(formatarHora(ultima.hora)) : ''}</span>

                              </div>

                              <div class="chat-item-previa">${ultima ? esc(ultima.texto) : 'Nenhuma mensagem ainda'}</div>

                         </div>

                    </button>

               `;

          }).join('');



          chatLista.querySelectorAll('.perfil-foto[data-email]').forEach(el => {

               pintarFoto(el, fotoDoUsuario(el.dataset.email));

          });

     }



     // Conversa aberta

     const atual = conversas.find(c => c.id === conversaAberta);



     chatVazio.classList.toggle('hidden', !!atual);

     chatCabeca.classList.toggle('hidden', !atual);

     chatMsgs.classList.toggle('hidden', !atual);

     chatForm.classList.toggle('hidden', !atual);



     if (!atual) {

          chatVazio.textContent = sessao && sessao.tipo === 'freelancer'

               ? 'Quando um cliente falar com você, a conversa aparece aqui.'

               : 'Escolha um freelancer na lista e clique em "Conversar" para começar.';

          return;

     }



     const outra = outraParte(atual);



     document.getElementById('chatNome').textContent = outra.nome;

     document.getElementById('chatPapel').textContent = outra.papel;

     pintarFoto(document.getElementById('chatAvatar'), fotoDoUsuario(outra.email));



     chatMsgs.innerHTML = atual.mensagens.length

          ? atual.mensagens.map(m => `

                    <div class="chat-msg ${m.de === eu ? 'minha' : 'deles'}">

                         <div class="chat-balao">${esc(m.texto)}</div>

                         <div class="chat-hora">${esc(formatarHora(m.hora))}</div>

                    </div>

               `).join('')

          : '<p class="chat-aviso">Envie a primeira mensagem.</p>';



     chatMsgs.scrollTop = chatMsgs.scrollHeight;

}



function abrirChat(id) {

     if (!sessaoAtual()) {

          entrar();

          return;

     }



     fecharModais();

     conversaAberta = id || conversaAberta;

     renderChat();

     telaChat.classList.add('open');

}



function iniciarConversa(emailFreelancer) {

     const sessao = sessaoAtual();



     if (!sessao) {

          entrar();

          return;

     }



     const freelancer = lerLS(CHAVE_CONTAS, [])

          .find(c => c.email === emailFreelancer && c.tipo === 'freelancer');



     if (!freelancer) return;



     const eu = meuEmail();

     const conversas = lerConversas();



     let conversa = conversas.find(c =>

          c.cliente.email === eu && c.freelancer.email === freelancer.email

     );



     if (!conversa) {

          conversa = {

               id: 'c' + Date.now(),

               cliente: { email: eu, nome: sessao.nome },

               freelancer: { email: freelancer.email, nome: freelancer.nome },

               criadaEm: new Date().toISOString(),

               mensagens: []

          };



          conversas.push(conversa);

          salvarConversas(conversas);

     }



     abrirChat(conversa.id);

     chatTexto.focus();

}



document.getElementById('btnMensagens')

     .addEventListener('click', () => abrirChat());



document.getElementById('freelancerGrid').addEventListener('click', e => {

     const botao = e.target.closest('.btn-conversar');



     if (!botao) return;



     if (!sessaoAtual()) {

          entrar();

          return;

     }



     if (botao.dataset.email) {

          iniciarConversa(botao.dataset.email);

          return;

     }



     alert('A lista de freelancers já está conectada ao Supabase, mas o chat com esses perfis ainda não foi conectado ao backend.');

});



chatLista.addEventListener('click', e => {

     const item = e.target.closest('.chat-item');



     if (!item) return;



     conversaAberta = item.dataset.id;

     renderChat();

});



chatForm.addEventListener('submit', e => {

     e.preventDefault();



     const texto = chatTexto.value.trim();



     if (!texto || !conversaAberta) return;



     const conversas = lerConversas();

     const conversa = conversas.find(c => c.id === conversaAberta);



     if (!conversa) return;



     conversa.mensagens.push({

          de: meuEmail(),

          texto,

          hora: new Date().toISOString()

     });



     if (!salvarConversas(conversas)) {

          chatMsgs.insertAdjacentHTML(

               'beforeend',

               '<p class="chat-aviso">Não foi possível salvar a mensagem neste navegador.</p>'

          );

          return;

     }



     chatTexto.value = '';

     renderChat();

     chatTexto.focus();

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

// ============================================================
// ============================================================
// PROJETOS, PROPOSTAS E CAIXA DE ENTRADA (front-end)
// Bloco colocado no fim do script.js.
//
// PROP_API = false -> funciona sozinho (localStorage), para testar/apresentar.
// PROP_API = true  -> usa as rotas abaixo (token JWT no header), a combinar com o back:
//   GET   /projetos                  -> lista de projetos abertos
//   POST  /projetos                  {titulo, descricao, valor, prazo}            (cliente)
//   POST  /propostas                 {freelancer_id, freelancer_nome, titulo, descricao, valor, prazo} (cliente)
//   POST  /solicitacoes              {projeto_id, descricao, valor}               (freelancer)
//   GET   /caixa-de-entrada          -> {recebidas:[item], enviadas:[item]}
//   PATCH /propostas/{id}  e  /solicitacoes/{id}   {status:'aceita'|'recusada'}
//   item = {id, tipo:'proposta'|'solicitacao', titulo, descricao, valor, prazo, status:'pendente'|'aceita'|'recusada', pessoa, criadaEm}
//   projeto = {id, titulo, descricao, valor, prazo, cliente_nome, cliente_email}
// Quando uma proposta/solicitação é aceita, o chat deve liberar para as duas partes:
//   defina window.fpAbrirConversa = (item) => { ... } para abrir a conversa certa.
// ============================================================
(function () {
  const PROP_API = false;
  const LS = 'fp_propostas';
  const vazio = () => ({ projetos: [], propostas: [], solicitacoes: [] });
  const ler = () => { try { return JSON.parse(localStorage.getItem(LS)) || vazio(); } catch (e) { return vazio(); } };
  const gravar = d => { try { localStorage.setItem(LS, JSON.stringify(d)); return true; } catch (e) { return false; } };
  const uid = () => 'p' + Date.now() + Math.random().toString(36).slice(2, 6);
  const eu = () => { const s = sessaoAtual(); return s ? { email: s.email, nome: s.nome, tipo: s.tipo, token: s.token } : null; };
  const tk = () => (eu() || {}).token;
  const $ = id => document.getElementById(id);
  const brl = v => (v !== '' && v != null) ? 'R$ ' + Number(v).toLocaleString('pt-BR') : 'A combinar';
  const dt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem prazo';

  // ---------- camada de dados ----------
  const rep = {
    async projetos() {
      if (PROP_API) { const r = await apiFetch('/projetos', { token: tk() }); return r.ok && Array.isArray(r.dados) ? r.dados : []; }
      return ler().projetos.filter(p => p.status === 'aberto').reverse()
        .map(p => ({ ...p, cliente_nome: p.cliente.nome, cliente_email: p.cliente.email }));
    },
    async enviar(tipo, corpo) {
      if (PROP_API) {
        const rota = { projeto: '/projetos', proposta: '/propostas', solicitacao: '/solicitacoes' }[tipo];
        const r = await apiFetch(rota, { metodo: 'POST', corpo, token: tk() });
        return r.ok ? { ok: true } : { ok: false, erro: mensagemErroApi(r, 'Não foi possível enviar') };
      }
      const d = ler(), e = eu();
      const base = { id: uid(), status: 'pendente', criadaEm: new Date().toISOString(), ...corpo };
      if (tipo === 'projeto') d.projetos.push({ ...base, status: 'aberto', cliente: { email: e.email, nome: e.nome } });
      if (tipo === 'proposta') d.propostas.push({ ...base, de: { email: e.email, nome: e.nome }, para: { chave: corpo.freelancer_id, nome: corpo.freelancer_nome } });
      if (tipo === 'solicitacao') {
        if (d.solicitacoes.some(s => s.projeto_id === corpo.projeto_id && s.freelancer.email === e.email))
          return { ok: false, erro: 'Você já enviou uma solicitação para este projeto.' };
        d.solicitacoes.push({ ...base, freelancer: { email: e.email, nome: e.nome } });
      }
      return gravar(d) ? { ok: true } : { ok: false, erro: 'Não foi possível salvar neste navegador.' };
    },
    async caixa() {
      if (PROP_API) { const r = await apiFetch('/caixa-de-entrada', { token: tk() }); return r.ok && r.dados ? r.dados : { recebidas: [], enviadas: [] }; }
      const d = ler(), me = eu().email, rec = [], env = [];
      d.propostas.forEach(p => {
        const it = { id: p.id, tipo: 'proposta', titulo: p.titulo, descricao: p.descricao, valor: p.valor, prazo: p.prazo, status: p.status, criadaEm: p.criadaEm };
        if (p.para.chave === me) rec.push({ ...it, pessoa: p.de.nome });
        if (p.de.email === me) env.push({ ...it, pessoa: p.para.nome, freelancer_chave: p.para.chave });
      });
      d.solicitacoes.forEach(s => {
        const pr = d.projetos.find(x => x.id === s.projeto_id) || {};
        const it = { id: s.id, tipo: 'solicitacao', titulo: 'Projeto: ' + (pr.titulo || '—'), descricao: s.descricao, valor: s.valor, status: s.status, criadaEm: s.criadaEm };
        if (pr.cliente && pr.cliente.email === me) rec.push({ ...it, pessoa: s.freelancer.nome, freelancer_chave: s.freelancer.email });
        if (s.freelancer.email === me) env.push({ ...it, pessoa: pr.cliente ? pr.cliente.nome : '—' });
      });
      const o = (a, b) => b.criadaEm.localeCompare(a.criadaEm);
      return { recebidas: rec.sort(o), enviadas: env.sort(o) };
    },
    async responder(it, aceitar) {
      const status = aceitar ? 'aceita' : 'recusada';
      if (PROP_API) {
        const r = await apiFetch((it.tipo === 'proposta' ? '/propostas/' : '/solicitacoes/') + it.id, { metodo: 'PATCH', corpo: { status }, token: tk() });
        return { ok: r.ok };
      }
      const d = ler(), x = (it.tipo === 'proposta' ? d.propostas : d.solicitacoes).find(a => a.id === it.id);
      if (!x) return { ok: false };
      x.status = status;
      if (aceitar && it.tipo === 'solicitacao') { const pr = d.projetos.find(p => p.id === x.projeto_id); if (pr) pr.status = 'fechado'; }
      return { ok: gravar(d) };
    }
  };

  // ---------- estrutura da página ----------
  document.querySelector('nav').insertAdjacentHTML('beforeend', '<a href="#projetos">Projetos</a>');
  $('como-funciona').insertAdjacentHTML('beforebegin', `
    <section id="projetos"><div class="wrap">
      <div class="section-head">
        <div><h2>Projetos abertos</h2><p>Clientes publicam o que precisam; freelancers pedem para realizar.</p></div>
        <button class="btn btn-primary" type="button" id="btnNovoProjeto">Publicar projeto</button>
      </div>
      <div class="grid" id="projetoGrid"></div>
    </div></section>`);
  $('btnMensagens').insertAdjacentHTML('beforebegin',
    '<button class="btn btn-ghost btn-mensagens" type="button" id="btnCaixa">Caixa de entrada<span class="badge hidden" id="caixaBadge"></span></button>');
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="modalProp"><div class="modal-box">
      <button class="modal-close" type="button" id="pFechar" aria-label="Fechar">&times;</button>
      <h2 id="pTitulo"></h2><p id="pSub"></p>
      <form id="pForm" novalidate>
        <div id="pCampoTitulo"><label for="pT">Título</label><input type="text" id="pT" maxlength="80"></div>
        <div><label for="pD" id="pDL">Descrição</label><textarea id="pD" maxlength="600"></textarea></div>
        <div class="row2">
          <div><label for="pV">Valor (R$)</label><input type="number" id="pV" min="0" step="1"></div>
          <div id="pCampoPrazo"><label for="pP">Prazo</label><input type="date" id="pP"></div>
        </div>
        <div id="pMsg" class="auth-msg" role="alert"></div>
        <button class="btn btn-primary" type="submit" id="pBtn">Enviar</button>
      </form>
    </div></div>
    <div class="tela" id="telaCaixa">
      <div class="tela-topo"><div class="tela-topo-int">
        <button class="btn btn-ghost" type="button" id="cxVoltar">&larr; Voltar</button><h2>Propostas</h2>
        <div class="tipo-switch" style="margin:0 0 0 auto;"><button type="button" class="chip active">Propostas</button><button type="button" class="chip" id="abaMsg">Mensagens</button></div>
      </div></div>
      <div class="tela-corpo">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <button type="button" class="chip active" data-lado="recebidas">Recebidas</button>
          <button type="button" class="chip" data-lado="enviadas">Enviadas</button>
          <span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="chip active" data-filtro="todas">Todas</button>
            <button type="button" class="chip" data-filtro="pendente">Pendentes</button>
            <button type="button" class="chip" data-filtro="aceita">Aceitas</button>
          </span>
        </div>
        <div class="jobs" id="cxLista" style="margin-top:0;"></div>
      </div>
    </div>`);

  // ---------- formulário (projeto, proposta, solicitação) ----------
  const MODOS = {
    projeto:    { titulo: 'Publicar projeto', sub: 'Descreva o serviço que você precisa. Freelancers poderão pedir para realizá-lo.', campoTitulo: true, rotulo: 'Descrição do serviço', btn: 'Publicar', prazo: true },
    proposta:   { titulo: 'Enviar proposta', sub: '', campoTitulo: true, rotulo: 'Detalhes da proposta', btn: 'Enviar proposta', prazo: true },
    solicitacao:{ titulo: 'Quero realizar este serviço', sub: '', campoTitulo: false, rotulo: 'Sua mensagem ao cliente', btn: 'Enviar solicitação', prazo: false }
  };
  let modo = null, ctx = null;

  function abrirForm(m, c, subtitulo) {
    if (!eu()) { entrar(); return; }
    const cfg = MODOS[m];
    modo = m; ctx = c || {};
    $('pForm').reset();
    $('pMsg').className = 'auth-msg';
    $('pTitulo').textContent = cfg.titulo;
    $('pSub').textContent = subtitulo || cfg.sub;
    $('pDL').textContent = cfg.rotulo;
    $('pBtn').textContent = cfg.btn;
    $('pCampoTitulo').classList.toggle('hidden', !cfg.campoTitulo);
    $('pCampoPrazo').classList.toggle('hidden', !cfg.prazo);
    $('modalProp').classList.add('open');
    (cfg.campoTitulo ? $('pT') : $('pD')).focus();
  }
  const fecharForm = () => $('modalProp').classList.remove('open');
  $('pFechar').addEventListener('click', fecharForm);
  $('modalProp').addEventListener('click', e => { if (e.target === $('modalProp')) fecharForm(); });

  $('pForm').addEventListener('submit', async e => {
    e.preventDefault();
    const cfg = MODOS[modo], msg = $('pMsg');
    const titulo = $('pT').value.trim(), descricao = $('pD').value.trim(), valor = $('pV').value, prazo = $('pP').value;
    if ((cfg.campoTitulo && !titulo) || !descricao) { mostrarMsg(msg, 'Preencha ' + (cfg.campoTitulo ? 'o título e ' : '') + 'a descrição.', 'erro'); return; }
    const corpo = { descricao, valor: valor === '' ? null : Number(valor) };
    if (cfg.campoTitulo) corpo.titulo = titulo;
    if (cfg.prazo) corpo.prazo = prazo || null;
    if (modo === 'proposta') { corpo.freelancer_id = ctx.chave; corpo.freelancer_nome = ctx.nome; }
    if (modo === 'solicitacao') corpo.projeto_id = ctx.projetoId;
    const b = $('pBtn'); b.disabled = true;
    const r = await rep.enviar(modo, corpo);
    b.disabled = false;
    if (!r.ok) { mostrarMsg(msg, r.erro || 'Não foi possível enviar.', 'erro'); return; }
    mostrarMsg(msg, modo === 'projeto' ? 'Projeto publicado!' : 'Enviado com sucesso!', 'ok');
    setTimeout(fecharForm, 900);
    if (modo === 'projeto') renderProjetos();
    atualizarBadge();
  });

  // ---------- lista de projetos ----------
  async function renderProjetos() {
    const grid = $('projetoGrid'), e = eu();
    const lista = await rep.projetos();
    if (!lista.length) { grid.innerHTML = '<p style="color:var(--muted);">Nenhum projeto aberto ainda.</p>'; return; }
    grid.innerHTML = lista.map(p => {
      const meu = e && p.cliente_email === e.email;
      const botao = meu ? '<span class="st">Seu projeto</span>'
        : (e && e.tipo === 'cliente') ? ''
        : `<button class="btn btn-primary btn-proposta" type="button" data-solicitar="${esc(p.id)}" data-titulo="${esc(p.titulo)}">Quero realizar</button>`;
      return `<div class="card">
        <h3>${esc(p.titulo)}</h3><div class="role">Publicado por ${esc(p.cliente_nome)}</div>
        <p class="desc">${esc(p.descricao)}</p><p class="meta">Prazo: ${esc(dt(p.prazo))}</p>
        <div class="card-foot"><span class="rate">${esc(brl(p.valor))}</span>${botao}</div></div>`;
    }).join('');
  }

  // ---------- botão "Enviar proposta" nos cards de freelancers ----------

  document.addEventListener('click', e => {
    const p = e.target.closest('.btn-proposta[data-chave]');
    if (p) {
      const s = eu();
      if (!s) { entrar(); return; }
      if (s.tipo === 'freelancer') return;
      abrirForm('proposta', { chave: p.dataset.chave, nome: p.dataset.nome }, 'Para: ' + p.dataset.nome);
      return;
    }
    const s2 = e.target.closest('[data-solicitar]');
    if (s2) abrirForm('solicitacao', { projetoId: s2.dataset.solicitar }, 'Projeto: ' + s2.dataset.titulo);
  });
  $('btnNovoProjeto').addEventListener('click', () => abrirForm('projeto'));

  // ---------- caixa de entrada ----------
  const ROT = { pendente: 'Pendente', aceita: 'Aceita', recusada: 'Recusada' };

  let ladoCx = 'recebidas', filtroCx = 'todas', itensCx = [];

  async function renderCaixa() {
    const c = await rep.caixa();
    document.querySelectorAll('#telaCaixa [data-lado]').forEach(b => {
      const n = (c[b.dataset.lado] || []).length;
      b.textContent = (b.dataset.lado === 'recebidas' ? 'Recebidas' : 'Enviadas') + ' (' + n + ')';
      b.classList.toggle('active', b.dataset.lado === ladoCx);
    });
    document.querySelectorAll('#telaCaixa [data-filtro]').forEach(b => b.classList.toggle('active', b.dataset.filtro === filtroCx));

    const recebida = ladoCx === 'recebidas';
    itensCx = (c[ladoCx] || []).filter(i => filtroCx === 'todas' || i.status === filtroCx);
    const box = $('cxLista');
    if (!itensCx.length) {
      box.innerHTML = '<p class="empty">' + (filtroCx !== 'todas' ? 'Nenhuma proposta com esse status.' : recebida ? 'Nada recebido ainda.' : 'Você ainda não enviou nada.') + '</p>';
      return;
    }
    box.innerHTML = itensCx.map((it, i) => {
      const acoes = (recebida && it.status === 'pendente')
        ? `<button class="btn btn-primary btn-proposta" type="button" data-resp="1" data-i="${i}">Aceitar</button><button class="btn btn-ghost btn-proposta" type="button" data-resp="0" data-i="${i}">Recusar</button>`
        : it.status === 'aceita' ? `<button class="btn btn-ghost btn-proposta" type="button" data-conversar="${i}">Conversar</button>${window.fpBotaoAvaliar ? window.fpBotaoAvaliar(it, i, recebida) : ''}` : '';
      return `<div class="job"><div class="perfil-foto" style="width:36px;height:36px;"></div>
        <div class="job-info" style="flex:1;min-width:0;">
          <h4>${esc(it.titulo)} <span class="st ${esc(it.status)}">${esc(ROT[it.status] || it.status)}</span></h4>
          <span>${recebida ? 'De' : 'Para'} ${esc(it.pessoa)} · ${esc(brl(it.valor))}${it.prazo ? ' · Prazo ' + esc(dt(it.prazo)) : ''}</span>
          <div style="margin-top:6px;font-size:14px;">${esc(it.descricao)}</div>
        </div>
        <div class="job-acoes">${acoes}</div></div>`;
    }).join('');
    box.querySelectorAll('.perfil-foto').forEach(el => pintarFoto(el, null));
  }

  document.querySelectorAll('#telaCaixa [data-lado]').forEach(b => b.addEventListener('click', () => { ladoCx = b.dataset.lado; renderCaixa(); }));
  document.querySelectorAll('#telaCaixa [data-filtro]').forEach(b => b.addEventListener('click', () => { filtroCx = b.dataset.filtro; renderCaixa(); }));

  $('cxLista').addEventListener('click', async e => {
    const r = e.target.closest('[data-resp]'), c = e.target.closest('[data-conversar]'), av = e.target.closest('[data-avaliar]');
    if (av && window.fpAbrirAvaliar) { window.fpAbrirAvaliar(itensCx[Number(av.dataset.avaliar)]); return; }
    if (r) {
      const res = await rep.responder(itensCx[Number(r.dataset.i)], r.dataset.resp === '1');
      if (res.ok) { renderCaixa(); atualizarBadge(); }
    }
    if (c) {
      const it = itensCx[Number(c.dataset.conversar)];
      $('telaCaixa').classList.remove('open');
      if (window.fpAbrirConversa) window.fpAbrirConversa(it); else abrirChat();
    }
  });
  $('cxVoltar').addEventListener('click', () => $('telaCaixa').classList.remove('open'));
  function abrirCaixa() {
    if (!eu()) { entrar(); return; }
    fecharModais(); renderCaixa(); $('telaCaixa').classList.add('open');
  }
  $('btnCaixa').addEventListener('click', abrirCaixa);
  $('btnMensagens').classList.add('hidden');
  $('abaMsg').addEventListener('click', () => { $('telaCaixa').classList.remove('open'); abrirChat(); });
  // as mesmas abas dentro do chat, para poder voltar às propostas
  document.querySelector('#telaChat .tela-topo-int').insertAdjacentHTML('beforeend',
    '<div class="tipo-switch" style="margin:0 0 0 auto;"><button type="button" class="chip" id="chatAbaProp">Propostas</button><button type="button" class="chip active">Mensagens</button></div>');
  $('chatAbaProp').addEventListener('click', abrirCaixa);

  async function atualizarBadge() {
    const bs = [$('caixaBadge')];
    if (!eu()) { bs.forEach(b => b.classList.add('hidden')); return; }
    const c = await rep.caixa(), n = (c.recebidas || []).filter(i => i.status === 'pendente').length;
    bs.forEach(b => { b.textContent = n; b.classList.toggle('hidden', !n); });
  }

  // ---------- integração com o script.js (sem editá-lo) ----------
  const fecharOriginal = window.fecharModais;
  window.fecharModais = function () { fecharOriginal(); fecharForm(); $('telaCaixa').classList.remove('open'); };

  function aoMudarSessao() {
    const s = eu();
    $('btnNovoProjeto').classList.toggle('hidden', !!(s && s.tipo === 'freelancer'));
    renderProjetos(); atualizarBadge();
  }
  const topoOriginal = window.atualizarTopo;
  window.atualizarTopo = function () { topoOriginal(); aoMudarSessao(); };
  aoMudarSessao();
})();

// ============================================================
// AVALIAÇÕES E DESTAQUE
// AV_API = false -> guarda no navegador (localStorage).
// AV_API = true  -> usa as rotas abaixo (a combinar com o back):
//   GET  /avaliacoes/resumo               -> [{freelancer_id, media, total}]
//   GET  /freelancers/{id}/avaliacoes     -> [{nota, comentario, autor_nome, criada_em}]
//   POST /avaliacoes                      {freelancer_id, nota (1 a 5), comentario}  (cliente com proposta aceita)
//   Os itens de /caixa-de-entrada devem trazer freelancer_id, para o botão "Avaliar".
// Regra do destaque: os 6 melhores (nota média, depois nº de avaliações). A tela "Freelancers" lista todos, do melhor para o pior.
// ============================================================
(function () {
  const AV_API = false;
  const LS = 'fp_avaliacoes';
  const MAX = 6;
  const $ = id => document.getElementById(id);
  const ler = () => { try { return JSON.parse(localStorage.getItem(LS)) || []; } catch (e) { return []; } };
  const gravar = d => { try { localStorage.setItem(LS, JSON.stringify(d)); return true; } catch (e) { return false; } };
  const chaveDe = f => String(f.email || f.id);
  const estr = m => { const n = Math.round(m); return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); };
  const fmt = m => m.toFixed(1).replace('.', ',');
  let resumoApi = {}, notaSel = 0, alvo = null;

  function resumo(chave) {
    if (AV_API) return resumoApi[chave] || { media: 0, total: 0 };
    const l = ler().filter(a => a.freelancer_chave === chave);
    return { media: l.length ? l.reduce((t, a) => t + a.nota, 0) / l.length : 0, total: l.length };
  }
  async function carregarResumoApi() {
    const r = await apiFetch('/avaliacoes/resumo');
    if (!r.ok || !Array.isArray(r.dados)) return;
    resumoApi = {};
    r.dados.forEach(x => { resumoApi[String(x.freelancer_id)] = { media: Number(x.media) || 0, total: Number(x.total) || 0 }; });
    renderGrid();
  }
  async function listar(chave) {
    if (AV_API) { const r = await apiFetch('/freelancers/' + encodeURIComponent(chave) + '/avaliacoes'); return r.ok && Array.isArray(r.dados) ? r.dados : []; }
    return ler().filter(a => a.freelancer_chave === chave).reverse();
  }
  async function salvar(chave, nome, nota, comentario) {
    const e = sessaoAtual();
    if (AV_API) {
      const r = await apiFetch('/avaliacoes', { metodo: 'POST', corpo: { freelancer_id: chave, nota, comentario }, token: e.token });
      if (!r.ok) return { ok: false, erro: mensagemErroApi(r, 'Não foi possível avaliar') };
      await carregarResumoApi(); return { ok: true };
    }
    const d = ler(), i = d.findIndex(a => a.freelancer_chave === chave && a.autor_email === e.email);
    const reg = { id: 'a' + Date.now(), freelancer_chave: chave, freelancer_nome: nome, nota, comentario, autor_nome: e.nome, autor_email: e.email, criadaEm: new Date().toISOString() };
    if (i >= 0) d[i] = { ...reg, id: d[i].id }; else d.push(reg);
    return gravar(d) ? { ok: true } : { ok: false, erro: 'Não foi possível salvar neste navegador.' };
  }

  // ---------- cards e filtro do destaque ----------
  window.fpEstrelas = f => {
    const r = resumo(chaveDe(f));
    if (!r.total) return '<div class="av-linha av-vazio">Sem avaliações ainda</div>';
    return `<button type="button" class="av-linha av-link" data-ver="${esc(chaveDe(f))}" data-nome="${esc(f.nome)}"><span class="stars">${estr(r.media)}</span> <b>${fmt(r.media)}</b> <span>(${r.total})</span></button>`;
  };
  const PROFISSOES = ['Design gráfico', 'Desenvolvimento web', 'Redação e conteúdo', 'Edição de vídeo', 'Fotografia', 'Marketing digital', 'Tradução', 'Música e áudio', 'Consultoria', 'Outros'];
  const CIDADES = ['São Paulo', 'Campinas', 'Santos', 'Sorocaba', 'Ribeirão Preto', 'São José dos Campos', 'Sumaré', 'Osasco', 'Guarulhos', 'São Bernardo do Campo', 'Santo André', 'Jundiaí', 'Piracicaba', 'Bauru', 'Mogi das Cruzes', 'São José do Rio Preto', 'Taubaté', 'Limeira', 'Americana', 'Outra cidade'];
  let catSel = '', cidSel = '', catT = '', cidT = '', baseVazia = false;
  const opcoes = (arr, ph) => '<option value="">' + ph + '</option>' + arr.map(x => '<option>' + esc(x) + '</option>').join('');
  if ($('cadProfissao')) $('cadProfissao').innerHTML = opcoes(PROFISSOES, 'Selecione');
  if ($('cadCidade')) $('cadCidade').innerHTML = opcoes(CIDADES, 'Selecione');

  const ordenar = arr => arr.map(f => ({ f, r: resumo(chaveDe(f)) }))
    .sort((a, b) => b.r.media - a.r.media || b.r.total - a.r.total || String(a.f.nome).localeCompare(String(b.f.nome), 'pt-BR')).map(x => x.f);
  const passa = (f, cat, cid) => (!cat || f.profissao === cat) && (!cid || f.cidade === cid);
  const listaBase = () => USAR_API ? freelancersApi : lerLS(CHAVE_CONTAS, []).filter(c => c.tipo === 'freelancer');
  const caixa = (attr, id, ph, arr, atual) => `<select ${attr}="${id}" aria-label="${ph}"><option value="">${ph}</option>${arr.map(x => `<option${x === atual ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;

  // destaque: os 6 melhores (respeitando profissão e cidade escolhidas)
  window.fpFiltrarDestaque = lista => {
    const saida = ordenar(lista.filter(f => passa(f, catSel, cidSel))).slice(0, MAX);
    desenharFiltros();
    if ($('telaFreelancers').classList.contains('open')) renderTodos();
    baseVazia = !lista.length;
    return saida;
  };
  window.fpMsgVazio = () => baseVazia ? 'Nenhum freelancer cadastrado ainda.' : 'Nenhum freelancer encontrado com esses filtros.';
  function desenharFiltros() {
    const el = $('filters');
    if (!el) return;
    el.innerHTML = caixa('data-f', 'cat', 'Todas as profissões', PROFISSOES, catSel) + caixa('data-f', 'cid', 'Todas as cidades', CIDADES, cidSel)
      + '<button type="button" class="chip" data-todos style="margin-left:auto;">Ver todos os freelancers &rarr;</button>';
  }

  // tela "Freelancers": todos, do mais para o menos avaliado
  document.body.insertAdjacentHTML('beforeend', `
    <div class="tela" id="telaFreelancers">
      <div class="tela-topo"><div class="tela-topo-int">
        <button class="btn btn-ghost" type="button" id="tfVoltar">&larr; Voltar</button><h2>Freelancers</h2>
      </div></div>
      <div class="tela-corpo">
        <p class="tela-sub">Todos os freelancers cadastrados, dos mais bem avaliados aos menos avaliados.</p>
        <div class="filters" id="tfFiltros"></div>
        <div class="grid" id="todosGrid"></div>
      </div>
    </div>`);
  function renderTodos() {
    const grid = $('todosGrid');
    $('tfFiltros').innerHTML = caixa('data-t', 'cat', 'Todas as profissões', PROFISSOES, catT) + caixa('data-t', 'cid', 'Todas as cidades', CIDADES, cidT);
    if (USAR_API && !freelancersApiCarregados) { grid.innerHTML = '<p style="color:var(--muted);">Carregando freelancers...</p>'; renderGrid(); return; }
    const base = listaBase();
    baseVazia = !base.length;
    renderizarCardsFreelancers(ordenar(base.filter(f => passa(f, catT, cidT))), grid);
  }
  function abrirTodos() { fecharModais(); renderTodos(); $('telaFreelancers').classList.add('open'); }
  $('tfVoltar').addEventListener('click', () => $('telaFreelancers').classList.remove('open'));
  const linkNav = document.querySelector('nav a[href="#freelancers"]');
  if (linkNav) linkNav.addEventListener('click', e => { e.preventDefault(); abrirTodos(); });

  // ---------- janelas ----------
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="modalVerAval"><div class="modal-box">
      <button class="modal-close" type="button" id="vaFechar" aria-label="Fechar">&times;</button>
      <h2 id="vaTitulo"></h2><p id="vaResumo"></p><div id="vaLista"></div>
    </div></div>
    <div class="modal" id="modalAval"><div class="modal-box">
      <button class="modal-close" type="button" id="avFechar" aria-label="Fechar">&times;</button>
      <h2>Avaliar freelancer</h2><p id="avSub"></p>
      <form id="avForm" novalidate>
        <div><label>Sua nota</label><div id="avEstrelas">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="av-star" data-n="${n}" aria-label="${n} de 5">★</button>`).join('')}</div></div>
        <div><label for="avTxt">Comentário (opcional)</label><textarea id="avTxt" maxlength="300" placeholder="Como foi trabalhar com essa pessoa?"></textarea></div>
        <div id="avMsg" class="auth-msg" role="alert"></div>
        <button class="btn btn-primary" type="submit">Enviar avaliação</button>
      </form>
    </div></div>`);
  const fechar = () => { $('modalVerAval').classList.remove('open'); $('modalAval').classList.remove('open'); };
  [$('vaFechar'), $('avFechar')].forEach(b => b.addEventListener('click', fechar));
  [$('modalVerAval'), $('modalAval')].forEach(m => m.addEventListener('click', e => { if (e.target === m) fechar(); }));
  const fecharOriginal = window.fecharModais;
  window.fecharModais = function () { fecharOriginal(); fechar(); $('telaFreelancers').classList.remove('open'); };

  async function ver(chave, nome) {
    $('vaTitulo').textContent = nome;
    $('vaResumo').textContent = 'Carregando...';
    $('vaLista').innerHTML = '';
    $('modalVerAval').classList.add('open');
    const l = await listar(chave), r = resumo(chave);
    $('vaResumo').textContent = l.length ? estr(r.total ? r.media : 0) + ' ' + fmt(r.media) + ' · ' + l.length + (l.length === 1 ? ' avaliação' : ' avaliações') : 'Sem avaliações ainda.';
    $('vaLista').innerHTML = l.map(a => `<div class="av-item">
      <div class="av-top"><span><strong>${esc(a.autor_nome)}</strong> <span class="stars">${estr(a.nota)}</span></span><span class="mu">${esc(new Date(a.criadaEm || a.criada_em).toLocaleDateString('pt-BR'))}</span></div>
      ${a.comentario ? '<p style="margin:6px 0 0;font-size:14px;color:var(--muted);">' + esc(a.comentario) + '</p>' : ''}</div>`).join('');
  }
  function marcar(n) { notaSel = n; document.querySelectorAll('#avEstrelas .av-star').forEach(b => b.classList.toggle('on', Number(b.dataset.n) <= n)); }

  window.fpBotaoAvaliar = (it, i, recebida) => {
    const ok = ((it.tipo === 'proposta' && !recebida) || (it.tipo === 'solicitacao' && recebida)) && (it.freelancer_chave || it.freelancer_id);
    return ok ? `<button class="btn btn-ghost btn-proposta" type="button" data-avaliar="${i}">Avaliar</button>` : '';
  };
  window.fpAbrirAvaliar = it => {
    alvo = { chave: String(it.freelancer_chave || it.freelancer_id), nome: it.pessoa };
    marcar(0); $('avForm').reset(); $('avMsg').className = 'auth-msg';
    $('avSub').textContent = 'Freelancer: ' + alvo.nome;
    $('modalAval').classList.add('open');
  };
  $('avEstrelas').addEventListener('click', e => { const b = e.target.closest('.av-star'); if (b) marcar(Number(b.dataset.n)); });
  $('avForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!notaSel) { mostrarMsg($('avMsg'), 'Escolha uma nota de 1 a 5.', 'erro'); return; }
    const r = await salvar(alvo.chave, alvo.nome, notaSel, $('avTxt').value.trim());
    if (!r.ok) { mostrarMsg($('avMsg'), r.erro, 'erro'); return; }
    mostrarMsg($('avMsg'), 'Avaliação enviada!', 'ok');
    setTimeout(fechar, 900);
    renderGrid();
  });

  document.addEventListener('click', e => {
    const v = e.target.closest('[data-ver]');
    if (v) ver(v.dataset.ver, v.dataset.nome);
    if (e.target.closest('[data-todos]')) abrirTodos();
  });

  document.addEventListener('change', e => {
    const f = e.target.closest('[data-f]'), t = e.target.closest('[data-t]');
    if (f) { if (f.dataset.f === 'cat') catSel = f.value; else cidSel = f.value; renderGrid(); }
    if (t) { if (t.dataset.t === 'cat') catT = t.value; else cidT = t.value; renderTodos(); }
  });

  if (AV_API) carregarResumoApi();
  renderGrid();
})();