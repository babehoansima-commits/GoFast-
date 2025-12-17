// ============================================
// GOFAST - SCRIPT PANIER GARANTI
// ============================================

// CONFIGURATION
const PANIER_KEY = 'gofast_panier';
let panier = JSON.parse(localStorage.getItem(PANIER_KEY)) || [];
let filtreActuel = 'all';

// ============================================
// FONCTIONS ESSENTIELLES
// ============================================

// 1. METTRE À JOUR LE COMPTEUR
function mettreAJourCompteurPanier() {
    const totalArticles = panier.reduce((total, item) => total + (item.quantite || 1), 0);
    document.getElementById('cartCount').textContent = totalArticles;
    console.log(`🔄 Compteur mis à jour: ${totalArticles} articles`);
}

// 2. METTRE À JOUR LE MODAL (FONCTION CRITIQUE)
function mettreAJourModalPanier() {
    console.log('🔄 Mise à jour du modal panier...');
    console.log('📦 Panier actuel:', panier);
    
    const cartItems = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !emptyCartMessage || !cartTotal) {
        console.error('❌ Éléments du modal introuvables');
        return;
    }
    
    // VIDER d'abord le modal
    cartItems.innerHTML = '';
    
    if (panier.length === 0) {
        console.log('📭 Panier vide - affichage message');
        emptyCartMessage.style.display = 'block';
        cartTotal.textContent = '0.00';
        return;
    }
    
    // Panier non vide
    emptyCartMessage.style.display = 'none';
    let totalPrix = 0;
    let html = '';
    
    panier.forEach(item => {
        // Extraire les informations SANS erreur
        const nom = item.nom || 'Produit';
        const prix = typeof item.prix === 'number' ? item.prix : parseFloat(item.prix) || 0;
        const quantite = item.quantite || 1;
        const image = item.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop';
        const id = item.id || 0;
        
        const prixTotalItem = prix * quantite;
        totalPrix += prixTotalItem;
        
        console.log(`   Produit ${id}: ${nom}, ${prix}$ × ${quantite} = ${prixTotalItem}$`);
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${image}" alt="${nom}"
                         onerror="this.src='https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${nom}</div>
                    <div class="cart-item-price">${prix.toFixed(2)} $ × ${quantite}</div>
                </div>
                <button class="cart-item-remove" onclick="supprimerDuPanierDirect(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    console.log(`💰 Total panier: ${totalPrix.toFixed(2)} $`);
    cartItems.innerHTML = html;
    cartTotal.textContent = totalPrix.toFixed(2);
    
    // FORCER le navigateur à afficher les changements
    setTimeout(() => {
        cartItems.style.display = 'none';
        cartItems.offsetHeight; // Force reflow
        cartItems.style.display = 'block';
    }, 10);
}

// 3. SAUVEGARDER LE PANIER
function sauvegarderPanier() {
    localStorage.setItem(PANIER_KEY, JSON.stringify(panier));
    console.log('💾 Panier sauvegardé:', panier);
}

// 4. FONCTIONS EXPOSÉES (pour les boutons HTML)
window.ajouterAuPanier = function(productId) {
    console.log(`➕ Ajout produit ${productId}`);
    
    // Trouver le produit dans la liste
    const produit = produitsGoFast.find(p => p.id == productId);
    if (!produit) {
        console.error(`❌ Produit ${productId} introuvable`);
        return;
    }
    
    console.log('📦 Produit trouvé:', produit);
    
    // Vérifier si déjà dans panier
    const index = panier.findIndex(item => item.id == productId);
    
    if (index === -1) {
        // AJOUTER
        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: parseFloat(produit.prix),
            image: produit.image,
            quantite: 1
        });
        console.log('✅ Produit ajouté');
    } else {
        // AUGMENTER LA QUANTITÉ
        panier[index].quantite = (panier[index].quantite || 1) + 1;
        console.log(`📈 Quantité augmentée: ${panier[index].quantite}`);
    }
    
    // Mettre à jour TOUT
    sauvegarderPanier();
    mettreAJourCompteurPanier();
    mettreAJourBoutonsProduits();
    mettreAJourModalPanier(); // CRITIQUE : forcer la mise à jour du modal
    
    // Feedback visuel
    const bouton = document.querySelector(`.product-card[data-id="${productId}"] .add-to-cart-btn`);
    if (bouton) {
        bouton.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
        bouton.classList.add('in-cart');
        setTimeout(() => {
            bouton.innerHTML = '<i class="fas fa-check"></i> Dans le panier';
        }, 1000);
    }
};

