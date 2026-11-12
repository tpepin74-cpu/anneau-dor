# L’Anneau d’Or — Une histoire de mains

Site de présentation en français pour L’Anneau d’Or, Chantal Minicelli, à Porrentruy. React, Vite, Framer Motion et Three.js. Le logo fourni est conservé dans `public/assets/logo.png`. Les polices sont hébergées localement.

## Développement

`npm ci` puis `npm run dev`. Production : `npm run build`, sortie statique dans `dist`.

## Expérience

- Premier écran vidéo plein cadre (100 svh), puis page éditoriale blanche, photographies d’atelier et typographie Cormorant Garamond / Manrope.
- Récit en quatre chapitres : imaginer, façonner, sertir, transmettre. Une seule scène 3D reste montée du premier écran au pied de page. La vidéo la recouvre au début, puis le scroll révèle le dessin central. Sa position, sa taille et son orientation restent fixes ; une progression globale continue contrôle la construction dans les deux sens du défilement.
- La bague reste au centre de l’écran, sur ordinateur et mobile. La bague reste toujours derrière les photographies, les textes et les commandes. Les conteneurs de texte, séparateurs et légendes sont transparents : aucune bande blanche ne masque artificiellement le bijou. Seules les photographies le recouvrent. Le rendu reste discret sous les textes, particulièrement sur mobile. Aucun configurateur ni choix de métal ou de pierre.
- Framer Motion lisse la progression du défilement avec un ressort amorti, sans rebond, puis la relie aux étapes de la géométrie Three.js, avec des repères calculés sur la position réelle des chapitres. La matière, la monture et la pierre se révèlent sans déplacement de la bague. Aucun mouvement autonome, zoom ni réinitialisation entre les chapitres ; le rendu ne se recalcule que lorsque la progression ou la taille change.
- WebGL2 avec rendu physique ; moteur Canvas 2D de compatibilité avec projection, profondeur et éclairage de géométries 3D si WebGL est indisponible.
- Prise en compte de la réduction des animations et commande manuelle « Prendre le temps, sans mouvement ». Rendu suspendu lorsque la scène est hors de l’écran.
- Navigation mobile, liens vers les chapitres, accordéons de services et dialogue de contact accessible au clavier.
- Formulaire : validation native, préparation explicite d’un e-mail via `mailto:`. Aucun envoi serveur, aucune fausse confirmation d’envoi. Aucun stockage de données personnelles.

## Vidéo d’accueil

La vidéo fournie `gemini_generated_video_a219055b.mp4` est intégrée en plein écran dans le hero. Copie web locale : `public/assets/video/atelier-hero.mp4` (H.264, 1280 × 720, 10 secondes, environ 1,60 Mo, sans piste audio, démarrage rapide). L’image d’attente `atelier-hero-poster.webp` est extraite de cette vidéo. Lecture silencieuse en boucle, bouton pause/reprise, suspension hors écran et quand l’onglet est masqué. La préférence de réduction des animations désactive la lecture automatique.

## Photographies d’ambiance

Quatre images ont été générées pour ce projet le 3 novembre 2026, avec une même référence visuelle afin de conserver la cohérence de l’artisane, des vêtements et de l’atelier. Elles montrent une artisane fictive et ne sont pas des portraits de Chantal Minicelli ni des photos de son atelier réel. Cette distinction figure dans le pied de page et les informations du site.

Direction commune : photographie éditoriale naturaliste, petite joaillerie artisanale, lumière douce de fenêtre, murs clairs, établi ancien en bois, chemise de lin crème et tablier taupe, gestes et matières au premier plan, sans lettrage ni marque.

1. `croquis` : artisane vue de côté, dessin d’une bague solitaire dans un carnet.
2. `matiere` : gros plan sur les mains et le limage d’un anneau d’or à l’établi.
3. `sertissage` : sertissage d’une pierre sur la monture, tenue dans une pince en bois.
4. `eclat` : solitaire achevé présenté dans les mains de l’artisane.

