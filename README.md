# Pont Discord ↔ Claude Code

Ton serveur Discord privé devient une copie de la barre latérale de l'app Claude :

```
📁 Projet Remaster Silver          ← catégorie = un projet (un dossier du PC)
   # game-decompilation            ← salon = une conversation avec Claude
   # wsl-disk-space-analysis
📁 chaine-ia
   # reecriture-voix-off
📁 Sans dossier
   # apex-movement-mechanics
📦 Archives
# accueil                          ← commandes du bot
```

Dans chaque salon :

```
Toi : ajoute un bouton pause
Bot : ⏳ Patience, je traite ta requête…
Bot : (réponse, coupée en plusieurs messages si elle dépasse 2000 caractères)
Bot : ✅ Réponse terminée (42 s) — tu peux envoyer ta prochaine question.
```

Claude garde le fil de chaque conversation, et plusieurs conversations peuvent tourner en parallèle (3 par défaut).

## Installation (une seule fois, ~5 min)

Il te faut un PC Windows, [Node.js](https://nodejs.org) 24 ou plus, et [Claude Code](https://claude.com/claude-code) connecté à ton abonnement Claude. Aucune dépendance à installer : `git clone https://github.com/MashiroW/ClaudeCord` suffit.

Un guide détaillé en PDF est dans [`Guide-bot-Discord-Claude.pdf`](Guide-bot-Discord-Claude.pdf).

### 1. Créer ton serveur
Dans Discord : **+** → **Créer le mien** → **Pour moi et mes amis**. Il ne sera qu'à toi.

### 2. Créer le bot
Un webhook ne peut qu'**envoyer** des messages, pas les lire : il faut donc un bot (gratuit).

1. Va sur https://discord.com/developers/applications → **New Application** → nomme-le (ex. « Claude »).
2. Onglet **Bot** :
   - **Reset Token** → copie le token (garde-le secret, c'est le mot de passe du bot).
   - Active **Message Content Intent** (obligatoire, sinon le bot ne voit pas le texte de tes messages).
3. Onglet **OAuth2 → URL Generator** :
   - Scopes : coche `bot`.
   - Bot Permissions : coche **Administrator** (le plus simple sur un serveur qui n'est qu'à toi). Sinon au minimum : `Manage Channels`, `View Channels`, `Send Messages`, `Read Message History`, `Attach Files`.
   - Ouvre l'URL générée en bas et ajoute le bot à ton serveur.

### 3. Récupérer les identifiants
Dans Discord : **Paramètres utilisateur → Avancés → Mode développeur** (activer). Ensuite :
- clic droit sur l'icône de ton serveur → **Copier l'identifiant du serveur** ;
- clic droit sur ton pseudo → **Copier l'identifiant de l'utilisateur**.

### 4. Configurer
Copie `config.example.json` en `config.json` et remplis :

| Clé | Rôle |
|---|---|
| `discordToken` | le token du bot |
| `guildId` | l'ID de ton serveur |
| `ownerId` | ton ID : **seuls tes messages** sont transmis à Claude |
| `claudePath` | chemin de `claude.exe` (déjà rempli) |
| `permissionMode` | `auto` (recommandé), `acceptEdits` (modifie les fichiers mais refuse les commandes), `bypassPermissions` (tout sans demander, risqué) |
| `model` | `claude-opus-5-5` par défaut ; vide = modèle par défaut de Claude Code, sinon `sonnet`, `haiku`… |
| `effort` | niveau de réflexion : `low`, `medium` (défaut), `high`, `xhigh`, `max` |
| `showUsage` | affiche sous chaque réponse les tokens utilisés et ce qu'il reste du forfait (5 h et semaine) |
| `maxParallel` | nombre de conversations qui peuvent travailler en même temps |
| `timeoutMinutes` | durée max d'une requête |
| `importListSize` | nombre de conversations proposées par `!importer` |
| `showCost` | affiche le coût de chaque réponse |
| `appendSystemPrompt` | consignes ajoutées à Claude (réponses courtes, pas de tableaux…) |

### 5. Lancer
Double-clic sur **`start.bat`**. Toutes les options sont détaillées juste en dessous.

## Lancer et arrêter le bot

| Pour… | Fais… |
|---|---|
| **Lancer** | double-clic sur **`start.bat`** |
| **Arrêter** | ferme la fenêtre « Pont Discord - Claude Code » (elle est peut-être réduite dans la barre des tâches) |
| **Relancer** (après une mise à jour du code) | tape `!redemarrer` dans Discord, ou ferme la fenêtre et relance `start.bat` |

Tant que la fenêtre est ouverte, le bot tourne. S'il plante, il redémarre tout seul au bout de 5 s. Le PC doit rester allumé : s'il se met en veille, le bot ne répond plus.

Au premier lancement, le bot crée un salon **#accueil** avec l'aide.

## Lancement automatique au démarrage du PC

| Pour… | Fais… |
|---|---|
| **Activer** | double-clic sur **`autostart-activer.bat`** |
| **Désactiver** | double-clic sur **`autostart-desactiver.bat`** |

`autostart-activer.bat` place un raccourci `ClaudeCord.lnk` dans le dossier Démarrage de Windows. Le bot se lance donc à chaque ouverture de ta session Windows, dans une fenêtre réduite. `autostart-desactiver.bat` supprime ce raccourci. Si le bot tourne déjà, il continue jusqu'à ce que tu fermes sa fenêtre.

Pour vérifier à la main : `Win + R` → `shell:startup`. Si `ClaudeCord` est dans ce dossier, le lancement automatique est actif.

> Si tu déplaces le dossier du projet, relance `autostart-activer.bat` pour mettre le raccourci à jour.

## Utilisation

**Projets** (tape-les dans #accueil ou n'importe où) :
- `!projet C:\Myfiles\Logiciels\Autocut` : crée la catégorie du projet et un premier salon `nouvelle-conversation`.
- `!projets` : liste les projets et leurs dossiers.
- `!importer` : liste tes conversations récentes de l'app Claude. Ensuite `!importer 1 3 5` ou `!importer tout` les recrée en salons, rangées par projet, avec ta dernière demande et la dernière réponse pour te remettre dans le bain.

**Dans une conversation :**
- `!nouveau` (ou `!nouveau titre`) : nouvelle conversation dans le même projet.
- `!stop` : annule la requête en cours.
- `!status` : libre/occupé, dossier, session.
- `!archiver` : range le salon dans 📦 Archives (tu peux toujours y écrire).
- `!conso` : ce qu'il reste de ton forfait, sur la fenêtre de 5 h et sur la semaine.
- `!synchro` : met tout à jour depuis l'app. Elle recopie les messages échangés dans l'app depuis la dernière fois, importe les nouvelles conversations (seulement celles qui ont un titre dans l'app, pas les scripts), et répercute les titres renommés et les changements de dossier. Elle se lance aussi toute seule toutes les `syncMinutes` minutes (10 par défaut, 0 pour la couper).
- `!redemarrer` : relance le bot, par exemple après une mise à jour de son code.

Sous chaque message ✅, en petit :
```
🪙 40,3 k lus (dont 32 k en cache) · 850 écrits
⏱️ 5 h : reste 81 % (recharge 09:00) · 📅 semaine : reste 39 % (recharge sam. 22:00)
```

Après la première réponse, le salon `nouvelle-conversation` est renommé automatiquement avec un titre court, comme dans l'app.

Tu peux aussi créer un salon **à la main** dans la catégorie d'un projet : il devient une nouvelle conversation de ce projet. Supprimer un salon ou une catégorie dans Discord fait simplement oublier la conversation au bot. Elle reste disponible dans l'app Claude.

Tu peux joindre une capture d'écran ou un fichier : il est téléchargé sur le PC et Claude le lit.

## À savoir

- Une seule requête à la fois **par salon**. Si tu écris pendant que Claude bosse, le bot te demande d'attendre le ✅.
- Claude ne peut pas te poser de question de permission par Discord. En mode `auto`, il fait les actions sûres seul et refuse celles qui sont risquées, puis te dit ce qui a été bloqué.
- N'écris pas dans **la même** conversation depuis l'app et depuis Discord en même temps.
- Les conversations créées depuis Discord ne s'ajoutent pas d'elles-mêmes dans la barre latérale de l'app. Tu peux les reprendre sur le PC avec `claude --resume` dans le dossier du projet.
- Ça utilise ton abonnement Claude, exactement comme Claude Code dans un terminal.