window.supprimerDuPanierDirect = function(productId) {
    console.log(`🗑️ Suppression directe ${productId}`);
    
    const index = panier.findIndex(item => item.id == productId);
    if (index !== -1) {
        panier.splice(index, 1);
        console.log('✅ Produit supprimé');
        
        // Mettre à jour TOUT
        sauvegarderPanier();
        mettreAJourCompteurPanier();
        mettreAJourBoutonsProduits();
        mettreAJourModalPanier(); // CRITIQUE : forcer la mise à jour
        
        // Si panier vide, fermer le modal
        if (panier.length === 0) {
            setTimeout(() => fermerModalPanier(), 500);
        }
    }
};

window.togglePanier = function(productId) {
    const index = panier.findIndex(item => item.id == productId);
    
    if (index === -1) {
        // Ajouter
        window.ajouterAuPanier(productId);
    } else {
        // Retirer
        window.supprimerDuPanierDirect(productId);
    }
};

// 5. OUVRIRE/FERMER MODAL
window.ouvrirModalPanier = function() {
    console.log('📦 Ouverture modal panier');
    mettreAJourModalPanier(); // FORCER la mise à jour avant d'ouvrir
    document.getElementById('cartModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Forcer un rafraîchissement visuel
    setTimeout(() => {
        const modal = document.getElementById('cartModal');
        modal.style.transform = 'translateY(0)';
    }, 10);
};

function fermerModalPanier() {
    document.getElementById('cartModalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    console.log('📦 Modal fermé');
}

// 6. METTRE À JOUR LES BOUTONS PRODUITS
function mettreAJourBoutonsProduits() {
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.dataset.id);
        const bouton = card.querySelector('.add-to-cart-btn');
        const dansPanier = panier.some(item => item.id == productId);
        
        if (dansPanier) {
            card.classList.add('product-in-cart');
            bouton.innerHTML = '<i class="fas fa-check"></i> Dans le panier';
            bouton.classList.add('in-cart');
        } else {
            card.classList.remove('product-in-cart');
            bouton.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
            bouton.classList.remove('in-cart');
        }
    });
}

// ============================================
// FONCTIONS D'AFFICHAGE PRODUITS
// ============================================

function chargerTopProduits() {
    const grid = document.getElementById('topProductsGrid');
    if (!grid) return;
    
    const topProduits = produitsGoFast.filter(p => p.populaire).slice(0, 8);
    grid.innerHTML = topProduits.map(p => creerCarteProduit(p)).join('');
}

function chargerTousProduits(filtre = 'all') {
    const grid = document.getElementById('allProductsGrid');
    if (!grid) return;
    
    filtreActuel = filtre;
    const produitsFiltres = filtre === 'all' 
        ? produitsGoFast 
        : produitsGoFast.filter(p => p.categorie === filtre);
    
    grid.innerHTML = produitsFiltres.map(p => creerCarteProduit(p)).join('');
    mettreAJourInfoFiltre(filtre);
}

