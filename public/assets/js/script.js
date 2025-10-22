/* ===== FUNÇÕES GLOBAIS (TODAS AS PÁGINAS) ===== */

/**
 * Verifica o status de login ao carregar cada página e atualiza os botões de login/logout
 */

document.addEventListener('DOMContentLoaded', function () {
  checkLoginRedirect();
  checkPerfilRedirect();
  setupGlobalEventListeners();
  updateLoginButtons();
  setupPasswordToggle();
  setupCpfFormatting();

  if (document.querySelector('.container-principal') || document.getElementById('mobileFormPage')) {
    setupLoginModal();
  }

  if (document.getElementById('form-orcamento')) {
    updateLoginStatus();
    setupTattooStyleSelector();
  }

  if (document.querySelector('.avaliacoes-grid')) {
    setupAvaliacoes();
  }

  if (document.querySelector('.style-container')) {
    setupPortfolioAnimations();
  }

  if (document.querySelector('#header-video') || document.querySelector('.parallax-bg')) {
    setupHomeEffects();
  }

  if (document.querySelector('.menu-toggle')) {
    setupMobileMenu();
  }
});

/**
 * Formatação automática do CPF
 */

function setupCpfFormatting() {
  const cpfInputs = document.querySelectorAll('.cpf-input');

  cpfInputs.forEach(input => {
    input.addEventListener('input', function (e) {
      formatCPF(this);
    });

    if (input.value) {
      formatCPF(input);
    }
  });
}

/**
 * Formata o CPF no formato 000.000.000-00
 */

function formatCPF(input) {
  // Remove tudo que não é número
  let value = input.value.replace(/\D/g, '');

  if (value.length > 11) {
    value = value.substring(0, 11);
  }

  // Aplica a formatação

  if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (value.length > 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  input.value = value;
}

/**
 * Remove a formatação do CPF (para envio ao servidor)
 */

function cleanCPF(cpf) {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida se o CPF está no formato correto (apenas formato, não valida dígitos)
 */

function validateCPFFormat(cpf) {
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return cpfRegex.test(cpf);
}

/**
 * Verifica se precisa redirecionar para a página de login
 * Se estiver em outra página e não tiver o formulário, redireciona para index.html
 */

function checkLoginRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const shouldOpenLogin = urlParams.get('openLogin') === 'true';
  const loginSection = urlParams.get('section');

  if (shouldOpenLogin) {

    if (window.location.pathname.includes('index.html') ||
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('/')) {

      setTimeout(() => {
        openLogin();
        if (loginSection === 'cadastro') {
          if (window.innerWidth <= 768) {
            showMobileSection('cadastro');
          } else {
            document.querySelector('.container-principal')?.classList.add('ativo');
          }
        }
      }, 100);
    } else {
      window.location.href = 'index.html?openLogin=true' + (loginSection ? `&section=${loginSection}` : '');
    }
  }
}

/**
 * Configura event listeners globais
 */

function setupGlobalEventListeners() {
  document.addEventListener('click', function (e) {
    const loginContainer = document.querySelector('.container-principal');
    if (loginContainer && e.target === loginContainer) {
      closeLogin();
    }

    // Fechar modal de perfil

    const perfilModal = document.getElementById('perfilModal');
    if (perfilModal && e.target === perfilModal) {
      closePerfil();
    }

    // Fechar modal de confirmação

    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal && e.target === confirmModal) {
      fecharConfirmacao();
    }

    // Fechar alerta

    const alertOverlay = document.getElementById('alertOverlay');
    if (alertOverlay && e.target === alertOverlay) {
      fecharAlerta();
    }

    // Alternar entre login e cadastro

    if (e.target.classList.contains('link-cadastro')) {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        showMobileSection('cadastro');
      } else {
        document.querySelector('.container-principal')?.classList.add('ativo');
      }
    }

    if (e.target.classList.contains('link-login')) {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        showMobileSection('login');
      } else {
        document.querySelector('.container-principal')?.classList.remove('ativo');
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const offset = 100; // Ajuste para o header fixo
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  // Tecla ESC para fechar modais

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllForms();
      closePerfil();
      fecharConfirmacao();
      fecharAlerta();
    }
  });
}

/* ===== SISTEMA DE LOGIN/CADASTRO RESPONSIVO ===== */

/**
 * Abre o formulário apropriado baseado no dispositivo
 * Se não estiver na página index, redireciona
 */

