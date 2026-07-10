# Téranga Trans — Application mobile (Expo / React Native)

Application mobile pour les **agents** de Téranga Trans. Elle consomme l'API REST
du backend Laravel (dossier parent) : authentification par téléphone + code à 4
chiffres, portefeuille, dépôts/retraits et commissions.

## Stack

- **Expo SDK 57** / React Native 0.86 / React 19
- **expo-router** (navigation par fichiers)
- **axios** (client HTTP) + **expo-secure-store** (stockage sécurisé du token Sanctum)
- Design-system maison en `StyleSheet` (couleurs Téranga : bleu `#2d547d`, orange `#fb6300`)

## Structure

```
app/                      # écrans (expo-router)
  _layout.tsx             # racine : AuthProvider + garde d'authentification
  index.tsx               # redirection selon l'état de connexion
  (auth)/login.tsx        # connexion
  (auth)/register.tsx     # inscription
  (tabs)/index.tsx        # tableau de bord (solde, stats, transactions récentes)
  (tabs)/transactions.tsx # liste paginée des transactions
  (tabs)/profile.tsx      # profil agent + déconnexion
  transaction/new.tsx     # nouvelle transaction (aperçu commission en direct)
  transaction/[id].tsx    # détail d'une transaction
src/
  api/        # client axios, config d'URL, endpoints typés
  auth/       # contexte d'authentification + stockage du token
  components/ # composants UI (Button, Card, Field, TransactionRow…)
  theme.ts    # couleurs, espacements, formatage FCFA
  types.ts    # types TypeScript partagés
```

## Prérequis

- Node 18+ et npm
- Le backend Laravel qui tourne (dossier parent)
- L'app **Expo Go** sur ton téléphone (iOS/Android), OU un émulateur Android / simulateur iOS

## Lancer en développement

### 1. Démarrer le backend Laravel (dossier parent)

**Important :** le serveur doit écouter sur `0.0.0.0` pour être joignable depuis le
téléphone sur le réseau Wi-Fi (pas seulement `localhost`).

```bash
cd ..
php artisan serve --host=0.0.0.0 --port=8000
```

Assure-toi que le téléphone et l'ordinateur sont sur le **même réseau Wi-Fi**.

### 2. Démarrer l'app mobile

```bash
cd mobile
npm install        # première fois seulement
npx expo start
```

Scanne le QR code avec **Expo Go** (Android) ou l'appareil photo (iOS).

## Configuration de l'URL de l'API

Par défaut, l'app détecte automatiquement l'adresse IP du serveur de dev (celle du
Metro bundler) et cible le port **8000**. Voir `src/api/config.ts` :

- **Port différent** → change `API_PORT`.
- **Backend déployé** (production) → renseigne `MANUAL_API_URL`, ex :
  `'https://api.terangatrans.com/api'`.
- **Émulateur Android** sans détection auto → l'app retombe sur `10.0.2.2:8000`.

## Vérifications

```bash
npx tsc --noEmit          # typecheck
npx expo export -p android # valide le bundle complet
```

## Build de production (APK / IPA)

Via **EAS Build** (nécessite un compte Expo) :

```bash
npm install -g eas-cli
eas login
eas build --platform android   # ou ios
```

Pour iOS il faut un compte Apple Developer (99 $/an) ; le build peut se faire depuis
Linux/Windows grâce aux serveurs EAS (pas besoin de Mac).