function creerCarteProduit(produit) {
    const dansPanier = panier.some(item => item.id == produit.id);
    const nomCategorie = obtenirNomCategorie(produit.categorie);
    
    return `
        <div class="product-card ${dansPanier ? 'product-in-cart' : ''}" 
             data-id="${produit.id}">
            <div class="product-image">
                <img src="${produit.image}" alt="${produit.nom}"
                     onerror="this.src='https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${produit.nom}</h3>
                <div class="product-price">${parseFloat(produit.prix).toFixed(2)} $</div>
                <div class="product-category">${nomCategorie}</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn ${dansPanier ? 'in-cart' : ''}" 
                            onclick="togglePanier(${produit.id})">
                        <i class="fas ${dansPanier ? 'fa-check' : 'fa-cart-plus'}"></i>
                        ${dansPanier ? 'Dans le panier' : 'Ajouter au panier'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function obtenirNomCategorie(categorie) {
    const noms = {
        'habits': '👕 Habits',
        'chaussures': '👟 Chaussures',
        'sacs': '👜 Sacs',
        'electronique': '💻 Électronique',
        'cosmetiques': '💄 Cosmétiques',
        'autres': '📦 Autres'
    };
    return noms[categorie] || categorie;
}

function mettreAJourInfoFiltre(filtre) {
    const info = document.getElementById('filterInfo');
    if (!info) return;
    
    if (filtre === 'all') {
        info.classList.remove('active');
    } else {
        info.classList.add('active');
        info.innerHTML = `
            <span>Filtre actif :</span>
            <strong>${obtenirNomCategorie(filtre)}</strong>
            <button onclick="reinitialiserFiltre()" style="margin-left:10px; padding:5px 10px; 
                    background:transparent; border:1px solid #FF6B00; color:#FF6B00; 
                    border-radius:3px; cursor:pointer;">
                ✕ Tout afficher
            </button>
        `;
    }
}

// ============================================
// COMMANDE WHATSAPP
// ============================================

window.commanderWhatsApp = function() {
    if (panier.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    
    let message = "Bonjour, je souhaite passer commande sur GoFast :%0A%0A";
    let total = 0;
    
    panier.forEach((item, index) => {
        const totalItem = (item.prix || 0) * (item.quantite || 1);
        message += `${index + 1}. ${item.nom} - ${(item.prix || 0).toFixed(2)} $ × ${item.quantite || 1}%0A`;
        total += totalItem;
    });
    
    message += `%0ATotal : ${total.toFixed(2)} $%0A%0A`;
    message += "Merci de me contacter pour finaliser la commande.";
    
    const url = `https://wa.me/243970332222?text=${message}`;
    window.open(url, '_blank');
};

window.reinitialiserFiltre = function() {
    filtreActuel = 'all';
    chargerTousProduits('all');
};

// ============================================
// INITIALISATION
// ============================================

function configurerEvenements() {
    // Icône panier
    document.getElementById('cartIcon').addEventListener('click', ouvrirModalPanier);
    
    // Fermer modal
    document.getElementById('closeCartModal').addEventListener('click', fermerModalPanier);
    
    // Fermer en cliquant dehors
    document.getElementById('cartModalOverlay').addEventListener('click', function(e) {
        if (e.target === this) fermerModalPanier();
    });
    
    // Bouton WhatsApp
    document.getElementById('whatsappOrderBtn').addEventListener('click', commanderWhatsApp);
    
    // Bouton "Voir tout"
    document.getElementById('resetFilter').addEventListener('click', reinitialiserFiltre);
    
    // Catégories
    document.querySelectorAll('.category-card').forEach(carte => {
        carte.addEventListener('click', function() {
            const categorie = this.dataset.category;
            filtreActuel = categorie;
            chargerTousProduits(categorie);
            document.getElementById('all-products').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function initialiser() {
    console.log('🚀 GoFast - Initialisation...');
    console.log(`📦 ${produitsGoFast.length} produits chargés`);
    console.log(`🛒 ${panier.length} articles dans le panier`);
    
    chargerTopProduits();
    chargerTousProduits();
    mettreAJourCompteurPanier();
    mettreAJourBoutonsProduits();
    configurerEvenements();
    
    console.log('✅ GoFast prêt !');
}

// ============================================
// DÉMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', initialiser);

// ============================================
// FONCTIONS DE DÉBOGAGE (optionnel)
// ============================================

window.debugPanier = function() {
    console.log('=== DEBUG PANIER ===');
    console.log('LocalStorage:', localStorage.getItem(PANIER_KEY));
    console.log('Panier variable:', panier);
    console.log('Panier length:', panier.length);
    console.log('Produits dans panier:');
    panier.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.nom} (ID: ${item.id})`);
    });
};

window.viderPanier = function() {
    if (confirm(`Vider tout le panier (${panier.length} articles)?`)) {
        panier = [];
        sauvegarderPanier();
        mettreAJourCompteurPanier();
        mettreAJourBoutonsProduits();
        mettreAJourModalPanier();
        console.log('🧹 Panier vidé');
    }
};