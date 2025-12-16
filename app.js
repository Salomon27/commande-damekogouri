// Initialisation
let currentFilter = 'jour';

// Variables globales
let capturedPhotoFile = null;
let selectionMode = false;
const selectedCommandeIds = new Set();

// Vérification de la connexion à la base de données
async function checkDatabaseConnection() {
    if (!supabase) {
        showConnectionStatus('error', '❌ Base de données non initialisée. Vérifiez votre configuration.');
        return false;
    }
    
    try {
        const { data, error } = await supabase
            .from('commandes')
            .select('id')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        showConnectionStatus('success', '✅ Connexion à la base de données réussie');
        return true;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        let errorMessage = '❌ Erreur de connexion à la base de données.';
        
        if (error.message) {
            if (error.message.includes('JWT')) {
                errorMessage += ' Clé API invalide.';
            } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
                errorMessage += ' Table "commandes" introuvable. Exécutez le script SQL de configuration.';
            } else if (error.message.includes('permission') || error.message.includes('policy')) {
                errorMessage += ' Problème de permissions. Vérifiez les politiques RLS.';
            } else {
                errorMessage += ' ' + error.message;
            }
        }
        
        showConnectionStatus('error', errorMessage);
        return false;
    }
}

// Afficher le statut de connexion
function showConnectionStatus(type, message) {
    // Tous les statuts DB sont maintenant affichés en toast discret en bas
    if (type === 'success') {
        showMessage(message, 'success-db'); // seulement icône
    } else if (type === 'error') {
        showMessage(message, 'error');
    } else {
        showMessage(message, 'info');
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser l'UI même si la base n'est pas connectée
    initMobileMenu();
    initNavigation();
    initForm();
    initFilters();
    initModal();
    initPhotoCapture();
    initImageViewer();
    initSelectionMode();
    
    // Puis vérifier la connexion à la base (non bloquant pour l'UI)
    if (!supabase) {
        showConnectionStatus('error', '❌ Base de données non initialisée. Vérifiez que le SDK Supabase est chargé.');
        return;
    }
    
    showConnectionStatus('info', '🔄 Vérification de la connexion à la base de données...');
    
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
        console.warn('Application démarrée sans connexion à la base de données. Certaines fonctionnalités peuvent être limitées.');
    }
    
    // Ne rien charger automatiquement, l'utilisateur choisira la période
});

function initFilters() {
    const form = document.getElementById('custom-filter-form');
    const resultsContainer = document.getElementById('custom-filter-results');
    const resetBtn = document.getElementById('btn-filter-reset');
    
    if (!form || !resultsContainer) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await applyCustomFilter();
    });
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            resultsContainer.innerHTML = '<p class="empty">Utilisez le filtre ci-dessus pour rechercher une commande précise.</p>';
        });
    }
}

