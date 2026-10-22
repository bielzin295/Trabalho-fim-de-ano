document.getElementById('year').textContent = new Date().getFullYear();

// Avisos temporários enquanto as páginas reais não existem
function entrar() {
  alert("Página de login em desenvolvimento.");
}

function cadastrarCliente() {
  alert("Cadastro de cliente em desenvolvimento.");
}

function cadastrarFreelancer() {
  alert("Cadastro de freelancer em desenvolvimento.");
}

// Dropdown do botão "Cadastrar"
const cadastroBtn = document.getElementById('cadastroBtn');
const cadastroMenu = document.getElementById('cadastroMenu');
cadastroBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  cadastroMenu.classList.toggle('open');
});
document.addEventListener('click', () => cadastroMenu.classList.remove('open'));
cadastroMenu.addEventListener('click', (e) => e.stopPropagation());

const spCities = ["São Paulo","Campinas","Santos","Sorocaba","Ribeirão Preto","São José dos Campos","Sumaré","Osasco"];

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