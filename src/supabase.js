// ═══════════════════════════════════
// SUPABASE — configuração e sincronização
// ═══════════════════════════════════
// Substitua os valores abaixo pelas credenciais do seu projeto Supabase
// (Project Settings → API)
const SB_URL  = 'https://icqpbjxaglijhjzruuuz.supabase.co';
const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcXBianhhZ2xpamhqenJ1dXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDA5OTAsImV4cCI6MjA5NzUxNjk5MH0.OcT7PD08lD6nHlDa0Kkq-DGGB4p1ZvQoYZER_iq9nXc';

const sb = supabase.createClient(SB_URL, SB_KEY);

// ─── Estado de autenticação ───
let sbUser = null;
let authRequired = false;

async function sbInit(){
  const { data: { session } } = await sb.auth.getSession();
  sbUser = session?.user || null;
  atualizarHeaderAuth();
  if(!sbUser){
    // bloqueia o app até fazer login
    authRequired = true;
    abrirModalAuth();
    const closeBtn = document.querySelector('#modalAuth .modal-close');
    if(closeBtn) closeBtn.style.display = 'none';
  } else {
    authRequired = false;
    mostrarToast('☁️ Conectado como ' + sbUser.email, 'success');
    await sbSyncDown();
  }
}

// ─── Auth ───
async function sbLogin(email, senha){
  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if(error){ mostrarToast('⚠️ ' + error.message, 'warn'); return false; }
  sbUser = data.user;
  authRequired = false;
  atualizarHeaderAuth();
  // mostra o X de fechar novamente (caso precise abrir o modal depois)
  const closeBtn = document.querySelector('#modalAuth .modal-close');
  if(closeBtn) closeBtn.style.display = '';
  fecharModalAuth();
  mostrarToast('✅ Login realizado! Sincronizando dados...', 'success');
  await sbSyncDown();
  verificarOnboarding();
  return true;
}

async function sbRegistrar(email, senha){
  const { data, error } = await sb.auth.signUp({ email, password: senha });
  if(error){ mostrarToast('⚠️ ' + error.message, 'warn'); return false; }
  sbUser = data.user;
  authRequired = false;
  atualizarHeaderAuth();
  const closeBtn = document.querySelector('#modalAuth .modal-close');
  if(closeBtn) closeBtn.style.display = '';
  fecharModalAuth();
  mostrarToast('🎉 Conta criada! Configure seu perfil.', 'success');
  verificarOnboarding();
  return true;
}

async function sbLogout(){
  await sb.auth.signOut();
  sbUser = null;
  atualizarHeaderAuth();
  mostrarToast('👋 Sessão encerrada', '');
}

async function sbResetSenha(email){
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: location.href
  });
  if(error){ mostrarToast('⚠️ ' + error.message, 'warn'); return; }
  mostrarToast('📧 E-mail de redefinição enviado!', 'success');
}

// ─── Sync: local → nuvem ───
async function sbSyncUp(){
  if(!sbUser){ abrirModalAuth(); return; }

  // monta objeto com todos os dados locais (mesma lógica do backup)
  const data = {};
  BACKUP_KEYS.forEach(k => {
    const val = localStorage.getItem(k);
    if(val) try { data[k] = JSON.parse(val); } catch(e){ data[k] = val; }
  });

  setSyncStatus('syncing');
  const { error } = await sb
    .from('user_data')
    .upsert({ user_id: sbUser.id, data, updated_at: new Date().toISOString() });

  if(error){
    setSyncStatus('error');
    mostrarToast('⚠️ Erro ao sincronizar: ' + error.message, 'warn');
  } else {
    setSyncStatus('ok');
    localStorage.setItem('pm_last_sync', new Date().toISOString());
    mostrarToast('☁️ Dados sincronizados com sucesso!', 'success');
    atualizarUltimoSync();
  }
}

// ─── Sync: nuvem → local ───
async function sbSyncDown(){
  if(!sbUser) return;

  setSyncStatus('syncing');
  const { data: row, error } = await sb
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', sbUser.id)
    .single();

  if(error || !row){
    setSyncStatus('ok');
    mostrarToast('☁️ Nenhum dado na nuvem ainda — use Sync ↑ para salvar', '');
    return;
  }

  // restaura no localStorage
  const dados = row.data || {};
  BACKUP_KEYS.forEach(k => {
    if(dados[k] !== undefined){
      localStorage.setItem(k, typeof dados[k] === 'string' ? dados[k] : JSON.stringify(dados[k]));
    }
  });

  // recarrega a UI
  restaurarImagensLS();
  renderHistory();
  renderFrasesCustom();
  renderProfileSelector();
  renderTemplateList();
  restoreDraft();
  atualizarSubtitle();

  setSyncStatus('ok');
  localStorage.setItem('pm_last_sync', new Date().toISOString());
  mostrarToast('☁️ Dados restaurados da nuvem!', 'success');
  atualizarUltimoSync();
}