// Appliquer le filtre personnalisé
async function applyCustomFilter() {
    const numero = document.getElementById('filter-numero').value.trim();
    const montantMin = document.getElementById('filter-montant-min').value.trim();
    const montantMax = document.getElementById('filter-montant-max').value.trim();
    const dateDebut = document.getElementById('filter-date-debut').value;
    const dateFin = document.getElementById('filter-date-fin').value;
    const container = document.getElementById('custom-filter-results');
    
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Recherche en cours...</p>';
    
    if (!supabase) {
        container.innerHTML = '<p class="empty">❌ Base de données non connectée. Vérifiez votre connexion.</p>';
        return;
    }
    
    try {
        let query = supabase
            .from('commandes')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (numero) {
            // Recherche précise ou par début de numéro
            query = query.ilike('numero_client', `${numero}%`);
        }
        
        if (montantMin) {
            const min = parseFloat(montantMin);
            if (!isNaN(min)) {
                query = query.gte('montant', min);
            }
        }
        
        if (montantMax) {
            const max = parseFloat(montantMax);
            if (!isNaN(max)) {
                query = query.lte('montant', max);
            }
        }
        
        if (dateDebut) {
            const start = new Date(dateDebut);
            start.setHours(0, 0, 0, 0);
            query = query.gte('created_at', start.toISOString());
        }
        
        if (dateFin) {
            const end = new Date(dateFin);
            end.setHours(23, 59, 59, 999);
            query = query.lte('created_at', end.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        if (data && data.length > 0) {
            displayGalleryCommandes(data, container);
        } else {
            container.innerHTML = '<p class="empty">Aucune commande ne correspond à ce filtre.</p>';
        }
    } catch (error) {
        console.error('Erreur lors du filtre personnalisé:', error);
        let msg = 'Erreur lors de la recherche.';
        if (error.message) {
            msg += ' ' + error.message;
        }
        container.innerHTML = `<p class="empty">${msg}</p>`;
    }
}

// Gestion du menu mobile
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    let overlay = document.querySelector('.nav-overlay');
    
    // Créer l'overlay si il n'existe pas
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }
    
    // Toggle du menu
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Fermer le menu en cliquant sur l'overlay
    overlay.addEventListener('click', () => {
        closeMobileMenu();
    });
    
    // Fermer le menu en cliquant sur un bouton de navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Fermer le menu lors du redimensionnement vers desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    const nav = document.getElementById('nav');
    const overlay = document.querySelector('.nav-overlay');
    const menuToggle = document.getElementById('menu-toggle');
    
    nav.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    menuToggle.classList.remove('active');
}