function openLogin(section = 'login') {
  const isIndexPage = window.location.pathname.includes('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/');

  if (!isIndexPage) {
    window.location.href = `index.html?openLogin=true&section=${section}`;
    return;
  }

  if (window.innerWidth <= 768) {
    openMobileForm(section);
  } else {
    openDesktopForm(section);
  }
}

/**
 * Abre formulário desktop (popup)
 */

function openDesktopForm(section = 'login') {
  const container = document.querySelector('.container-principal');
  if (container) {
    container.style.display = 'flex';
    if (section === 'cadastro') {
      container.classList.add('ativo');
    } else {
      container.classList.remove('ativo');
    }
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Abre formulário mobile (página completa)
 */

function openMobileForm(section = 'login') {
  const mobilePage = document.getElementById('mobileFormPage');
  if (mobilePage) {
    mobilePage.classList.add('active');
    document.body.style.overflow = 'hidden';
    showMobileSection(section);
  }
}

/**
 * Fecha formulário mobile
 */

function closeMobileForm() {
  const mobilePage = document.getElementById('mobileFormPage');
  if (mobilePage) {
    mobilePage.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (window.location.search.includes('openLogin=true')) {
      const url = new URL(window.location);
      url.searchParams.delete('openLogin');
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url);
    }
  }
}

/**
 * Fecha formulário desktop
 */

function closeDesktopForm() {
  const container = document.querySelector('.container-principal');
  if (container) {
    container.style.display = 'none';
    document.body.style.overflow = 'auto';

    if (window.location.search.includes('openLogin=true')) {
      const url = new URL(window.location);
      url.searchParams.delete('openLogin');
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url);
    }
  }
}

/**
 * Fecha qualquer formulário aberto
 */

function closeAllForms() {
  closeDesktopForm();
  closeMobileForm();
}

/**
 * Mostra seção específica no formulário mobile
 */
function showMobileSection(section) {
  document.querySelectorAll('.mobile-form-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSection = document.getElementById(`mobile${section.charAt(0).toUpperCase() + section.slice(1)}Section`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

/**
 * Configura os formulários na inicialização
 */

function setupForms() {
  const closeBtn = document.querySelector('.desktop-form .close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDesktopForm);
  }

  const mobileBackBtn = document.querySelector('.mobile-back-btn');
  if (mobileBackBtn) {
    mobileBackBtn.addEventListener('click', closeMobileForm);
  }
}

/**
 * Configura o modal de login/cadastro
 */

function setupLoginModal() {
  setupForms();

  // Configurar envio do formulário de login desktop

  const loginForm = document.querySelector('.formulario.login form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleLogin(this);
    });
  }

  // Configurar envio do formulário de login mobile

  const mobileLoginForm = document.querySelector('#mobileLoginSection form');
  if (mobileLoginForm) {
    mobileLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleLogin(this);
    });
  }

  // Configurar envio do formulário de cadastro desktop

  const cadastroForm = document.querySelector('.formulario.cadastro form');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', function (e) {
      const cpfInput = this.querySelector('.cpf-input');
      if (cpfInput && cpfInput.value) {
        cpfInput.value = cleanCPF(cpfInput.value);
      }
    });
  }

  // Configurar envio do formulário de cadastro mobile

  const mobileCadastroForm = document.querySelector('#mobileCadastroSection form');
  if (mobileCadastroForm) {
    mobileCadastroForm.addEventListener('submit', function (e) {
      const cpfInput = this.querySelector('.cpf-input');
      if (cpfInput && cpfInput.value) {
        cpfInput.value = cleanCPF(cpfInput.value);
      }
    });
  }
  setupPasswordToggleForMobile();
}

/**
 * Processa o login com AJAX para mostrar mensagens de erro
 */

function handleLogin(form) {
  document.querySelectorAll('.login-error').forEach(el => el.remove());

  const formData = new FormData(form);

  fetch('../backend/php/login.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.nome);

        updateLoginButtons();
        closeAllForms();
        showAlert('Login realizado com sucesso!', 'success');
        setTimeout(() => {
          if (window.location.pathname.includes('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/')) {
            window.location.href = 'orçamentoCliente.html';
          }
        }, 1500);
      } else {
        if (data.message === 'email_senha_incorretos') {
          showLoginError('Por favor verificar, email ou senha estão incorretas');
        } else {
          showLoginError(data.message);
        }
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      showLoginError('Erro ao processar login. Tente novamente.');
    });

  return false;
}

