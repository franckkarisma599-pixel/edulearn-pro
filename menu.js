/**
 * Menu Responsive Universel - EduLearn Pro
 * Version: 1.0.0
 */

class ResponsiveMenu {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.menuOpen = false;
        this.init();
    }

    init() {
        this.createMobileMenu();
        this.attachEventListeners();
        this.checkScreenSize();
        this.updateUserInfo();
    }

    createMobileMenu() {
        // Ajouter le bouton menu mobile s'il n'existe pas
        if (!document.querySelector('.mobile-menu-toggle')) {
            const navbar = document.querySelector('.navbar .container');
            if (navbar) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'mobile-menu-toggle';
                toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                toggleBtn.setAttribute('aria-label', 'Menu');
                navbar.appendChild(toggleBtn);
            }
        }

        // Créer le menu mobile s'il n'existe pas
        if (!document.querySelector('.mobile-nav')) {
            const navMenu = document.querySelector('.nav-menu, .nav-links');
            if (navMenu) {
                const mobileNav = document.createElement('div');
                mobileNav.className = 'mobile-nav';
                mobileNav.innerHTML = navMenu.cloneNode(true).innerHTML;
                
                // Ajouter les liens de connexion/déconnexion si nécessaire
                const userInfo = document.querySelector('.user-info');
                if (userInfo && !mobileNav.querySelector('.mobile-user-info')) {
                    const userClone = userInfo.cloneNode(true);
                    userClone.className = 'mobile-user-info';
                    mobileNav.appendChild(userClone);
                }
                
                document.body.appendChild(mobileNav);
            }
        }
    }

    attachEventListeners() {
        // Bouton toggle menu
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (toggleBtn && mobileNav) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Fermer le menu en cliquant sur un lien
        document.querySelectorAll('.mobile-nav a, .mobile-nav button').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Fermer le menu en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (this.menuOpen && mobileNav && !mobileNav.contains(e.target) && !toggleBtn?.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Gérer le redimensionnement
        window.addEventListener('resize', () => {
            this.checkScreenSize();
            if (window.innerWidth > 768 && this.menuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        const mobileNav = document.querySelector('.mobile-nav');
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (mobileNav) {
            if (this.menuOpen) {
                mobileNav.classList.remove('open');
                toggleBtn?.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                mobileNav.classList.add('open');
                toggleBtn?.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            this.menuOpen = !this.menuOpen;
        }
    }

    closeMenu() {
        const mobileNav = document.querySelector('.mobile-nav');
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (mobileNav && this.menuOpen) {
            mobileNav.classList.remove('open');
            toggleBtn?.classList.remove('active');
            document.body.style.overflow = '';
            this.menuOpen = false;
        }
    }

    checkScreenSize() {
        const isNowMobile = window.innerWidth <= 768;
        if (this.isMobile !== isNowMobile) {
            this.isMobile = isNowMobile;
            if (!isNowMobile && this.menuOpen) {
                this.closeMenu();
            }
        }
    }

    updateUserInfo() {
        // Mettre à jour les infos utilisateur dans le menu mobile
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userNameSpan = document.querySelector('#user-name');
        const userAvatar = document.querySelector('#user-avatar');
        
        if (currentUser) {
            if (userNameSpan) userNameSpan.textContent = currentUser.name.split(' ')[0];
            if (userAvatar && currentUser.avatar) userAvatar.src = currentUser.avatar;
            
            // Mettre à jour le menu mobile
            const mobileUserName = document.querySelector('.mobile-nav #user-name');
            const mobileUserAvatar = document.querySelector('.mobile-nav #user-avatar');
            if (mobileUserName) mobileUserName.textContent = currentUser.name.split(' ')[0];
            if (mobileUserAvatar && currentUser.avatar) mobileUserAvatar.src = currentUser.avatar;
        }
    }
}

// Ajouter les styles CSS pour le menu responsive
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
    /* ========== MENU RESPONSIVE ========== */
    .mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--dark, #1a1a2e);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.3s;
        z-index: 1001;
    }

    .mobile-menu-toggle:hover {
        background: rgba(67, 97, 238, 0.1);
    }

    .mobile-menu-toggle.active {
        color: var(--primary, #4361ee);
    }

    .mobile-nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        max-width: 320px;
        height: 100vh;
        background: var(--card-bg, #ffffff);
        box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transition: right 0.3s ease;
        display: flex;
        flex-direction: column;
        padding: 80px 20px 20px;
        overflow-y: auto;
    }

    .mobile-nav.open {
        right: 0;
    }

    .mobile-nav .nav-menu,
    .mobile-nav .nav-links {
        display: flex !important;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }

    .mobile-nav a,
    .mobile-nav button {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 12px;
        text-decoration: none;
        color: var(--dark, #1a1a2e);
        font-weight: 500;
        transition: all 0.3s;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-size: 1rem;
    }

    .mobile-nav a:hover,
    .mobile-nav button:hover {
        background: rgba(67, 97, 238, 0.1);
        color: var(--primary, #4361ee);
    }

    .mobile-nav a.active {
        background: rgba(67, 97, 238, 0.1);
        color: var(--primary, #4361ee);
    }

    .mobile-nav i {
        width: 24px;
        font-size: 1.2rem;
    }

    .mobile-nav .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--border-color, #e9ecef);
        margin-top: auto;
    }

    .mobile-nav .user-info img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .mobile-nav .logout-btn {
        color: var(--danger, #e74c3c);
    }

    .mobile-nav .logout-btn:hover {
        background: rgba(231, 76, 60, 0.1);
    }

    /* Overlay pour fermer le menu */
    .mobile-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .mobile-nav-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: block;
        }
        
        .nav-menu,
        .nav-links {
            display: none !important;
        }
        
        .user-info {
            display: none !important;
        }
        
        .navbar .container {
            position: relative;
        }
    }

    @media (min-width: 769px) {
        .mobile-nav {
            display: none;
        }
        
        .mobile-menu-toggle {
            display: none;
        }
        
        .nav-menu,
        .nav-links {
            display: flex !important;
        }
        
        .user-info {
            display: flex !important;
        }
    }
`;

document.head.appendChild(responsiveStyles);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveMenu = new ResponsiveMenu();
});