// ─── UI helpers ───
function atualizarHeaderAuth(){
  const btn = document.getElementById('btnAuth');
  const syncArea = document.getElementById('syncArea');
  if(!btn) return;
  if(sbUser){
    btn.textContent = '👤 ' + (sbUser.email?.split('@')[0] || 'Conta');
    btn.title = sbUser.email + ' — clique para sair';
    btn.onclick = () => { if(confirm('Sair da conta?')) sbLogout(); };
    if(syncArea) syncArea.style.display = 'flex';
  } else {
    btn.textContent = '🔑 Entrar';
    btn.title = 'Fazer login ou criar conta';
    btn.onclick = abrirModalAuth;
    if(syncArea) syncArea.style.display = 'none';
  }
  atualizarUltimoSync();
}

function atualizarUltimoSync(){
  const el = document.getElementById('ultimoSync');
  if(!el) return;
  const ts = localStorage.getItem('pm_last_sync');
  el.textContent = ts
    ? 'Sync: ' + new Date(ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
    : 'Sem sync';
}

function setSyncStatus(estado){
  const btn = document.getElementById('btnSyncUp');
  if(!btn) return;
  if(estado === 'syncing'){ btn.textContent = '⏳ Sincronizando...'; btn.disabled = true; }
  else if(estado === 'error'){ btn.textContent = '❌ Erro'; btn.disabled = false; setTimeout(() => { btn.textContent = '☁️ Sync ↑'; }, 3000); }
  else { btn.textContent = '☁️ Sync ↑'; btn.disabled = false; }
}

function abrirModalAuth(){
  document.getElementById('modalAuth').classList.add('open');
  setTimeout(() => document.getElementById('authEmail')?.focus(), 100);
}

function fecharModalAuth(){
  if(authRequired && !sbUser) return; // não fecha sem login
  document.getElementById('modalAuth').classList.remove('open');
}

function switchAuthTab(tab){
  document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('authTabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('authFormLogin').style.display        = tab === 'login'    ? 'block' : 'none';
  document.getElementById('authFormLoginFooter').style.display  = tab === 'login'    ? 'flex'  : 'none';
  document.getElementById('authFormRegister').style.display     = tab === 'register' ? 'block' : 'none';
  document.getElementById('authFormRegisterFooter').style.display = tab === 'register' ? 'flex' : 'none';
}

async function handleLogin(){
  const email = document.getElementById('authEmail').value.trim();
  const senha = document.getElementById('authSenha').value;
  if(!email || !senha){ mostrarToast('⚠️ Preencha e-mail e senha', 'warn'); return; }
  const btn = document.getElementById('btnLogin');
  btn.textContent = 'Entrando...'; btn.disabled = true;
  await sbLogin(email, senha);
  btn.textContent = 'Entrar'; btn.disabled = false;
}

async function handleRegistrar(){
  const email = document.getElementById('regEmail').value.trim();
  const senha = document.getElementById('regSenha').value;
  const confirm = document.getElementById('regConfirm').value;
  if(!email || !senha){ mostrarToast('⚠️ Preencha e-mail e senha', 'warn'); return; }
  if(senha !== confirm){ mostrarToast('⚠️ Senhas não conferem', 'warn'); return; }
  if(senha.length < 6){ mostrarToast('⚠️ Senha deve ter ao menos 6 caracteres', 'warn'); return; }
  const btn = document.getElementById('btnRegistrar');
  btn.textContent = 'Criando conta...'; btn.disabled = true;
  await sbRegistrar(email, senha);
  btn.textContent = 'Criar conta'; btn.disabled = false;
}

async function handleResetSenha(){
  const email = document.getElementById('authEmail').value.trim();
  if(!email){ mostrarToast('⚠️ Digite seu e-mail primeiro', 'warn'); return; }
  await sbResetSenha(email);
}

// Inicializa ao carregar
sbInit();
