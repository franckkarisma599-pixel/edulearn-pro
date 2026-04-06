/**
 * EduLearn Pro - Gestionnaire de version
 * Version: 2.0.0
 * Dernière mise à jour: 2 avril 2026
 */

class VersionManager {
    constructor() {
        this.currentVersion = "2.0.0";
        this.versionKey = "app_version";
        this.lastUpdateKey = "last_update";
        this.checkOnLoad = true;
        this.apiUrl = "/api/version.php";
        this.init();
    }

    /**
     * Initialisation du gestionnaire de version
     */
    init() {
        this.displayVersion();
        if (this.checkOnLoad) {
            this.checkVersion();
        }
        this.attachEventListeners();
    }

    /**
     * Affiche la version dans le footer et la console
     */
    displayVersion() {
        const versionElements = document.querySelectorAll('.version-badge');
        versionElements.forEach(el => {
            el.textContent = `v${this.currentVersion}`;
        });
        
        // Ajouter un footer de version si non existant
        if (!document.querySelector('.version-footer')) {
            const footer = document.querySelector('footer');
            if (footer) {
                const versionSpan = document.createElement('div');
                versionSpan.className = 'version-footer';
                versionSpan.style.fontSize = '0.7rem';
                versionSpan.style.opacity = '0.6';
                versionSpan.style.marginTop = '10px';
                versionSpan.innerHTML = `EduLearn Pro v${this.currentVersion} | © 2026`;
                footer.querySelector('.container')?.appendChild(versionSpan);
            }
        }
        
        console.log(`[Version] EduLearn Pro v${this.currentVersion} - ${this.getLastUpdateDate()}`);
    }

    /**
     * Récupère la version stockée en localStorage
     */
    getStoredVersion() {
        try {
            return localStorage.getItem(this.versionKey) || "1.0.0";
        } catch(e) {
            return "1.0.0";
        }
    }

    /**
     * Sauvegarde la version actuelle
     */
    saveVersion() {
        try {
            localStorage.setItem(this.versionKey, this.currentVersion);
            localStorage.setItem(this.lastUpdateKey, new Date().toISOString());
        } catch(e) {
            console.warn('[Version] Impossible de sauvegarder la version');
        }
    }

    /**
     * Récupère la date de dernière mise à jour
     */
    getLastUpdateDate() {
        try {
            const date = localStorage.getItem(this.lastUpdateKey);
            if (date) {
                return new Date(date).toLocaleDateString('fr-FR');
            }
        } catch(e) {}
        return "2 avril 2026";
    }