/**
 * Mostra mensagem de erro no login (SPAN VERMELHO)
 */

function showLoginError(message) {

  document.querySelectorAll('.login-error').forEach(el => el.remove());

  const errorSpan = document.createElement('span');
  errorSpan.className = 'login-error';
  errorSpan.style.cssText = `
    color: #ff6b6b;
    font-size: 14px;
    text-align: center;
    display: block;
    margin-top: 10px;
    padding: 10px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 5px;
    border: 1px solid #ff6b6b;
    width: 100%;
  `;
  errorSpan.textContent = message;

  // Verifica se é desktop ou mobile

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const errorContainer = document.getElementById('mobile-login-error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
      errorContainer.appendChild(errorSpan);
    }
  } else {
    const errorContainer = document.getElementById('login-error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
      errorContainer.appendChild(errorSpan);
    }
  }
}

/**
 * Atualiza os botões de login/logout em TODAS as páginas
 */

function updateLoginButtons() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const loginElements = document.querySelectorAll('#login-btn, .open-btn[onclick="openLogin()"]');
  const logoutElements = document.querySelectorAll('#logout-btn');
  const perfilElements = document.querySelectorAll('#perfil-btn');

  loginElements.forEach(element => {
    element.style.display = isLoggedIn ? 'none' : 'block';
  });

  logoutElements.forEach(element => {
    element.style.display = isLoggedIn ? 'block' : 'none';
  });

  perfilElements.forEach(element => {
    element.style.display = isLoggedIn ? 'block' : 'none';
  });
}

/**
 * Realiza o logout do usuário
 */

function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    updateLoginButtons();
    showAlert('Logout realizado com sucesso!', 'success');

    if (window.location.pathname.includes('orçamentoCliente.html')) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  }
}

/**
 * Alternar visibilidade da senha para formulários desktop
 */

function setupPasswordToggle() {
  const toggleButtons = document.querySelectorAll('.desktop-form .toggle-password');

  toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const input = this.closest('.campo-input').querySelector('.password-input');
      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '🙈';
      } else {
        input.type = 'password';
        this.textContent = '👁️';
      }
    });
  });
}

/**
 * Configura toggle de senha para formulários mobile
 */

function setupPasswordToggleForMobile() {
  const mobileToggleButtons = document.querySelectorAll('.mobile-input-group .toggle-password');

  mobileToggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const input = this.closest('.mobile-input-group').querySelector('.password-input');
      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '🙈';
      } else {
        input.type = 'password';
        this.textContent = '👁️';
      }
    });
  });
}

/* ===== SISTEMA DE PERFIL - COM COMUNICAÇÃO REAL ===== */

/**
 * Abre o modal do perfil
 */

function openPerfil() {
  const perfilModal = document.getElementById('perfilModal');
  if (perfilModal) {
    perfilModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    showPerfilSection('menu');
    carregarDadosUsuario();
  } else {
    console.error('Modal de perfil não encontrado nesta página.');
    showAlert('Erro: Modal de perfil não disponível.', 'error');
  }
}
/**
 * Fecha o modal do perfil
 */