// Navigation entre les pages
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.getAttribute('data-page');
            
            // Mettre à jour les boutons
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mettre à jour les pages
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${targetPage}`).classList.add('active');
            
            // Charger les commandes si on va sur la page liste
            if (targetPage === 'liste') {
                // Ne rien charger, juste afficher la navigation
            }
        });
    });
    
    // Navigation par période
    const periodNavButtons = document.querySelectorAll('.period-nav-btn');
    periodNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.getAttribute('data-page');
            
            // Mettre à jour les boutons
            periodNavButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Masquer la page liste et afficher la page période
            document.getElementById('page-liste').classList.remove('active');
            pages.forEach(p => {
                if (p.id.startsWith('page-') && p.id !== 'page-liste' && p.id !== 'page-enregistrement') {
                    p.classList.remove('active');
                }
            });
            
            document.getElementById(`page-${targetPage}`).classList.add('active');
            
            // Charger les commandes pour cette période
            loadCommandesForPeriod(targetPage);
        });
    });
}

// Fonction pour retourner à la liste
function goBackToList() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        if (p.id.startsWith('page-') && p.id !== 'page-liste' && p.id !== 'page-enregistrement') {
            p.classList.remove('active');
        }
    });
    document.getElementById('page-liste').classList.add('active');
}

// Gestion du formulaire
function initForm() {
    const form = document.getElementById('form-commande');
    const numeroInput = document.getElementById('numero-client');
    const montantInput = document.getElementById('montant');
    
    // Prévisualisation en temps réel
    numeroInput.addEventListener('input', updatePreview);
    montantInput.addEventListener('input', updatePreview);
    
    // Animation des icônes au focus
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            input.addEventListener('focus', () => {
                wrapper.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                wrapper.classList.remove('focused');
            });
        }
    });
    
    // Initialiser la prévisualisation
    updatePreview();
    
    // Soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
    });
}

// Initialisation de la capture photo
function initPhotoCapture() {
    const photoInput = document.getElementById('photo-commande');
    const btnCapture = document.getElementById('btn-capture');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');
    
    // Déclencher le sélecteur de fichier (caméra) via le bouton
    btnCapture.addEventListener('click', () => {
        photoInput.click();
    });
    
    // Gérer la sélection de photo
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handlePhotoCapture(file);
        }
    });
    
    // Supprimer la photo
    btnRemovePhoto.addEventListener('click', () => {
        removePhoto();
    });
}

// Gérer la capture de photo
async function handlePhotoCapture(file) {
    try {
        // Compresser l'image
        const compressedFile = await compressImage(file);
        capturedPhotoFile = compressedFile;
        
        // Afficher la prévisualisation
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.getElementById('photo-preview-container');
            const photoPreview = document.getElementById('photo-preview');
            const previewImg = document.getElementById('preview-img');
            const previewPhotoText = document.getElementById('preview-photo-text');
            
            photoPreview.src = e.target.result;
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
            previewImg.style.display = 'block';
            previewPhotoText.style.display = 'none';
            
            updatePreview();
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('Erreur lors du traitement de la photo:', error);
        showMessage('Erreur lors du traitement de la photo', 'error');
    }
}

// Compresser l'image
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 800;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;
                
                // Redimensionner si nécessaire
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir en blob avec qualité réduite
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Erreur lors de la compression'));
                    }
                }, 'image/jpeg', 0.6);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
    });
}

// Supprimer la photo
function removePhoto() {
    const photoInput = document.getElementById('photo-commande');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('preview-img');
    const previewPhotoText = document.getElementById('preview-photo-text');
    
    photoInput.value = '';
    capturedPhotoFile = null;
    previewContainer.style.display = 'none';
    previewImg.style.display = 'none';
    previewPhotoText.style.display = 'block';
    updatePreview();
}

// Mise à jour de la prévisualisation
function updatePreview() {
    const numero = document.getElementById('numero-client').value || '—';
    const montant = document.getElementById('montant').value || '—';
    
    // Formater le montant
    let montantFormatted = '—';
    if (montant !== '—' && montant !== '') {
        const montantNum = parseFloat(montant);
        if (!isNaN(montantNum)) {
            montantFormatted = montantNum.toLocaleString('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }) + ' FCFA';
        }
    }
    
    document.getElementById('preview-numero').textContent = numero;
    document.getElementById('preview-montant').textContent = montantFormatted;
}

// Validation du formulaire
function validateForm() {
    const numero = document.getElementById('numero-client').value.trim();
    const montant = document.getElementById('montant').value.trim();
    
    if (!numero) {
        showMessage('Le numéro du client est obligatoire', 'error');
        document.getElementById('numero-client').focus();
        return false;
    }
    
    if (!montant) {
        showMessage('Le montant est obligatoire', 'error');
        document.getElementById('montant').focus();
        return false;
    }
    
    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
        showMessage('Le montant doit être un nombre valide supérieur à 0', 'error');
        document.getElementById('montant').focus();
        return false;
    }
    
    return true;
}

// Soumission du formulaire
async function submitForm() {
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = document.querySelector('#form-commande button[type="submit"]');
    const submitBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Enregistrement...</span>';
    
    try {
        let photoUrl = null;
        
        // Upload de la photo vers Supabase Storage si présente
        if (capturedPhotoFile) {
            const timestamp = Date.now();
            const fileName = `commandes/${timestamp}_${Math.random().toString(36).substring(7)}.jpg`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('photos-commandes')
                .upload(fileName, capturedPhotoFile, {
                    contentType: 'image/jpeg',
                    upsert: false
                });
            
            if (uploadError) {
                throw new Error('Erreur lors de l\'upload de la photo: ' + uploadError.message);
            }
            
            // Obtenir l'URL publique de la photo
            const { data: urlData } = supabase.storage
                .from('photos-commandes')
                .getPublicUrl(fileName);
            
            photoUrl = urlData.publicUrl;
        }
        
        // Enregistrer la commande dans la base de données
        const formData = {
            numero_client: document.getElementById('numero-client').value.trim(),
            montant: parseFloat(document.getElementById('montant').value),
            photo_url: photoUrl
        };
        
        const { data, error } = await supabase
            .from('commandes')
            .insert([formData])
            .select();
        
        if (error) {
            throw error;
        }
        
        // Message de succès discret
        showMessage('✓ Commande enregistrée avec succès', 'success');
        
        // Réinitialiser immédiatement le formulaire
        resetForm();
        
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors de l\'enregistrement: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtnContent;
    }
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('form-commande').reset();
    removePhoto();
    updatePreview();
    
    // Replacer le focus sur Numéro du client après un court délai
    setTimeout(() => {
        document.getElementById('numero-client').focus();
    }, 100);
}

// Charger les commandes pour une période spécifique
async function loadCommandesForPeriod(period) {
    const periodMap = {
        'aujourdhui': 'jour',
        'semaine': 'semaine',
        'mois': 'mois'
    };
    
    currentFilter = periodMap[period];
    const container = document.getElementById(`commandes-${period}`);
    const statsContainer = document.getElementById(`stats-${period}`);
    
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Chargement...</p>';
    
    if (!supabase) {
        container.innerHTML = '<p class="empty">❌ Base de données non connectée. Vérifiez votre connexion.</p>';
        return;
    }
    
    try {
        let query = supabase
            .from('commandes')
            .select('*')
            .order('created_at', { ascending: false });
        
        const now = new Date();
        let startDate;
        
        switch (currentFilter) {
            case 'jour':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'semaine':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'mois':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        
        if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        if (data && data.length > 0) {
            displayGalleryCommandes(data, container);
            updateStatsForPeriod(data, statsContainer);
        } else {
            container.innerHTML = '<p class="empty">Aucune commande trouvée pour cette période.</p>';
            if (statsContainer) statsContainer.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        let errorMsg = 'Erreur lors du chargement des commandes.';
        if (error.message) {
            if (error.message.includes('JWT') || error.message.includes('Invalid API key')) {
                errorMsg = '❌ Clé API invalide. Vérifiez votre configuration.';
            } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
                errorMsg = '❌ Table "commandes" introuvable. Exécutez le script SQL de configuration.';
            } else if (error.message.includes('permission') || error.message.includes('policy')) {
                errorMsg = '❌ Problème de permissions. Vérifiez les politiques RLS dans Supabase.';
            }
        }
        container.innerHTML = `<p class="empty">${errorMsg}</p>`;
    }
}

// Mise à jour des statistiques pour une période
function updateStatsForPeriod(commandes, container) {
    if (!container) return;
    
    const total = commandes.length;
    const montantTotal = commandes.reduce((sum, cmd) => sum + parseFloat(cmd.montant || 0), 0);
    const avecPhoto = commandes.filter(cmd => cmd.photo_url).length;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <div class="stat-value">${montantTotal.toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 0})} FCFA</div>
                <div class="stat-label">Montant total</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📷</div>
            <div class="stat-content">
                <div class="stat-value">${avecPhoto}</div>
                <div class="stat-label">Avec photo</div>
            </div>
        </div>
    `;
}