    /**
     * Vérifie si une mise à jour est disponible
     */
    async checkVersion() {
        const storedVersion = this.getStoredVersion();
        
        // Vérifier via l'API si disponible
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.version && data.version !== this.currentVersion) {
                    this.showUpdateNotification(data.version, data.changelog);
                    return;
                }
            }
        } catch(e) {
            console.log('[Version] API non disponible, utilisation du localStorage');
        }
        
        // Fallback localStorage
        if (storedVersion !== this.currentVersion) {
            this.showUpdateNotification(this.currentVersion);
        }
    }

    /**
     * Affiche la notification de mise à jour
     */
    showUpdateNotification(newVersion, changelog = null) {
        // Éviter les doublons
        if (document.querySelector('.update-notification')) return;
        
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            padding: 16px 20px;
            max-width: 320px;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
            border-left: 4px solid var(--primary, #4361ee);
        `;
        
        let changelogHtml = '';
        if (changelog && changelog.length) {
            changelogHtml = `<ul style="margin: 10px 0 0 20px; font-size: 0.8rem; color: var(--gray, #6c757d);">${changelog.map(f => `<li>✓ ${f}</li>`).join('')}</ul>`;
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-sync-alt" style="font-size: 1.2rem; color: var(--primary, #4361ee);"></i>
                <div style="flex: 1;">
                    <strong style="font-size: 0.9rem;">Nouvelle version disponible !</strong>
                    <div style="font-size: 0.75rem; color: var(--gray, #6c757d);">v${newVersion}</div>
                    ${changelogHtml}
                </div>
                <button class="update-btn" style="background: var(--primary, #4361ee); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.75rem;">Mettre à jour</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        const updateBtn = notification.querySelector('.update-btn');
        updateBtn.addEventListener('click', () => {
            this.performUpdate();
            notification.remove();
        });
        
        // Auto-fermeture après 10 secondes
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 10000);
    }

    /**
     * Effectue la mise à jour
     */
    performUpdate() {
        // Sauvegarder les données utilisateur avant mise à jour
        this.backupUserData();
        
        // Sauvegarder la nouvelle version
        this.saveVersion();
        
        // Afficher un message de succès
        this.showToast('Mise à jour effectuée avec succès !');
        
        // Recharger la page après un court délai
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    /**
     * Sauvegarde les données utilisateur avant mise à jour
     */
    backupUserData() {
        try {
            const backup = {
                users: localStorage.getItem('users'),
                currentUser: localStorage.getItem('currentUser'),
                timestamp: new Date().toISOString(),
                version: this.currentVersion
            };
            
            // Sauvegarder dans un backup
            localStorage.setItem('backup_before_update', JSON.stringify(backup));
            
            // Garder les backups des 5 dernières versions
            this.cleanOldBackups();
            
            console.log('[Version] Données sauvegardées avant mise à jour');
        } catch(e) {
            console.warn('[Version] Erreur lors de la sauvegarde');
        }
    }

    /**
     * Nettoie les anciens backups
     */
    cleanOldBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                backups.push(key);
            }
        }
        backups.sort().reverse();
        while (backups.length > 5) {
            localStorage.removeItem(backups.pop());
        }
    }

    /**
     * Récupère l'historique des versions
     */
    getVersionHistory() {
        return [
            { version: "2.0.0", date: "2026-04-02", features: [
                "Ajout du thème sombre",
                "Support multilingue (FR/EN)",
                "Nouvelle interface dashboard",
                "Système de tickets support",
                "Amélioration des performances"
            ]},
            { version: "1.5.0", date: "2026-03-15", features: [
                "Ajout des notifications push",
                "Export des données",
                "Amélioration des quiz"
            ]},
            { version: "1.0.0", date: "2026-01-01", features: [
                "Version initiale",
                "Gestion des fichiers",
                "Quiz de base",
                "Création de cours"
            ]}
        ];
    }

    /**
     * Affiche un toast de notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'version-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            animation: fadeInUp 0.3s ease;
            font-size: 0.85rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Affiche le panneau d'information sur la version
     */
    showVersionPanel() {
        const panel = document.createElement('div');
        panel.className = 'version-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 24px;
            padding: 25px;
            max-width: 500px;
            width: 90%;
            z-index: 10002;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: zoomIn 0.2s ease;
        `;
        
        const history = this.getVersionHistory();
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="display: flex; align-items: center; gap: 10px;"><i class="fas fa-code-branch" style="color: var(--primary, #4361ee);"></i> Version ${this.currentVersion}</h3>
                <button class="close-panel" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="color: var(--gray, #6c757d);">Dernière mise à jour : ${this.getLastUpdateDate()}</p>
                <p>Bienvenue sur EduLearn Pro ! Nous améliorons constamment votre expérience.</p>
            </div>
            <div style="margin-bottom: 20px;">
                <strong>📝 Notes de version</strong>
                ${history.map(v => `
                    <div style="margin-top: 15px; padding: 10px; background: var(--light, #f8f9fa); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>v${v.version}</strong>
                            <small style="color: var(--gray, #6c757d);">${new Date(v.date).toLocaleDateString('fr-FR')}</small>
                        </div>
                        <ul style="margin: 8px 0 0 20px; font-size: 0.8rem; color: var(--gray, #6c757d);">
                            ${v.features.map(f => `<li>✓ ${f}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="document.querySelector('.version-panel')?.remove()">Fermer</button>
        `;
        
        document.body.appendChild(panel);
        
        panel.querySelector('.close-panel').addEventListener('click', () => panel.remove());
        panel.addEventListener('click', (e) => {
            if (e.target === panel) panel.remove();
        });
    }

    /**
     * Attache les écouteurs d'événements
     */
    attachEventListeners() {
        // Ajouter un bouton de version dans le footer
        const footer = document.querySelector('footer');
        if (footer && !document.querySelector('.version-info-btn')) {
            const versionBtn = document.createElement('button');
            versionBtn.className = 'version-info-btn';
            versionBtn.innerHTML = `<i class="fas fa-info-circle"></i> v${this.currentVersion}`;
            versionBtn.style.cssText = `
                background: none;
                border: none;
                color: var(--gray, #6c757d);
                font-size: 0.7rem;
                cursor: pointer;
                margin-top: 10px;
                opacity: 0.6;
                transition: opacity 0.3s;
            `;
            versionBtn.onmouseenter = () => versionBtn.style.opacity = '1';
            versionBtn.onmouseleave = () => versionBtn.style.opacity = '0.6';
            versionBtn.onclick = () => this.showVersionPanel();
            
            const footerContainer = footer.querySelector('.container');
            if (footerContainer) {
                footerContainer.appendChild(versionBtn);
            }
        }
    }
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes fadeInUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    @keyframes zoomIn {
        from {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    .version-toast {
        animation: fadeInUp 0.3s ease;
    }
    .update-notification {
        animation: slideInUp 0.3s ease;
    }
    .version-panel {
        animation: zoomIn 0.2s ease;
    }
`;
document.head.appendChild(style);

// Initialisation
const versionManager = new VersionManager();
window.versionManager = versionManager;