function closePerfil() {
  const perfilModal = document.getElementById('perfilModal');
  if (perfilModal) {
    perfilModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

/**
 * Mostra seção específica no perfil
 */

function showPerfilSection(section) {

  const sections = document.querySelectorAll('.perfil-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSection = document.getElementById(`perfil${section.charAt(0).toUpperCase() + section.slice(1)}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

/**
 * Carrega os dados do usuário nos formulários
 */

function carregarDadosUsuario() {
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  if (userEmail) {
    document.getElementById('perfilUserEmail').textContent = userEmail;
  }

  if (userName) {
    document.getElementById('perfilUserName').textContent = userName;
  }
}

/**
 * Alterna a visibilidade da senha
 */

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

/* ===== SISTEMA DE ALERTAS ===== */

/**
 * Mostra alerta personalizado
 */

function showAlert(message, type = 'success') {
  const alertOverlay = document.getElementById('alertOverlay');
  const alertMessage = document.getElementById('alertMessage');

  if (alertOverlay && alertMessage) {
    alertMessage.textContent = message;
    alertOverlay.className = `alert-overlay ${type}-alert`;
    alertOverlay.style.display = 'flex';
  } else {
    alert(message);
  }
}

/**
 * Fecha o alerta
 */

function fecharAlerta() {
  const alertOverlay = document.getElementById('alertOverlay');
  if (alertOverlay) {
    alertOverlay.style.display = 'none';
  }
}

/* ===== UTILITÁRIOS ===== */

/**
 * Valida formato de e-mail
 */

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Verifica se o nome é feminino
 */

function isNomeFeminino(nome) {
  if (!nome) return false;

  const nomeLower = nome.toLowerCase();
  const sufixosFemininos = ['a', 'e', 'i', 'da', 'na', 'ra', 'la', 'ta', 'ca', 'ah', 'ah'];

  return sufixosFemininos.some(sufixo => nomeLower.endsWith(sufixo));
}

/* ===== PÁGINA HOME ===== */

/**
 * Configura efeitos da página inicial
 */

function setupHomeEffects() {
  if (document.querySelector('.parallax-bg')) {
    window.addEventListener('scroll', function () {
      const scrollPosition = window.pageYOffset;
      const windowHeight = window.innerHeight;

      // Alternar entre imagens de fundo

      if (scrollPosition < windowHeight * 0.75) {
        document.getElementById('parallax-bg2').style.opacity = '1';
        document.getElementById('parallax-bg4').style.opacity = '0';
      } else {
        document.getElementById('parallax-bg2').style.opacity = '0';
        document.getElementById('parallax-bg4').style.opacity = '1';
      }

      // Aplicar parallax
      document.getElementById('parallax-bg2').style.transform = `translateY(${scrollPosition * 0.4}px)`;
      document.getElementById('parallax-bg4').style.transform = `translateY(${scrollPosition * 0.6}px)`;
      document.querySelector('header').classList.toggle('scrolled', scrollPosition > 100);
    });
  }

  // Controle do vídeo de fundo
  const video = document.getElementById('header-video');
  if (video) {
    video.muted = true;
    video.loop = true;
    video.play().catch(e => {
      document.addEventListener('click', () => video.play(), { once: true });
    });

    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play();
    });
  }
}

/* ===== PÁGINA PORTFÓLIO ===== */

/**
 * Configura animações e interações do portfólio
 */

function setupPortfolioAnimations() {
  const animateOnScroll = function () {
    // Animar containers de estilo
    const styleContainers = document.querySelectorAll('.style-container');
    styleContainers.forEach(container => {
      const containerPosition = container.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (containerPosition < screenPosition) {
        if (container.classList.contains('reverse')) {
          container.classList.add('animate__fadeInRight');
        } else {
          container.classList.add('animate__fadeInLeft');
        }
        container.style.opacity = '1';
      }
    });

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
      const itemPosition = item.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;

      if (itemPosition < screenPosition) {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('animate__zoomIn');
      }
    });
  };

  animateOnScroll();
  window.addEventListener('scroll', animateOnScroll);
  setupPortfolioModal();
}

/**
 * Configura o modal de zoom para imagens do portfólio
 */

function setupPortfolioModal() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const captionText = document.getElementById('caption');
  const zoomButtons = document.querySelectorAll('.zoom-btn');
  const closeModal = document.querySelector('.close-modal');

  if (!modal) return;

  zoomButtons.forEach(button => {
    button.addEventListener('click', function () {
      const container = this.closest('.style-container') || this.closest('.gallery-item').parentElement;
      const imgSrc = container.querySelector('img').src;
      const imgAlt = container.querySelector('img').alt;
      const title = container.querySelector('h3') ? container.querySelector('h3').textContent : 'Tatuagem';

      modal.style.display = 'block';
      modalImg.src = imgSrc;
      modalImg.alt = imgAlt;
      captionText.innerHTML = `<strong>${title}</strong> - ${imgAlt}`;
    });
  });

  closeModal.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/* ===== PÁGINA ORÇAMENTO ===== */

/**
 * Atualiza o status de login e controla o formulário de orçamento
 */

function updateLoginStatus() {
  const formOrcamento = document.getElementById('form-orcamento');
  if (!formOrcamento) return;

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const loginMessage = document.getElementById('login-message');
  const formInputs = formOrcamento.querySelectorAll('input, select, textarea, button');

  formOrcamento.style.display = 'block';

  if (isLoggedIn) {
    if (loginMessage) loginMessage.style.display = 'none';
    formOrcamento.classList.remove('disabled-form');
    formInputs.forEach(input => {
      input.disabled = false;
    });
  } else {
    if (loginMessage) loginMessage.style.display = 'block';
    formOrcamento.classList.add('disabled-form');
    formInputs.forEach(input => {
      input.disabled = true;
    });
  }
}