Les fichiers WebP dans `public/assets/atelier` existent en 768 et 1536 pixels, avec `srcset`, chargement différé hors hero et dimensions explicites. Les géométries 3D sont illustratives.

## Coordonnées

Les coordonnées publiques proviennent de la fiche de l’établissement consultée le 3 novembre 2026 : https://www.local.ch/fr/d/porrentruy/2900/bijouterie/l-anneau-d-or-chantal-minicelli-D3H8KW7pKFV75ATFSakkBg. Raison individuelle et adresse corroborées par https://www.moneyhouse.ch/fr/company/lanneau-dor-chantal-minicelli-21128243291.

## Vérification

Build de production ; vidéo couvrant exactement le viewport sur ordinateur et mobile ; lecture silencieuse, pause/reprise, suspension hors écran ; bague toujours derrière les photographies et les textes, sans masque blanc sur les conteneurs ; navigation et mise en page sur ordinateur et mobile ; images sans erreur et absence de débordement horizontal à 375 pixels ; chapitres et progression continue au scroll ; canvas unique et coordonnées identiques à plusieurs étapes sur ordinateur et mobile ; mode sans mouvement avec bijou achevé visible ; menu mobile ; accordéons ; ouverture et fermeture du dialogue et validation du formulaire vide. Le navigateur de QA désactive WebGL : le moteur de compatibilité a été vérifié visuellement, le rendu physique WebGL n’a pas pu être observé dans cet environnement.


## Page Mes créations

Page statique dédiée `/creations/`, avec sa propre entrée HTML, son titre et sa description. Accès depuis les menus ordinateur/mobile et depuis la section atelier de l’accueil. L’expérience 3D reste réservée à l’accueil et ses conteneurs transparents sont conservés.

Neuf bijoux fictifs illustrent la galerie : Aube, Liens, Feuille, Sillage, Petite lune, Rosée, Trace, Aurore et Mémoire. Le caractère généré et illustratif est indiqué en haut de page, dans chaque fiche et dans les informations du site. Aucun achat, prix, configurateur ou faux témoignage client.

Filtres combinables : type de bijou, occasion, destinataire (femme/homme/mixte), matière et pierre. Compteur de résultats annoncé, retrait individuel des critères, remise à zéro et état sans résultat. Les pièces mixtes apparaissent aussi dans les sélections femme et homme. Chaque fiche présente une image agrandie, une description et les critères ; le bouton de contact préremplit explicitement le message avec le nom de l’exemple, sans envoyer de demande.

Neuf photographies originales générées avec l’outil intégré, sur fond ivoire, lumière douce et textures artisanales. Versions WebP 640 et 1280 pixels dans `public/assets/creations`, environ 1,43 Mo pour les 18 fichiers, dimensions et chargement différé. Prompts et fichiers : `asset-notes/gallery-image-prompts.json`.

Vérification de la galerie : build multi-page, navigation depuis l’accueil, combinaison mariage + homme + or jaune (Liens), combinaison sans résultat, remise à zéro, catégorie bagues (4 pièces), fiche détaillée, message de contact prérempli, fermeture par Échap et retour du focus. Vue mobile à 375 pixels utiles : filtres argent + homme (2 pièces), fiche défilable et absence de débordement horizontal.


## Publication GitHub Pages

Dépôt : https://github.com/tpepin74-cpu/anneau-dor

Site : https://tpepin74-cpu.github.io/anneau-dor/

La branche `main`, dossier `/docs`, publie le site avec GitHub Pages. Le code React/Vite reste dans `src`, les médias dans `public` et la version prête à servir dans `docs`.

Après une modification : `npm ci`, `npm run build:pages`, puis committer le code et le dossier `docs`. Les chemins utilisent la base Vite pour fonctionner sous `/anneau-dor/`, y compris la vidéo, les images et `/anneau-dor/creations/`.

Les visuels d’ambiance et de bijoux sont des illustrations générées. Cette publication conserve les mentions de démonstration et le formulaire qui prépare un e-mail, sans envoi automatique ni stockage.
