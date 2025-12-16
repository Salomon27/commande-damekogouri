if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    // Chemin du service worker adapté pour GitHub Pages
    const swPath = location.hostname.includes('github.io') 
      ? '/commande-damekogouri/sw.js' 
      : './sw.js';
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (confirm('Une nouvelle version est disponible. Voulez-vous recharger la page ?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.log('Erreur lors de l\'enregistrement du Service Worker:', error);
      });
  });

  let deferredPrompt;
  const installButton = document.createElement('button');
  installButton.textContent = 'Installer l\'app';
  installButton.className = 'btn-install';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--primary-gradient);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    z-index: 1000;
    display: none;
    transition: all 0.3s ease;
  `;

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('L\'utilisateur a accepté l\'installation');
    } else {
      console.log('L\'utilisateur a refusé l\'installation');
    }
    
    deferredPrompt = null;
    installButton.style.display = 'none';
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
    document.body.appendChild(installButton);
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installée avec succès');
    deferredPrompt = null;
    installButton.style.display = 'none';
  });
}

if ('standalone' in window.navigator && window.navigator.standalone) {
  document.documentElement.classList.add('ios-standalone');
}