/**
 * Configura o seletor de estilo de tatuagem
 */

function setupTattooStyleSelector() {
  const estiloSelect = document.getElementById('estilo-tatuagem');
  const fileInput = document.getElementById('imagem-referencia');
  const requiredStar = document.getElementById('required-star');

  if (estiloSelect && fileInput && requiredStar) {
    estiloSelect.addEventListener('change', function () {
      if (this.value === 'outro') {
        requiredStar.style.display = 'inline';
        fileInput.setAttribute('required', 'true');
      } else {
        requiredStar.style.display = 'none';
        fileInput.removeAttribute('required');
      }
    });
  }

  // Configurar envio do formulário de orçamento
  const formOrcamento = document.getElementById('form-orcamento');
  if (formOrcamento) {
    formOrcamento.addEventListener('submit', function (e) {
      e.preventDefault();

      const inputs = document.querySelectorAll('#form-orcamento [required]');
      let valido = true;

      inputs.forEach(input => {
        if (!input.value) {
          input.style.borderColor = "#ff6b6b";
          valido = false;
        } else {
          input.style.borderColor = "#4b1c76";
        }
      });

      if (!valido) {
        showAlert("Por favor, preencha todos os campos obrigatórios.", "error");
        return;
      }

      showAlert("Solicitação enviada com sucesso! Entraremos em contato em até 48 horas.", "success");
      this.reset();

      const outroContainer = document.getElementById('outro-estilo-container');
      if (outroContainer) {
        outroContainer.style.display = 'none';
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ===== PÁGINA AVALIAÇÕES ===== */

/**
 * Configura funcionalidades da página de avaliações
 */

function setupAvaliacoes() {
  const cards = document.querySelectorAll('.avaliacao-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    observer.observe(card);
  });

  const btnAvaliacao = document.querySelector('.btn-avaliacao');
  if (btnAvaliacao) {
    btnAvaliacao.addEventListener('click', function (e) {
      e.preventDefault();
      criarAvaliacao();
    });
  }
}

/**
 * Cria uma nova avaliação
 */

function criarAvaliacao() {
  const nome = prompt("Digite seu nome:");
  if (!nome) return;

  const titulo = prompt("Digite o título da sua mensagem:");
  if (!titulo) return;

  let estrelas;
  while (true) {
    estrelas = prompt("Sua avaliação de estrelas (1 a 5, sendo 1 ruim e 5 excelente):");
    if (!estrelas) return;

    estrelas = parseInt(estrelas);
    if (estrelas >= 1 && estrelas <= 5) break;

    alert("Por favor, digite um número entre 1 e 5.");
  }

  const mensagem = prompt("Digite sua mensagem de avaliação:");
  if (!mensagem) return;

  // Determinar o gênero com base no nome

  const genero = isNomeFeminino(nome) ? 'women' : 'men';
  const randomId = Math.floor(Math.random() * 100);

  // Formatar data atual

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR');

  // Criar estrelas

  let estrelasHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= estrelas) {
      estrelasHTML += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 <= estrelas) {
      estrelasHTML += '<i class="fas fa-star-half-alt"></i>';
    } else {
      estrelasHTML += '<i class="far fa-star"></i>';
    }
  }

  // Criar card

  const novoCard = document.createElement('div');
  novoCard.className = 'avaliacao-card';
  novoCard.style.opacity = '0';
  novoCard.style.transform = 'translateY(30px)';

  novoCard.innerHTML = `
        <div class="avaliacao-header">
            <img src="https://randomuser.me/api/portraits/${genero}/${randomId}.jpg" alt="${nome}" class="avaliacao-avatar">
            <div class="avaliacao-info">
                <h3 class="avaliacao-nome">${nome}</h3>
                <p class="avaliacao-data">${dataFormatada}</p>
            </div>
        </div>
        <div class="avaliacao-estrelas">
            ${estrelasHTML}
        </div>
        <p class="avaliacao-texto">${mensagem}</p>
        <p class="avaliacao-tatuagem"><i class="fas fa-tint"></i> ${titulo}</p>
    `;

  const grid = document.querySelector('.avaliacoes-grid');
  if (grid) {
    grid.appendChild(novoCard);
    setTimeout(() => {
      novoCard.style.opacity = '1';
      novoCard.style.transform = 'translateY(0)';
      novoCard.style.transition = 'all 0.8s ease';
    }, 100);
  }
}

/* ===== MENU MOBILE ===== */

/**
 * Configura o menu mobile
 */

function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }
}

