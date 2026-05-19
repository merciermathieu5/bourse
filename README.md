# Bourse-École 📈

Un simulateur boursier éducatif pour adolescents (16+), conçu pour faire découvrir le métier de trader et les mécanismes des marchés financiers — sans risquer un sou.

> **Apprends à investir en jouant.** Achète et vends 20 grandes actions réelles, suis les actualités du marché et compare ta performance avec celle de tes camarades.

---

## ✨ Ce que ça fait

- **20 grands titres** répartis dans 4 secteurs : Technologies (AAPL, MSFT, NVDA, GOOGL, META), Communications (VZ, T, TMUS, CMCSA, CHTR), Métaux (BHP, RIO, VALE, NEM, FCX) et Manufacturier (CAT, GE, BA, HON, MMM).
- **Marché en direct** : les cours évoluent toutes les 2 secondes avec une marche aléatoire calibrée par titre (NVDA et BA sont plus volatils que VZ, comme dans la réalité).
- **Fil d'actualités pédagogique** : ~1 actu par minute fait dériver un titre dans une direction pendant 40 secondes. Chaque actu est accompagnée d'une explication *« Pourquoi ? »* qui décortique le lien entre la nouvelle et le prix.
- **Persistance complète** via `localStorage` : ferme l'onglet, reviens dans 2 jours — le marché a continué de bouger et tu vois ce qui s'est passé en ton absence (jusqu'à 500 ticks de rattrapage, soit ~17 minutes simulées).
- **Mode enseignant** : tableau de bord de tous les étudiants, ajustement des budgets, accélération du temps (avance de 5 min instantanément pour les démos en classe).
- **Système de badges** et **classement de classe** pour la motivation.
- **Mini-graphiques** sur chaque titre + graphique détaillé en cliquant sur le symbole.

## 🎯 Pour qui

- **Cours d'économie, mathématiques financières ou éducation financière** au secondaire/lycée
- **Clubs d'investissement** scolaires
- Toute personne qui veut comprendre les marchés sans risquer d'argent

## 🚀 Démarrage local (sans hébergement)

C'est un site 100 % statique — aucune installation requise.

```bash
# Cloner le dépôt
git clone https://github.com/TON-NOM/bourse-ecole.git
cd bourse-ecole

# Ouvrir directement dans le navigateur
open index.html         # macOS
xdg-open index.html     # Linux
start index.html        # Windows
```

Ou simplement double-cliquer sur `index.html`.

## 🌐 Déploiement sur GitHub Pages

GitHub Pages est gratuit et idéal pour ce projet.

1. **Pousse le code sur GitHub** (créer un dépôt, puis `git push`).
2. Dans ton dépôt, va dans **Settings → Pages**.
3. Sous **Source**, choisis la branche `main` et le dossier `/ (root)`.
4. Clique sur **Save**.
5. Patiente 30-60 secondes. Ton site sera disponible à :
   `https://TON-NOM.github.io/bourse-ecole/`

C'est tout. Partage le lien aux étudiants.

## 🌐 Autres options d'hébergement gratuit

- **Netlify** : glisser-déposer le dossier sur [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** : `vercel` dans le dossier après installation du CLI
- **Cloudflare Pages** : connecter le dépôt GitHub, déploiement automatique
- **Surge.sh** : `npx surge` dans le dossier

## 👥 Comptes de démonstration

| Utilisateur | NIP | Rôle | Budget |
|---|---|---|---|
| `alex` | `100` | Étudiant | 10 000 $ |
| `sam` | `200` | Étudiant | 10 000 $ |
| `jordan` | `300` | Étudiant | 10 000 $ |
| `prof` | `999` | Enseignant | — |

Tu peux modifier ces comptes dans `app.js` (chercher `defaultState`).

## 🧩 Structure des fichiers

```
.
├── index.html          # Structure de la page (login, dashboard, admin)
├── styles.css          # Tous les styles (design éditorial chaud)
├── app.js              # Logique : simulation, persistance, trading, news
├── README.md
├── LICENSE
└── .gitignore
```

Tout est en **vanilla JS, HTML et CSS** — pas de framework, pas de build, pas de `node_modules`. Les seules dépendances externes sont chargées par CDN : Google Fonts (Fraunces, Geist, JetBrains Mono) et Tabler Icons.

## ⚙️ Personnalisation rapide

Toutes les constantes principales sont en haut de `app.js` :

```js
const TICK_MS = 2000;            // Vitesse du marché (ms entre ticks)
const HISTORY_LEN = 60;          // Nombre de points sur les graphiques
const MAX_CATCHUP_TICKS = 500;   // Plafond du rattrapage temporel
const NEWS_CHANCE = 0.014;       // Probabilité d'une news par tick (~1/min)
const NEWS_DURATION_TICKS = 20;  // Durée d'effet d'une actu
```

Tu peux aussi modifier :
- La liste des titres (`STOCKS_DEF`) — ticker, nom, secteur, prix de base, volatilité
- Les actualités (`NEWS_POOL`) — texte, titre concerné, biais (+/-), explication pédagogique
- Les badges (`BADGES`) — conditions de déblocage dans `checkBadges()`

## 🔒 Limites assumées

- **Pas de vrai backend** : la persistance est locale (`localStorage`) — chaque étudiant a sa propre simulation dans son navigateur. Si tu veux un classement partagé entre les étudiants, il faut un backend (Firebase, Supabase, etc.).
- **Pas de hash sur les NIP** : c'est un simulateur pédagogique, pas un système d'authentification réel.
- **Cours simulés, pas réels** : les prix bougent par marche aléatoire calibrée, pas via une API de marché. Pour brancher du vrai temps réel, voir la section *Ressources* ci-dessous.

## 📚 Ressources pour pousser plus loin

- **Données de marché réelles (gratuites pour usage limité)** : [Finnhub](https://finnhub.io/), [Alpha Vantage](https://www.alphavantage.co/), [IEX Cloud](https://iexcloud.io/)
- **Backend léger** pour un classement partagé : [Firebase Realtime DB](https://firebase.google.com/products/realtime-database) ou [Supabase](https://supabase.com/) (généreux niveau gratuit)
- **Idées d'extension** : frais de transaction, ordres limites, événements macro affectant tout un secteur, mode tournoi avec date de fin, export CSV des transactions

## 📄 Licence

MIT — utilise, modifie et partage librement, y compris pour usage commercial. Voir [LICENSE](LICENSE).

---

*Construit avec ❤️ pour les profs qui veulent rendre la finance vivante.*