// Chargement des commandes
async function loadCommandes() {
    const container = document.getElementById('commandes-container');
    container.innerHTML = '<p class="loading">Chargement...</p>';
    
    if (!supabase) {
        container.innerHTML = '<p class="empty">❌ Base de données non connectée. Vérifiez votre connexion.</p>';
        return;
    }
    
    try {
        let query = supabase
            .from('commandes')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Appliquer le filtre de date
        const now = new Date();
        let startDate;
        
        switch (currentFilter) {
            case 'jour':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'semaine':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'mois':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        
        if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        if (data && data.length > 0) {
            displayCommandes(data);
        } else {
            container.innerHTML = '<p class="empty">Aucune commande trouvée pour cette période.</p>';
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        let errorMsg = 'Erreur lors du chargement des commandes.';
        if (error.message) {
            if (error.message.includes('JWT') || error.message.includes('Invalid API key')) {
                errorMsg = '❌ Clé API invalide. Vérifiez votre configuration.';
            } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
                errorMsg = '❌ Table "commandes" introuvable. Exécutez le script SQL de configuration.';
            } else if (error.message.includes('permission') || error.message.includes('policy')) {
                errorMsg = '❌ Problème de permissions. Vérifiez les politiques RLS dans Supabase.';
            }
        }
        container.innerHTML = `<p class="empty">${errorMsg}</p>`;
    }
}

// Affichage des commandes
function displayCommandes(commandes) {
    const container = document.getElementById('commandes-container');
    
    if (!container.classList.contains('grid-view') && !container.classList.contains('list-view')) {
        container.classList.add('grid-view');
    }
    
    container.innerHTML = '';
    
    if (commandes.length === 0) {
        container.innerHTML = '<p class="empty">Aucune commande trouvée pour cette période.</p>';
        updateStats([]);
        return;
    }
    
    commandes.forEach(commande => {
        const card = createCommandeCard(commande);
        container.appendChild(card);
    });
    
    updateStats(commandes);
}

// Mise à jour des statistiques
function updateStats(commandes) {
    const total = commandes.length;
    const montantTotal = commandes.reduce((sum, cmd) => sum + parseFloat(cmd.montant || 0), 0);
    const avecPhoto = commandes.filter(cmd => cmd.photo_url).length;
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-montant').textContent = montantTotal.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ' FCFA';
    document.getElementById('stat-photos').textContent = avecPhoto;
}

// Affichage en galerie style Google Photos
function displayGalleryCommandes(commandes, container) {
    container.innerHTML = '';
    
    commandes.forEach(commande => {
        const galleryItem = createGalleryItem(commande);
        container.appendChild(galleryItem);
    });
}

// Création d'un élément de galerie
function createGalleryItem(commande) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    if (commande.id) {
        item.dataset.commandeId = commande.id;
    }
    
    const date = commande.created_at ? new Date(commande.created_at) : new Date();
    const dateFormatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const montantFormatted = commande.montant.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ' FCFA';
    
    const hasPhoto = commande.photo_url;
    
    item.innerHTML = `
        <div class="gallery-image-wrapper">
            ${hasPhoto ? 
                `<img src="${commande.photo_url}" alt="Commande ${commande.numero_client}" loading="lazy" class="gallery-image" onerror="this.parentElement.innerHTML='<div class=\\'gallery-placeholder\\'><span>📦</span></div>'">` :
                `<div class="gallery-placeholder"><span>📦</span></div>`
            }
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <div class="gallery-info-top">
                        <span class="gallery-client">
                            <button type="button" class="gallery-phone-btn" data-phone="${commande.numero_client}" aria-label="Appeler le client">📞</button>
                            <span class="gallery-client-number">#${commande.numero_client}</span>
                        </span>
                        <span class="gallery-montant">${montantFormatted}</span>
                    </div>
                    <div class="gallery-info-bottom">
                        <span class="gallery-date">${dateFormatted}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const phoneBtn = item.querySelector('.gallery-phone-btn');
    if (phoneBtn) {
        phoneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const phone = phoneBtn.dataset.phone;
            if (phone) {
                window.location.href = `tel:${phone}`;
            }
        });
    }
    
    item.addEventListener('click', () => {
        if (selectionMode && commande.id) {
            toggleCommandeSelection(commande.id, item);
        } else {
            showModal(commande);
        }
    });
    
    return item;
}

// Création d'une carte de commande (ancienne version pour compatibilité)
function createCommandeCard(commande) {
    const card = document.createElement('div');
    card.className = 'card';
    if (commande.id) {
        card.dataset.commandeId = commande.id;
    }
    
    const date = commande.created_at ? new Date(commande.created_at) : new Date();
    const dateFormatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const montantFormatted = commande.montant.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ' FCFA';
    
    let photoHtml = '';
    if (commande.photo_url) {
        photoHtml = `
        <div class="card-photo">
            <img src="${commande.photo_url}" alt="Photo de la commande" loading="lazy" onerror="this.style.display='none'">
        </div>
        `;
    }
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-label">Client #${commande.numero_client}</span>
            <span class="card-value">${montantFormatted}</span>
        </div>
        ${photoHtml}
        <div class="card-row">
            <span class="card-label">Date:</span>
            <span class="card-value">${dateFormatted}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        showModal(commande);
    });
    
    return card;
}

// Visionneuse d'image plein écran
function initImageViewer() {
    const viewer = document.getElementById('image-viewer');
    const closeBtn = document.getElementById('image-viewer-close');
    const img = document.getElementById('image-viewer-img');
    
    if (!viewer || !closeBtn || !img) return;
    
    const closeViewer = () => {
        viewer.classList.remove('active');
        viewer.setAttribute('aria-hidden', 'true');
        img.src = '';
    };
    
    closeBtn.addEventListener('click', closeViewer);
    
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) {
            closeViewer();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && viewer.classList.contains('active')) {
            closeViewer();
        }
    });
}

function openImageViewer(src, altText) {
    const viewer = document.getElementById('image-viewer');
    const img = document.getElementById('image-viewer-img');
    
    if (!viewer || !img) return;
    
    img.src = src;
    img.alt = altText || 'Photo de la commande en plein écran';
    viewer.classList.add('active');
    viewer.setAttribute('aria-hidden', 'false');
}

// Gestion de la modal
function initModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('modal-close');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Afficher la modal avec les détails
function showModal(commande) {
    const modalBody = document.getElementById('modal-body');
    
    const date = commande.created_at ? new Date(commande.created_at) : new Date();
    const dateFormatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const montantFormatted = commande.montant.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ' FCFA';
    
    let photoHtml = '';
    if (commande.photo_url) {
        photoHtml = `
        <div class="modal-photo-section">
            <div class="modal-photo-header">
                <span class="modal-photo-label">Photo de la commande</span>
                <button class="modal-photo-fullscreen" onclick="openImageViewer('${commande.photo_url}', 'Commande ${commande.numero_client}')" aria-label="Voir en plein écran">
                    <span>⛶</span>
                </button>
            </div>
            <div class="modal-photo-container">
                <img src="${commande.photo_url}" alt="Photo de la commande" class="modal-photo-img" onclick="openImageViewer('${commande.photo_url}', 'Commande ${commande.numero_client}')">
            </div>
        </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="modal-details-grid">
            <div class="modal-detail-item">
                <div class="modal-detail-icon">👤</div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Numéro client</div>
                    <div class="modal-detail-value">
                        <button type="button" class="modal-phone-btn" data-phone="${commande.numero_client}">
                            <span>#${commande.numero_client}</span>
                            <span>📞</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-icon">💰</div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Montant</div>
                    <div class="modal-detail-value modal-detail-value-highlight">${montantFormatted}</div>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-icon">📅</div>
                <div class="modal-detail-content">
                    <div class="modal-detail-label">Date de création</div>
                    <div class="modal-detail-value">${dateFormatted}</div>
                </div>
            </div>
        </div>
        ${photoHtml}
        <div class="modal-actions">
            <button type="button" id="btn-delete-commande" class="btn-delete-commande">
                <span class="btn-delete-icon">🗑️</span>
                <span>Supprimer cette commande</span>
            </button>
        </div>
    `;
    
    // Bouton de suppression
    const deleteBtn = document.getElementById('btn-delete-commande');
    if (deleteBtn && commande.id) {
        deleteBtn.addEventListener('click', () => {
            handleDeleteCommande(commande);
        });
    }
    
    const modalPhoneBtn = modalBody.querySelector('.modal-phone-btn');
    if (modalPhoneBtn) {
        modalPhoneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const phone = modalPhoneBtn.dataset.phone;
            if (phone) {
                window.location.href = `tel:${phone}`;
            }
        });
    }
    
    document.getElementById('modal').classList.add('active');
}

// Suppression d'une commande
async function handleDeleteCommande(commande) {
    if (!commande || !commande.id) {
        showMessage('Impossible de supprimer : identifiant manquant.', 'error');
        return;
    }
    
    const confirmed = confirm('Voulez-vous vraiment supprimer cette commande ?');
    if (!confirmed) return;
    
    if (!supabase) {
        showMessage('Base de données non connectée. Suppression impossible.', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('commandes')
            .delete()
            .eq('id', commande.id);
        
        if (error) {
            throw error;
        }
        
        // Retirer la commande de la galerie/listes visibles
        const elements = document.querySelectorAll(`[data-commande-id="${commande.id}"]`);
        elements.forEach(el => el.remove());
        
        // Fermer la modal
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Si une page période est active, on recharge pour mettre à jour les stats
        const activePeriodPage = document.querySelector('.period-page.active');
        if (activePeriodPage && activePeriodPage.id) {
            const periodKey = activePeriodPage.id.replace('page-', '');
            if (['aujourdhui', 'semaine', 'mois'].includes(periodKey)) {
                loadCommandesForPeriod(periodKey);
            }
        }
        
        showMessage('Commande supprimée avec succès.', 'success');
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showMessage('Erreur lors de la suppression de la commande: ' + error.message, 'error');
    }
}

// Gestion du mode sélection multiple
function initSelectionMode() {
    const toggleButtons = document.querySelectorAll('.selection-toggle-btn');
    const deleteButtons = document.querySelectorAll('.selection-delete-btn');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.toggle('active');
            selectionMode = isActive;
            selectedCommandeIds.clear();
            updateSelectionUI();
        });
    });
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (selectedCommandeIds.size === 0) return;
            await deleteMultipleCommandes();
        });
    });
}

function toggleCommandeSelection(id, element) {
    if (selectedCommandeIds.has(id)) {
        selectedCommandeIds.delete(id);
        element.classList.remove('selected');
    } else {
        selectedCommandeIds.add(id);
        element.classList.add('selected');
    }
    updateSelectionUI();
}

function updateSelectionUI() {
    const count = selectedCommandeIds.size;
    const deleteButtons = document.querySelectorAll('.selection-delete-btn');
    const countSpans = document.querySelectorAll('.selection-delete-btn .selection-count');
    
    deleteButtons.forEach(btn => {
        btn.style.display = selectionMode && count > 0 ? 'inline-flex' : 'none';
    });
    
    countSpans.forEach(span => {
        span.textContent = count;
    });
    
    if (!selectionMode) {
        // Nettoyer la sélection visuelle
        document.querySelectorAll('.gallery-item.selected').forEach(el => el.classList.remove('selected'));
        selectedCommandeIds.clear();
        countSpans.forEach(span => span.textContent = '0');
    }
}

async function deleteMultipleCommandes() {
    const ids = Array.from(selectedCommandeIds);
    if (ids.length === 0) return;
    
    const confirmed = confirm(`Voulez-vous vraiment supprimer ${ids.length} commande(s) ?`);
    if (!confirmed) return;
    
    if (!supabase) {
        showMessage('Base de données non connectée. Suppression impossible.', 'error');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('commandes')
            .delete()
            .in('id', ids);
        
        if (error) {
            throw error;
        }
        
        ids.forEach(id => {
            document.querySelectorAll(`[data-commande-id="${id}"]`).forEach(el => el.remove());
        });
        
        selectionMode = false;
        updateSelectionUI();
        
        const activePeriodPage = document.querySelector('.period-page.active');
        if (activePeriodPage && activePeriodPage.id) {
            const periodKey = activePeriodPage.id.replace('page-', '');
            if (['aujourdhui', 'semaine', 'mois'].includes(periodKey)) {
                loadCommandesForPeriod(periodKey);
            }
        }
        
        showMessage('Commandes supprimées avec succès.', 'success');
    } catch (error) {
        console.error('Erreur lors de la suppression multiple:', error);
        showMessage('Erreur lors de la suppression des commandes: ' + error.message, 'error');
    }
}

// Afficher un message (notification toast discrète)
function showMessage(text, type) {
    // Créer un conteneur de notifications s'il n'existe pas
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Créer la notification toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const isSuccess = type === 'success' || type === 'success-db';
    const isError = type === 'error';
    
    const icon = isSuccess ? '✓' : isError ? '✕' : 'ℹ';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${text}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Masquer automatiquement après 4 secondes pour succès, 6 pour erreur
    const duration = isSuccess ? 4000 : isError ? 6000 : 5000;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