/* ===== COMPATIBILIDADE ===== */

function openRegister() {
  openLogin('cadastro');
}

function openPopup(popupId) {
  if (popupId === 'loginPopup') {
    openLogin();
  }
}

/* ===== INICIALIZAÇÃO ===== */

window.addEventListener('message', function (event) {
  if (event.data === 'updateLoginStatus') {
    updateLoginButtons();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  setupForms();
});

document.addEventListener('click', function (event) {
  const perfilModal = document.getElementById('perfilModal');
  const confirmModal = document.getElementById('confirmModal');

  if (event.target === perfilModal) {
    closePerfil();
  }

  if (event.target === confirmModal) {
    fecharConfirmacao();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closePerfil();
    fecharConfirmacao();
    fecharAlerta();
  }
});

// Adicionar estilos CSS para as mensagens de erro e elementos do perfil

const errorStyles = `
    .login-error {
        color: #ff6b6b;
        font-size: 14px;
        text-align: center;
        display: block;
        margin-top: 10px;
        padding: 10px;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 5px;
        border: 1px solid #ff6b6b;
    }
    
    .alert-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    }
    
    .success-alert {
        color: #10b981;
    }
    
    .error-alert {
        color: #ef4444;
    }
    
    .info-alert {
        color: #3b82f6;
    }
`;

// Adicionar estilos ao documento

const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);


/* ===== SISTEMA DE PERFIL - COM COMUNICAÇÃO REAL ===== */

/**
 * Verifica se precisa abrir o perfil ao carregar a página
 */

function checkPerfilRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const shouldOpenPerfil = urlParams.get('openPerfil') === 'true';

  if (shouldOpenPerfil) {
    setTimeout(() => {
      openPerfil();
      const url = new URL(window.location);
      url.searchParams.delete('openPerfil');
      window.history.replaceState({}, '', url);
    }, 100);
  }
}

/**
 * Abre o modal do perfil em QUALQUER página
 */

function openPerfil() {
  const perfilModal = document.getElementById('perfilModal');
  if (perfilModal) {
    perfilModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    showPerfilSection('menu');
    carregarDadosUsuario();
  } else {
    console.log('Modal de perfil não encontrado, redirecionando para index...');
    window.location.href = 'index.html?openPerfil=true';
  }
}

/**
 * Fecha o modal do perfil
 */

function closePerfil() {
  const perfilModal = document.getElementById('perfilModal');
  if (perfilModal) {
    perfilModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

/**
 * Mostra seção específica no perfil
 */

function showPerfilSection(section) {

  const sections = document.querySelectorAll('.perfil-section');
  sections.forEach(sec => sec.classList.remove('active'));
  const targetSection = document.getElementById(`perfil${section.charAt(0).toUpperCase() + section.slice(1)}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

/**
 * Carrega os dados do usuário nos formulários
 */

function carregarDadosUsuario() {
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  if (userEmail) {
    document.getElementById('perfilUserEmail').textContent = userEmail;
  }

  if (userName) {
    document.getElementById('perfilUserName').textContent = userName;
  }
}

/**
 * Alterna a visibilidade da senha
 */

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

/**
 * Confirma a exclusão da conta
 */
function confirmarExclusao() {
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) {
    confirmModal.style.display = 'flex';
  }
}

/**
 * Fecha o modal de confirmação
 */

function fecharConfirmacao() {
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) {
    confirmModal.style.display = 'none';
  }
}

/**
 * Deleta a conta do usuário
 */

function deletarConta() {

  showAlert('Deletando conta... Você será deslogado automaticamente.', 'info');

  fetch('../backend/php/deletar_conta_processa.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    }
  })
    .then(response => response.json())
    .then(json => {
      if (!json || typeof json.success === 'undefined') {
        throw new Error('Resposta inesperada do servidor');
      }

      if (!json.success) {

        showAlert(json.message || 'Erro ao deletar conta. Tente novamente.', 'error');
        fecharConfirmacao();
        return;
      }
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      updateLoginButtons();

      fecharConfirmacao();
      closePerfil();

      showAlert(json.message || 'Conta deletada com sucesso! Você foi deslogado.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    })
    .catch(error => {
      console.error('Erro:', error);
      showAlert('Erro ao deletar conta. Tente novamente.', 'error');
      fecharConfirmacao();
    });
}