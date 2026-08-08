import React, { useState, useEffect } from "react";
import { Trophy, Mountain, Zap, Wind, TrendingUp, Flag, Bike, RotateCcw, Users } from "lucide-react";

/* ============================== THEME ============================== */
const T = {
  bg: "#121110",
  panel: "#1e1c19",
  panelAlt: "#282521",
  line: "#3b3630",
  ink: "#f5f0e6",
  inkMuted: "#a09787",
  accent: "#f4c430",
  accent2: "#3f8f6d",
  danger: "#c1503f",
  info: "#5b8fae",
  purple: "#8a63d2",
};

/* ============================== REFERENCE DATA ============================== */
const NATIONS = [
  { code: "FR", flag: "🇫🇷", label: "France" },
  { code: "BE", flag: "🇧🇪", label: "Belgique" },
  { code: "IT", flag: "🇮🇹", label: "Italie" },
  { code: "ES", flag: "🇪🇸", label: "Espagne" },
  { code: "CO", flag: "🇨🇴", label: "Colombie" },
  { code: "NL", flag: "🇳🇱", label: "Pays-Bas" },
  { code: "SI", flag: "🇸🇮", label: "Slovénie" },
  { code: "AU", flag: "🇦🇺", label: "Australie" },
  { code: "DE", flag: "🇩🇪", label: "Allemagne" },
  { code: "GB", flag: "🇬🇧", label: "Grande-Bretagne" },
  { code: "NO", flag: "🇳🇴", label: "Norvège" },
  { code: "DK", flag: "🇩🇰", label: "Danemark" },
  { code: "CH", flag: "🇨🇭", label: "Suisse" },
  { code: "PT", flag: "🇵🇹", label: "Portugal" },
  { code: "US", flag: "🇺🇸", label: "États-Unis" },
  { code: "PL", flag: "🇵🇱", label: "Pologne" },
  { code: "KZ", flag: "🇰🇿", label: "Kazakhstan" },
  { code: "EC", flag: "🇪🇨", label: "Équateur" },
  { code: "IE", flag: "🇮🇪", label: "Irlande" },
  { code: "CA", flag: "🇨🇦", label: "Canada" },
  { code: "SE", flag: "🇸🇪", label: "Suède" },
  { code: "AT", flag: "🇦🇹", label: "Autriche" },
  { code: "LU", flag: "🇱🇺", label: "Luxembourg" },
  { code: "ER", flag: "🇪🇷", label: "Érythrée" },
  { code: "JP", flag: "🇯🇵", label: "Japon" },
  { code: "NZ", flag: "🇳🇿", label: "Nouvelle-Zélande" },
  { code: "CZ", flag: "🇨🇿", label: "Tchéquie" },
  { code: "UA", flag: "🇺🇦", label: "Ukraine" },
  { code: "RW", flag: "🇷🇼", label: "Rwanda" },
  { code: "ZA", flag: "🇿🇦", label: "Afrique du Sud" },
];

// Retrouve le drapeau d'une nationalité à partir de son code (utilisé pour les coureurs du peloton,
// qui ne stockent que le code — contrairement au joueur, qui garde l'objet nation complet).
function flagFor(code) {
  return NATIONS.find((n) => n.code === code)?.flag || "";
}

const ORIGINS = [
  { id: "rural", label: "Club amateur rural", desc: "Peu de moyens, mais une vraie rage de vaincre." },
  { id: "academie", label: "Académie structurée", desc: "Encadrement pro dès le plus jeune âge." },
  { id: "autodidacte", label: "Autodidacte", desc: "Formé seul, sur les routes, sans filet." },
];

const SPECIALTIES = [
  { id: "grimpeur", label: "Grimpeur", icon: Mountain, desc: "Les cols sont ton terrain de jeu." },
  { id: "puncheur", label: "Puncheur", icon: TrendingUp, desc: "Les côtes courtes et sèches, ton domaine." },
  { id: "sprinteur", label: "Sprinteur", icon: Zap, desc: "Explosif dans les 200 derniers mètres." },
  { id: "rouleur", label: "Rouleur / CLM", icon: Wind, desc: "Puissance régulière, contre-la-montre." },
  { id: "polyvalent", label: "Polyvalent", icon: Bike, desc: "Aucun point faible, aucun point fort marqué." },
];
// Note : le baroudeur n'est plus un profil de départ — n'importe quel profil peut viser des victoires
// d'étape en échappée via la compétence transversale "Chasseur d'étape" (voir SKILL_TREE_CONFIG.transversal).

const LIFESTYLES = [
  { id: "rigoureux", label: "Rigoureux", desc: "Diète stricte, sommeil réglé. Peu de fatigue, peu de vague sociale." },
  { id: "equilibre", label: "Équilibré", desc: "Un pied dans le vélo, un pied dans la vraie vie." },
  { id: "festif", label: "Extraverti", desc: "Populaire, médiatique, mais dur pour le corps." },
];

// Le système d'équipes complet (WorldTour / ProTeam / Continentale) est défini plus bas,
// après les fonctions utilitaires (pick, rand) dont il dépend.

/* ============================================================================
   SKILL_TREE_CONFIG — configuration centralisée du système de progression RPG
   ============================================================================
   Toutes les valeurs d'équilibrage vivent ICI, jamais en dur dans le moteur
   (SkillEngine, plus bas) ni dans les événements/courses. Pour rééquilibrer
   le jeu, on modifie ce fichier de données — jamais la logique.

   Chaque skill a :
     id, label, desc, cost, tier (1 = basique, 2 = avancé)
     effects: [{ type, ...params }]   — lu par SkillEngine, jamais interprété ailleurs
   Types d'effets supportés par SkillEngine (voir plus bas pour le détail) :
     specialtyBonus, allSpecialtyBonus, fatigueResist, formeRecovery,
     craquageResist, finalStageBonus, noiseReduction, reputationDimBonus,
     moneyBonus, teammatesBonus, relationEquipeBonus, ethiqueShield,
     unlockChoice, unlockEvent, talentCharge
   ============================================================================ */
const SKILL_TREE_CONFIG = {
  trees: {
    physique: {
      label: "Physique", icon: "💪",
      desc: "Les qualités brutes du coureur — ce qu'il peut sortir dans ses jambes.",
      skills: [
        { id: "phys_grimpeur", label: "Grimpeur", desc: "+8 en montagne", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "montagne", value: 8 }] },
        { id: "phys_sprinteur", label: "Sprinteur", desc: "+8 au sprint", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "sprint", value: 8 }] },
        { id: "phys_rouleur", label: "Rouleur", desc: "+8 en contre-la-montre", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "clm", value: 8 }] },
        { id: "phys_puncheur", label: "Puncheur", desc: "Bonus de performance dans les arrivées en montagne ET au sprint — seulement au moment décisif, pas un bonus permanent", cost: 1, tier: 1, effects: [{ type: "contextBonus", context: "montagne_stage", value: 5 }, { type: "contextBonus", context: "sprint_stage", value: 5 }] },
        { id: "phys_endurance", label: "Endurance", desc: "Réduit la fatigue accumulée en course", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 4 }] },
        { id: "phys_recuperation", label: "Récupération", desc: "Régénère mieux la forme à chaque intersaison", cost: 1, tier: 1, effects: [{ type: "formeRecovery", value: 3 }] },
        { id: "phys_acceleration", label: "Accélération", desc: "Fort bonus de performance dans les 200 derniers mètres, uniquement à l'arrivée d'un sprint massif", cost: 2, tier: 2, effects: [{ type: "contextBonus", context: "sprint_stage", value: 9 }] },
        { id: "phys_resistance", label: "Résistance", desc: "Réduit encore la fatigue et protège la forme dans les courses très dures", cost: 2, tier: 2, effects: [{ type: "fatigueResist", value: 3 }, { type: "formeRecovery", value: 2 }] },
      ],
    },
    mental: {
      label: "Mental", icon: "🧠",
      desc: "La tête, dans les moments qui comptent.",
      skills: [
        { id: "mental_sangfroid", label: "Sang-froid", desc: "Moins de risque de craquer dans les moments décisifs", cost: 1, tier: 1, effects: [{ type: "craquageResist", value: 6 }] },
        { id: "mental_resilience", label: "Résilience", desc: "Récupère mieux moralement après une défaite", cost: 1, tier: 1, effects: [{ type: "formeRecovery", value: 2 }, { type: "craquageResist", value: 3 }] },
        { id: "mental_stress", label: "Gestion du stress", desc: "Les grandes courses (Monuments, Grands Tours) coûtent moins cher en fatigue", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 4 }] },
        { id: "mental_leadership", label: "Leadership", desc: "Renforce durablement ta relation avec l'équipe", cost: 1, tier: 1, effects: [{ type: "relationEquipeBonus", value: 4 }, { type: "unlockEvent", key: "leader_request" }] },
        { id: "mental_confiance", label: "Confiance", desc: "Petit bonus de performance à l'arrivée des courses majeures", cost: 2, tier: 2, effects: [{ type: "finalStageBonus", value: 4 }] },
        { id: "mental_motivation", label: "Motivation", desc: "Ta motivation se régénère plus vite entre les saisons", cost: 1, tier: 1, effects: [{ type: "formeRecovery", value: 2 }] },
        { id: "mental_regularite", label: "Régularité", desc: "Réduit la part d'aléatoire dans tes résultats — plus régulier, moins de coups d'éclat comme de contre-performances", cost: 2, tier: 2, effects: [{ type: "noiseReduction", value: 8 }] },
      ],
    },
    tactique: {
      label: "Tactique", icon: "🧭",
      desc: "La lecture de course — débloque de nouvelles décisions en pleine course.",
      skills: [
        { id: "tact_placement", label: "Placement", desc: "Réduit la fatigue dans les moments de bataille pour la position", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 3 }] },
        { id: "tact_lecture", label: "Lecture de course", desc: "Débloque le choix « Contre-attaquer » en cours de course", cost: 2, tier: 1, effects: [{ type: "unlockChoice", key: "contre_attaquer" }] },
        { id: "tact_vision", label: "Vision", desc: "Débloque « Suivre uniquement le rival » et « Demander un relais à un équipier »", cost: 4, tier: 2, effects: [{ type: "unlockChoice", key: "suivre_rival" }, { type: "unlockChoice", key: "demander_relais" }] },
        { id: "tact_effort", label: "Gestion de l'effort", desc: "Réduit largement la fatigue accumulée en course", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 5 }] },
        { id: "tact_timing", label: "Sens du timing", desc: "Petit bonus de performance à l'arrivée, sur toutes les courses", cost: 2, tier: 2, effects: [{ type: "finalStageBonus", value: 3 }] },
        { id: "tact_aspiration", label: "Aspiration", desc: "Réduit la fatigue dans le peloton", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 3 }] },
      ],
    },
    carriere: {
      label: "Carrière", icon: "📣",
      desc: "Ton image, tes relations, ta valeur sur le marché des transferts.",
      skills: [
        { id: "car_popularite", label: "Popularité", desc: "Renforce ta cote auprès du public", cost: 1, tier: 1, effects: [{ type: "reputationDimBonus", dim: "fans", value: 5 }, { type: "unlockEvent", key: "documentaire" }] },
        { id: "car_charisme", label: "Charisme", desc: "Renforce ta cote médiatique", cost: 1, tier: 1, effects: [{ type: "reputationDimBonus", dim: "medias", value: 5 }] },
        { id: "car_medias", label: "Relations médias", desc: "Débloque des interviews exclusives en fin de saison", cost: 1, tier: 1, effects: [{ type: "unlockEvent", key: "interview_exclusive" }] },
        { id: "car_negociation", label: "Négociation", desc: "Améliore tes primes de signature et tes revenus de contrat", cost: 2, tier: 2, effects: [{ type: "moneyBonus", value: 0.15 }] },
        { id: "car_sponsors", label: "Sponsors", desc: "Améliore les primes sponsor et ta réputation auprès d'eux", cost: 1, tier: 1, effects: [{ type: "reputationDimBonus", dim: "sponsors", value: 5 }, { type: "moneyBonus", value: 0.1 }] },
        { id: "car_leadership", label: "Leadership", desc: "Renforce ton autorité dans l'équipe et ta relation avec le staff", cost: 2, tier: 2, effects: [{ type: "relationEquipeBonus", value: 5 }] },
        { id: "car_image", label: "Image publique", desc: "Amortit les dégâts de réputation en cas de scandale", cost: 2, tier: 2, effects: [{ type: "ethiqueShield", value: 0.4 }] },
      ],
    },
  },

  // Un arbre de spécialisation par profil de départ — débloqué uniquement pour le profil du joueur.
  specialisation: {
    grimpeur: [
      { id: "spec_g_attaque", label: "Attaque explosive", desc: "+10 en montagne", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "montagne", value: 10 }] },
      { id: "spec_g_altitude", label: "Haute altitude", desc: "Réduit la fatigue dans les arrivées au sommet", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 4 }] },
      { id: "spec_g_descendeur", label: "Descendeur", desc: "Talent unique : bonus de performance dans les étapes de montagne des grands tours", cost: 1, tier: 1, unique: true, effects: [{ type: "contextBonus", context: "montagne_stage", value: 8 }] },
      { id: "spec_g_ascensions", label: "Longues ascensions", desc: "Débloque la décision « Attendre le dernier col » — gérer patiemment jusqu'à l'ascension finale plutôt qu'un simple bonus de stat", cost: 2, tier: 2, effects: [{ type: "unlockChoice", key: "attendre_dernier_col" }] },
      { id: "spec_g_cols", label: "Gestion des cols", desc: "Réduit encore la fatigue en montagne", cost: 2, tier: 2, effects: [{ type: "fatigueResist", value: 4 }] },
    ],
    sprinteur: [
      { id: "spec_s_lance", label: "Sprint lancé", desc: "+10 au sprint", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "sprint", value: 10 }] },
      { id: "spec_s_explosif", label: "Sprint explosif", desc: "Débloque la décision « Jouer le tout pour le tout » — un pari risqué mais payant dans les derniers mètres, plutôt qu'un simple bonus de stat", cost: 2, tier: 2, effects: [{ type: "unlockChoice", key: "tout_pour_le_tout" }] },
      { id: "spec_s_placement", label: "Placement (spécialisé)", desc: "Réduit la fatigue dans la bagarre pour la position avant le sprint", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 4 }] },
      { id: "spec_s_coude", label: "Coude à coude", desc: "Talent unique : petit bonus dans les sprints massifs très disputés", cost: 1, tier: 1, unique: true, effects: [{ type: "contextBonus", context: "sprint_stage", value: 6 }] },
      { id: "spec_s_train", label: "Train de sprint", desc: "Renforce durablement l'efficacité de tes équipiers", cost: 2, tier: 2, effects: [{ type: "teammatesBonus", value: 8 }] },
    ],
    rouleur: [
      { id: "spec_r_clm", label: "Contre-la-montre", desc: "+10 en contre-la-montre", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "clm", value: 10 }] },
      { id: "spec_r_vent", label: "Vent", desc: "Réduit la fatigue dans le vent et les bordures", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 4 }] },
      { id: "spec_r_relais", label: "Relais", desc: "Renforce l'efficacité de tes équipiers en échappée/poursuite", cost: 1, tier: 1, effects: [{ type: "teammatesBonus", value: 6 }] },
      { id: "spec_r_fauxplat", label: "Faux-plats", desc: "+6 en contre-la-montre supplémentaires", cost: 2, tier: 2, effects: [{ type: "specialtyBonus", key: "clm", value: 6 }] },
      { id: "spec_r_endurance", label: "Endurance (spécialisée)", desc: "Réduit encore la fatigue sur la longueur", cost: 2, tier: 2, effects: [{ type: "fatigueResist", value: 4 }] },
    ],
    puncheur: [
      { id: "spec_pu_explosivite", label: "Explosivité courte", desc: "+10 en montagne (efforts courts et intenses)", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "montagne", value: 10 }] },
      { id: "spec_pu_rythme", label: "Changement de rythme", desc: "+6 au sprint supplémentaires", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "sprint", value: 6 }] },
      { id: "spec_pu_finisseur", label: "Finisseur", desc: "Talent unique : bonus de performance à l'arrivée des classiques ardennaises", cost: 1, tier: 1, unique: true, effects: [{ type: "contextBonus", context: "montagne_stage", value: 8 }] },
      { id: "spec_pu_bosses", label: "Franchissement de bosses", desc: "Réduit la fatigue sur les parcours très vallonnés", cost: 2, tier: 2, effects: [{ type: "fatigueResist", value: 4 }] },
      { id: "spec_pu_anticipation", label: "Anticipation", desc: "Débloque le choix « Contre-attaquer » en cours de course", cost: 2, tier: 2, effects: [{ type: "unlockChoice", key: "contre_attaquer" }] },
    ],
    polyvalent: [
      { id: "spec_p_equilibre", label: "Équilibre athlétique", desc: "+5 sur toutes tes qualités", cost: 1, tier: 1, effects: [{ type: "allSpecialtyBonus", value: 5 }] },
      { id: "spec_p_adaptabilite", label: "Adaptabilité", desc: "Réduit la fatigue quel que soit le terrain", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 3 }] },
      { id: "spec_p_lecture", label: "Lecture multi-terrain", desc: "Débloque « Contre-attaquer » en cours de course", cost: 1, tier: 1, effects: [{ type: "unlockChoice", key: "contre_attaquer" }] },
      { id: "spec_p_capitaine", label: "Capitaine naturel", desc: "Renforce durablement le moral de tous tes équipiers", cost: 2, tier: 2, effects: [{ type: "teammatesBonus", value: 10 }] },
      { id: "spec_p_couteau", label: "Couteau suisse", desc: "+4 supplémentaires répartis sur toutes tes qualités", cost: 2, tier: 2, effects: [{ type: "allSpecialtyBonus", value: 4 }] },
    ],
  },

  // Chasseur d'étape reste transversal : accessible depuis n'importe quel profil (voir specialisation ci-dessus,
  // conservé identique pour ne rien casser des parties précédentes).
  transversal: [
    { id: "chasseur_etape", label: "Chasseur d'étape", desc: "Quel que soit ton profil, tu sais repérer et exploiter la bonne échappée. +5 sur toutes tes qualités.", cost: 2, tier: 2, effects: [{ type: "allSpecialtyBonus", value: 5 }] },
  ],

  // Talents uniques : pas de bonus de stat plat, mais un vrai effet de gameplay (charge limitée ou contextuel).
  // Prestigieux et volontairement peu nombreux — chacun a sa propre narration de déblocage.
  talents: [
    { id: "talent_attaquant", label: "Attaquant", desc: "Une fois par course : lance une attaque surprise (bonus de performance important sur cette course)", cost: 2, tier: 2, unique: true,
      narrative: "Certains coureurs attendent le bon moment. Toi, tu le crées. Ton équipe a fini par comprendre qu'il valait mieux te laisser faire.",
      effects: [{ type: "talentCharge", key: "attaquant_surprise", scope: "race", value: 16 }] },
    { id: "talent_patron", label: "Patron", desc: "Tes équipiers deviennent durablement plus efficaces", cost: 2, tier: 2, unique: true,
      narrative: "Sans un mot de plus, le groupe se met en ordre autour de toi dès que tu montres la route. C'est ça, être un patron de peloton.",
      effects: [{ type: "teammatesBonus", value: 12 }] },
    { id: "talent_acier", label: "Mental d'acier", desc: "Une fois par saison : ignore une baisse de motivation", cost: 2, tier: 2, unique: true,
      narrative: "Les coups durs qui feraient plier n'importe qui d'autre glissent sur toi. Une fois par saison, rien ne peut vraiment t'atteindre.",
      effects: [{ type: "talentCharge", key: "mental_acier", scope: "season", value: 0 }] },
    { id: "talent_instinct", label: "Instinct", desc: "Une fois par course : annule les conséquences d'une erreur tactique", cost: 3, tier: 2, unique: true,
      narrative: "Une lecture de course qui frôle le sixième sens. Une fois par course, ton instinct te sort d'une situation que personne d'autre n'aurait vue venir.",
      effects: [{ type: "talentCharge", key: "instinct_correction", scope: "race", value: 0 }] },
    { id: "talent_cannibale", label: "Le Cannibale", desc: "Après plusieurs saisons dominantes, les sponsors te courtisent activement — primes et réputation nettement renforcées", cost: 3, tier: 2, unique: true,
      narrative: "Le peloton a un nouveau surnom pour toi, celui que seuls les très grands reçoivent. Les sponsors ne négocient plus — ils s'alignent.",
      effects: [{ type: "moneyBonus", value: 0.2 }, { type: "reputationDimBonus", dim: "fans", value: 6 }, { type: "reputationDimBonus", dim: "sponsors", value: 6 }] },
  ],

  // Embranchements exclusifs : impossible de débloquer les deux d'une même paire (rejouabilité).
  philosophies: [
    { id: "philo_attaquant", pair: "attaque", label: "Attaquant", desc: "Bonus de performance quand tu choisis d'attaquer pour la victoire", cost: 2, tier: 2,
      narrative: "Tu choisis ta voie : celle de l'attaque, envers et contre tout. Le public adore ça — et ton corps en paie parfois le prix.",
      effects: [{ type: "finalStageBonus", value: 5 }] },
    { id: "philo_calculateur", pair: "attaque", label: "Calculateur", desc: "Bonus de performance quand tu choisis de gérer ton effort", cost: 2, tier: 2,
      narrative: "Tu choisis ta voie : celle de la gestion froide, du calcul plutôt que de l'instinct. Moins spectaculaire, redoutablement efficace.",
      effects: [{ type: "fatigueResist", value: 6 }] },
    { id: "philo_leader", pair: "role", label: "Leader", desc: "Tu peux demander le statut de leader à chaque saison", cost: 2, tier: 2,
      narrative: "Tu assumes désormais le costume de leader. L'équipe se construit autour de tes ambitions — et de tes échecs, aussi.",
      effects: [{ type: "unlockEvent", key: "leader_request" }, { type: "relationEquipeBonus", value: -2 }] },
    { id: "philo_equipier", pair: "role", label: "Équipier modèle", desc: "Renforce durablement ta relation avec l'équipe", cost: 2, tier: 2,
      narrative: "Tu assumes ce rôle sans éclat mais essentiel. Ce sont les équipiers comme toi qui font gagner les leaders.",
      effects: [{ type: "relationEquipeBonus", value: 8 }] },
    { id: "philo_star", pair: "media", label: "Star médiatique", desc: "Forte hausse de réputation fans/médias, mais plus exposé", cost: 2, tier: 2,
      narrative: "Les caméras te suivent désormais partout. Tu deviens un visage du peloton — avec tout ce que ça implique de projecteurs.",
      effects: [{ type: "reputationDimBonus", dim: "fans", value: 8 }, { type: "reputationDimBonus", dim: "medias", value: 8 }] },
    { id: "philo_discret", pair: "media", label: "Athlète discret", desc: "Progression plus lente en réputation, mais jamais de bad buzz", cost: 2, tier: 2,
      narrative: "Tu laisses parler tes jambes plutôt que ta bouche. Une carrière plus discrète, mais à l'abri des tempêtes médiatiques.",
      effects: [{ type: "ethiqueShield", value: 0.6 }] },
  ],

  // Styles de carrière émergents — jamais choisis directement, calculés en direct par SkillEngine.getCareerStyle().
  careerStyles: [
    { id: "cannibale", label: "Le Cannibale", desc: "Une faim de victoires insatiable.", check: (ctx) => ctx.palmares.filter((p) => p.label.startsWith("Victoire")).length >= 6 },
    { id: "chasseur_gt", label: "Chasseur de Grands Tours", desc: "Vit pour les trois semaines de juillet, mai et août.", check: (ctx) => ctx.palmares.some((p) => /Tour de France|Giro|Vuelta/.test(p.label)) },
    { id: "roi_classiques", label: "Roi des Classiques", desc: "Les Monuments sont son terrain de chasse.", check: (ctx) => ctx.palmares.filter((p) => /Flandres|Roubaix|Liège|San Remo|Lombardia/.test(p.label)).length >= 2 },
    { id: "stategiste", label: "Le Stratège", desc: "Lit la course mieux que quiconque.", check: (ctx) => ctx.hasSkill("tact_vision") && ctx.hasSkill("tact_lecture") },
    { id: "capitaine", label: "Le Capitaine", desc: "L'équipe se rassemble derrière lui.", check: (ctx) => ctx.hasSkill("philo_leader") && ctx.hasSkill("mental_leadership") },
    { id: "baroudeur", label: "Le Baroudeur", desc: "Toujours dans le bon coup, loin devant.", check: (ctx) => ctx.hasSkill("chasseur_etape") },
    { id: "polyvalent_style", label: "Le Polyvalent", desc: "Aucun terrain ne lui fait vraiment peur.", check: (ctx) => ctx.specialtyPrimary === "polyvalent" },
  ],
};



const SPEC_IDS = ["grimpeur", "puncheur", "sprinteur", "rouleur", "polyvalent"];
const NATION_NAMES = {
  FR: { first: ["Léo", "Tom", "Julien", "Nicolas", "Romain", "Hugo", "Maxime"], last: ["Mercier", "Dupont", "Faure", "Lefèvre", "Girard", "Bernard"] },
  BE: { first: ["Wout", "Tim", "Yves", "Jasper", "Thibault", "Victor"], last: ["Vermeulen", "Van Dijk", "Dumont", "Peeters", "Willems"] },
  IT: { first: ["Marco", "Matteo", "Giulio", "Alessandro", "Davide"], last: ["Ferretti", "Ricci", "Conti", "Moretti", "Bianchi"] },
  ES: { first: ["Iker", "Carlos", "Alejandro", "Pablo", "Mikel"], last: ["Zabala", "Sánchez", "Herrera", "Ibáñez", "Cruz"] },
  CO: { first: ["Nairo", "Rigoberto", "Sergio", "Esteban", "Daniel"], last: ["Ramírez", "Gómez", "Ortiz", "Cruz", "Vargas"] },
  NL: { first: ["Nils", "Bram", "Dylan", "Mathieu", "Sven"], last: ["Berg", "Van Dijk", "Groen", "Visser", "de Vries"] },
  SI: { first: ["Primo", "Tadej", "Matej", "Jan", "Luka"], last: ["Novak", "Kovač", "Zupan", "Kranjc", "Horvat"] },
  AU: { first: ["Sam", "Jack", "Nathan", "Luke", "Chris"], last: ["O'Reilly", "Anderson", "Mitchell", "Clarke", "Bennett"] },
  DE: { first: ["Marcel", "Maximilian", "Lennard", "Nils", "Emanuel", "Jonas"], last: ["Schmidt", "Müller", "Weber", "Fischer", "Wagner", "Becker"] },
  GB: { first: ["Thomas", "George", "Adam", "Oliver", "Ethan", "Josh"], last: ["Turner", "Baker", "Wright", "Cooper", "Hughes", "Barnes"] },
  NO: { first: ["Erik", "Magnus", "Sondre", "Odin", "Tobias", "Vegard"], last: ["Johansen", "Haugen", "Kristiansen", "Solberg", "Andersen", "Dahl"] },
  DK: { first: ["Mads", "Kasper", "Jonas", "Mikkel", "Frederik", "Anders"], last: ["Nielsen", "Andersen", "Poulsen", "Christensen", "Larsen", "Jensen"] },
  CH: { first: ["Stefan", "Silvan", "Marc", "Fabian", "Reto", "Noah"], last: ["Küng", "Schär", "Frei", "Zbinden", "Meier", "Baumann"] },
  PT: { first: ["João", "Rui", "Tiago", "André", "Nelson", "Ivo"], last: ["Ferreira", "Silva", "Costa", "Oliveira", "Pereira", "Rocha"] },
  US: { first: ["Matteo", "Sepp", "Neilson", "Brandon", "Kyle", "Quinn"], last: ["Powless", "Kuss", "Craddock", "McNulty", "Carpenter", "Baker"] },
  PL: { first: ["Michał", "Rafał", "Kamil", "Paweł", "Łukasz", "Maciej"], last: ["Kwiatkowski", "Kowalski", "Nowak", "Wiśniewski", "Zieliński", "Wójcik"] },
  KZ: { first: ["Alexey", "Nikita", "Yevgeniy", "Daniil", "Artur", "Bauyrzhan"], last: ["Lutsenko", "Fominykh", "Gidich", "Grigoryev", "Zhuban", "Nurlanuly"] },
  EC: { first: ["Richard", "Jonathan", "Santiago", "Byron", "Diego", "Miguel"], last: ["Andrade", "Chávez", "Guamán", "Cevallos", "Torres", "Vega"] },
  IE: { first: ["Ryan", "Eddie", "Conor", "Sean", "Rhys", "Darragh"], last: ["Murphy", "Kelly", "O'Brien", "Doyle", "Walsh", "McCarthy"] },
  CA: { first: ["Michael", "Hugo", "Derek", "Guillaume", "Pierrick", "Nickolas"], last: ["Woods", "Houle", "Boivin", "Tremblay", "Gagnon", "Roy"] },
  SE: { first: ["Erik", "Gustav", "Filip", "Oskar", "Viktor", "Anton"], last: ["Karlsson", "Andersson", "Johansson", "Lindgren", "Nilsson", "Berggren"] },
  AT: { first: ["Felix", "Lukas", "Patrick", "Michael", "Georg", "Marco"], last: ["Gschnitzer", "Steinhauser", "Mayr", "Gruber", "Huber", "Wallner"] },
  LU: { first: ["Bob", "Kevin", "Alex", "Michel", "Jean", "Laurent"], last: ["Kirchen", "Schmit", "Weber", "Wagner", "Muller", "Thill"] },
  ER: { first: ["Natnael", "Merhawi", "Amanuel", "Henok", "Metkel", "Yonas"], last: ["Berhane", "Tesfay", "Kudus", "Ghebreslassie", "Semere", "Habtu"] },
  JP: { first: ["Yuki", "Hiroshi", "Kazuki", "Ryota", "Takumi", "Sho"], last: ["Tanaka", "Suzuki", "Watanabe", "Yamamoto", "Nakamura", "Kobayashi"] },
  NZ: { first: ["Jack", "George", "Sam", "Finn", "Corbin", "Regan"], last: ["Turner", "Reid", "Anderson", "Taylor", "Mitchell", "Walker"] },
  CZ: { first: ["Jan", "Petr", "Tomáš", "Zdeněk", "Josef", "Adam"], last: ["Novák", "Svoboda", "Král", "Procházka", "Dvořák", "Horák"] },
  UA: { first: ["Mark", "Andriy", "Vitaliy", "Oleksandr", "Yuriy", "Denys"], last: ["Kravets", "Shevchenko", "Kovalenko", "Bondarenko", "Tkachenko", "Melnyk"] },
  RW: { first: ["Joseph", "Moise", "Samuel", "Eric", "Bonaventure", "Xavier"], last: ["Mugisha", "Nsengimana", "Ndayisenga", "Byukusenge", "Nkurunziza", "Habimana"] },
  ZA: { first: ["Louis", "Ryan", "Nicholas", "Stefan", "Jacques", "Daryl"], last: ["Pretorius", "Coetzee", "Oosthuizen", "Botha", "Nel", "Venter"] },
};
function randomNameForNation(nationCode) {
  const pool = NATION_NAMES[nationCode] || NATION_NAMES.FR;
  return `${pick(pool.first)} ${pick(pool.last)}`;
}

/* ============================== UTILS ============================== */
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));
// clamp() arrondit à l'entier — parfait pour les stats 0-100 (forme, fatigue...), mais dangereux pour un
// multiplicateur décimal (ex : fatigueReduction 0.4-1) où l'arrondi peut faire sauter la valeur à 0 ou 1.
// clamp01 borne SANS arrondir : à utiliser pour tout multiplicateur/valeur fractionnaire.
const clamp01 = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ============================================================================
   SkillEngine — moteur d'effets de compétences.
   ============================================================================
   Personne d'autre dans le code ne doit lire SKILL_TREE_CONFIG directement :
   tout passe par SkillEngine. Pour ajouter un talent plus tard, il suffit de
   l'enregistrer dans SKILL_TREE_CONFIG — aucune autre partie du moteur n'a
   besoin de changer, tant que son effet utilise un type déjà supporté ici.
   ============================================================================ */
const SkillEngine = (() => {
  // Catalogue complet : toutes les compétences de tous les arbres, aplaties, avec leur catégorie.
  function catalog() {
    const list = [];
    Object.entries(SKILL_TREE_CONFIG.trees).forEach(([treeId, tree]) => {
      tree.skills.forEach((s) => list.push({ ...s, category: "tree", treeId }));
    });
    Object.entries(SKILL_TREE_CONFIG.specialisation).forEach(([spec, skills]) => {
      skills.forEach((s) => list.push({ ...s, category: "specialisation", treeId: spec }));
    });
    SKILL_TREE_CONFIG.transversal.forEach((s) => list.push({ ...s, category: "transversal" }));
    SKILL_TREE_CONFIG.talents.forEach((s) => list.push({ ...s, category: "talent" }));
    SKILL_TREE_CONFIG.philosophies.forEach((s) => list.push({ ...s, category: "philosophie" }));
    return list;
  }
  const findSkill = (id) => catalog().find((s) => s.id === id);

  function unlockedDefs(player) {
    const ids = player?.unlockedSkills || [];
    return ids.map(findSkill).filter(Boolean);
  }
  function hasSkill(player, id) { return !!(player?.unlockedSkills || []).includes(id); }

  // Somme tous les effets d'un type donné (avec filtre optionnel) parmi les compétences débloquées.
  function sumEffect(player, type, filter) {
    let total = 0;
    unlockedDefs(player).forEach((skill) => {
      (skill.effects || []).forEach((e) => {
        if (e.type !== type) return;
        if (filter && !filter(e)) return;
        total += e.value || 0;
      });
    });
    return total;
  }

  // Bonus de spécialité (physique + spécialisation) appliqué en direct dans performanceScore.
  function specialtyBonus(player, specKey) {
    const direct = sumEffect(player, "specialtyBonus", (e) => e.key === specKey);
    const all = sumEffect(player, "allSpecialtyBonus");
    return direct + all;
  }
  function fatigueResist(player) { return sumEffect(player, "fatigueResist"); }
  function formeRecovery(player) { return sumEffect(player, "formeRecovery"); }
  function craquageResist(player) { return sumEffect(player, "craquageResist"); }
  function finalStageBonus(player) { return sumEffect(player, "finalStageBonus"); }
  function noiseReduction(player) { return Math.min(20, sumEffect(player, "noiseReduction")); } // plafonné : jamais 100% déterministe
  function reputationDimBonus(player, dim) { return sumEffect(player, "reputationDimBonus", (e) => e.dim === dim); }
  function moneyMultiplier(player) { return 1 + sumEffect(player, "moneyBonus"); }
  function teammatesBonus(player) { return sumEffect(player, "teammatesBonus"); }
  function relationEquipeBonus(player) { return sumEffect(player, "relationEquipeBonus"); }
  function ethiqueShield(player) { return Math.min(0.8, sumEffect(player, "ethiqueShield")); } // 0 à 0.8 : amortit les pertes de réputation
  function contextBonus(player, context) { return sumEffect(player, "contextBonus", (e) => e.context === context); }
  function hasUnlockedChoice(player, key) { return unlockedDefs(player).some((s) => (s.effects || []).some((e) => e.type === "unlockChoice" && e.key === key)); }
  function hasUnlockedEvent(player, key) { return unlockedDefs(player).some((s) => (s.effects || []).some((e) => e.type === "unlockEvent" && e.key === key)); }

  // Vérifie qu'une compétence n'entre pas en conflit avec une philosophie déjà choisie dans la même paire exclusive.
  function isExclusiveLocked(player, skillId) {
    const target = findSkill(skillId);
    if (!target || !target.pair) return false;
    return (player?.unlockedSkills || []).some((id) => {
      const other = findSkill(id);
      return other && other.pair === target.pair && other.id !== skillId;
    });
  }

  // Une compétence avancée (tier 2) d'un arbre nécessite d'avoir débloqué plus de la moitié des
  // compétences de base (tier 1) de CE MÊME arbre. Ne s'applique qu'aux arbres à hiérarchie
  // (physique/mental/tactique/carrière/spécialisation) — pas aux talents/philosophies, qui n'ont pas de palier de base.
  function baseSkillsProgress(player, skill) {
    if (skill.tier !== 2 || (skill.category !== "tree" && skill.category !== "specialisation")) return null;
    const baseSkills = catalog().filter((s) => s.treeId === skill.treeId && s.category === skill.category && s.tier !== 2);
    if (baseSkills.length === 0) return null;
    const unlockedCount = baseSkills.filter((s) => hasSkill(player, s.id)).length;
    return { unlockedCount, total: baseSkills.length, met: unlockedCount > baseSkills.length / 2 };
  }

  function canUnlock(game, skillId) {
    const player = game.player;
    const skill = findSkill(skillId);
    if (!skill) return { ok: false, reason: "Compétence inconnue." };
    if (hasSkill(player, skillId)) return { ok: false, reason: "Déjà débloquée." };
    if ((player.skillPoints || 0) < skill.cost) return { ok: false, reason: "Pas assez de points." };
    if (isExclusiveLocked(player, skillId)) return { ok: false, reason: "Incompatible avec un choix déjà fait." };
    const progress = baseSkillsProgress(player, skill);
    if (progress && !progress.met) return { ok: false, reason: `Débloque d'abord plus de la moitié des compétences de base (${progress.unlockedCount}/${progress.total}).` };
    return { ok: true, skill };
  }

  // Débloque une compétence : déduit les points, enregistre l'id, initialise les charges de talent si besoin.
  // Ne mute rien en place — renvoie un nouvel objet game, dans l'esprit du reste du moteur.
  function unlock(game, skillId) {
    const { ok, skill } = canUnlock(game, skillId);
    if (!ok) return game;
    const player = { ...game.player, skillPoints: game.player.skillPoints - skill.cost, unlockedSkills: [...game.player.unlockedSkills, skillId] };
    let talentCharges = { ...(game.talentCharges || {}) };
    (skill.effects || []).forEach((e) => { if (e.type === "talentCharge") talentCharges[e.key] = true; });
    return { ...game, player, talentCharges };
  }

  // Choix tactiques supplémentaires débloqués par l'arbre Tactique/Spécialisation, ajoutés aux étapes
  // NON finales des courses (voir le rendu de la vue "story"). tacticalBonus est reporté sur l'étape
  // d'arrivée via game.tacticalBonus (consommé par performanceScore).
  function getExtraTacticalChoices(game, role) {
    const player = game.player;
    const choices = [];
    // Rôle d'équipier : des choix explicites qui rendent concret le fait de rouler pour quelqu'un d'autre,
    // plutôt qu'un menu tactique identique quel que soit le rôle du jour.
    if (role === RACE_ROLES.DOMESTIQUE) {
      choices.push({ label: "Aller chercher les bidons au véhicule technique", resolve: () => ({ text: "Tu fais l'aller-retour jusqu'à la voiture technique pour ravitailler l'équipe — un service discret mais essentiel.", delta: { fatigue: 4, relationEquipe: 3, teammatesDelta: { moral: 2 } } }) });
      choices.push({ label: "Emmener ton leader jusqu'au pied de la difficulté", resolve: () => ({ text: "Tu roules à un rythme soutenu en tête de peloton pour amener ton leader dans les meilleures conditions possibles — au prix de tes propres jambes.", delta: { fatigue: 7, relationEquipe: 5, teammatesDelta: { moral: 3 } } }) });
    }
    if (hasUnlockedChoice(player, "contre_attaquer")) {
      choices.push({ label: "Contre-attaquer immédiatement", resolve: () => ({ text: "Tu lis la course et places une contre-attaque immédiate.", delta: { fatigue: 5, tacticalBonus: 6 } }) });
    }
    if (hasUnlockedChoice(player, "suivre_rival")) {
      choices.push({ label: "Suivre uniquement le rival", resolve: (g) => ({ text: `Tu colles à la roue de ${getRival(g)?.name || "ton rival"}, sans te préoccuper du reste.`, delta: { fatigue: 2, tacticalBonus: 4, rival: { haine: 4 } } }) });
    }
    if (hasUnlockedChoice(player, "demander_relais")) {
      choices.push({ label: "Demander un relais à un équipier", resolve: () => ({ text: "Un équipier vient te protéger du vent et t'économise un maximum d'énergie.", delta: { fatigue: -6, tacticalBonus: 2, teammatesDelta: { moral: 2 } } }) });
    }
    if (hasUnlockedChoice(player, "attendre_dernier_col") && !player.flags?.savedForFinalClimb) {
      choices.push({ label: "Attendre le dernier col", resolve: () => ({ text: "Tu te contiens, économe, en réservant tes forces pour l'ascension finale.", delta: { fatigue: -3, tacticalBonus: 2, flags: { savedForFinalClimb: true } } }) });
    }
    if (hasUnlockedChoice(player, "tout_pour_le_tout")) {
      choices.push({ label: "Jouer le tout pour le tout", resolve: () => {
          const success = Math.random() < 0.5;
          return success
            ? { text: "Le pari est payant : ton explosivité surprend tout le monde !", delta: { fatigue: 6, tacticalBonus: 14 } }
            : { text: "Le pari échoue : tu as grillé tes cartouches trop tôt.", delta: { fatigue: 8, tacticalBonus: -6 } };
        } });
    }
    if (game.talentCharges?.attaquant_surprise) {
      choices.push({ label: "🔥 Attaque surprise (une fois par course)", resolve: () => ({ text: "Personne ne t'attendait là ! Tu surprends tout le monde par une attaque totalement inattendue.", delta: { fatigue: 8, tacticalBonus: 16, consumeTalentCharge: "attaquant_surprise" } }) });
    }
    if (game.talentCharges?.instinct_correction) {
      choices.push({ label: "🧠 Instinct : corriger la trajectoire (une fois par course)", resolve: () => ({ text: "Ton instinct te fait dévier légèrement de ta trajectoire — juste assez pour éviter l'erreur que tu sentais venir.", delta: { fatigue: 1, tacticalBonus: 5, consumeTalentCharge: "instinct_correction" } }) });
    }
    return choices;
  }

  // Narration de déblocage : les talents/philosophies ont leur propre texte (voir SKILL_TREE_CONFIG),
  // les autres compétences reçoivent une narration générée automatiquement — pour que chaque déblocage
  // ait son mot, sans avoir à écrire un texte pour les 60+ compétences des arbres.
  const NARRATIVE_OPENERS = {
    tree: ["Après plusieurs semaines de travail spécifique, ton staff technique le confirme :", "Séance après séance, ça a fini par payer :", "Ton corps a fini par s'adapter :", "Ce n'est plus un hasard, c'est devenu une qualité :"],
    specialisation: ["Ton profil s'affine encore un peu plus.", "Ton style de course évolue naturellement dans cette direction.", "C'est exactement le terrain où tu progresses le plus vite.", "Une évolution logique, vu ton profil."],
    transversal: ["Une corde de plus à ton arc, utile quel que soit ton profil.", "Tu élargis ton registre, au-delà de ta spécialité de départ."],
  };
  function getUnlockNarrative(skill) {
    if (skill.narrative) return skill.narrative;
    const openers = NARRATIVE_OPENERS[skill.category] || NARRATIVE_OPENERS.tree;
    return `${pick(openers)} tu maîtrises désormais « ${skill.label} ».`;
  }

  // Niveau de maîtrise d'un arbre : dérivé du nombre de compétences déjà débloquées dans cet arbre
  // (aucune nouvelle statistique — juste une lecture de player.unlockedSkills déjà existant).
  const MASTERY_LEVELS = ["Niveau I", "Niveau II", "Niveau III", "Niveau IV", "Maître"];
  function getMasteryLevel(player, treeId) {
    const total = catalog().filter((s) => s.treeId === treeId).length;
    const unlockedCount = catalog().filter((s) => s.treeId === treeId && hasSkill(player, s.id)).length;
    if (unlockedCount === 0) return null;
    const idx = Math.min(MASTERY_LEVELS.length - 1, Math.floor((unlockedCount / Math.max(1, total)) * MASTERY_LEVELS.length));
    return { label: MASTERY_LEVELS[idx], unlockedCount, total };
  }

  // Titre automatique du coureur — purement dérivé de son âge, son palmarès et sa réputation.
  // Aucune stat nouvelle : tout est déjà disponible sur l'objet joueur.
  function computeTitle(player) {
    const wins = (player.palmares || []).filter((p) => /Victoire|Classement général|Championnats du Monde/.test(p.label)).length;
    const rep = player.reputation?.peloton || 0;
    if (wins >= 10 || rep >= 90) return "Légende";
    if (wins >= 5 || rep >= 70) return "Champion";
    if (wins >= 2 || rep >= 50 || player.role === "leader") return "Leader";
    if (rep >= 25 || player.age >= 24) return "Professionnel";
    if (player.age >= 20) return "Espoir";
    return "Novice";
  }

  // Style de carrière émergent — calculé en direct, jamais choisi ni stocké.
  function getCareerStyle(game) {
    const player = game.player;
    const ctx = { palmares: player.palmares || [], specialtyPrimary: player.specialtyPrimary, hasSkill: (id) => hasSkill(player, id) };
    const match = SKILL_TREE_CONFIG.careerStyles.find((s) => { try { return s.check(ctx); } catch { return false; } });
    return match || null;
  }

  return {
    catalog, findSkill, hasSkill, unlockedDefs, canUnlock, unlock, isExclusiveLocked,
    specialtyBonus, fatigueResist, formeRecovery, craquageResist, finalStageBonus, noiseReduction,
    reputationDimBonus, moneyMultiplier, teammatesBonus, relationEquipeBonus, ethiqueShield, contextBonus,
    hasUnlockedChoice, hasUnlockedEvent, getExtraTacticalChoices, getCareerStyle,
    getUnlockNarrative, getMasteryLevel, computeTitle, baseSkillsProgress,
  };
})();

/* ============================== SYSTÈME D'ÉQUIPES ============================== */
// Noms fictifs, mais construits sur les mêmes codes que le vrai peloton (sponsor + territoire + "Racing"/"Cycling")
// pour que le joueur s'y retrouve, sans reproduire de marques réelles.
const TEAM_LEVELS = { WT: "WorldTour", PT: "ProTeam", CT: "Continentale" };

const DIRECTOR_FIRST = ["Bernard", "Patrick", "Rik", "Marc", "Frank", "Gianni", "Xavier", "Erik", "Peter", "Luc"];
const DIRECTOR_LAST = ["Lemoine", "Verhoeven", "Bertolotti", "Delcroix", "Hansen", "Moreau", "Castellani", "Roux", "Van Hooren", "Sorensen"];

const OBJECTIVES = {
  [TEAM_LEVELS.WT]: ["Viser le Top 5 du Tour de France", "Dominer les Monuments printaniers", "Décrocher le maillot arc-en-ciel", "Aligner les victoires d'étape sur les trois grands tours"],
  [TEAM_LEVELS.PT]: ["Décrocher une invitation en grand tour", "S'imposer sur les classiques de deuxième niveau", "Faire éclore un noyau de jeunes talents"],
  [TEAM_LEVELS.CT]: ["Se faire remarquer sur le circuit national", "Décrocher une place en ProTeam d'ici deux ans", "Représenter fièrement les couleurs régionales"],
};

// La philosophie d'une équipe influence son discours (DS), ses objectifs de course, et le profil de coureurs
// qu'elle recherche. Déterministe par équipe (pas de hasard), pour rester stable d'une partie à l'autre.
const TEAM_PHILOSOPHIES = {
  grands_tours: { label: "Grands Tours", desc: "Toute la saison est construite autour des trois grands tours.", favors: ["grimpeur", "rouleur", "polyvalent"] },
  classiques: { label: "Classiques", desc: "Le printemps et les pavés sont sacrés ici.", favors: ["puncheur", "rouleur", "polyvalent"] },
  sprint: { label: "Sprinteurs", desc: "L'équipe vit pour les arrivées massives et le maillot vert.", favors: ["sprinteur", "puncheur"] },
  jeunes: { label: "Jeunes talents", desc: "Un projet de développement, patient, tourné vers l'avenir.", favors: ["grimpeur", "puncheur", "sprinteur", "rouleur", "polyvalent"] },
  opportuniste: { label: "Opportuniste", desc: "Pas de plan figé : l'équipe saisit ce qui se présente, échappée ou sprint.", favors: ["puncheur", "polyvalent"] },
};
const PHILOSOPHY_IDS = Object.keys(TEAM_PHILOSOPHIES);

// Bornes par niveau. L'écart entre le haut et le bas de chaque fourchette reste volontairement modéré :
// le budget hiérarchise les équipes "sur le papier", mais ne doit jamais garantir un résultat en course
// (voir performanceScore : le poids réel de equipmentQuality est faible face à la forme, la spécialité et l'aléatoire).
const TEAM_RANGES = {
  [TEAM_LEVELS.WT]: { budget: [14000000, 45000000], reputation: [62, 92], trainingQuality: [68, 92], equipmentQuality: [70, 90], roster: 28 },
  [TEAM_LEVELS.PT]: { budget: [2500000, 8500000], reputation: [42, 64], trainingQuality: [52, 70], equipmentQuality: [52, 70], roster: 22 },
  [TEAM_LEVELS.CT]: { budget: [350000, 2000000], reputation: [22, 42], trainingQuality: [35, 52], equipmentQuality: [35, 52], roster: 16 },
};

// Interpolation linéaire déterministe : rank=1 -> la plus grosse équipe du niveau (valeurs hautes),
// rank=total -> la plus modeste (valeurs basses). Aucun hasard : les mêmes équipes ont toujours les mêmes stats.
function scaleByRank(min, max, rank, total) {
  if (total <= 1) return Math.round((min + max) / 2);
  const t = (rank - 1) / (total - 1); // 0 pour la plus grosse, 1 pour la plus petite
  return Math.round(max - (max - min) * t);
}

function buildTeam(name, level, country, rank, total) {
  const r = TEAM_RANGES[level];
  const idx = rank - 1;
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name, level, country, rank,
    budget: scaleByRank(r.budget[0], r.budget[1], rank, total),
    sponsor: name.split(" ")[0],
    director: `${DIRECTOR_FIRST[idx % DIRECTOR_FIRST.length]} ${DIRECTOR_LAST[(idx * 3) % DIRECTOR_LAST.length]}`,
    objective: OBJECTIVES[level][idx % OBJECTIVES[level].length],
    philosophy: PHILOSOPHY_IDS[idx % PHILOSOPHY_IDS.length],
    roster: r.roster,
    reputation: scaleByRank(r.reputation[0], r.reputation[1], rank, total),
    trainingQuality: scaleByRank(r.trainingQuality[0], r.trainingQuality[1], rank, total),
    equipmentQuality: scaleByRank(r.equipmentQuality[0], r.equipmentQuality[1], rank, total),
  };
}

function buildTeamRoster(list, level) {
  return list.map(([name, country], i) => buildTeam(name, level, country, i + 1, list.length));
}

// 18 équipes WorldTour, classées de la plus grosse (rang 1) à la plus modeste (rang 18)
const TEAMS_WT = buildTeamRoster([
  ["Falcon Emirates Racing", "AE"], ["Lease Nordic Cycling", "NL"], ["Steel Grenadiers Racing", "GB"],
  ["Alloy Masters Racing", "BE"], ["Gulf Victory Cycling", "BH"], ["Alpine Bank Racing", "FR"],
  ["Petrol Dynamics Cycling", "FR"], ["Creditline Racing", "FR"], ["Startup Nation Cycling", "IL"],
  ["Telecom Iberia Racing", "ES"], ["Campus Education Racing", "US"], ["Steppe Riders Cycling", "KZ"],
  ["Grocery Trail Racing", "US"], ["Sportswear Mutual Cycling", "FR"], ["Breton Hotels Racing", "FR"],
  ["Market Wanty Cycling", "BE"], ["Fuel Nordic Racing", "NO"], ["Red Bull Alpine Cycling", "AT"],
], TEAM_LEVELS.WT);

// 18 équipes ProTeam, classées de même
const TEAMS_PT = buildTeamRoster([
  ["Terra Rossa Racing", "IT"], ["Nordic Development Team", "SE"], ["Iberia Continental Cycling", "ES"],
  ["Rhône Valley Racing", "FR"], ["Flanders Rising Cycling", "BE"], ["Balkan Express Racing", "SI"],
  ["Andean Condor Cycling", "CO"], ["Baltic Wind Racing", "LT"], ["Tuscan Hills Cycling", "IT"],
  ["Rhineland Racing Team", "DE"], ["Southern Cross Cycling", "AU"], ["Pyrénées Sprint Racing", "FR"],
  ["North Sea Racing Team", "NL"], ["Adriatic Coast Cycling", "HR"], ["Highland Racing Collective", "GB"],
  ["Douro Valley Cycling", "PT"], ["Carpathian Racing Team", "RO"], ["Fjord Racing Development", "NO"],
], TEAM_LEVELS.PT);

// Continentales (structures modestes, tremplin vers le monde pro)
const TEAMS_CT = buildTeamRoster([
  ["Vélo Dynamo Continental", "FR"], ["Casa Toscana Amateur Team", "IT"], ["Lowlands Junior Racing", "NL"],
  ["Sierra Nevada Espoirs", "ES"], ["Ardennes Développement", "BE"], ["Aegean Coast Cycling Club", "GR"],
], TEAM_LEVELS.CT);

function pickTeams(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/* ============================================================================
   ÉQUIPES VIVANTES — les 42 équipes générées (pas seulement la tienne) évoluent chaque
   saison, indépendamment du joueur : DS qui change, sponsor qui part, philosophie qui
   bascule, promotion/relégation entre niveaux. Rien n'est stocké en dur dans TEAMS_WT/PT/CT
   (jamais mutées) — tout vit dans game.teamsState, un override léger fusionné à la demande.
   ============================================================================ */
const ALL_TEAMS = [...TEAMS_WT, ...TEAMS_PT, ...TEAMS_CT];
const TEAM_LEVEL_RANK = { [TEAM_LEVELS.CT]: 0, [TEAM_LEVELS.PT]: 1, [TEAM_LEVELS.WT]: 2 };
const SPONSOR_PREFIXES = ["Groupe", "Banque", "Assurances", "Énergie", "Telecom", "Voyages", "Immobilier", "Fondation"];
const SPONSOR_SUFFIXES = ["Horizon", "Alliance", "Nova", "Pinnacle", "Meridian", "Atlas", "Vantage", "Solstice"];

// Fusionne une équipe de base avec son évolution accumulée au fil des saisons.
function resolveTeam(game, baseTeam) {
  const override = game.teamsState?.[baseTeam.id];
  if (!override) return baseTeam;
  return { ...baseTeam, ...override, level: override.level || baseTeam.level };
}

// Le "leader" d'une équipe n'est pas stocké : c'est simplement le coureur du peloton généré au plus haut
// niveau qui appartient à cette équipe — dérivé à la volée, pas une donnée de plus à maintenir.
function teamLeader(game, team) {
  const roster = (game.peloton || []).filter((r) => r.team?.id === team.id);
  if (roster.length === 0) return null;
  return [...roster].sort((a, b) => b.level - a.level)[0];
}

// Fait évoluer TOUTES les équipes d'une saison à l'autre, joueur ou pas. Retourne le nouvel état
// (game.teamsState) et des dépêches pour le fil de News.
function simulateTeamsEvolution(game) {
  const teamsState = { ...(game.teamsState || {}) };
  const headlines = [];

  ALL_TEAMS.forEach((base) => {
    const current = resolveTeam(game, base);
    let next = { ...(teamsState[base.id] || {}) };

    if (Math.random() < 0.08) {
      const idx = Math.floor(Math.random() * DIRECTOR_FIRST.length);
      next.director = `${DIRECTOR_FIRST[idx]} ${DIRECTOR_LAST[(idx * 3) % DIRECTOR_LAST.length]}`;
      headlines.push(`${current.name} annonce l'arrivée de ${next.director} comme nouveau directeur sportif.`);
    }
    if (Math.random() < 0.05) {
      const newSponsor = `${pick(SPONSOR_PREFIXES)} ${pick(SPONSOR_SUFFIXES)}`;
      next.sponsor = newSponsor;
      next.name = `${newSponsor} Racing`;
      headlines.push(`${current.name} change de nom : place à ${next.name}, porté par un nouveau sponsor titre.`);
    }
    if (Math.random() < 0.05) {
      const otherPhilosophies = PHILOSOPHY_IDS.filter((p) => p !== current.philosophy);
      next.philosophy = pick(otherPhilosophies);
      headlines.push(`${current.name} annonce un virage stratégique vers une philosophie ${TEAM_PHILOSOPHIES[next.philosophy].label.toLowerCase()}.`);
    }

    // Dérive lente de budget/réputation — montée ou descente d'ambition d'une saison à l'autre.
    // Volontairement centrée sur zéro en moyenne, pour que promotions et relégations s'équilibrent
    // sur longue durée plutôt que de gonfler indéfiniment le nombre d'équipes WorldTour.
    const repDrift = rand(-7, 7);
    const budgetDrift = 1 + rand(-8, 10) / 100;
    next.reputation = clamp((current.reputation || 50) + repDrift);
    next.budget = Math.max(200000, Math.round((current.budget || 1000000) * budgetDrift));

    // Montée/descente de niveau, selon la réputation atteinte — la vraie rejouabilité vient d'ici :
    // une équipe modeste peut devenir WorldTour, une grosse structure peut s'effondrer.
    if (current.level !== TEAM_LEVELS.WT && next.reputation >= 78 && Math.random() < 0.15) {
      next.level = current.level === TEAM_LEVELS.CT ? TEAM_LEVELS.PT : TEAM_LEVELS.WT;
      next.equipmentQuality = clamp((current.equipmentQuality || 50) + 15);
      next.trainingQuality = clamp((current.trainingQuality || 50) + 15);
      next.roster = TEAM_RANGES[next.level].roster;
      headlines.push(`${current.name} obtient sa promotion en ${next.level} — une saison référence pour cette structure.`);
    } else if (current.level !== TEAM_LEVELS.CT && next.reputation <= 22 && Math.random() < 0.12) {
      next.level = current.level === TEAM_LEVELS.WT ? TEAM_LEVELS.PT : TEAM_LEVELS.CT;
      next.equipmentQuality = clamp((current.equipmentQuality || 50) - 15);
      next.trainingQuality = clamp((current.trainingQuality || 50) - 15);
      next.roster = TEAM_RANGES[next.level].roster;
      headlines.push(`${current.name} rétrograde en ${next.level} après une saison difficile.`);
    }

    // Si l'équipe n'a plus de figure de proue identifiable dans le peloton généré, ça se sait.
    if (!teamLeader(game, current) && Math.random() < 0.1) {
      headlines.push(`${current.name} cherche un nouveau leader après une saison sans figure de proue.`);
    }

    teamsState[base.id] = next;
  });

  return { teamsState, headlines };
}


let riderIdCounter = 0;
function nextRiderId() { riderIdCounter += 1; return `rider_${riderIdCounter}_${Math.random().toString(36).slice(2, 6)}`; }

function teamPoolForLevel(level) {
  if (level >= 78) return TEAMS_WT;
  if (level >= 52) return TEAMS_PT;
  return TEAMS_CT;
}

function generatePeloton(count = 30) {
  const peloton = [];
  for (let i = 0; i < count; i++) {
    const level = rand(48, 92);
    const nation = pick(NATIONS);
    peloton.push({
      id: nextRiderId(),
      name: randomNameForNation(nation.code),
      nation: nation.code,
      spec: SPEC_IDS[i % SPEC_IDS.length],
      level,
      age: rand(19, 34),
      team: pick(teamPoolForLevel(level)),
      points: 0,
    });
  }
  return peloton;
}

function generateTeammates() {
  return [
    { name: "Julien Faure", role: "Poisson-pilote", loyaute: 85, moral: 75, spec: "sprinteur", level: 66, age: 27 },
    { name: "Marc Keller", role: "Capitaine de route", loyaute: 90, moral: 80, spec: "rouleur", level: 79, age: 31 },
    { name: "Santi Ibáñez", role: "Grimpeur dévoué", loyaute: 70, moral: 65, spec: "grimpeur", level: 71, age: 26 },
    { name: "Lukas Weber", role: "Baroudeur", loyaute: 75, moral: 70, spec: "puncheur", level: 64, age: 28 },
    { name: "Antoine Petit", role: "Jeune espoir", loyaute: 80, moral: 85, spec: "polyvalent", level: 58, age: 20 },
    { name: "Diego Fontana", role: "Co-leader ambitieux", loyaute: 60, moral: 72, spec: "grimpeur", level: 76, age: 29 },
  ];
}

/* ============================== PELOTON VIVANT ============================== */
// Chaque saison, tout le peloton généré évolue : vieillit, progresse ou régresse selon l'âge,
// change parfois d'équipe, prend sa retraite en fin de carrière — remplacé par de jeunes talents.

// Courbe de performance liée à l'âge : progression nette chez les jeunes, pic vers 26-28 ans, déclin après 32 ans.
function evolveRiderLevel(level, age) {
  let delta;
  if (age <= 23) delta = rand(2, 8);
  else if (age <= 28) delta = rand(-2, 5);
  else if (age <= 32) delta = rand(-4, 2);
  else delta = rand(-8, -1);
  return clamp(level + delta, 30, 99);
}

function retirementChance(level, age) {
  if (age >= 39) return 1; // retraite forcée
  if (age >= 34) return 0.15 + Math.max(0, (55 - level)) * 0.01;
  if (age >= 31 && level < 45) return 0.08;
  return 0;
}

function generateYoungRider() {
  const level = rand(48, 68);
  return {
    id: nextRiderId(),
    name: randomNameForNation(pick(NATIONS).code),
    spec: pick(SPEC_IDS),
    level,
    age: rand(18, 21),
    team: pick(level >= 60 ? TEAMS_PT : TEAMS_CT), // les jeunes débutent rarement directement en WorldTour
    points: 0,
  };
}

// Fait vieillir/évoluer tout le peloton d'une saison. Retourne le nouveau peloton + un résumé narratif.
// Le classement UCI (points) redémarre à zéro chaque saison, comme un vrai classement annuel.
function simulateSeason(peloton) {
  const survivors = [];
  const retirees = [];
  const transfers = [];

  peloton.forEach((rider) => {
    const newAge = rider.age + 1;
    if (Math.random() < retirementChance(rider.level, newAge)) {
      retirees.push(rider);
      return;
    }
    const newLevel = evolveRiderLevel(rider.level, newAge);
    let newTeam = rider.team;
    if (Math.random() < 0.15) {
      const candidate = pick(teamPoolForLevel(newLevel));
      if (!rider.team || candidate.name !== rider.team.name) {
        transfers.push({ name: rider.name, nation: rider.nation, from: rider.team?.name, to: candidate.name });
        newTeam = candidate;
      }
    }
    survivors.push({ ...rider, age: newAge, level: newLevel, team: newTeam, points: 0 });
  });

  // Remplace chaque retraité par un jeune talent, pour garder un peloton vivant de taille stable.
  const newcomers = retirees.map(() => generateYoungRider());

  return {
    peloton: [...survivors, ...newcomers],
    summary: { retirees, newcomers, transfers },
  };
}

// Le rival N'EST PLUS un objet séparé : c'est un coureur normal du tableau `peloton`, référencé par `rivalId`.
// Il vieillit, progresse/régresse, change d'équipe et prend sa retraite exactement comme les autres,
// via simulateSeason() — aucune logique dupliquée. Seule sa relation avec le joueur (haine/respect) est
// stockée à part, car ce n'est pas un attribut du coureur lui-même mais de la rivalité.
// getRival() renvoie un objet fusionné (données du coureur + relation) pour rester un remplacement direct
// de l'ancien game.rival partout ailleurs dans le code.
function getRival(game) {
  const rider = (game.peloton || []).find((r) => r.id === game.rivalId);
  if (!rider) return null;
  const relation = game.rivalRelation || { haine: 25, respect: 30 };
  return { ...rider, haine: relation.haine, respect: relation.respect };
}

// Le monde a une mémoire : à partir de game.worldHistory (voir plus bas), génère une phrase de contexte
// quand quelqu'un — toi, ton rival, ou un inconnu — a déjà gagné cette course par le passé.
// Le tenant du titre est toujours nommé (même un inconnu du peloton), et le rival/le joueur sont mentionnés
// en plus s'ils ont déjà gagné cette course sans en être l'actuel tenant — pour un fil narratif plus concret.
// Ex : "Tu défends ton titre à Paris-Roubaix." / "Ricci vise un troisième Tour."
// / "Foster, vainqueur l'an dernier, sera présent. Ricci, 2 fois vainqueur ici par le passé, sera aussi dans le coup."
function raceContextLine(game, raceName) {
  const wh = game.worldHistory || {};
  const years = Object.keys(wh).map(Number).sort((a, b) => a - b);
  if (years.length === 0) return "";

  // Décompte des victoires de chacun sur cette course précise, toutes années confondues.
  const winsById = {};
  years.forEach((y) => {
    const w = wh[y]?.[raceName];
    if (w) { if (!winsById[w.id]) winsById[w.id] = { name: w.name, count: 0 }; winsById[w.id].count += 1; }
  });

  const lastYear = years[years.length - 1];
  const lastWinner = wh[lastYear]?.[raceName];
  if (!lastWinner) return "";

  const rival = getRival(game);
  const champCount = winsById[lastWinner.id]?.count || 1;
  const nth = (n) => (n === 2 ? "un deuxième" : n === 3 ? "un troisième" : n >= 4 ? `un ${n}e` : null);

  let line;
  if (lastWinner.id === "player") {
    line = champCount > 1 ? ` Tu vises ${nth(champCount)} sacre à ${raceName}.` : ` Tu défends ton titre à ${raceName}.`;
  } else if (rival && lastWinner.id === rival.id) {
    line = champCount > 1 ? ` ${rival.name} vise ${nth(champCount)} succès à ${raceName}.` : ` ${rival.name}, tenant du titre, sera présent.`;
  } else {
    // Toujours nommer le tenant du titre, même si ce n'est ni toi ni ton rival.
    line = ` ${lastWinner.name}, vainqueur l'an dernier, sera présent.`;
  }

  // Réalisme en plus : si le rival n'est pas l'actuel tenant du titre mais a déjà gagné cette course
  // par le passé, on le rappelle quand même.
  if (rival && lastWinner.id !== rival.id && winsById[rival.id]) {
    const rc = winsById[rival.id].count;
    line += rc > 1 ? ` ${rival.name}, ${rc} fois vainqueur ici par le passé, sera aussi dans le coup.` : ` ${rival.name}, déjà vainqueur ici par le passé, sera aussi dans le coup.`;
  }
  // Idem pour toi, si tu n'es pas l'actuel tenant du titre mais l'as déjà emporté par le passé.
  if (lastWinner.id !== "player" && winsById["player"]) {
    const pc = winsById["player"].count;
    line += pc > 1 ? ` Toi aussi, ${pc} fois vainqueur ici, tu sais ce qu'il faut faire.` : ` Toi aussi, déjà vainqueur ici, tu sais ce qu'il faut faire.`;
  }

  return line;
}

// Si le rival fait partie des retraités de la saison (ou a disparu pour une autre raison), désigne un
// successeur parmi le nouveau peloton — de préférence dans la même spécialité que le joueur.
function pickNewRivalId(newPeloton, player) {
  const candidates = newPeloton.filter((r) => r.spec === player.specialtyPrimary);
  const successor = pick(candidates.length > 0 ? candidates : newPeloton);
  return successor.id;
}

// Transforme les données brutes de simulation (retraites/transferts/jeunes talents) en vraies dépêches,
// façon fil d'actu cyclisme. C'est la seule "mise en scène" ajoutée — toutes les données existaient déjà.
const RETIREMENT_HEADLINES = [
  (r) => `${flagFor(r.nation)} ${r.name} (${r.team?.name || "sans équipe"}) prend sa retraite après ${r.age} ans de carrière.`,
  (r) => `Fin de carrière pour ${flagFor(r.nation)} ${r.name}, qui raccroche le vélo à ${r.age} ans.`,
  (r) => `${flagFor(r.nation)} ${r.name} annonce se retirer du peloton professionnel.`,
];
const TRANSFER_HEADLINES = [
  (t) => `${flagFor(t.nation)} ${t.name} quitte ${t.from || "sa précédente équipe"} et rejoint ${t.to}.`,
  (t) => `Mercato : ${flagFor(t.nation)} ${t.name} rejoint ${t.to}.`,
  (t) => `${flagFor(t.nation)} ${t.name} change de couleurs et s'engage avec ${t.to}.`,
];
const NEWCOMER_HEADLINES = [
  (n) => `Le jeune ${flagFor(n.nation)} ${n.name} (${n.age} ans) signe chez ${n.team?.name}.`,
  (n) => `Nouveau venu dans le peloton : ${flagFor(n.nation)} ${n.name} rejoint ${n.team?.name}.`,
  (n) => `${flagFor(n.nation)} ${n.name}, ${n.age} ans, débute chez ${n.team?.name}.`,
];

// Statut de favori : dérivé du palmarès récent et de la réputation médiatique déjà suivis — pas une nouvelle
// jauge de "pression", juste une lecture de situation qui alimente les médias et un incident de course dédié.
function isFavoriteContext(player) {
  const recentWins = (player.palmares || []).slice(-4).filter((p) => /Victoire|Classement général|Championnats du Monde/.test(p.label)).length;
  return recentWins >= 2 && (player.reputation?.medias || 0) >= 55;
}

/* ============================================================================
   PRESSURE ENGINE — pas une nouvelle jauge stockée, mais une VALEUR CALCULÉE à la volée
   (même famille que computeFraicheur/isOvertrained), qui agrège des facteurs déjà suivis
   ailleurs et vient réellement influencer plusieurs systèmes : performance dans les moments
   décisifs, déclenchement d'incidents narratifs, et ton médiatique.
   ============================================================================ */
// Renvoie un score 0-100. Rien n'est persisté : computePressure() peut être appelée à tout moment,
// pour n'importe quelle course, sans effet de bord.
function computePressure(game, raceName) {
  const player = game.player;
  const meta = CALENDAR_META[raceName] || {};
  let pressure = 0;

  pressure += (player.reputation.medias || 0) * 0.25; // médiatisation
  if (isFavoriteContext(player)) pressure += 18; // statut de favori
  pressure += (meta.prestige || 50) * 0.2; // enjeu de la course
  if (MAJOR_RACE_NAMES.has(raceName)) pressure += 10; // Monument/Grand Tour/Mondiaux : l'enjeu ultime

  // Attentes du DS : proxy direct sur la réputation et l'adéquation avec la philosophie d'équipe
  // (évite de recalculer le rôle complet ici — même logique de fond que computeRaceRole).
  const philosophy = player.team ? TEAM_PHILOSOPHIES[player.team.philosophy] : null;
  const fits = philosophy ? philosophy.favors.includes(player.specialtyPrimary) : true;
  const dsExpectation = player.reputation.peloton >= 65 ? 15 : player.reputation.peloton >= 45 ? 8 : 0;
  pressure += dsExpectation * (fits ? 1 : 0.6);

  if (game.sponsor && !game.sponsor.fulfilled) pressure += 6; // objectif sponsor encore à remplir

  // Mental (compétences déjà existantes) : atténue directement la pression, jamais l'inverse.
  pressure -= SkillEngine.craquageResist(player) * 1.1;
  if (SkillEngine.hasSkill(player, "talent_acier")) pressure -= 8;

  // Expérience : un jeune brusquement propulsé favori encaisse plus mal qu'un vétéran dans les grands rendez-vous.
  if (player.age < 23 && isFavoriteContext(player)) pressure += 15;
  if (player.age >= 30) pressure -= 10;

  // Confiance : réutilise la motivation, jusqu'ici peu exploitée ailleurs dans le moteur.
  pressure -= (player.stats.motivation - 50) * 0.15;

  return clamp(pressure);
}

function pressureTier(pressure) {
  if (pressure >= 75) return "extrême";
  if (pressure >= 55) return "forte";
  if (pressure >= 35) return "modérée";
  return "faible";
}

function buildNewsFeed(pelotonNews, player) {
  if (!pelotonNews) return [];
  const news = [];
  pelotonNews.retirees.forEach((r) => news.push(pick(RETIREMENT_HEADLINES)(r)));
  pelotonNews.transfers.forEach((t) => news.push(pick(TRANSFER_HEADLINES)(t)));
  pelotonNews.newcomers.forEach((n) => news.push(pick(NEWCOMER_HEADLINES)(n)));
  if (pelotonNews.retiredRival) {
    news.push(`Fin de carrière pour ${pelotonNews.retiredRival.name}, ton grand rival de ces dernières saisons.`);
  }
  if (player && isFavoriteContext(player)) {
    news.push(pick([`« Le nouveau favori ? » — la presse s'interroge ouvertement sur ${player.name} après sa série de résultats.`, `${player.name} impressionne le peloton — les observateurs le rangent désormais parmi les grands favoris.`]));
  }
  const teaserRace = pick(CALENDAR_RACES);
  news.push(`${teaserRace.name} approche à grands pas — le peloton commence déjà à évoquer les favoris.`);
  return news.sort(() => Math.random() - 0.5).slice(0, 20);
}

// Les 5 vrais Monuments du calendrier — utilisés pour évaluer l'objectif "remporter une classique majeure".
const MONUMENTS = new Set(["Milan-San Remo", "Tour des Flandres", "Paris-Roubaix", "Liège-Bastogne-Liège", "Il Lombardia"]);

// Objectifs de saison : le joueur en choisit 3 à 5 en début de saison. Rien de nouveau côté données —
// chaque objectif est évalué en fin de saison à partir de ce qui existe déjà (palmares, points UCI, équipe).
const SEASON_OBJECTIVES = [
  { id: "monument", icon: "🏆", label: "Remporter une classique majeure (Monument)" },
  { id: "anywin", icon: "🥇", label: "Décrocher au moins une victoire" },
  { id: "worlds", icon: "🌍", label: "Monter sur le podium des Mondiaux" },
  { id: "gc", icon: "👑", label: "Monter sur le podium d'un Grand Tour" },
  { id: "jersey", icon: "🟢", label: "Remporter un maillot secondaire (points, montagne ou jeune)" },
  { id: "uci", icon: "📈", label: "Franchir les 150 points UCI sur la saison" },
  { id: "wt_debut", icon: "⭐", label: "Vivre ta première saison complète en WorldTour" },
];

// Évalue un objectif à partir de ce qui s'est réellement passé cette saison (nouvelles entrées de
// palmares depuis le début de saison, points UCI accumulés, niveau d'équipe).
function evaluateSeasonObjective(objId, ctx) {
  const { newPalmares, uciPointsThisSeason, player, wasWTAtSeasonStart } = ctx;
  switch (objId) {
    case "monument": return newPalmares.some((p) => /^(Victoire|Classement général)/.test(p) && [...MONUMENTS].some((m) => p.includes(m)));
    case "anywin": return newPalmares.some((p) => /^(Victoire|Classement général)/.test(p));
    case "worlds": return newPalmares.some((p) => p.includes("Championnats du Monde"));
    case "gc": return newPalmares.some((p) => /^(Victoire|Podium|Classement général)/.test(p) && /Tour de France|Giro d'Italia|Vuelta a España/.test(p));
    case "jersey": return newPalmares.some((p) => p.startsWith("Maillot"));
    case "uci": return uciPointsThisSeason >= 150;
    case "wt_debut": return player.team?.level === TEAM_LEVELS.WT && !wasWTAtSeasonStart;
    default: return false;
  }
}

const SPONSOR_OBJECTIVES = [
  { name: "Banque Cycliste Pro", objective: "Décrocher un podium cette saison", reward: "Prime de 15 000 € & +réputation sponsors", bonusMoney: 15000 },
  { name: "Aqua Vitale", objective: "Terminer une classique dans le top 10", reward: "Prime de 8 000 € & +réputation sponsors", bonusMoney: 8000 },
  { name: "Groupe Média Sportif", objective: "Décrocher une victoire d'étape", reward: "Prime de 20 000 € & forte exposition médiatique", bonusMoney: 20000 },
];

/* ============================== CALENDRIER UCI (calendar.js) ============================== */
// Reprend exactement le calendrier défini dans calendar.js. Chaque course a :
// { month, name, type, prestige, difficulty, terrain, mountains, sprint, cobbles, fatigue }
// Ces métadonnées pondèrent désormais les récompenses/coûts réels en course (voir raceOutcome) :
// une victoire au Tour de France (prestige 100) rapporte bien plus qu'une victoire au Tour Down Under (prestige 55),
// et une étape de Grand Tour (fatigue 90-100) coûte bien plus cher physiquement qu'une classique d'un jour.
const RACE_TYPES = { ONE_DAY: "Classique d'un jour", MONUMENT: "Monument", STAGE_RACE: "Course par étapes", GRAND_TOUR: "Grand Tour", CHAMPIONSHIP: "Championnat" };

function calRace(month, name, type, prestige, difficulty, terrain, mountains, sprint, cobbles, fatigue) {
  return { month, name, type, prestige, difficulty, terrain, mountains, sprint, cobbles, fatigue };
}

const CALENDAR = {
  "Janvier": [calRace("Janvier", "Tour Down Under", RACE_TYPES.STAGE_RACE, 55, 35, "vallonné", 20, 70, 0, 40)],
  "Février": [
    calRace("Février", "UAE Tour", RACE_TYPES.STAGE_RACE, 60, 45, "mixte", 35, 55, 0, 45),
    calRace("Février", "Omloop Het Nieuwsblad", RACE_TYPES.ONE_DAY, 50, 55, "pavés / vallonné", 15, 25, 60, 55),
  ],
  "Mars": [
    calRace("Mars", "Paris-Nice", RACE_TYPES.STAGE_RACE, 65, 55, "mixte", 40, 45, 5, 55),
    calRace("Mars", "Tirreno-Adriatico", RACE_TYPES.STAGE_RACE, 65, 55, "mixte", 45, 40, 0, 55),
    calRace("Mars", "Milan-San Remo", RACE_TYPES.MONUMENT, 90, 60, "vallonné / plat", 20, 55, 0, 65),
  ],
  "Avril": [
    calRace("Avril", "Tour des Flandres", RACE_TYPES.MONUMENT, 95, 85, "pavés / vallonné", 25, 20, 90, 80),
    calRace("Avril", "Paris-Roubaix", RACE_TYPES.MONUMENT, 95, 90, "pavés", 5, 15, 100, 85),
    calRace("Avril", "Amstel Gold Race", RACE_TYPES.ONE_DAY, 75, 65, "vallonné", 35, 30, 0, 65),
    calRace("Avril", "Flèche Wallonne", RACE_TYPES.ONE_DAY, 75, 70, "vallonné (Mur de Huy)", 40, 20, 0, 60),
    calRace("Avril", "Liège-Bastogne-Liège", RACE_TYPES.MONUMENT, 90, 85, "vallonné / montagneux", 55, 15, 0, 75),
  ],
  "Mai": [calRace("Mai", "Giro d'Italia", RACE_TYPES.GRAND_TOUR, 95, 90, "montagneux", 80, 40, 0, 95)],
  "Juin": [
    calRace("Juin", "Critérium du Dauphiné", RACE_TYPES.STAGE_RACE, 70, 70, "montagneux", 65, 30, 0, 65),
    calRace("Juin", "Tour de Suisse", RACE_TYPES.STAGE_RACE, 68, 68, "montagneux", 60, 30, 0, 65),
  ],
  "Juillet": [calRace("Juillet", "Tour de France", RACE_TYPES.GRAND_TOUR, 100, 95, "montagneux / mixte", 75, 45, 10, 100)],
  "Août": [calRace("Août", "Vuelta a España", RACE_TYPES.GRAND_TOUR, 88, 88, "montagneux", 80, 35, 0, 90)],
  "Septembre": [calRace("Septembre", "Championnats du Monde", RACE_TYPES.CHAMPIONSHIP, 92, 75, "circuit variable", 40, 45, 0, 70)],
  "Octobre": [calRace("Octobre", "Il Lombardia", RACE_TYPES.MONUMENT, 88, 80, "montagneux", 70, 15, 0, 70)],
  // Novembre / Décembre : trêve hivernale — fin de saison, pas de course.
};

const CALENDAR_RACES = Object.values(CALENDAR).flat();
const CALENDAR_META = Object.fromEntries(CALENDAR_RACES.map((r) => [r.name, r]));

// Estimation du profil terrain pour les courses sans fiche détaillée (ProSeries/Europe Tour) — dérivée
// simplement de leur specKey dominant, pour rester cohérent avec les vraies fiches CALENDAR_META.
const SPEC_TERRAIN_ESTIMATE = {
  montagne: { mountains: 65, sprint: 15, cobbles: 5 },
  sprint: { mountains: 10, sprint: 70, cobbles: 5 },
  pave: { mountains: 10, sprint: 30, cobbles: 65 },
  clm: { mountains: 25, sprint: 10, cobbles: 0 },
};
function terrainProfileFor(race) {
  const meta = CALENDAR_META[race.name];
  if (meta) return { mountains: meta.mountains, sprint: meta.sprint, cobbles: meta.cobbles };
  return SPEC_TERRAIN_ESTIMATE[race.specKey] || { mountains: 30, sprint: 30, cobbles: 10 };
}

// Commentaire d'adéquation profil/course — purement dérivé (profil terrain × spécialité du joueur),
// jamais stocké. C'est ce qui rend le calendrier lisible comme un vrai outil stratégique.
function fitCommentary(player, race) {
  const p = terrainProfileFor(race);
  const spec = player.specialtyPrimary;
  if (spec === "grimpeur") return p.mountains >= 55 ? "Course très intéressante pour ton profil." : p.mountains >= 35 ? "Un profil correct, sans être ton terrain de prédilection." : "Peu d'occasions pour un grimpeur ici.";
  if (spec === "sprinteur") return p.sprint >= 55 ? "Course très intéressante pour ton profil." : p.mountains >= 55 ? "Quelques opportunités d'étapes, mais peu intéressante pour le classement général." : "Un profil correct pour toi.";
  if (spec === "rouleur") return p.cobbles >= 45 ? "Un terrain qui te correspond parfaitement." : p.sprint <= 20 && p.mountains <= 30 ? "Un profil roulant taillé pour toi." : "Un profil correct pour toi.";
  if (spec === "puncheur") return (p.mountains >= 25 && p.mountains <= 65) ? "Un profil vallonné taillé pour ton explosivité." : "Un profil correct, mais pas ton terrain idéal.";
  return "Un terrain où ta polyvalence peut faire la différence.";
}

// Durée estimée — dérivée du type de course, pas une donnée à saisir à la main pour chacune des ~45 courses.
function estimateDuration(race) {
  if (!race.isStageRace) return "1 jour";
  if (race.raceTier === "WT") return "7-8 jours";
  return "4-5 jours";
}

// Niveau d'enjeu (1 à 5 étoiles) — dérivé du prestige réel (CALENDAR_META) quand il existe, sinon du niveau.
function enjeuStars(race) {
  const meta = CALENDAR_META[race.name];
  const prestige = meta ? meta.prestige : race.raceTier === "WT" ? 65 : race.raceTier === "Pro" ? 45 : 30;
  return Math.max(1, Math.min(5, Math.round(prestige / 20)));
}

// Objectifs possibles sur cette course — dérivés du type (étapes ou course d'un jour).
function possibleObjectives(race) {
  return race.isStageRace ? ["Général", "Étapes", "Maillot", "Préparation"] : ["Victoire", "Top 10", "Préparation"];
}

// Les courses dont le monde garde la mémoire d'une année sur l'autre (worldHistory) : Monuments, Grands Tours, Mondiaux.
const MAJOR_TYPES = [RACE_TYPES.GRAND_TOUR, RACE_TYPES.MONUMENT, RACE_TYPES.CHAMPIONSHIP];
const MAJOR_RACE_NAMES = new Set(CALENDAR_RACES.filter((r) => MAJOR_TYPES.includes(r.type)).map((r) => r.name));

// Convertit une valeur de métadonnée en multiplicateur doux (0.7x à 1.5x) autour d'une baseline,
// pour que l'effet reste réel mais jamais extrême.
function metaFactor(value, baseline, min = 0.7, max = 1.5) {
  if (value === undefined) return 1;
  return Math.max(min, Math.min(max, value / baseline));
}

/* ============================================================================
   RACE ENGINE V2 — état de course réel (groupe + énergie) plutôt qu'un score caché.
   ============================================================================
   Avant : Événement → Bonus → Score final.
   Maintenant : Événement → État de course (groupe/énergie) → Décision → Nouvel état → Final.

   game.raceState = { group, energy } est réinitialisé à chaque entrée en course (voir goToNextQueueItem).
   Chaque tacticalBonus généré par une action (existant dans tout le jeu : courses, imprévus, choix de
   compétences) n'est plus additionné tel quel au score — il consomme de l'énergie et tente de faire
   progresser ou régresser le GROUPE dans lequel tu te trouves (voir applyDelta). Au moment de l'arrivée,
   le classement trie D'ABORD par groupe, ENSUITE par score — le groupe est un vrai plafond, pas un chiffre
   de plus dans une addition.
   ============================================================================ */
const RACE_GROUPS = { FRONT: "tête de course", PELOTON: "peloton principal", CHASE: "groupe poursuivant", DROPPED: "décroché" };
const GROUP_ORDER = [RACE_GROUPS.DROPPED, RACE_GROUPS.CHASE, RACE_GROUPS.PELOTON, RACE_GROUPS.FRONT];
const GROUP_RANK = Object.fromEntries(GROUP_ORDER.map((g, i) => [g, i]));

function initRaceState() { return { group: RACE_GROUPS.PELOTON, energy: 100 }; }

function moveGroup(current, direction) {
  const idx = GROUP_ORDER.indexOf(current);
  const next = Math.max(0, Math.min(GROUP_ORDER.length - 1, idx + direction));
  return GROUP_ORDER[next];
}

// Attribue un groupe à un coureur du peloton simulé, pondéré par son niveau ET son adéquation au type
// de course (fit) — un rouleur au niveau élevé n'a plus les mêmes chances qu'un grimpeur pur en haute montagne.
function assignFieldGroup(level, fit = 0.75) {
  const effectiveLevel = level * (0.5 + 0.5 * fit);
  const roll = Math.random() * 100;
  if (effectiveLevel >= 78) return roll < 55 ? RACE_GROUPS.FRONT : roll < 90 ? RACE_GROUPS.PELOTON : RACE_GROUPS.CHASE;
  if (effectiveLevel >= 60) return roll < 20 ? RACE_GROUPS.FRONT : roll < 75 ? RACE_GROUPS.PELOTON : roll < 95 ? RACE_GROUPS.CHASE : RACE_GROUPS.DROPPED;
  return roll < 5 ? RACE_GROUPS.PELOTON : roll < 60 ? RACE_GROUPS.CHASE : RACE_GROUPS.DROPPED;
}

/* ============================== SCORING ============================== */
const OVERTRAINING_THRESHOLD = 42; // fatigue chronique au-delà de laquelle le surentraînement s'installe

function isOvertrained(player) { return (player.stats.fatigueChronique || 0) >= OVERTRAINING_THRESHOLD; }

// Fraîcheur : lecture instantanée de l'état du coureur (fatigue récente ET chronique combinées), 0-100.
// Purement un indicateur pour le joueur — la pénalité mécanique réelle vit déjà dans performanceScore.
function computeFraicheur(player) {
  return clamp(100 - player.stats.fatigue * 0.5 - (player.stats.fatigueChronique || 0) * 0.5);
}

function performanceScore(player, specKey, extraBonus = 0) {
  const spec = player.specialties[specKey] ?? 30;
  const forme = player.stats.forme;
  const fatiguePenalty = player.stats.fatigue * 0.35;
  // Le surentraînement (fatigue chronique élevée) pénalise la performance au-delà d'un seuil, plafonné
  // pour rester un vrai coup dur sans devenir injouable.
  const overtrainingPenalty = isOvertrained(player) ? Math.min(15, (player.stats.fatigueChronique - OVERTRAINING_THRESHOLD) * 0.6) : 0;
  // Le matériel donne un léger coup de pouce (±6 points maxi), très inférieur au poids de la spécialité (jusqu'à 50),
  // de la forme (jusqu'à 35) et de l'aléatoire (0-30) : une petite équipe en forme peut toujours gagner.
  const equipmentBonus = player.team ? clamp((player.team.equipmentQuality - 50) / 8, -6, 6) : 0;
  // Compétences physiques/spécialisation : bonus direct sur la qualité sollicitée.
  const skillBonus = SkillEngine.specialtyBonus(player, specKey);
  // Régularité (Mental) réduit la part d'aléatoire, sans jamais la supprimer entièrement.
  const noiseMax = Math.max(10, 30 - SkillEngine.noiseReduction(player));
  const noise = rand(0, noiseMax);
  return spec * 0.5 + forme * 0.35 - fatiguePenalty * 0.3 - overtrainingPenalty + equipmentBonus + skillBonus + extraBonus + noise;
}

function raceOutcome(player, specKey, raceName, tier) {
  const meta = CALENDAR_META[raceName];
  const repFactor = metaFactor(meta?.prestige, 70);
  const costFactor = metaFactor(meta?.fatigue, 65);
  // La résistance à la fatigue (Endurance, Gestion du stress, Gestion de l'effort...) réduit le coût réel,
  // plafonnée à 60% de réduction pour qu'un effort décisif reste toujours un effort.
  const fatigueReduction = clamp01(1 - SkillEngine.fatigueResist(player) / 25, 0.4, 1);
  if (tier === "victoire") return { tier, text: `Victoire sur ${raceName} ! Le public scande ton nom.`, palmares: [`Victoire — ${raceName}`], reputation: Math.round(16 * repFactor), forme: -Math.round(8 * costFactor * fatigueReduction), fatigue: Math.round(10 * costFactor * fatigueReduction) };
  if (tier === "podium") return { tier, text: `Tu montes sur le podium de ${raceName}. Une belle carte de visite.`, palmares: [`Podium — ${raceName}`], reputation: Math.round(9 * repFactor), forme: -Math.round(6 * costFactor * fatigueReduction), fatigue: Math.round(8 * costFactor * fatigueReduction) };
  if (tier === "top10") return { tier, text: `Un discret top 10 sur ${raceName}. Solide, sans éclat.`, reputation: Math.round(3 * repFactor), forme: -Math.round(4 * costFactor * fatigueReduction), fatigue: Math.round(6 * costFactor * fatigueReduction) };
  return { tier, text: `${raceName} t'échappe. Une course à oublier vite.`, reputation: -2, forme: -Math.round(3 * costFactor * fatigueReduction), fatigue: Math.round(5 * costFactor * fatigueReduction) };
}

function ordinal(n) { return n === 1 ? "1er" : `${n}e`; }

/* ============================== MAILLOTS DISTINCTIFS (courses par étapes) ============================== */
// Sur un Grand Tour ou un tour d'une semaine, le classement général n'est qu'une des courses dans la course.
// On calcule ici, en plus, les classements du meilleur grimpeur (maillot à pois), par points (maillot vert)
// et du meilleur jeune (maillot blanc, réservé aux moins de 26 ans) — chacun avec son propre barème de points UCI,
// plus modeste que le général.
const JERSEY_UCI_POINTS = 20; // récompense d'un maillot secondaire (le général reste toujours le plus valorisé)
const YOUTH_AGE_LIMIT = 26;

function rankPlayerAmong(game, playerScore, riderScoreFn, riderFilter) {
  const peloton = (game.peloton || []).filter((r) => !riderFilter || riderFilter(r));
  const entries = peloton.map((r) => ({ id: r.id, name: r.name, score: riderScoreFn(r) + rand(0, 25) }));
  entries.push({ id: "player", name: game.player.name, score: playerScore + rand(0, 25) });
  entries.sort((a, b) => b.score - a.score);
  return { position: entries.findIndex((e) => e.id === "player") + 1, winnerName: entries[0].name, size: entries.length };
}

function computeSecondaryJerseys(game) {
  const player = game.player;
  const results = {};
  // Cohérence avec le Race Engine V2 : un coureur décroché n'a plus vraiment de chances sur les classements
  // annexes non plus — le groupe prime, même pour le maillot à pois ou le maillot par points.
  const groupPenalty = { [RACE_GROUPS.FRONT]: 1, [RACE_GROUPS.PELOTON]: 0.85, [RACE_GROUPS.CHASE]: 0.5, [RACE_GROUPS.DROPPED]: 0.15 };
  const playerGroupFactor = groupPenalty[(game.raceState || initRaceState()).group] ?? 0.85;

  // Maillot à pois (meilleur grimpeur) : dominé par les grimpeurs/puncheurs, quel que soit le profil du vainqueur du général.
  results.kom = rankPlayerAmong(
    game,
    player.specialties.montagne * 0.75 * playerGroupFactor,
    (r) => r.level * (r.spec === "grimpeur" ? 0.85 : r.spec === "puncheur" ? 0.6 : 0.35)
  );

  // Maillot par points : dominé par les sprinteurs/puncheurs réguliers.
  results.points = rankPlayerAmong(
    game,
    player.specialties.sprint * 0.75 * playerGroupFactor,
    (r) => r.level * (r.spec === "sprinteur" ? 0.85 : r.spec === "puncheur" ? 0.55 : 0.3)
  );

  // Maillot du meilleur jeune : seuls les moins de 26 ans sont éligibles (toi y compris).
  if (player.age < YOUTH_AGE_LIMIT) {
    results.youth = rankPlayerAmong(
      game,
      Math.max(player.specialties.montagne, player.specialties.clm) * 0.75 * playerGroupFactor,
      (r) => r.level * 0.75,
      (r) => r.age < YOUTH_AGE_LIMIT
    );
  }
  return results;
}

// Ajoute le résultat des maillots secondaires au texte et aux gains d'une arrivée de course par étapes.
function applyStageRaceJerseys(game, raceName, baseText) {
  const jerseys = computeSecondaryJerseys(game);
  let text = baseText;
  const palmares = [];
  let uciPoints = 0;

  if (jerseys.kom.position === 1) { text += ` Tu t'empares aussi du maillot à pois de meilleur grimpeur !`; palmares.push(`Maillot à pois — ${raceName}`); uciPoints += JERSEY_UCI_POINTS; }
  else if (jerseys.kom.position <= 3) { text += ` Tu termines ${ordinal(jerseys.kom.position)} du classement de meilleur grimpeur.`; }

  if (jerseys.points.position === 1) { text += ` Le maillot par points te revient également !`; palmares.push(`Maillot par points — ${raceName}`); uciPoints += JERSEY_UCI_POINTS; }
  else if (jerseys.points.position <= 3) { text += ` Tu es ${ordinal(jerseys.points.position)} du classement par points.`; }

  if (jerseys.youth) {
    if (jerseys.youth.position === 1) { text += ` Chez les jeunes, tu domines aussi le classement et repars avec le maillot blanc !`; palmares.push(`Maillot du meilleur jeune — ${raceName}`); uciPoints += Math.round(JERSEY_UCI_POINTS * 0.75); }
    else if (jerseys.youth.position <= 3) { text += ` Chez les moins de ${YOUTH_AGE_LIMIT} ans, tu es ${ordinal(jerseys.youth.position)}.`; }
  }

  return { text, palmares, uciPoints };
}

/* ============================== CLASSEMENT UCI ============================== */
// Barème inspiré du fonctionnement réel de l'UCI : les points se concentrent sur les 10 premiers,
// et sont pondérés par le prestige de la course (un Monument ou un Grand Tour rapporte bien plus
// qu'une course mineure) — même logique que la pondération déjà utilisée pour la réputation.
const UCI_POINTS_BY_POSITION = { 1: 100, 2: 70, 3: 50, 4: 40, 5: 32, 6: 26, 7: 22, 8: 18, 9: 14, 10: 10 };
function pointsForPosition(position, meta) {
  const base = UCI_POINTS_BY_POSITION[position];
  if (!base) return 0;
  const factor = metaFactor(meta?.prestige, 70, 0.6, 1.6);
  return Math.round(base * factor);
}

// Quels profils sont plausiblement présents dans le peloton selon le type d'effort décisif de la course.
// Barème de compatibilité gradué : ce n'est plus "peut participer ou pas", mais "à quel point ce profil
// est fait pour ce type d'arrivée". Un sprinteur pur écrase un rouleur juste "compatible" sur un sprint,
// un grimpeur pur domine largement un polyvalent en haute montagne — le monde prend enfin de vraies décisions.
const SPEC_FIT_WEIGHTS = {
  montagne: { grimpeur: 1.0, puncheur: 0.8, polyvalent: 0.7, rouleur: 0.5, sprinteur: 0.25 },
  sprint: { sprinteur: 1.0, puncheur: 0.7, polyvalent: 0.65, rouleur: 0.55, grimpeur: 0.2 },
  pave: { rouleur: 1.0, puncheur: 0.85, polyvalent: 0.7, sprinteur: 0.6, grimpeur: 0.25 },
  clm: { rouleur: 1.0, grimpeur: 0.6, polyvalent: 0.65, puncheur: 0.4, sprinteur: 0.3 },
};
function specFit(spec, specKey) {
  return SPEC_FIT_WEIGHTS[specKey]?.[spec] ?? 0.4;
}

// Déduit le type d'effort dominant d'une course du calendrier à partir de ses métadonnées.
function dominantSpecKey(meta) {
  const scores = { montagne: meta.mountains, sprint: meta.sprint, pave: meta.cobbles };
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// Le monde continue de vivre sans toi : chaque course du calendrier que tu n'as pas courue cette saison
// est quand même disputée par le reste du peloton, en coulisses — avec un vainqueur, un podium,
// et une vraie distribution de points UCI aux 10 premiers.
function simulateBackgroundRace(peloton, raceMeta) {
  const specKey = dominantSpecKey(raceMeta);
  // On exclut seulement les profils vraiment hors sujet (fit trop faible) — le reste concourt,
  // mais avec des chances très inégales selon leur adéquation réelle.
  let field = peloton.filter((r) => specFit(r.spec, specKey) >= 0.3);
  if (field.length === 0) field = peloton;
  const major = MAJOR_RACE_NAMES.has(raceMeta.name);
  const scored = field.map((r) => {
    const fit = specFit(r.spec, specKey);
    // Une équipe ambitieuse (réputation élevée) pousse et protège son leader sur les grands rendez-vous.
    const teamAmbitionBonus = major ? ((r.team?.reputation || 50) - 50) * 0.06 : 0;
    // Le fit pèse fort sur la partie "niveau" du score, mais pas sur l'aléatoire : un rouleur peut encore,
    // rarement, voler un sprint massif — ce n'est plus impossible, juste très défavorable statistiquement.
    return { ...r, score: r.level * 0.65 * (0.55 + 0.45 * fit) + rand(0, 30) + teamAmbitionBonus };
  }).sort((a, b) => b.score - a.score);
  const top10 = scored.slice(0, 10);
  const pointsMap = new Map(top10.map((r, i) => [r.id, pointsForPosition(i + 1, raceMeta)]));
  const updatedPeloton = peloton.map((r) => (pointsMap.has(r.id) ? { ...r, points: (r.points || 0) + pointsMap.get(r.id) } : r));
  return { race: raceMeta, winner: scored[0], podium: scored.slice(0, 3), peloton: updatedPeloton };
}

function raceResultHeadline(result, rivalId) {
  const w = result.winner;
  if (!w) return null;
  if (w.id === rivalId) return `⚔️ Ton rival ${flagFor(w.nation)} ${w.name} s'impose sur ${result.race.name} !`;
  return `${flagFor(w.nation)} ${w.name} (${w.team?.name || "sans équipe"}) remporte ${result.race.name}.`;
}

// Simule tout le reste du calendrier UCI (les courses que le joueur n'a pas disputées cette saison),
// distribue les points correspondants, et en tire des dépêches — le peloton est mis à jour au fil de l'eau
// pour que les points s'accumulent course après course.
function buildRaceResultsNews(peloton, racedNames, rivalId) {
  const raced = new Set(racedNames || []);
  const backgroundRaces = CALENDAR_RACES.filter((r) => !raced.has(r.name));
  let currentPeloton = peloton;
  const headlines = [];
  const majorResults = {};
  backgroundRaces.forEach((meta) => {
    const result = simulateBackgroundRace(currentPeloton, meta);
    const headline = raceResultHeadline(result, rivalId);
    if (headline) headlines.push(headline);
    if (MAJOR_RACE_NAMES.has(meta.name) && result.winner) {
      majorResults[meta.name] = { id: result.winner.id, name: result.winner.name, nation: result.winner.nation };
    }
    currentPeloton = result.peloton;
  });
  return { headlines, peloton: currentPeloton, majorResults };
}

// Simule le peloton présent sur la course (jusqu'à 25 coureurs compatibles + le rival), classe tout le monde,
// et en déduit ta position réelle — c'est cette position qui détermine ton résultat (victoire/podium/top10/anonyme)
// ET les points UCI distribués (à toi comme aux coureurs du peloton présents).
function runRaceField(game, specKey, raceName) {
  const rival = getRival(game);
  const raceState = game.raceState || initRaceState();
  let field = (game.peloton || []).filter((r) => specFit(r.spec, specKey) >= 0.3);
  field = [...field].sort(() => Math.random() - 0.5).slice(0, 25);
  // Le rival est toujours engagé sur tes courses clés, même s'il n'est pas tombé dans l'échantillon aléatoire.
  if (rival && !field.some((r) => r.id === rival.id)) field = [...field, rival];

  const major = MAJOR_RACE_NAMES.has(raceName);
  // Chaque coureur du peloton simulé est assigné à un groupe (pondéré par son niveau ET son adéquation
  // au type de course) — cohérent avec la façon dont ton propre groupe s'est construit pendant la course.
  const entries = field.map((r) => {
    const fit = specFit(r.spec, specKey);
    const teamAmbitionBonus = major ? ((r.team?.reputation || 50) - 50) * 0.06 : 0;
    return { id: r.id, name: r.name, nation: r.nation, team: r.team?.name, isPlayer: false, isRival: rival ? r.id === rival.id : false, group: assignFieldGroup(r.level, fit), score: r.level * 0.65 * (0.55 + 0.45 * fit) + rand(0, 20) + teamAmbitionBonus };
  });
  // Bonus mental (Confiance/Sang-froid/Résilience) et bonus contextuel de spécialisation restent des bonus
  // de score classiques — mais l'énergie qu'il te reste (Race Engine V2) module maintenant directement
  // ta performance À L'INTÉRIEUR de ton groupe, plutôt que de simplement s'additionner au score final.
  const context = specKey === "montagne" ? "montagne_stage" : specKey === "sprint" ? "sprint_stage" : null;
  // Pressure Engine : la pression de la course (médiatisation, statut de favori, enjeu, attentes du DS...)
  // pénalise directement ta performance dans ce moment décisif — nette de ton mental (Sang-froid, Mental
  // d'acier), qui peut totalement l'annuler. Jamais l'inverse : le mental ne peut qu'atténuer la pression.
  const pressure = computePressure(game, raceName);
  const pressurePenalty = Math.max(0, (pressure - 55) * 0.2 - SkillEngine.craquageResist(game.player) * 0.8);
  // Paiement différé de la décision « Attendre le dernier col » : ne paie que si l'arrivée est
  // effectivement en montagne — un vrai pari tactique, pas un bonus garanti.
  const savedClimbPayoff = game.player.flags?.savedForFinalClimb && specKey === "montagne" ? 8 : 0;
  // Stage en altitude : bonus temporaire, réservé au Grand Tour ciblé cette saison — un GT se reconnaît
  // ici par son nom brut ("Tour de France", etc.), jamais sur les autres courses de montagne.
  const altitudeCampBonus = game.player.flags?.altitudeCampActive && specKey === "montagne" && GRAND_TOUR_FLAVOR[raceName] ? 8 : 0;
  const mentalBonus = SkillEngine.finalStageBonus(game.player) + SkillEngine.craquageResist(game.player) + (context ? SkillEngine.contextBonus(game.player, context) : 0) - pressurePenalty + savedClimbPayoff + altitudeCampBonus;
  const energyModifier = (raceState.energy - 50) * 0.3;
  const playerScore = performanceScore(game.player, specKey, mentalBonus) + energyModifier;
  entries.push({ id: "player", name: game.player.name, nation: game.player.nation?.code, team: game.player.team?.name, isPlayer: true, isRival: false, group: raceState.group, score: playerScore });

  // Le tri se fait D'ABORD par groupe (un décroché ne peut jamais dépasser un coureur de tête de course,
  // quel que soit son score), ENSUITE par score à l'intérieur d'un même groupe. C'est le cœur du Race Engine V2 :
  // le groupe est un vrai plafond de résultat, pas un chiffre de plus dans une addition.
  entries.sort((a, b) => {
    const groupDiff = GROUP_RANK[b.group] - GROUP_RANK[a.group];
    if (groupDiff !== 0) return groupDiff;
    return b.score - a.score;
  });

  const playerPosition = entries.findIndex((e) => e.isPlayer) + 1;
  const rivalPosition = entries.findIndex((e) => e.isRival) + 1;
  const tier = playerPosition === 1 ? "victoire" : playerPosition <= 3 ? "podium" : playerPosition <= 10 ? "top10" : "anonyme";

  const meta = CALENDAR_META[raceName];
  const top10 = entries.slice(0, 10);
  const playerPoints = playerPosition <= 10 ? pointsForPosition(playerPosition, meta) : 0;
  const pelotonPoints = top10.filter((e) => !e.isPlayer).map((e, _, arr) => ({ id: e.id, points: pointsForPosition(top10.indexOf(e) + 1, meta) }));

  return { entries, top10, playerPosition, rivalPosition, tier, fieldSize: entries.length, playerPoints, pelotonPoints };
}

// Ton rival partage toujours ton profil : il est donc présent sur toutes tes courses clés.
function raceOutcomeVsRival(game, specKey, raceName) {
  const field = runRaceField(game, specKey, raceName);
  const rival = getRival(game);
  const o = raceOutcome(game.player, specKey, raceName, field.tier);
  let rivalLine, rivalDelta;
  if (!rival || !field.rivalPosition) { rivalLine = ""; rivalDelta = {}; }
  else if (field.playerPosition < field.rivalPosition) { rivalLine = ` Tu devances ${rival.name} sur cette course (${ordinal(field.playerPosition)} contre ${ordinal(field.rivalPosition)}).`; rivalDelta = { haine: 10 }; }
  else if (field.playerPosition === field.rivalPosition) { rivalLine = ` Vous terminez au coude à coude avec ${rival.name}.`; rivalDelta = { haine: 3, respect: 5 }; }
  else { rivalLine = ` ${rival.name} te devance sur cette course (${ordinal(field.rivalPosition)} contre ${ordinal(field.playerPosition)}).`; rivalDelta = { respect: 8 }; }
  return { ...o, text: o.text + rivalLine, rivalDelta, classification: field.top10, playerPosition: field.playerPosition, fieldSize: field.fieldSize, uciPoints: field.playerPoints, pelotonPoints: field.pelotonPoints };
}

/* ============================== APPLY DELTA (moteur unifié) ============================== */
function addRep(amount) {
  return { medias: amount, fans: Math.round(amount * 0.7), peloton: Math.round(amount * 0.5), sponsors: Math.round(amount * 0.3) };
}

function applyDelta(game, delta = {}) {
  let player = { ...game.player, stats: { ...game.player.stats }, reputation: { ...game.player.reputation }, specialties: { ...game.player.specialties }, palmares: [...game.player.palmares], history: [...game.player.history], flags: { ...game.player.flags } };
  let rivalRelation = game.rivalRelation ? { ...game.rivalRelation } : null;
  let teammates = game.teammates ? game.teammates.map((t) => ({ ...t })) : null;
  let sponsor = game.sponsor ? { ...game.sponsor } : null;
  let peloton = game.peloton;
  let seasonMajorResults = game.seasonMajorResults || {};
  let tacticalBonus = game.tacticalBonus || 0;
  let raceState = game.raceState ? { ...game.raceState } : initRaceState();
  let talentCharges = game.talentCharges ? { ...game.talentCharges } : {};
  let effortAccum = game.effortAccum || 0;
  let recentResultTiers = game.recentResultTiers ? [...game.recentResultTiers] : [];
  let seasonBonusSkillPoints = game.seasonBonusSkillPoints ?? 0;
  const BONUS_SKILL_POINTS_CAP = 3; // plafond par saison, pour éviter le farming

  let steelMindUsed = false;
  ["forme", "fatigue", "motivation", "ethique"].forEach((k) => {
    if (delta[k] === undefined) return;
    let amount = delta[k];
    // Mental d'acier : absorbe un gros coup dur de forme, une fois par saison.
    if (k === "forme" && amount <= -5 && talentCharges.mental_acier) {
      amount = 0;
      steelMindUsed = true;
    }
    // On garde une trace de l'effort fatigant réellement fourni, pour le restituer ensuite en récupération
    // entre deux activités (voir goToNextQueueItem) — la récupération dépend donc bien de l'effort fourni.
    // La fatigue chronique, elle, NE vient PLUS directement de ce gain (voir Pipeline Fatigue Chronique
    // dans goToNextQueueItem) : charge + récupération insuffisante = fatigue chronique, pas juste charge.
    if (k === "fatigue" && amount > 0) effortAccum += amount;
    player.stats[k] = clamp(player.stats[k] + amount);
  });
  // Ajustement explicite de la fatigue chronique (récupération inter-activités, trêve hivernale, incidents de surentraînement).
  if (delta.fatigueChronique !== undefined) {
    player.stats.fatigueChronique = clamp(player.stats.fatigueChronique + delta.fatigueChronique);
  }
  if (steelMindUsed) {
    talentCharges.mental_acier = false;
    player.history.push(`${player.age} ans — Mental d'acier : encaisse un coup dur sans broncher.`);
  }
  if (delta.relationEquipe !== undefined) {
    // Leadership (Mental/Carrière) rend les gains de relation équipe plus efficaces (n'aggrave jamais les pertes).
    const bonus = delta.relationEquipe > 0 ? SkillEngine.relationEquipeBonus(player) * 0.5 : 0;
    player.stats.relationEquipe = clamp(player.stats.relationEquipe + delta.relationEquipe + bonus);
  }
  if (delta.reputation !== undefined) {
    // Image publique / Athlète discret amortissent les pertes de réputation liées à un scandale.
    const effective = delta.reputation < 0 ? delta.reputation * (1 - SkillEngine.ethiqueShield(player)) : delta.reputation;
    const dims = addRep(effective);
    Object.entries(dims).forEach(([k, v]) => {
      // Popularité / Charisme / Sponsors ajoutent un petit bonus ciblé quand la réputation progresse.
      const skillBonus = effective > 0 ? Math.round(SkillEngine.reputationDimBonus(player, k) * 0.3) : 0;
      player.reputation[k] = clamp(player.reputation[k] + v + skillBonus);
    });
  }
  if (delta.specialtyDeltas) {
    Object.entries(delta.specialtyDeltas).forEach(([k, v]) => { player.specialties[k] = clamp((player.specialties[k] || 0) + v); });
  }
  if (delta.palmares) {
    delta.palmares.forEach((label) => {
      player.palmares.push({ label, age: player.age });
      player.history.push(`${player.age} ans — ${label}`);
    });
  }
  if (delta.resultTier) {
    recentResultTiers = [...recentResultTiers, delta.resultTier].slice(-2);
    const isGood = (t) => t === "victoire" || t === "podium" || t === "top10";
    if (recentResultTiers.length === 2 && recentResultTiers.every(isGood) && seasonBonusSkillPoints < BONUS_SKILL_POINTS_CAP) {
      player.skillPoints = (player.skillPoints || 0) + 1;
      seasonBonusSkillPoints += 1;
      player.history.push(`${player.age} ans — Enchaîne deux bons résultats coup sur coup, gagne un point de compétence bonus.`);
      recentResultTiers = []; // on repart de zéro pour éviter de recompter la même série en boucle
    }
  }
  if (delta.flags) player.flags = { ...player.flags, ...delta.flags };
  if (delta.money) {
    // Négociation / Sponsors améliorent les gains d'argent (jamais les coûts).
    const amount = delta.money > 0 ? Math.round(delta.money * SkillEngine.moneyMultiplier(player)) : delta.money;
    player.money = Math.max(0, (player.money || 0) + amount);
  }
  if (delta.team) { player.team = delta.team; }
  if (delta.teamUpgrade) {
    player.team = delta.teamUpgrade;
    player.money = (player.money || 0) + Math.round(delta.teamUpgrade.budget / 400 * SkillEngine.moneyMultiplier(player));
    player.history.push(`${player.age} ans — signe pour ${delta.teamUpgrade.name} (${delta.teamUpgrade.level}).`);
    // Historique des équipes : on clôt l'équipe précédente et on ouvre la nouvelle — pour le récapitulatif de carrière.
    const history = [...(player.teamsHistory || [])];
    if (history.length > 0) history[history.length - 1] = { ...history[history.length - 1], toAge: player.age };
    player.teamsHistory = [...history, { name: delta.teamUpgrade.name, level: delta.teamUpgrade.level, fromAge: player.age }];
  }
  if (delta.uciPoints) { player.uciPoints = (player.uciPoints || 0) + delta.uciPoints; }
  if (delta.tacticalBonus) {
    tacticalBonus += delta.tacticalBonus;
    // Race Engine V2 : toute action coûte de l'énergie, et une action significative tente de faire
    // progresser (positif) ou régresser (négatif) ton groupe dans la course — au lieu de simplement
    // additionner un chiffre au score final. C'est ce qui rend chaque décision réellement conséquente.
    raceState.energy = clamp(raceState.energy - Math.abs(delta.tacticalBonus) * 0.6);
    // Reputation & Social Consequences Engine : ta réputation dans le peloton influence directement
    // la coopération des autres coureurs. Bien vu = alliances faciles, échappées qui roulent bien
    // ensemble. Mal vu = coureurs qui refusent de collaborer, échappée qui ne prend jamais.
    const pelotonCooperationModifier = ((player.reputation?.peloton || 50) - 50) * 0.0024; // ±12% max
    if (delta.tacticalBonus >= 5 && raceState.energy > 15 && Math.random() < 0.35 + delta.tacticalBonus / 40 + pelotonCooperationModifier) {
      raceState.group = moveGroup(raceState.group, 1);
      // Progression en cours de saison : une action tactique à fort enjeu (attaque surprise, gros pari...)
      // qui réussit vraiment peut rapporter un point de compétence bonus — plafonné pour éviter le farming.
      if (delta.tacticalBonus >= 10 && seasonBonusSkillPoints < BONUS_SKILL_POINTS_CAP && Math.random() < 0.3) {
        player.skillPoints = (player.skillPoints || 0) + 1;
        seasonBonusSkillPoints += 1;
        player.history.push(`${player.age} ans — Une initiative tactique payante lui vaut un point de compétence bonus.`);
      }
    } else if (delta.tacticalBonus < 0 && (raceState.energy < 25 || Math.random() < 0.35)) {
      raceState.group = moveGroup(raceState.group, -1);
    }
  }
  if (delta.consumeTalentCharge) { talentCharges[delta.consumeTalentCharge] = false; }

  if (delta.rival && rivalRelation) {
    if (delta.rival.haine) rivalRelation.haine = clamp(rivalRelation.haine + delta.rival.haine);
    if (delta.rival.respect) rivalRelation.respect = clamp(rivalRelation.respect + delta.rival.respect);
  }
  if (delta.teammatesDelta && teammates) {
    // Patron / Train de sprint / Relais / Capitaine naturel renforcent l'effet de tout événement d'équipe.
    const teamBonusFactor = 1 + SkillEngine.teammatesBonus(player) / 100;
    Object.entries(delta.teammatesDelta).forEach(([k, v]) => {
      const boosted = v > 0 ? Math.round(v * teamBonusFactor) : v;
      teammates.forEach((tm) => { if (tm[k] !== undefined) tm[k] = clamp(tm[k] + boosted); });
    });
  }
  if (delta.pelotonPoints && peloton) {
    const pointsMap = new Map(delta.pelotonPoints.map((p) => [p.id, p.points]));
    peloton = peloton.map((r) => (pointsMap.has(r.id) ? { ...r, points: (r.points || 0) + pointsMap.get(r.id) } : r));
  }
  if (delta.majorResult) {
    seasonMajorResults = { ...seasonMajorResults, [delta.majorResult.raceName]: delta.majorResult.winner };
  }
  if (delta.sponsorFulfilled && sponsor && !sponsor.fulfilled) {
    sponsor.fulfilled = true;
    player.money = (player.money || 0) + sponsor.bonusMoney;
    player.reputation.sponsors = clamp(player.reputation.sponsors + 10);
  }

  return { ...game, player, rivalRelation, teammates, sponsor, peloton, seasonMajorResults, tacticalBonus, talentCharges, effortAccum, raceState, recentResultTiers, seasonBonusSkillPoints };
}

/* ============================== DILEMMES NARRATIFS ============================== */
const EVENTS = [
  /* ---- JUNIOR (16-18) ---- */
  { id: "j1", block: "junior", text: "Ton club amateur t'inscrit à une course régionale importante. Le sélectionneur régional sera présent dans les tribunes.",
    choices: [
      { label: "Tout donner dès le départ", resolve: () => ({ text: "Tu pars trop fort et craques dans le final, mais on remarque ton culot.", delta: { forme: -5, reputation: 4, fatigue: 8 } }) },
      { label: "Courir intelligemment, économiser ses forces", resolve: () => ({ text: "Tu places ton effort au bon moment et termines dans le groupe de tête.", delta: { forme: -2, reputation: 6, fatigue: 4 } }) },
    ] },
  { id: "j2", block: "junior", text: "Ton entraîneur te propose un stage intensif pendant les vacances scolaires, au détriment de tes révisions.",
    choices: [
      { label: "Accepter le stage", resolve: () => ({ text: "Tu progresses techniquement, mais tes parents s'inquiètent pour tes études.", delta: { forme: 6, fatigue: 6 } }) },
      { label: "Refuser, rester concentré sur l'école", resolve: () => ({ text: "Tu gardes l'équilibre, au prix d'un léger retard sur tes rivaux.", delta: { reputation: -2, ethique: 2 } }) },
    ] },
  { id: "j3", block: "junior", text: "Un recruteur d'une académie structurée assiste à ta course et t'observe dans les moments difficiles.",
    choices: [
      { label: "Attaquer pour te montrer", resolve: () => ({ text: "Ton attaque audacieuse tape dans l'œil du recruteur.", delta: { reputation: 7, fatigue: 6 } }) },
      { label: "Rouler pour un équipier plus fort que toi", resolve: () => ({ text: "Ton sens du collectif est noté, même sans résultat personnel.", delta: { relationEquipe: 8, reputation: 2 } }) },
    ] },
  { id: "j4", block: "junior", text: "Tu ressens une douleur au genou après une série d'entraînements intensifs.",
    choices: [
      { label: "Lever le pied et te soigner", resolve: () => ({ text: "Tu coupes court à temps, la douleur disparaît en deux semaines.", delta: { forme: -3, fatigue: -10 } }) },
      { label: "Serrer les dents et continuer", resolve: () => ({ text: "Tu tiens le rythme, mais la douleur devient chronique.", delta: { forme: 4, fatigue: 14, flags: { genouFragile: true } } }) },
    ] },
  { id: "j5", block: "junior", text: "Un ami de ton club te propose d'essayer un complément 'miracle' pour progresser plus vite.",
    choices: [
      { label: "Refuser catégoriquement", resolve: () => ({ text: "Tu restes sur tes valeurs. Le respect de tes proches grandit.", delta: { ethique: 6, relationEquipe: 3 } }) },
      { label: "Essayer, juste pour voir", resolve: () => ({ text: "Rien de probant, mais un doute s'installe dans ta tête.", delta: { ethique: -8 } }) },
    ] },
  { id: "j6", block: "junior", text: "Le club organise une sortie en montagne. Tes coéquipiers peinent dans les longues ascensions, mais toi, ça semble presque naturel.",
    choices: [
      { label: "Pousser l'allure dans les cols", resolve: () => ({ text: "Tu découvres avec surprise que la montagne te va bien — tes jambes répondent différemment ici.", delta: { specialtyDeltas: { montagne: 5 }, fatigue: 5 } }) },
      { label: "Rester groupé avec les autres, sans forcer", resolve: () => ({ text: "Tu restes prudent, sans vraiment tester tes limites en montagne.", delta: { fatigue: 2 } }) },
    ] },
  { id: "j7", block: "junior", text: "Un critérium local se termine par un sprint massif. Ton explosivité surprend tout le monde à l'arrivée.",
    choices: [
      { label: "Retravailler ce sprint à l'entraînement", resolve: () => ({ text: "Tu sens que la vitesse pure pourrait devenir une vraie arme pour toi.", delta: { specialtyDeltas: { sprint: 5 }, fatigue: 3 } }) },
      { label: "Ne pas s'y attarder, ce n'est qu'un critérium", resolve: () => ({ text: "Tu relativises ce résultat isolé et poursuis ta préparation habituelle.", delta: { forme: 2 } }) },
    ] },
  { id: "j8", block: "junior", text: "Ton club te propose de découvrir le contre-la-montre lors d'une course régionale, seul face au chrono.",
    choices: [
      { label: "S'investir sérieusement dans cette discipline", resolve: () => ({ text: "Le travail solitaire et la rigueur du chrono te correspondent étonnamment bien.", delta: { specialtyDeltas: { clm: 5 }, fatigue: 4 } }) },
      { label: "Le vivre comme une simple formalité", resolve: () => ({ text: "Tu termines sans éclat, sans vraiment t'investir dans l'exercice.", delta: { fatigue: 1 } }) },
    ] },
  { id: "j9", block: "junior", text: "Une classique junior locale se joue sur un secteur pavé exigeant. Tu adores ou tu détestes — pas de juste milieu.",
    choices: [
      { label: "Foncer sur les pavés sans lever le pied", resolve: () => ({ text: "Le chaos du pavé ne te fait pas peur — au contraire, tu t'y sens à l'aise.", delta: { specialtyDeltas: { pave: 5 }, fatigue: 5 } }) },
      { label: "Rouler prudemment pour éviter la chute", resolve: () => ({ text: "Tu passes ce secteur sans encombre, sans chercher à briller.", delta: { fatigue: 2 } }) },
    ] },
  { id: "j10", block: "junior", text: "Le championnat national junior approche. C'est la course la plus regardée de ta catégorie d'âge.",
    choices: [
      { label: "Viser le maillot à tout prix", resolve: () => ({ text: "Tu joues le tout pour le tout devant tout le pays — un souvenir marquant, quel que soit le résultat.", delta: { reputation: 9, fatigue: 8, forme: -3 } }) },
      { label: "Courir pour l'expérience, sans pression", resolve: () => ({ text: "Tu abordes la course sereinement, pour apprendre plutôt que pour viser le maillot.", delta: { reputation: 3, fatigue: 3 } }) },
    ] },
  { id: "j11", block: "junior", text: "Un ancien coureur pro, aujourd'hui entraîneur bénévole, te prend sous son aile après t'avoir repéré.",
    choices: [
      { label: "Écouter ses conseils tactiques avec attention", resolve: () => ({ text: "Sa lecture de course, acquise sur le terrain, t'ouvre les yeux sur des subtilités que personne ne t'avait enseignées.", delta: { reputation: 3, relationEquipe: 4 } }) },
      { label: "Rester sur tes propres intuitions", resolve: () => ({ text: "Tu préfères construire ton style à ta manière, quitte à apprendre plus lentement.", delta: { forme: 3 } }) },
    ] },
  { id: "j12", block: "junior", text: "Ta famille s'inquiète du temps et de l'argent investis dans le cyclisme, au détriment d'un \"vrai métier\".",
    choices: [
      { label: "Les rassurer en gardant un plan B scolaire", resolve: () => ({ text: "Tu trouves un équilibre qui apaise ta famille, sans sacrifier ta progression.", delta: { relationEquipe: 3, ethique: 3 } }) },
      { label: "T'investir à 100% dans le vélo, quitte à les inquiéter", resolve: () => ({ text: "Tu mises tout sur le cyclisme — un pari risqué, mais assumé.", delta: { forme: 4, reputation: 2 } }) },
    ] },

  // Événement rare (~5%) : don physiologique exceptionnel, à la Pogačar. Ne se déclenche qu'à 16 ans,
  // une seule fois par carrière (flag geneticsRolled).
  { id: "j_genetics", block: "junior", condition: (g) => g.player.age === 16 && !g.player.flags.geneticsRolled && Math.random() < 0.16,
    text: "Lors d'un test d'effort de routine, le médecin du club n'en revient pas : tes capacités physiologiques sortent largement des courbes habituelles pour ton âge.",
    choices: [
      { label: "Rester les pieds sur terre malgré la nouvelle", resolve: () => ({ text: "Tu prends cette révélation avec calme — un potentiel brut ne remplace jamais le travail, mais c'est un sacré atout pour la suite.", delta: { specialtyDeltas: { montagne: 6, sprint: 6, clm: 6, pave: 6 }, flags: { geneticsRolled: true, giftedGenetics: true } } }) },
      { label: "En faire désormais ton objectif de vie", resolve: () => ({ text: "Cette révélation change ta façon de voir ta trajectoire — tu vises désormais plus haut que jamais.", delta: { specialtyDeltas: { montagne: 6, sprint: 6, clm: 6, pave: 6 }, reputation: 4, flags: { geneticsRolled: true, giftedGenetics: true } } }) },
    ] },

  // Événement très rare (~2%) : signes de fragilité physique. La plupart du temps ça se solde par une
  // fragilité durable (flag physicalFragility) — mais dans de très rares cas (sous-tirage ~20-35%,
  // donc <1% au global), le diagnostic est sans appel et met fin à la carrière avant qu'elle commence.
  { id: "j_fragility", block: "junior", condition: (g) => g.player.age === 16 && !g.player.flags.fragilityRolled && Math.random() < 0.06,
    text: "Une série d'examens médicaux de routine détecte une anomalie inhabituelle. Le médecin recommande une prudence particulière pour la suite.",
    choices: [
      { label: "Suivre scrupuleusement les recommandations médicales", resolve: () => {
          if (Math.random() < 0.2) return { text: "Malgré toutes les précautions prises, le diagnostic final tombe : une fragilité bien trop sérieuse pour continuer. Ta carrière s'arrête avant même d'avoir commencé.", delta: { flags: { careerEndingInjury: true } } };
          return { text: "En étant prudent, tu limites les dégâts — mais une fragilité durable s'installe, qu'il faudra désormais gérer toute ta carrière.", delta: { flags: { fragilityRolled: true, physicalFragility: true }, fatigueChronique: 8 } };
        } },
      { label: "Continuer comme si de rien n'était", resolve: () => {
          if (Math.random() < 0.35) return { text: "En ignorant les signaux d'alarme, la situation s'aggrave. Le diagnostic final est sans appel : ta carrière s'arrête avant même d'avoir commencé.", delta: { flags: { careerEndingInjury: true } } };
          return { text: "Tu t'en sors cette fois, mais la fragilité détectée ne disparaît jamais complètement.", delta: { flags: { fragilityRolled: true, physicalFragility: true }, fatigueChronique: 12 } };
        } },
    ] },

  /* ---- PASSAGE PRO ---- */
  { id: "pro1", block: "passage_pro", text: "Tes performances en junior/espoir attirent l'attention. Des équipes te font une offre.",
    choices: (g) => {
      // Une belle période de formation ouvre de meilleures portes : au-delà d'une réputation junior
      // vraiment remarquable, des ProTeams peuvent s'intéresser à toi dès le premier contrat.
      const pool = (g.player.reputation.peloton >= 45) ? [...pickTeams(TEAMS_PT, 1), ...pickTeams(TEAMS_CT, 1)] : pickTeams(TEAMS_CT, 2);
      return pool.map((team) => ({ label: `${team.name} (${team.country}) — ${team.objective}`, resolve: () => ({ text: `Tu signes ton premier contrat professionnel avec ${team.name}.`, delta: { team, money: Math.round(team.budget / 400) } }) }));
    } },

  /* ---- HIVER ---- */
  { id: "h1", block: "hiver", text: "Stage hivernal en altitude. Le staff propose un programme d'entraînement très exigeant.",
    choices: [
      { label: "Suivre le programme à la lettre", resolve: () => ({ text: "Tu abordes la saison dans une forme excellente, mais fatigué en profondeur.", delta: { forme: 14, fatigue: 12 } }) },
      { label: "Doser tes efforts, écouter ton corps", resolve: () => ({ text: "Une préparation plus mesurée, moins spectaculaire mais plus saine.", delta: { forme: 8, fatigue: 4 } }) },
    ] },
  { id: "h2", block: "hiver", text: "Le directeur sportif redistribue les rôles au sein de l'équipe pour la saison à venir.",
    choices: [
      { label: "Demander un rôle de leader sur les classiques", resolve: () => ({ text: "Le DS apprécie ton ambition et t'accorde sa confiance... sous conditions.", delta: { reputation: 3, relationEquipe: -2, flags: { objectifLeader: true } } }) },
      { label: "Accepter un rôle d'équipier au service du groupe", resolve: () => ({ text: "Ta discipline rassure le staff. Ton crédit grandit dans l'ombre.", delta: { relationEquipe: 8 } }) },
    ] },
  { id: "h3", block: "hiver", condition: (g) => g.player.flags.genouFragile, text: "Ton genou te fait à nouveau souffrir pendant les premières sorties longues.",
    choices: [
      { label: "Consulter immédiatement un spécialiste", resolve: () => ({ text: "Diagnostic rassurant après examen, mais tu perds trois semaines de prépa.", delta: { forme: -6, fatigue: -6 } }) },
      { label: "Ignorer et continuer à t'entraîner", resolve: () => ({ text: "La douleur revient plus fort en pleine saison — tu le paieras plus tard.", delta: { forme: 4, flags: { blessureLatente: true } } }) },
    ] },
  { id: "h4", block: "hiver", text: "Un journaliste sportif te contacte pour une interview sur tes ambitions de la saison.",
    choices: [
      { label: "Rester humble et discret", resolve: () => ({ text: "Une interview sobre, appréciée par le staff.", delta: { relationEquipe: 3, reputation: 1 } }) },
      { label: "Afficher de grandes ambitions", resolve: () => ({ text: "Tes déclarations font parler de toi, pour le meilleur et pour le pire.", delta: { reputation: 6, relationEquipe: -3 } }) },
    ] },
  { id: "h5", block: "hiver", text: "Ton agent te transmet une proposition de sponsor personnel, indépendante de l'équipe.",
    choices: [
      { label: "Accepter, ça sécurise ton avenir financier", resolve: () => ({ text: "Un revenu confortable, mais quelques crispations avec le sponsor principal.", delta: { relationEquipe: -4, reputation: 2, money: 5000 } }) },
      { label: "Décliner par loyauté envers l'équipe", resolve: () => ({ text: "Le geste est remarqué en interne.", delta: { relationEquipe: 6 } }) },
    ] },
  { id: "h6", block: "hiver", condition: (g) => g.player.age >= 27, text: "Tu envisages une reconversion partielle de ta spécialité pour élargir ton profil.",
    choices: [
      { label: "Te réorienter vers le rôle de baroudeur", resolve: () => ({ text: "Tu travailles ton endurance et ton sens tactique pour les échappées longues.", delta: { specialtyDeltas: { montagne: 4 }, forme: -2 } }) },
      { label: "Rester fidèle à ta spécialité d'origine", resolve: () => ({ text: "Tu préfères capitaliser sur tes forces plutôt que te réinventer.", delta: { forme: 2 } }) },
    ] },
  // Reputation & Social Consequences Engine : quand l'éthique est durablement basse (accumulation de choix
  // douteux au fil de la carrière), le risque d'un scandale médiatique devient réel — avec un vrai impact
  // sur la réputation, amorti par ethiqueShield (compétences Image publique / Athlète discret).
  { id: "h7", block: "hiver", condition: (g) => g.player.stats.ethique < 40 && !g.player.flags.dopingScandalResolved && Math.random() < 0.18,
    text: "Un média d'investigation publie un article mettant en cause tes méthodes de préparation ces dernières saisons. L'affaire fait grand bruit dans le peloton et bien au-delà.",
    choices: [
      { label: "Nier catégoriquement et attaquer en diffamation", resolve: () => {
          const believed = Math.random() < 0.5;
          return believed
            ? { text: "Ta défense ne convainc personne — l'opinion publique et le peloton te tournent le dos.", delta: { reputation: -18, flags: { dopingScandalResolved: true } } }
            : { text: "Ta fermeté finit par semer le doute dans l'autre sens — l'affaire se dégonfle progressivement.", delta: { reputation: -6, flags: { dopingScandalResolved: true } } };
        } },
      { label: "Reconnaître des erreurs passées et t'excuser publiquement", resolve: () => ({ text: "Ta transparence surprend — certains te reprochent encore, mais beaucoup respectent la démarche.", delta: { reputation: -10, ethique: 8, flags: { dopingScandalResolved: true } } }) },
    ] },

  /* ---- CLASSIQUES (dilemme de connexion) ---- */
  { id: "c4", block: "classiques", text: "Un coureur adverse te chambre publiquement après une course, remettant en cause ta légitimité.",
    choices: [
      { label: "Répondre sur les réseaux sociaux", resolve: () => ({ text: "L'échange fait le buzz, ta popularité grimpe. La rivalité s'installe durablement.", delta: { reputation: 5, flags: { rivalite: true }, rival: { haine: 12 } } }) },
      { label: "Ignorer et répondre sur le vélo", resolve: () => ({ text: "Tu restes concentré sur l'essentiel. Une rivalité couve malgré tout.", delta: { forme: 2, flags: { rivalite: true }, rival: { haine: 4, respect: 4 } } }) },
    ] },

  /* ---- COEUR DE SAISON (dilemmes de connexion) ---- */
  { id: "g4", block: "coeur", text: "Ton leader chute dans un carambolage à 40 km de l'arrivée. Il a besoin de toi pour revenir dans le peloton.",
    choices: [
      { label: "Sacrifier ta journée pour le ramener", resolve: () => ({ text: "Tu roules à bloc pour ramener ton leader. L'équipe n'oubliera pas ce sacrifice.", delta: { relationEquipe: 14, fatigue: 12, forme: -6, teammatesDelta: { moral: 6 } } }) },
      { label: "Laisser d'autres équipiers s'en charger", resolve: () => ({ text: "Tu préserves tes jambes, mais le geste ne passe pas inaperçu dans le groupe.", delta: { relationEquipe: -10, forme: 3, teammatesDelta: { moral: -5 } } }) },
    ] },
  { id: "g6", block: "coeur", text: "Le vent souffle fort en côte de plaine. Une bordure se prépare à l'avant du peloton.",
    choices: [
      { label: "Te positionner dans les 15 premiers", resolve: () => ({ text: "Bien placé, tu évites la cassure et gagnes en crédit auprès du DS.", delta: { reputation: 3, fatigue: 6 } }) },
      { label: "Rester groupé au milieu du peloton", resolve: () => ({ text: "Tu te fais surprendre par la bordure et perds du temps.", delta: { forme: -5, reputation: -3 } }) },
    ] },
  { id: "g7", block: "coeur", text: "Un membre du staff médical te propose discrètement un 'produit non contrôlé' pour encaisser la charge du grand tour.",
    choices: [
      { label: "Refuser fermement", resolve: () => ({ text: "Tu restes fidèle à tes valeurs, même si la fatigue pèse.", delta: { ethique: 10, fatigue: 4 } }) },
      { label: "Céder à la pression", resolve: () => ({ text: "Un choix lourd de conséquences, que tu gardes secret pour l'instant.", delta: { ethique: -20, forme: 6, flags: { dopageSecret: true } } }) },
    ] },
  { id: "g8", block: "coeur", text: "Crevaison au pire moment, en pleine bagarre pour le classement général.",
    choices: [
      { label: "Changer de roue et repartir à fond", resolve: () => ({ text: "Un retour héroïque dans le peloton, salué par les commentateurs.", delta: { reputation: 4, fatigue: 10, forme: -3 } }) },
      { label: "Gérer calmement, limiter la casse", resolve: () => ({ text: "Tu limites les dégâts sans prendre de risque inutile.", delta: { fatigue: 5 } }) },
    ] },

  /* ---- FIN DE SAISON ---- */
  { id: "f2", block: "fin", text: "Fin août : ton contrat arrive à échéance. Le mercato cycliste s'ouvre.",
    choices: (g) => {
      const level = g.player.team.level;
      const base = [
        { label: "Négocier une prolongation dans ton équipe actuelle", resolve: () => ({ text: "La continuité rassure le staff, sans forcément faire progresser ton salaire.", delta: { relationEquipe: 6 } }) },
      ];
      // Le niveau EFFECTIF d'une équipe (après une éventuelle promotion/relégation en cours de saison)
      // peut différer de son niveau de création — on recalcule donc les pools à la volée.
      const teamsAtLevel = (lvl) => ALL_TEAMS.map((t) => resolveTeam(g, t)).filter((t) => t.level === lvl);
      let upgradePool = null, upgradeLabel = "";
      if (level === TEAM_LEVELS.CT && g.player.reputation.peloton >= 40) { upgradePool = teamsAtLevel(TEAM_LEVELS.PT); upgradeLabel = "ProTeam"; }
      else if (level === TEAM_LEVELS.PT && g.player.reputation.peloton >= 60) { upgradePool = teamsAtLevel(TEAM_LEVELS.WT); upgradeLabel = "WorldTour"; }
      if (upgradePool && upgradePool.length > 0) {
        const bigTeam = pick(upgradePool);
        const modestPool = teamsAtLevel(level).filter((t) => t.id !== g.player.team.id);
        const modestTeam = modestPool.length > 0 ? pick(modestPool) : g.player.team;
        base.push({ label: `Offre A — ${bigTeam.name} (${upgradeLabel}), rôle d'équipier`, resolve: () => ({ text: `${bigTeam.name} te veut dans son effectif, mais en tant qu'équipier au service de leaders déjà installés. Le tremplin idéal vers les Grands Tours — sans garantie de résultats personnels.`, delta: { reputation: 4, teamUpgrade: bigTeam } }) });
        base.push({ label: `Offre B — ${modestTeam.name}, leadership garanti`, resolve: () => ({ text: `${modestTeam.name} t'offre moins de prestige, mais un rôle de leader garanti et un calendrier construit autour de toi.`, delta: { reputation: 2, relationEquipe: 5, teamUpgrade: modestTeam, flags: { leadershipGuarantee: true } } }) });
      } else {
        base.push({ label: "Écouter les offres extérieures", resolve: () => ({ text: "Les touches restent discrètes, tu resteras probablement où tu es.", delta: { reputation: 1 } }) });
      }
      return base;
    } },
  { id: "f3", block: "fin", text: "Bilan de fin de saison avec le staff. C'est l'occasion de faire le point sur ta trajectoire.",
    choices: [
      { label: "Demander un programme d'entraînement plus poussé", resolve: () => ({ text: "Le staff valide un programme ambitieux pour progresser encore.", delta: { forme: 6, fatigue: 6 } }) },
      { label: "Demander une saison plus légère pour récupérer", resolve: () => ({ text: "Le staff comprend et allège ta charge pour l'an prochain.", delta: { fatigue: -14 } }) },
    ] },
  { id: "f4", block: "fin", condition: (g) => g.player.flags.dopageSecret, text: "Une rumeur commence à circuler dans la presse sportive sur d'éventuelles pratiques douteuses dans le peloton.",
    choices: [
      { label: "Garder profil bas", resolve: () => ({ text: "La rumeur ne te vise pas directement... pour l'instant.", delta: { fatigue: 3 } }) },
      { label: "Anticiper en te confiant à un journaliste de confiance", resolve: () => ({ text: "Un choix risqué qui pourrait se retourner contre toi à tout moment.", delta: { reputation: -6, ethique: 4 } }) },
    ] },
  { id: "f5", block: "fin", condition: (g) => g.player.stats.fatigue > 60, text: "Une petite douleur traînante depuis l'été ne passe pas malgré le repos.",
    choices: [
      { label: "Passer des examens complets à l'intersaison", resolve: () => ({ text: "Rien de grave détecté, tu abordes l'hiver rassuré(e).", delta: { fatigue: -20 } }) },
      { label: "Faire l'impasse, ça ira mieux avec le repos naturel", resolve: () => ({ text: "Le repos aide, mais le doute persiste discrètement.", delta: { fatigue: -8, forme: -2 } }) },
    ] },
  { id: "f6", block: "fin", text: "Un média te propose une interview bilan, à diffuser largement.",
    choices: [
      { label: "Jouer la carte de la transparence totale", resolve: () => ({ text: "Ton authenticité touche le public.", delta: { reputation: 5, relationEquipe: 2 } }) },
      { label: "Rester sur une communication policée", resolve: () => ({ text: "Une interview sans relief, mais sans risque.", delta: { reputation: 1 } }) },
    ] },
];

/* ============================== VRAI CALENDRIER — COURSES EN SÉQUENCES ============================== */
function finishChoices(specKey, raceName, extra = {}, isStageRace = false) {
  function majorResultFor(o) {
    if (!MAJOR_RACE_NAMES.has(raceName) || !o.classification || !o.classification[0]) return undefined;
    const w = o.classification[0];
    return { raceName, winner: { id: w.id, name: w.name, nation: w.nation } };
  }
  function withJerseys(o, g, baseText) {
    const gcPalmares = (o.palmares || []).map((label) => (isStageRace ? label.replace("Victoire —", "Classement général —") : label));
    if (!isStageRace) return { text: baseText, palmares: gcPalmares, uciPoints: o.uciPoints || 0 };
    const j = applyStageRaceJerseys(g, raceName, baseText);
    return { text: j.text, palmares: [...gcPalmares, ...j.palmares], uciPoints: (o.uciPoints || 0) + j.uciPoints };
  }
  return [
    { label: "Attaquer pour la victoire", resolve: (g) => {
        const o = raceOutcomeVsRival(g, specKey, raceName);
        const r = withJerseys(o, g, o.text);
        return { text: r.text, classification: o.classification, playerPosition: o.playerPosition, fieldSize: o.fieldSize, delta: { forme: o.forme, fatigue: o.fatigue, reputation: o.reputation, palmares: r.palmares, rival: o.rivalDelta, uciPoints: r.uciPoints, pelotonPoints: o.pelotonPoints, majorResult: majorResultFor(o), resultTier: o.tier, ...extra } };
      } },
    { label: "Gérer ton effort, viser un résultat solide", resolve: (g) => {
        const o = raceOutcomeVsRival(g, specKey, raceName);
        const r = withJerseys(o, g, o.text);
        return { text: r.text, classification: o.classification, playerPosition: o.playerPosition, fieldSize: o.fieldSize, delta: { forme: o.forme + 3, fatigue: o.fatigue - 3, reputation: Math.round(o.reputation * 0.7), palmares: r.palmares, rival: o.rivalDelta, uciPoints: r.uciPoints, pelotonPoints: o.pelotonPoints, majorResult: majorResultFor(o), resultTier: o.tier, ...extra } };
      } },
  ];
}

// Génère une course "standard" à 2 étapes (moins de narration sur-mesure que les Monuments, mais un vrai
// calcul de performance et un vrai enjeu). Utilisé pour étoffer massivement le calendrier ProSeries/Europe Tour.
function genericRace(id, name, month, fit, specKey, raceTier, tacticalText, isStageRace = false) {
  return {
    id, name, month, fit, specKey, raceTier, isStageRace,
    stages: [
      { phase: "Course en mouvement", text: tacticalText,
        choices: [
          { label: "Te montrer offensif", resolve: () => ({ text: "Tu te places dans le mouvement, quitte à payer cash plus tard.", delta: { fatigue: 4 } }) },
          { label: "Rester prudent, observer la course", resolve: () => ({ text: "Tu laisses la course se construire sans t'exposer.", delta: { fatigue: 1 } }) },
        ] },
      { phase: "Ligne d'arrivée", text: `Dernier kilomètres de ${name}, tout reste à jouer.`, choices: finishChoices(specKey, name, {}, isStageRace) },
    ],
  };
}

// Contre-la-montre par équipes : le seul exercice vraiment collectif du calendrier — le niveau moyen de
// tes équipiers pèse autant que tes propres jambes dans le résultat, via un bonus tactique qui alimente
// le Race Engine V2 comme n'importe quel autre choix.
function buildTeamTimeTrial() {
  return {
    id: "cttt", name: "Contre-la-montre par équipes", month: "Mars", fit: SPEC_IDS, specKey: "clm", raceTier: "WT", isStageRace: false,
    stages: [
      { phase: "Départ collectif", text: (g) => {
          const teammates = g.teammates || [];
          const avgLevel = teammates.length ? Math.round(teammates.reduce((a, t) => a + t.level, 0) / teammates.length) : 60;
          return `Toute l'équipe s'élance ensemble contre le chrono. Le niveau collectif de tes équipiers (moyenne ${avgLevel}) va peser autant que tes propres jambes dans le résultat final.`;
        },
        choices: [
          { label: "Prendre de longs relais en tête", resolve: (g) => {
              const teammates = g.teammates || [];
              const avgLevel = teammates.length ? teammates.reduce((a, t) => a + t.level, 0) / teammates.length : 60;
              const teamBonus = Math.round((avgLevel - 60) * 0.3);
              return { text: "Tu tires le groupe vers l'avant, en confiance dans le niveau de tes équipiers.", delta: { fatigue: 8, tacticalBonus: 4 + teamBonus, teammatesDelta: { moral: 2 } } };
            } },
          { label: "Rester prudent, suivre le rythme du groupe", resolve: (g) => {
              const teammates = g.teammates || [];
              const avgLevel = teammates.length ? teammates.reduce((a, t) => a + t.level, 0) / teammates.length : 60;
              const teamBonus = Math.round((avgLevel - 60) * 0.3);
              return { text: "Tu économises tes forces et laisses le collectif porter l'effort.", delta: { fatigue: 4, tacticalBonus: 1 + teamBonus } };
            } },
        ] },
      { phase: "Derniers kilomètres", text: "Les derniers hectomètres du chrono collectif, dans la roue de tes équipiers.", choices: finishChoices("clm", "Contre-la-montre par équipes", {}, false) },
    ],
  };
}

// Championnat national : une course à part, disputée face aux meilleurs compatriotes, ouverte à tous les niveaux
// d'équipe. Généré dynamiquement car son nom dépend de la nationalité du joueur.
function buildNationalChampionship(player) {
  const specMap = { grimpeur: "montagne", puncheur: "montagne", sprinteur: "sprint", rouleur: "clm", polyvalent: "montagne" };
  const specKey = specMap[player.specialtyPrimary] || "montagne";
  const raceName = `Championnat de ${player.nation.label} sur route`;
  return {
    id: "national_champs", name: raceName, month: "Juin", raceTier: "National",
    stages: [
      { phase: "Face aux meilleurs compatriotes", text: (g) => `Le maillot de champion national se joue aujourd'hui, face à l'élite de ${g.player.nation.label}.${raceContextLine(g, raceName)}`,
        choices: [
          { label: "Prendre la course à ton compte", resolve: () => ({ text: "Tu assumes le rôle de favori face à tes compatriotes.", delta: { fatigue: 4 } }) },
          { label: "Rester discret, attendre le final", resolve: () => ({ text: "Tu laisses les autres animer la course avant de te positionner.", delta: { fatigue: 1 } }) },
        ] },
      { phase: "Ligne d'arrivée", text: "Le maillot distinctif de champion national attend le vainqueur.", choices: finishChoices(specKey, raceName) },
    ],
  };
}

const CLASSICS = [
  { id: "omloop", name: "Omloop Het Nieuwsblad", month: "Février", fit: ["rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "pave", raceTier: "WT",
    stages: [
      { phase: "Les monts flandriens en ouverture", text: "Premier vrai test de la saison sur les pavés et les monts de Flandre-Occidentale. Le froid mord, le rythme est déjà élevé.",
        choices: [
          { label: "Te montrer offensif d'entrée", resolve: () => ({ text: "Tu montres tes jambes dès l'ouverture de saison, jambes lourdes mais présentes.", delta: { fatigue: 5, rival: { haine: 3 } } }) },
          { label: "Prendre la mesure de la course", resolve: () => ({ text: "Tu observes, encore un peu rouillé après la trêve hivernale.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Arrivée à Ninove", text: "Les derniers secteurs pavés avant l'arrivée décideront de cette première classique de la saison.", choices: finishChoices("pave", "Omloop Het Nieuwsblad") },
    ] },
  { id: "paris-nice", name: "Paris-Nice", month: "Mars", fit: ["grimpeur", "rouleur", "sprinteur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true,
    stages: [
      { phase: "La Course au Soleil", text: "Une semaine pour relier Paris à Nice, entre étapes de plaine et arrivée en altitude.",
        choices: [
          { label: "Attaquer sur les étapes vallonnées", resolve: () => ({ text: "Tu grappilles des secondes sur les étapes intermédiaires.", delta: { fatigue: 5 } }) },
          { label: "Économiser tes forces pour la dernière étape", resolve: () => ({ text: "Tu patientes, prêt à jouer ta carte au meilleur moment.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Étape reine, col d'Èze", text: "La dernière étape, vers Nice, tranche généralement le classement général.", choices: finishChoices("montagne", "Paris-Nice", {}, true) },
    ] },
  { id: "tirreno", name: "Tirreno-Adriatico", month: "Mars", fit: ["grimpeur", "rouleur", "sprinteur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true,
    stages: [
      { phase: "De la mer Tyrrhénienne à l'Adriatique", text: "Une course par étapes exigeante, entre étapes vallonnées et contre-la-montre.",
        choices: [
          { label: "Prendre des risques sur les étapes intermédiaires", resolve: () => ({ text: "Tu te mets en évidence sur le parcours accidenté.", delta: { fatigue: 5 } }) },
          { label: "Gérer ta charge en vue de la suite de saison", resolve: () => ({ text: "Tu roules avec prudence, la Milan-San Remo approche.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Étape finale à San Benedetto del Tronto", text: "Le classement général se joue dans les derniers kilomètres.", choices: finishChoices("montagne", "Tirreno-Adriatico", {}, true) },
    ] },
  { id: "msr", name: "Milan-San Remo", month: "Mars", fit: ["sprinteur", "puncheur", "rouleur", "polyvalent"], specKey: "sprint", raceTier: "WT",
    stages: [
      { phase: "Le Poggio", text: (g) => `Dernière difficulté avant l'arrivée. ${getRival(g).name} teste ses jambes en tête du peloton.${raceContextLine(g, "Milan-San Remo")}`,
        choices: [
          { label: "Attaquer dans le Poggio", resolve: () => ({ text: "Tu tentes le tout pour le tout dans la dernière difficulté.", delta: { fatigue: 5, flags: { poggioAttack: true } } }) },
          { label: "Garder tes forces pour le sprint", resolve: () => ({ text: "Tu restes sagement au chaud dans le peloton.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Via Roma, ligne d'arrivée", text: "L'arrivée mythique de la Via Roma approche.",
        choices: finishChoices("sprint", "Milan-San Remo") },
    ] },
  { id: "flandres", name: "Tour des Flandres", month: "Avril", fit: ["puncheur", "rouleur", "sprinteur", "polyvalent"], specKey: "pave", raceTier: "WT",
    stages: [
      { phase: "Le Mur de Grammont", text: (g) => `Les monts flandriens s'enchaînent. ${getRival(g).name} place une première attaque sur les pavés en pente.${raceContextLine(g, "Tour des Flandres")}`,
        choices: [
          { label: "Forcer l'allure dans le mur", resolve: () => ({ text: "Tu passes en force, jambes lourdes mais toujours devant.", delta: { fatigue: 6 } }) },
          { label: "Te faufiler dans les roues", resolve: () => ({ text: "Tu économises un peu d'énergie en te faufilant intelligemment.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "Le Vieux Quaremont, final", text: "Dernier passage sur les pavés emblématiques avant l'arrivée à Audenarde.", choices: finishChoices("pave", "Tour des Flandres") },
    ] },
  { id: "roubaix", name: "Paris-Roubaix", month: "Avril", fit: ["rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "pave", raceTier: "WT",
    stages: [
      { phase: "La tranchée d'Arenberg", text: (g) => `Le secteur le plus redouté de la course. Une chute générale se produit devant toi.${raceContextLine(g, "Paris-Roubaix")}`,
        choices: [
          { label: "Freiner et contourner", resolve: () => ({ text: "Tu évites la chute mais perds du temps précieux.", delta: { forme: -2 } }) },
          { label: "Prendre le risque de passer par le bas-côté", resolve: () => ({ text: "Un pari payant : tu restes dans le bon wagon !", delta: { reputation: 4, fatigue: 4 } }) },
        ] },
      { phase: "Le vélodrome de Roubaix", text: "L'arrivée légendaire sur la piste du vélodrome.", choices: finishChoices("pave", "Paris-Roubaix") },
    ] },
  { id: "amstel", name: "Amstel Gold Race", month: "Avril", fit: ["grimpeur", "puncheur", "rouleur", "polyvalent"], specKey: "montagne", raceTier: "WT",
    stages: [
      { phase: "Les côtes du Limbourg", text: "Une trentaine de côtes courtes s'enchaînent dans les collines néerlandaises, usant les organismes.",
        choices: [
          { label: "Placer une attaque à mi-course", resolve: () => ({ text: "Tu testes le peloton, sans forcément faire la différence tout de suite.", delta: { fatigue: 5 } }) },
          { label: "Rester econome jusqu'au Cauberg", resolve: () => ({ text: "Tu gardes tes forces pour la dernière difficulté.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Le Cauberg, juge de paix", text: "La dernière ascension du Cauberg décide traditionnellement de la course.", choices: finishChoices("montagne", "Amstel Gold Race") },
    ] },
  { id: "fleche", name: "Flèche Wallonne", month: "Avril", fit: ["puncheur", "grimpeur", "polyvalent"], specKey: "montagne", raceTier: "WT",
    stages: [
      { phase: "Approche du Mur de Huy", text: "La course se resserre à l'approche de la triple ascension du Mur de Huy.",
        choices: [
          { label: "Te positionner en tête avant la dernière ascension", resolve: () => ({ text: "Tu te bats pour une place idéale dans le peloton compressé.", delta: { fatigue: 4 } }) },
          { label: "Rester au calme, économiser tes jambes", resolve: () => ({ text: "Tu restes patient avant l'explication finale.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Le Mur de Huy, dernière rampe", text: "Les pentes à plus de 20% du Mur de Huy ne pardonnent aucune erreur de jugement.", choices: finishChoices("montagne", "Flèche Wallonne") },
    ] },
  { id: "lbl", name: "Liège-Bastogne-Liège", month: "Avril", fit: ["grimpeur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT",
    stages: [
      { phase: "La Côte de la Redoute", text: (g) => `La pente s'élève brutalement. ${getRival(g).name} sort les crocs en tête du groupe des favoris.${raceContextLine(g, "Liège-Bastogne-Liège")}`,
        choices: [
          { label: "Suivre les meilleurs sans faiblir", resolve: () => ({ text: "Tu tiens le rythme des favoris, au prix d'un effort colossal.", delta: { fatigue: 6 } }) },
          { label: "Laisser filer, revenir plus tard", resolve: () => ({ text: "Tu limites la casse en gérant ton effort.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "La Côte de la Roche-aux-Faucons", text: "La dernière difficulté avant Liège décidera de la course.", choices: finishChoices("montagne", "Liège-Bastogne-Liège") },
    ] },

  // ---- ProSeries (niveau 2, calendrier UCI ProSeries 2026) ----
  genericRace("laigueglia", "Trofeo Laigueglia", "Février", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Pro", "La classique ligure ouvre la saison des puncheurs sur les hauteurs de la Riviera."),
  genericRace("nokere", "Danilith Nokere Koerse", "Mars", ["rouleur", "puncheur", "sprinteur", "polyvalent"], "pave", "Pro", "Les pavés flandriens s'invitent tôt dans la saison, sur un parcours court et nerveux."),
  genericRace("milano-torino", "Milano-Torino", "Mars", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Pro", "La plus vieille classique du calendrier italien se termine par une ascension décisive."),
  genericRace("denain", "Grand Prix de Denain", "Mars", ["rouleur", "sprinteur", "puncheur", "polyvalent"], "pave", "Pro", "Une classique pavée du Nord, réputée pour son exigence malgré sa courte distance."),
  genericRace("scheldeprijs", "Scheldeprijs", "Avril", ["sprinteur", "rouleur", "polyvalent"], "sprint", "Pro", "La \"classique des sprinteurs\" traverse la Flandre avant un sprint massif à Schoten."),

  // ---- Europe Tour (niveau 3, courses 1.1/1.2/2.1 — calendrier 2026 réel) ----
  genericRace("palma", "Trofeo Palma", "Février", ["sprinteur", "puncheur", "rouleur", "polyvalent"], "sprint", "Europe", "Le traditionnel lever de rideau de la saison à Majorque, souvent promis à un sprint."),
  genericRace("bessges", "Étoile de Bessèges", "Février", ["grimpeur", "rouleur", "puncheur", "polyvalent"], "montagne", "Europe", "Une course par étapes gardoise qui sert de test de forme hivernal à tout le peloton continental.", true),
  genericRace("antalya", "Grand Prix Antalya", "Février", ["sprinteur", "rouleur", "polyvalent"], "sprint", "Europe", "Une classique turque roulante, généralement décidée au sprint."),
  genericRace("provence", "Tour de la Provence", "Février", ["grimpeur", "rouleur", "puncheur", "polyvalent"], "montagne", "Europe", "Une course par étapes provençale avec une arrivée en altitude décisive.", true),
  genericRace("jaen", "Clásica Jaén", "Février", ["puncheur", "grimpeur", "polyvalent"], "montagne", "Europe", "Une classique andalouse aux monts courts et répétés, taillée pour les puncheurs."),
  genericRace("var", "Classic Var", "Février", ["puncheur", "rouleur", "sprinteur", "polyvalent"], "montagne", "Europe", "Une classique varoise vallonnée, disputée tôt dans la saison méditerranéenne."),
  genericRace("alpes-maritimes", "Tour des Alpes-Maritimes", "Février", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Europe", "Un parcours accidenté dans l'arrière-pays niçois, propice aux baroudeurs."),
  genericRace("sardegna", "Giro di Sardegna", "Février", ["sprinteur", "rouleur", "puncheur", "polyvalent"], "montagne", "Europe", "Une course par étapes sarde qui alterne étapes de plaine et arrivées vallonnées.", true),
];

// Classiques d'automne (octobre) — un choix parmi ces trois courses, en plus d'Il Lombardia (automatique).
const AUTUMN_CLASSICS = [
  genericRace("emilia", "Giro dell'Emilia", "Octobre", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Pro", "La montée répétée du Santuario di San Luca décide traditionnellement de la course."),
  genericRace("varesine", "Tre Valli Varesine", "Octobre", ["puncheur", "grimpeur", "polyvalent"], "montagne", "Pro", "Un parcours vallonné et nerveux dans la région de Varèse, en clôture de saison italienne."),
  genericRace("paris-tours", "Paris-Tours", "Octobre", ["sprinteur", "rouleur", "puncheur", "polyvalent"], "sprint", "Pro", "La \"classique des feuilles mortes\" du Val de Loire se termine généralement par un sprint groupé."),
];

// Ouverture de saison (janvier-février) — un choix parmi ces deux courses selon le profil.
const EARLY_SEASON_RACES = [
  { id: "tdu", name: "Tour Down Under", month: "Janvier", fit: ["sprinteur", "rouleur", "puncheur", "polyvalent"], specKey: "sprint", raceTier: "WT", isStageRace: true,
    stages: [
      { phase: "Premières kermesses australiennes", text: "Le peloton retrouve la compétition sous le soleil d'Adelaide, dans une ambiance encore décontractée.",
        choices: [
          { label: "Se montrer déjà offensif", resolve: () => ({ text: "Tu forces un peu le rythme, histoire de tester tes jambes dès janvier.", delta: { fatigue: 4 } }) },
          { label: "Prendre la course comme un entraînement", resolve: () => ({ text: "Tu profites surtout de la mise en jambes collective.", delta: { fatigue: 1 } }) },
        ] },
      { phase: "Sprint final à Adelaide", text: "Le peloton se présente groupé pour la dernière étape.", choices: finishChoices("sprint", "Tour Down Under", {}, true) },
    ] },
  { id: "uae-tour", name: "UAE Tour", month: "Février", fit: ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true,
    stages: [
      { phase: "Entre désert et gratte-ciel", text: "La course par étapes émirienne alterne étapes de plaine balayées par le vent et arrivées en altitude.",
        choices: [
          { label: "Te placer en vue du général", resolve: () => ({ text: "Tu te mêles à la bagarre pour le classement général dès le début de saison.", delta: { fatigue: 5 } }) },
          { label: "Utiliser la course pour monter en forme", resolve: () => ({ text: "Tu roules pour construire ta condition, sans te mettre en danger.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Arrivée au sommet de Jebel Hafeet", text: "La dernière ascension décide traditionnellement du classement général.", choices: finishChoices("montagne", "UAE Tour", {}, true) },
    ] },
  buildTeamTimeTrial(),
];

// Préparation estivale (juin) — un choix parmi ces deux courses avant le grand tour.
const SUMMER_PREP_RACES = [
  { id: "dauphine", name: "Critérium du Dauphiné", month: "Juin", fit: ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true,
    stages: [
      { phase: "Répétition générale avant le Tour", text: "Le Dauphiné sert de dernier test grandeur nature avant le Tour de France, avec un plateau très relevé.",
        choices: [
          { label: "Te tester à fond face aux favoris du Tour", resolve: () => ({ text: "Tu prends des renseignements précieux sur ta forme actuelle.", delta: { fatigue: 6 } }) },
          { label: "Gérer prudemment ta charge de course", resolve: () => ({ text: "Tu roules avec la prudence de qui garde le meilleur pour plus tard.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "Étape de montagne décisive", text: "Une dernière étape alpestre pour clore la course.", choices: finishChoices("montagne", "Critérium du Dauphiné", {}, true) },
    ] },
  { id: "suisse", name: "Tour de Suisse", month: "Juin", fit: ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true,
    stages: [
      { phase: "Les Alpes suisses en guise de répétition", text: "Une course exigeante dans les cols helvétiques, prisée par les prétendants aux grands tours.",
        choices: [
          { label: "Chercher la victoire d'étape", resolve: () => ({ text: "Tu places une offensive pour tester tes rivaux directs.", delta: { fatigue: 6 } }) },
          { label: "Rouler pour la forme, pas pour le résultat", resolve: () => ({ text: "Tu utilises la course avant tout pour affûter ta condition.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "Dernière étape alpestre", text: "Le classement général se joue dans les derniers lacets.", choices: finishChoices("montagne", "Tour de Suisse", {}, true) },
    ] },
  genericRace("wallonie", "Tour de Wallonie", "Juin", ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], "montagne", "Pro", "Une course par étapes vallonnée à travers la Wallonie, prisée pour la préparation estivale.", true),
  genericRace("brussels", "Brussels Cycling Classic", "Juin", ["sprinteur", "puncheur", "rouleur", "polyvalent"], "sprint", "Pro", "Une classique roulante autour de Bruxelles, généralement promise aux rapides."),
];

// Chaque Grand Tour a sa propre identité — de vrais cols et lieux iconiques, pas un template générique
// interchangeable. Un col principal + des alternatives tirées au sort d'une saison à l'autre, pour la variété.
const GRAND_TOUR_FLAVOR = {
  "Tour de France": {
    montagne: { main: { name: "l'Alpe d'Huez", de: "de l'Alpe d'Huez" }, alt: [
      { name: "le Col du Tourmalet", de: "du Col du Tourmalet" },
      { name: "le Mont Ventoux", de: "du Mont Ventoux" },
      { name: "le Col du Galibier", de: "du Col du Galibier" },
      { name: "le Col d'Izoard", de: "du Col d'Izoard" },
    ] },
    clm: { location: "le contre-la-montre entre Paris et La Défense" },
    sprint: { location: "l'arrivée mythique sur les Champs-Élysées" },
  },
  "Giro d'Italia": {
    montagne: { main: { name: "le Passo dello Stelvio", de: "du Passo dello Stelvio" }, alt: [
      { name: "le Monte Zoncolan", de: "du Monte Zoncolan" },
      { name: "les Tre Cime di Lavaredo", de: "des Tre Cime di Lavaredo" },
      { name: "le Passo Giau", de: "du Passo Giau" },
      { name: "le Mortirolo", de: "du Mortirolo" },
    ] },
    clm: { location: "le cronometro final dans les rues de Milan" },
    sprint: { location: "l'arrivée dans les rues pavées de Milan" },
  },
  "Vuelta a España": {
    montagne: { main: { name: "l'Alto de l'Angliru", de: "de l'Alto de l'Angliru" }, alt: [
      { name: "les Lagos de Covadonga", de: "des Lagos de Covadonga" },
      { name: "l'Alto de Aitana", de: "de l'Alto de Aitana" },
      { name: "le Balcón de Bizkaia", de: "du Balcón de Bizkaia" },
      { name: "la Sierra Nevada", de: "de la Sierra Nevada" },
    ] },
    clm: { location: "le contre-la-montre autour de Valladolid" },
    sprint: { location: "l'arrivée sur la Gran Vía de Madrid" },
  },
};

function buildGrandTourRace(tourName, kind) {
  const flavor = GRAND_TOUR_FLAVOR[tourName] || GRAND_TOUR_FLAVOR["Tour de France"];
  // Le col principal revient un peu plus souvent (c'est LE juge de paix de ce tour), les alternatives
  // apportent de la variété d'une saison à l'autre sans jamais être totalement génériques.
  const climb = Math.random() < 0.4 ? flavor.montagne.main : pick(flavor.montagne.alt);
  const templates = {
    montagne: { specKey: "montagne", phase1: `Ascension ${climb.de}`, text1: (g) => `Le peloton explose sur les pentes ${climb.de}, l'un des juges de paix du ${tourName}. ${getRival(g).name} place une première accélération.${raceContextLine(g, tourName)}`,
      choiceA: "Attaquer dans la dernière ascension", choiceB: "Gérer ton effort pour le général",
      finalPhase: `Arrivée au sommet ${climb.de}`, finalText: `Les derniers hectomètres avant la ligne, sur les pentes ${climb.de}.` },
    clm: { specKey: "clm", phase1: "Vérification matérielle avant le départ", text1: (g) => `Position aérodynamique, réglages du vélo : tout se joue dans les détails pour ${flavor.clm.location}. ${getRival(g).name} vient de s'élancer deux minutes devant toi.${raceContextLine(g, tourName)}`,
      choiceA: "Partir à bloc dès le départ", choiceB: "Gérer ton effort sur la distance",
      finalPhase: "Dernier tronçon chronométré", finalText: `Les derniers kilomètres pour ${flavor.clm.location}, seul face au chrono.` },
    sprint: { specKey: "sprint", phase1: "Mise en place du train de sprint", text1: (g) => `L'équipe s'organise pour te lancer au sprint avant ${flavor.sprint.location}. ${getRival(g).name} est aussi bien placé, à l'affût.${raceContextLine(g, tourName)}`,
      choiceA: "Te lancer tôt, prendre les devants", choiceB: "Rester dans la roue jusqu'aux 200 derniers mètres",
      finalPhase: "Sprint massif", finalText: `Les derniers hectomètres avant ${flavor.sprint.location}, tout se joue maintenant.` },
  };
  const t = templates[kind];
  return {
    id: `gt_${kind}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${tourName} — étape décisive`,
    raceTier: "WT",
    isStageRace: true,
    stages: [
      { phase: t.phase1, text: t.text1,
        choices: [
          { label: t.choiceA, resolve: () => ({ text: "Tu places ton effort tôt, quitte à en payer le prix plus tard.", delta: { fatigue: 5 } }) },
          { label: t.choiceB, resolve: () => ({ text: "Tu restes patient, économe, prêt à frapper au bon moment.", delta: { fatigue: 2 } }) },
        ] },
      { phase: t.finalPhase, text: t.finalText, choices: finishChoices(t.specKey, `${tourName}`, {}, true) },
    ],
  };
}

const LOMBARDIA = {
  id: "lombardia", name: "Il Lombardia", month: "Octobre", fit: ["grimpeur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT",
  stages: [
    { phase: "Madonna del Ghisallo", text: (g) => `La classique des feuilles mortes entame ses ascensions vallonnées autour du lac de Côme.${raceContextLine(g, "Il Lombardia")}`,
      choices: [
        { label: "Imprimer un tempo élevé", resolve: () => ({ text: "Tu mènes la danse dès les premières pentes.", delta: { fatigue: 5 } }) },
        { label: "Rester au chaud dans le peloton", resolve: () => ({ text: "Tu observes, patient, avant de frapper plus tard.", delta: { fatigue: 2 } }) },
      ] },
    { phase: "Arrivée à Côme", text: "La dernière difficulté avant la descente vers l'arrivée.", choices: finishChoices("montagne", "Il Lombardia") },
  ],
};

function buildWorldsRace(player) {
  return {
    id: "worlds", name: "Championnats du Monde",
    raceTier: "WT",
    stages: [
      { phase: "Sélection nationale", text: (g) => `La fédération nationale annonce sa liste pour les Championnats du Monde. Ton nom y figure.${raceContextLine(g, "Championnats du Monde")}`,
        choices: [
          { label: "Assumer un rôle offensif dès le départ", resolve: () => ({ text: "Tu prends la course à ton compte dès les premiers kilomètres.", delta: { fatigue: 4, reputation: 2 } }) },
          { label: "Rester prudent, attendre le final", resolve: () => ({ text: "Tu observes la course se construire avant de te positionner.", delta: { fatigue: 1 } }) },
        ] },
      { phase: "Dernier tour du circuit", text: "Le maillot arc-en-ciel se jouera dans les derniers kilomètres du circuit.",
        choices: finishChoices("montagne", "Championnats du Monde", { reputation: 4 }) },
    ],
  };
}

/* ============================================================================
   COURSES VIVANTES — météo + imprévus injectés dynamiquement
   ============================================================================
   Plutôt que de réécrire chaque course une par une, on injecte à l'entrée en
   course (voir goToNextQueueItem) une couche d'événements procéduraux entre
   l'étape tactique et l'arrivée. Deux passages sur la même course ne se
   ressemblent donc jamais : météo tirée au sort, 1 à 2 imprévus choisis parmi
   un pool filtré par le profil réel de la course (pavés/montagne/plat), la
   météo, la fatigue, le moral, la personnalité du rival, le DS, les équipiers,
   la philosophie et les compétences du joueur (qui ouvrent de VRAIS choix
   supplémentaires, pas seulement de meilleures probabilités).
   ============================================================================ */

const WEATHER = { SOLEIL: "Soleil", PLUIE: "Pluie", VENT: "Vent battant", FROID: "Froid mordant", CANICULE: "Canicule" };

function rollWeather(meta = {}) {
  const rainProne = (meta.cobbles || 0) > 30 || meta.month === "Avril" || meta.month === "Mars";
  const windProne = (meta.cobbles || 0) > 40 || (meta.sprint || 0) > 50;
  const mountainCold = (meta.mountains || 0) > 65;
  const hotSeason = meta.month === "Juillet" || meta.month === "Août";
  const roll = Math.random();
  if (rainProne && roll < 0.28) return WEATHER.PLUIE;
  if (mountainCold && roll < 0.5) return WEATHER.FROID;
  if (windProne && roll < 0.7) return WEATHER.VENT;
  if (hotSeason && roll > 0.82) return WEATHER.CANICULE;
  return WEATHER.SOLEIL;
}

const WEATHER_FLAVOR = {
  [WEATHER.SOLEIL]: (race) => `Grand soleil sur ${race} — des conditions idéales pour se montrer.`,
  [WEATHER.PLUIE]: (race) => `La pluie s'invite sur ${race}. La route est glissante, la nervosité monte dans le peloton.`,
  [WEATHER.VENT]: (race) => `Un vent de travers balaie le parcours de ${race} — la journée s'annonce nerveuse, propice aux bordures.`,
  [WEATHER.FROID]: (race) => `Un froid mordant enveloppe ${race}, surtout à l'approche des sommets.`,
  [WEATHER.CANICULE]: (race) => `Une chaleur écrasante s'abat sur ${race} — la gestion de l'effort sera cruciale.`,
};
const WEATHER_START_DELTA = {
  [WEATHER.SOLEIL]: {},
  [WEATHER.PLUIE]: { fatigue: 2 },
  [WEATHER.VENT]: { fatigue: 1 },
  [WEATHER.FROID]: { fatigue: 2 },
  [WEATHER.CANICULE]: { fatigue: 3 },
};

// Pool d'imprévus. `condition` filtre l'éligibilité (profil réel de la course, météo, fatigue, moral, rival...).
// `choices` est une FONCTION de contexte : les compétences/philosophies débloquées y ajoutent de vrais choix
// supplémentaires, pas seulement de meilleures probabilités sur les choix existants.
const INCIDENT_POOL = [
  {
    // Dynamique classique des classiques/étapes de plaine : un petit groupe tente sa chance tôt dans la
    // course. Réutilise tacticalBonus (donc le Race Engine V2) et la réputation peloton déjà câblée —
    // sucer la roue sans jamais rouler, ça se remarque et ça se paie en réputation.
    id: "echappee_matinale", weight: 3, phaseLabel: "L'échappée du jour",
    condition: (ctx) => (ctx.meta.mountains || 0) < 50,
    text: () => "Un groupe de coureurs tente sa chance dès les premiers kilomètres. L'écart se creuse rapidement — c'est le moment de décider si tu montes dedans.",
    choices: () => [
      { label: "Monter dans l'échappée et prendre de longs relais", resolve: () => ({ text: "Tu rejoins le groupe de tête et places ton relais dès que possible — l'écart continue de grandir.", delta: { fatigue: 8, tacticalBonus: 7 } }) },
      { label: "Monter dans l'échappée mais économiser (sucer la roue)", resolve: () => ({ text: "Tu profites du travail des autres sans trop te dévoiler — au risque de te faire remarquer par le reste du peloton.", delta: { fatigue: 3, tacticalBonus: 3, reputation: -3 } }) },
      { label: "Rester dans le peloton, laisser filer", resolve: () => ({ text: "Tu choisis la prudence et restes au chaud dans le peloton principal.", delta: {} }) },
    ],
  },
  {
    // Rare et réservé aux Grands Tours : quand tu ne joues pas déjà le général (équipier, carte secondaire,
    // co-leader, jeune espoir, joker — donc typiquement en chasse d'un maillot secondaire ou d'une simple
    // expérience), le leader officiel peut craquer et t'ouvrir une fenêtre pour le classement général.
    // Volontairement rare (~10-12% par Grand Tour concerné) : ça doit rester un coup de théâtre, pas la norme.
    id: "opportunite_general", weight: 2, phaseLabel: "Coup de théâtre pour le général",
    condition: (ctx) => {
      const isGT = ctx.raceObj.id?.startsWith("gt_");
      if (!isGT || !ctx.role || ctx.role === RACE_ROLES.LEADER) return false;
      return Math.random() < 0.11;
    },
    text: (ctx) => `Coup de théâtre : le leader officiel de l'équipe craque complètement dans cette étape. ${ctx.game.player.team?.director || "Ton DS"} hésite un instant, puis lâche dans l'oreillette : "Vas-y, tente ta chance pour le général !"`,
    choices: (ctx) => {
      const list = [
        { label: "Saisir ta chance pour le général", resolve: () => ({ text: "Tu abandonnes ton objectif initial et pars à l'assaut du classement général — un pari osé, tout ou rien.", delta: { tacticalBonus: 12, fatigue: 10 } }) },
        { label: "Rester sur ton objectif initial, plus sûr", resolve: () => ({ text: "Tu préfères ne pas prendre de risque et continues de jouer ta carte habituelle.", delta: {} }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "car_leadership") || SkillEngine.hasSkill(ctx.game.player, "talent_instinct")) {
        list.push({ label: "Analyser froidement la situation avant de te décider (Leadership/Instinct)", resolve: () => ({ text: "Ton sang-froid déjà éprouvé te permet de saisir l'occasion avec beaucoup plus d'assurance.", delta: { tacticalBonus: 16, fatigue: 8 } }) });
      }
      return list;
    },
  },
  {
    // Symétrique de l'incident précédent : si TU es leader mais que tu es clairement en méforme (énergie basse
    // ou décroché du bon groupe — donc conséquence de tes propres choix/fatigue en course), le DS peut te
    // retirer la responsabilité du général au profit d'un équipier. Là, c'est le joueur qui subit la décision.
    id: "general_retire", weight: 2, phaseLabel: "Le DS change de plan",
    condition: (ctx) => {
      const isGT = ctx.raceObj.id?.startsWith("gt_");
      if (!isGT || ctx.role !== RACE_ROLES.LEADER) return false;
      const raceState = ctx.game.raceState || initRaceState();
      const struggling = raceState.energy < 35 || raceState.group === RACE_GROUPS.CHASE || raceState.group === RACE_GROUPS.DROPPED;
      return struggling && Math.random() < 0.22;
    },
    text: (ctx) => {
      const challenger = bestChallenger(ctx.game, ctx.game.player.team ? TEAM_PHILOSOPHIES[ctx.game.player.team.philosophy] : null);
      const name = challenger ? challenger.name : "un équipier";
      return `Tu sembles clairement en méforme aujourd'hui. ${ctx.game.player.team?.director || "Ton DS"} en tire les conclusions dans l'oreillette : "${name} prend le relais pour le général, on ne peut plus se permettre d'attendre."`;
    },
    choices: (ctx) => {
      const list = [
        { label: "Accepter la décision du DS", resolve: () => ({ text: "Tu te ranges à la décision, la mort dans l'âme — l'équipe change officiellement de leader pour la suite du général.", delta: { relationEquipe: 3, tacticalBonus: -4 } }) },
        { label: "Refuser d'obéir et continuer à jouer ta carte", resolve: () => ({ text: "Tu ignores la consigne et poursuis ta propre course, quitte à créer des tensions durables dans le vestiaire.", delta: { relationEquipe: -8, tacticalBonus: 2 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "talent_acier") || SkillEngine.hasSkill(ctx.game.player, "mental_confiance")) {
        list.push({ label: "Négocier pour garder ta chance encore un peu (Mental d'acier/Confiance)", resolve: () => ({ text: "Ton mental déjà éprouvé te permet de convaincre le DS de t'accorder un sursis.", delta: { relationEquipe: -2, tacticalBonus: 1 } }) });
      }
      return list;
    },
  },
  {
    // Spécifique aux Mondiaux : ici tu ne cours plus pour ton équipe trade mais pour ta nation — et la
    // fédération peut désigner un compatriote plus fort (même d'une équipe rivale à l'année) comme leader.
    // Réutilise le champ nation déjà présent sur chaque coureur du peloton, aucune nouvelle donnée.
    id: "selection_nationale", weight: 5, phaseLabel: "Réunion de la sélection nationale",
    condition: (ctx) => {
      if (ctx.raceObj.id !== "worlds") return false;
      const compatriots = (ctx.game.peloton || []).filter((r) => r.nation === ctx.game.player.nation?.code);
      if (compatriots.length === 0) return false;
      const bestCompatriot = [...compatriots].sort((a, b) => b.level - a.level)[0];
      const playerLevel = Math.max(ctx.game.player.specialties.montagne, ctx.game.player.specialties.sprint, ctx.game.player.specialties.clm, ctx.game.player.specialties.pave) * 0.75;
      return bestCompatriot.level > playerLevel + 8;
    },
    text: (ctx) => {
      const compatriots = (ctx.game.peloton || []).filter((r) => r.nation === ctx.game.player.nation?.code).sort((a, b) => b.level - a.level);
      const leader = compatriots[0];
      return `Réunion de sélection nationale : la fédération désigne ${leader.name} (${leader.team?.name || "une équipe rivale à l'année"}) comme leader de l'équipe de ${ctx.game.player.nation.label} — même s'il court habituellement pour une équipe concurrente le reste de la saison.`;
    },
    choices: () => [
      { label: "Accepter de rouler pour lui, malgré la rivalité de club", resolve: () => ({ text: "Le temps d'une course, les couleurs nationales priment sur celles du maillot trade — tu te mets à son service.", delta: { relationEquipe: 4, reputation: 3 } }) },
      { label: "Jouer ta propre carte malgré la consigne de la fédération", resolve: () => ({ text: "Tu ignores la hiérarchie nationale et cours pour toi — au risque de te fâcher avec la fédération.", delta: { reputation: -6, tacticalBonus: 3 } }) },
    ],
  },
  {
    id: "mecanique", weight: 3, phaseLabel: "Incident mécanique",
    condition: (ctx) => (ctx.meta.cobbles || 0) > 20 || ctx.weather === WEATHER.PLUIE,
    text: (ctx) => "Crevaison au pire moment, en pleine bataille pour la position !",
    choices: (ctx) => {
      const teammate = ctx.game.teammates?.[0];
      const list = [
        { label: "Attendre la voiture technique, seul", resolve: () => ({ text: "Tu perds un temps précieux, seul face à la malchance.", delta: { fatigue: 3, tacticalBonus: -4 } }) },
        teammate
          ? { label: `Changer de roue avec l'aide de ${teammate.name}`, resolve: () => ({ text: `${teammate.name} freine et te tend sa propre roue.`, delta: { fatigue: 1, tacticalBonus: 2, teammatesDelta: { loyaute: 3 } } }) }
          : { label: "Changer de roue au plus vite", resolve: () => ({ text: "Tu repars vite, sans aide.", delta: { fatigue: 2, tacticalBonus: 0 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "tact_placement")) {
        list.push({ label: "Gérer l'incident avec sang-froid (Placement)", resolve: () => ({ text: "Ton sens du placement te permet de revenir vite, sans paniquer.", delta: { fatigue: 1, tacticalBonus: 4 } }) });
      }
      return list;
    },
  },
  {
    id: "chute", weight: 3, phaseLabel: "Chute générale",
    condition: (ctx) => (ctx.meta.cobbles || 0) > 20 || ctx.weather === WEATHER.PLUIE,
    text: () => "Une chute générale se produit juste devant toi, la route se bloque en un instant.",
    choices: (ctx) => {
      const list = [
        { label: "Freiner et contourner prudemment", resolve: () => ({ text: "Tu évites la chute mais perds quelques précieuses secondes.", delta: { forme: -2, tacticalBonus: -2 } }) },
        { label: "Prendre le risque de passer par le bas-côté", resolve: () => ({ text: "Un pari payant : tu restes dans le bon wagon !", delta: { reputation: 3, fatigue: 4, tacticalBonus: 3 } }) },
      ];
      if (SkillEngine.hasUnlockedChoice(ctx.game.player, "suivre_rival") || SkillEngine.hasSkill(ctx.game.player, "tact_vision")) {
        list.push({ label: "Anticiper la trajectoire (Vision)", resolve: () => ({ text: "Tu as vu venir la chute une fraction de seconde avant tout le monde.", delta: { tacticalBonus: 6 } }) });
      }
      return list;
    },
  },
  {
    id: "rival_attaque", weight: 4, phaseLabel: "Attaque du rival",
    condition: () => true,
    text: (ctx) => {
      const rival = getRival(ctx.game);
      if (!rival) return "Le peloton s'anime en tête de course.";
      return rival.haine >= 55
        ? `${rival.name}, très remonté contre toi, place une attaque féroce en tête du peloton.`
        : `${rival.name} teste une attaque prudente, presque hésitante.`;
    },
    choices: (ctx) => {
      const player = ctx.game.player;
      const list = [
        { label: "Répondre immédiatement à l'attaque", resolve: (g) => ({ text: `Tu réponds du tac au tac à ${getRival(g)?.name || "ton rival"}.`, delta: { fatigue: 5, tacticalBonus: 4, rival: { haine: 4 } } }) },
        { label: "Laisser filer, garder ton rythme", resolve: () => ({ text: "Tu restes patient, sans céder à la panique.", delta: { fatigue: -2, tacticalBonus: 0 } }) },
      ];
      if (SkillEngine.hasSkill(player, "philo_attaquant")) {
        list.push({ label: "Contre-attaquer plus fort encore (Attaquant)", resolve: () => ({ text: "Ta philosophie ne connaît qu'une réponse : attaquer plus fort.", delta: { fatigue: 8, tacticalBonus: 9 } }) });
      }
      if (SkillEngine.hasSkill(player, "philo_calculateur")) {
        list.push({ label: "Analyser puis frapper au bon moment (Calculateur)", resolve: () => ({ text: "Tu laisses passer l'agitation avant de placer ton effort au meilleur moment.", delta: { fatigue: 3, tacticalBonus: 6 } }) });
      }
      return list;
    },
  },
  {
    id: "ds_ordre", weight: 3, phaseLabel: "Consigne du DS",
    condition: (ctx) => !!ctx.game.player.team,
    text: (ctx) => `${ctx.game.player.team?.director || "Ton DS"} demande par oreillette de temporiser pour protéger la stratégie d'équipe.`,
    choices: (ctx) => {
      const player = ctx.game.player;
      const list = [
        { label: "Obéir au DS", resolve: () => ({ text: "Tu suis la consigne à la lettre, au service du collectif.", delta: { relationEquipe: 5, tacticalBonus: -3 } }) },
        { label: "Désobéir et suivre ton instinct", resolve: () => ({ text: "Tu ignores la consigne et fais confiance à tes jambes.", delta: { relationEquipe: -5, tacticalBonus: 5 } }) },
      ];
      if (SkillEngine.hasSkill(player, "philo_leader") || SkillEngine.hasSkill(player, "car_leadership")) {
        list.push({ label: "Négocier directement avec le DS (Leadership)", resolve: () => ({ text: "Ton statut dans l'équipe te permet d'obtenir un compromis avec le staff.", delta: { relationEquipe: 2, tacticalBonus: 2 } }) });
      }
      return list;
    },
  },
  {
    id: "bordure", weight: 2, phaseLabel: "Bordure",
    condition: (ctx) => ctx.weather === WEATHER.VENT || (ctx.meta.sprint || 0) > 45,
    text: () => "Le vent de travers fracture le peloton en plusieurs morceaux — une bordure se forme à l'avant.",
    choices: (ctx) => {
      const list = [
        { label: "Te battre pour rester dans les 20 premiers", resolve: () => ({ text: "Tu te bats crânement pour rester devant la cassure.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
        { label: "Rester groupé, prendre le risque", resolve: () => ({ text: "Tu restes au milieu du peloton, quitte à te faire surprendre.", delta: { fatigue: -2, tacticalBonus: -3 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "tact_aspiration")) {
        list.push({ label: "Te placer dans l'aspiration idéale (Aspiration)", resolve: () => ({ text: "Tu trouves la roue parfaite pour limiter la casse.", delta: { fatigue: 1, tacticalBonus: 4 } }) });
      }
      return list;
    },
  },
  {
    id: "peloton_hostile", weight: 3, phaseLabel: "Isolé dans le peloton",
    condition: (ctx) => (ctx.game.player.reputation?.peloton || 50) < 30,
    text: () => "Ta réputation dans le peloton n'est pas bonne — depuis quelques semaines, on te sent isolé. Personne ne vient te chercher pour une échappée, personne ne roule avec toi.",
    choices: (ctx) => {
      const list = [
        { label: "Forcer le passage, seul contre tous", resolve: () => ({ text: "Tu tentes ta chance en solitaire, sans aucune aide du peloton — un pari épuisant.", delta: { tacticalBonus: 2, fatigue: 10 } }) },
        { label: "Accepter la situation, rouler pour ton équipe", resolve: () => ({ text: "Tu renonces à jouer ta carte personnelle et te mets au service du collectif.", delta: { relationEquipe: 4, tacticalBonus: -2 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "car_charisme") || SkillEngine.hasSkill(ctx.game.player, "car_medias")) {
        list.push({ label: "Tenter de renouer le dialogue avec le peloton", resolve: () => ({ text: "Ton sens du relationnel, déjà travaillé, apaise un peu les tensions — un premier pas timide vers plus de coopération.", delta: { reputation: 3, tacticalBonus: 1 } }) });
      }
      return list;
    },
  },
  {
    id: "chahut_public", weight: 2, phaseLabel: "Chahuté sur le bord de la route",
    condition: (ctx) => (ctx.game.player.reputation?.fans || 50) < 25,
    text: () => "Sur le bas-côté, quelques spectateurs te huent au passage — ta réputation auprès du public en a pris un coup ces derniers temps.",
    choices: () => [
      { label: "Ignorer et rester concentré sur la course", resolve: () => ({ text: "Tu fais abstraction, sans laisser transparaître quoi que ce soit.", delta: { tacticalBonus: 1 } }) },
      { label: "Laisser la colère te déstabiliser", resolve: () => ({ text: "Malgré toi, ça te touche plus que prévu — ta concentration en pâtit.", delta: { forme: -3, tacticalBonus: -2 } }) },
    ],
  },
  {
    id: "pression_favori", weight: 3, phaseLabel: "Le poids du favori",
    condition: (ctx) => computePressure(ctx.game, ctx.raceObj.name) >= 55,
    text: (ctx) => {
      const p = computePressure(ctx.game, ctx.raceObj.name);
      const tier = pressureTier(p);
      const causes = [];
      if (isFavoriteContext(ctx.game.player)) causes.push("tes récents résultats");
      if (ctx.game.player.reputation.medias >= 60) causes.push("ton exposition médiatique");
      if (MAJOR_RACE_NAMES.has(ctx.raceObj.name)) causes.push("l'enjeu de cette course en particulier");
      const causeText = causes.length ? causes.join(", ") : "les attentes autour de toi";
      return `La pression est ${tier} aujourd'hui, portée par ${causeText}. Le peloton et les médias n'attendent qu'une chose : une victoire.`;
    },
    choices: (ctx) => {
      const list = [
        { label: "Assumer ce statut de favori", resolve: () => ({ text: "Tu prends cette pression comme un moteur plutôt qu'un poids.", delta: { tacticalBonus: 4, fatigue: 3 } }) },
        { label: "Faire abstraction, courir comme si de rien n'était", resolve: () => ({ text: "Tu tentes d'ignorer les attentes extérieures pour rester toi-même.", delta: { tacticalBonus: 1 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "talent_acier") || SkillEngine.craquageResist(ctx.game.player) >= 6) {
        list.push({ label: "Laisser ton mental d'acier absorber la pression", resolve: () => ({ text: "Ce genre d'attente ne t'atteint plus vraiment — ton mental fait la différence.", delta: { tacticalBonus: 6, fatigue: 1 } }) });
      }
      return list;
    },
  },
  {
    id: "jeune_favori", weight: 4, phaseLabel: "Le poids des attentes, si jeune",
    condition: (ctx) => ctx.game.player.age < 23 && isFavoriteContext(ctx.game.player),
    text: () => "Tu n'as même pas 23 ans, et on parle déjà de toi comme d'un futur grand champion. Cette attente soudaine, à ton âge, pèse plus lourd que tu ne l'aurais cru.",
    choices: (ctx) => {
      const list = [
        { label: "Essayer de porter cette étiquette de prodige", resolve: () => ({ text: "Tu joues le jeu des attentes, quitte à t'exposer à une contre-performance très commentée.", delta: { tacticalBonus: 3, fatigue: 4 } }) },
        { label: "Relativiser, tu as le temps devant toi", resolve: () => ({ text: "Tu te rappelles que ta carrière ne se joue pas sur une seule course, à ton âge.", delta: { tacticalBonus: -1, fatigue: -2 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "mental_resilience") || SkillEngine.hasSkill(ctx.game.player, "mental_sangfroid")) {
        list.push({ label: "Puiser dans ton mental déjà solide malgré ton jeune âge", resolve: () => ({ text: "Ta maturité mentale, déjà travaillée, fait la différence face à des attentes qui déstabiliseraient n'importe quel autre jeune.", delta: { tacticalBonus: 5, fatigue: 1 } }) });
      }
      return list;
    },
  },
  {
    id: "craquage", weight: 3, phaseLabel: "Coup de moins bien",
    condition: (ctx) => ctx.game.player.stats.fatigue > 62 || ctx.game.player.stats.forme < 40,
    text: () => "Un coup de moins bien te saisit — la fatigue accumulée se rappelle brutalement à toi.",
    choices: (ctx) => {
      const list = [
        { label: "Puiser dans les réserves", resolve: () => ({ text: "Tu serres les dents et continues, au prix d'un effort payé plus tard.", delta: { forme: -5, tacticalBonus: 3 } }) },
        { label: "Lever le pied, préserver la suite de saison", resolve: () => ({ text: "Tu gères, quitte à sacrifier ce résultat.", delta: { forme: 2, tacticalBonus: -5 } }) },
      ];
      if (SkillEngine.craquageResist(ctx.game.player) > 0) {
        list.push({ label: "Garder ton sang-froid et gérer (Mental)", resolve: () => ({ text: "Ton sang-froid t'évite le pire — tu géres la crise sans t'effondrer.", delta: { forme: -1, tacticalBonus: 1 } }) });
      }
      return list;
    },
  },
  {
    id: "surentrainement", weight: 5, phaseLabel: "Signes de surentraînement",
    condition: (ctx) => isOvertrained(ctx.game.player),
    text: (ctx) => `Ton corps envoie des signaux inquiétants — sommeil dégradé, pouls au repos élevé. Le staff médical parle de surentraînement après des semaines sans vraie coupure.`,
    choices: (ctx) => {
      const list = [
        { label: "Ignorer et courir quand même à fond", resolve: () => ({ text: "Tu passes outre les signaux d'alarme — au risque d'aggraver la situation.", delta: { forme: -6, fatigueChronique: 4, tacticalBonus: 2 } }) },
        { label: "Lever le pied sur cette course pour préserver ta santé", resolve: () => ({ text: "Tu acceptes de sacrifier ce résultat pour ménager ton corps.", delta: { fatigue: -8, fatigueChronique: -6, tacticalBonus: -6 } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "mental_stress") || SkillEngine.hasSkill(ctx.game.player, "phys_recuperation")) {
        list.push({ label: "Adapter intelligemment ton effort (Gestion du stress / Récupération)", resolve: () => ({ text: "Tes compétences de gestion te permettent de composer avec la fatigue sans t'effondrer ni tout sacrifier.", delta: { forme: -2, fatigueChronique: -3, tacticalBonus: -1 } }) });
      }
      return list;
    },
  },
];

function weightedPickMultiple(list, n) {
  const pool = [...list];
  const chosen = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const totalWeight = pool.reduce((s, e) => s + (e.weight || 1), 0);
    let roll = Math.random() * totalWeight;
    let idx = 0;
    for (; idx < pool.length; idx++) { roll -= pool[idx].weight || 1; if (roll <= 0) break; }
    chosen.push(pool[Math.min(idx, pool.length - 1)]);
    pool.splice(Math.min(idx, pool.length - 1), 1);
  }
  return chosen;
}

// Injecte météo + 1-2 imprévus dans une course, entre l'étape tactique et l'arrivée.
// Appelée une seule fois, au moment où la course devient la course en cours (voir goToNextQueueItem).
// Rôle du coureur pour CETTE course précise — recalculé à chaque course, pas figé pour la saison.
// Dérivé de données déjà existantes (réputation, forme, âge, philosophie d'équipe) : aucune nouvelle statistique.
const RACE_ROLES = { LEADER: "Leader", COLEADER: "Co-leader", DOMESTIQUE: "Équipier", CARTE: "Carte secondaire", ESPOIR: "Jeune espoir", JOKER: "Joker" };

// Standing d'un coureur pour une course donnée — même logique pour toi et pour tes équipiers, ce qui permet
// une vraie comparaison. Réutilise level/spec (déjà présents), fits (philosophie d'équipe déjà existante).
function standingFor({ level, spec, moral }, philosophy) {
  const fits = philosophy ? philosophy.favors.includes(spec) : true;
  return level + (fits ? 12 : -8) + ((moral || 70) - 70) * 0.2;
}

// Le meilleur équipier dont la spécialité est pertinente pour CETTE course — celui qui peut concurrencer
// ton statut de leader. Retourne null si aucun équipier ne se distingue.
function bestChallenger(game, philosophy) {
  const teammates = game.teammates || [];
  if (teammates.length === 0) return null;
  const scored = teammates.map((tm) => ({ ...tm, standing: standingFor(tm, philosophy) }));
  scored.sort((a, b) => b.standing - a.standing);
  return scored[0];
}

function computeRaceRole(game, raceObj) {
  const player = game.player;
  if (player.age < 23 && player.reputation.peloton < 40) return { role: RACE_ROLES.ESPOIR, challenger: null };
  const philosophy = player.team ? TEAM_PHILOSOPHIES[player.team.philosophy] : null;
  const fits = philosophy ? philosophy.favors.includes(player.specialtyPrimary) : true;
  if (raceObj.raceTier && raceObj.raceTier !== "WT" && !fits && player.reputation.peloton < 55) return { role: RACE_ROLES.JOKER, challenger: null };

  const playerStanding = player.reputation.peloton + (fits ? 15 : -10) + (player.stats.forme - 50) * 0.3 - player.stats.fatigueChronique * 0.15 + (player.flags?.leadershipGuarantee ? 25 : 0);

  // Vraie concurrence interne : un équipier en forme, mieux adapté à la course, peut faire hésiter le DS —
  // même si ta propre réputation suffirait normalement pour être leader.
  const challenger = player.flags?.leadershipGuarantee ? null : bestChallenger(game, philosophy);
  if (challenger && challenger.standing > playerStanding + 8) {
    // Le DS tranche clairement en faveur de l'équipier : tu deviens équipier (ou carte secondaire si tu restes compétitif).
    return { role: playerStanding >= 45 ? RACE_ROLES.CARTE : RACE_ROLES.DOMESTIQUE, challenger, hesitation: false };
  }
  if (challenger && Math.abs(challenger.standing - playerStanding) <= 8 && playerStanding >= 35) {
    // Les deux standings sont proches : le DS hésite vraiment, la course tranchera.
    return { role: playerStanding >= 65 ? RACE_ROLES.LEADER : RACE_ROLES.COLEADER, challenger, hesitation: true };
  }

  if (playerStanding >= 65) return { role: RACE_ROLES.LEADER, challenger: null };
  if (playerStanding >= 45) return { role: RACE_ROLES.COLEADER, challenger: null };
  if (playerStanding >= 25) return { role: RACE_ROLES.CARTE, challenger: null };
  return { role: RACE_ROLES.DOMESTIQUE, challenger: null };
}

// Objectif d'équipe pour cette course, dérivé du rôle du joueur et de la philosophie d'équipe.
function raceObjectiveFor(game, raceObj, role, leaderName) {
  const meta = CALENDAR_META[raceObj.name] || {};
  const major = MAJOR_RACE_NAMES.has(raceObj.name);
  if (role === RACE_ROLES.LEADER) return major ? "Jouer la victoire, toute l'équipe est à ton service." : "Prendre un résultat, l'équipe roule pour toi aujourd'hui.";
  if (role === RACE_ROLES.COLEADER) return `Te tenir prêt à saisir ta chance si ${leaderName || "le leader officiel"} faiblit.`;
  if (role === RACE_ROLES.CARTE) return "Profiter des occasions qui se présentent, sans pression particulière.";
  if (role === RACE_ROLES.ESPOIR) return "Prendre de l'expérience et apprendre aux côtés des cadres de l'équipe.";
  if (role === RACE_ROLES.JOKER) return (meta.sprint || 0) > 40 ? "Te placer dans une échappée si l'occasion se présente." : "Rouler pour l'équipe, sans objectif personnel aujourd'hui.";
  return `Protéger ${leaderName || "le leader"} et assurer le ravitaillement — le classement individuel attendra.`;
}

function buildBriefingStage(game, raceObj) {
  const player = game.player;
  const { role, challenger, hesitation } = computeRaceRole(game, raceObj);
  // Le leader présumé de l'équipe pour cette course — calculé même hors du cas de concurrence interne
  // spécifique, pour qu'un équipier sache toujours concrètement pour QUI il roule aujourd'hui.
  const philosophy = player.team ? TEAM_PHILOSOPHIES[player.team.philosophy] : null;
  const presumedLeader = (role === RACE_ROLES.DOMESTIQUE || role === RACE_ROLES.CARTE || role === RACE_ROLES.COLEADER) ? (challenger || bestChallenger(game, philosophy)) : null;
  const objective = raceObjectiveFor(game, raceObj, role, presumedLeader?.name);
  const director = player.team?.director || "Ton DS";
  const philosophyLabel = philosophy?.label;
  const baseText = `${director} te confie ton rôle du jour : ${role}. ${objective}${philosophyLabel ? ` (Équipe orientée ${philosophyLabel.toLowerCase()}.)` : ""}`;

  // Vraie concurrence interne : le DS a clairement tranché en faveur d'un équipier.
  if (challenger && !hesitation && (role === RACE_ROLES.DOMESTIQUE || role === RACE_ROLES.CARTE)) {
    return {
      phase: "Briefing du DS",
      text: `${director} annonce que ${challenger.name} sera leader aujourd'hui — tes derniers résultats ne suffisent pas encore à le convaincre de te préférer.`,
      choices: [
        { label: "Accepter le rôle et te mettre au service de l'équipe", resolve: () => ({ text: `Tu rentres dans le rang sans faire d'histoires. ${director} apprécie ton professionnalisme.`, delta: { relationEquipe: 5 } }) },
        { label: "Réclamer ta chance auprès du DS", resolve: (g) => {
            const won = g.player.reputation.peloton >= (challenger.standing - 20);
            return won
              ? { text: `${director} accepte de te laisser une carte à jouer, à condition de ne pas nuire à ${challenger.name}.`, delta: { relationEquipe: -2, tacticalBonus: 3 } }
              : { text: `${director} refuse net : "${challenger.name} a fait ses preuves, pas toi. Encore."`, delta: { relationEquipe: -5 } };
          } },
        { label: "Te mettre pleinement au service de " + challenger.name, resolve: () => ({ text: `Tu t'engages sans réserve derrière ${challenger.name} — ce genre de loyauté ne s'oublie pas dans un vestiaire.`, delta: { relationEquipe: 8, teammatesDelta: { moral: 4 } } }) },
      ],
      role,
    };
  }

  // Le DS hésite vraiment entre toi et un équipier — le statut de leader reste à conquérir en course.
  if (challenger && hesitation) {
    return {
      phase: "Briefing du DS",
      text: `${director} hésite encore entre toi et ${challenger.name} pour le leadership aujourd'hui — vos formes sont trop proches pour trancher à l'avance. La course décidera.`,
      choices: [{ label: "Compris, à toi de le prouver sur la route", resolve: () => ({ text: "Tu prends le départ sachant que rien n'est acquis.", delta: {} }) }],
      role,
    };
  }

  return {
    phase: "Briefing du DS",
    text: baseText,
    choices: [{ label: "Compris", resolve: () => ({ text: "Tu prends ta place dans le peloton, rôle en tête.", delta: {} }) }],
    role,
  };
}

function injectDynamicIncidents(raceObj, game) {
  const meta = CALENDAR_META[raceObj.name] || {};
  const weather = rollWeather(meta);
  // Le briefing (et donc le rôle du jour) est calculé en premier, pour que les imprévus puissent
  // réagir à la situation du joueur dans la hiérarchie de l'équipe sur CETTE course précise.
  const briefingStage = buildBriefingStage(game, raceObj);
  const ctx = { game, raceObj, weather, meta, role: briefingStage.role };

  const weatherStage = {
    phase: "Conditions du jour",
    text: WEATHER_FLAVOR[weather](raceObj.name),
    choices: [{ label: "C'est parti !", resolve: () => ({ text: "Le peloton s'élance sous ces conditions.", delta: WEATHER_START_DELTA[weather] }) }],
  };

  const eligible = INCIDENT_POOL.filter((inc) => { try { return inc.condition(ctx); } catch { return false; } });
  const chosen = weightedPickMultiple(eligible, rand(1, 2));
  const incidentStages = chosen.map((inc) => ({
    phase: inc.phaseLabel,
    text: (g) => inc.text({ ...ctx, game: g }),
    choices: inc.choices(ctx),
  }));

  const originalStages = raceObj.stages;
  const finalStage = originalStages[originalStages.length - 1];
  const leadingStages = originalStages.slice(0, -1);
  return { ...raceObj, stages: [briefingStage, weatherStage, ...leadingStages, ...incidentStages, finalStage], weather, role: briefingStage.role };
}


/* ============================== CONSTRUCTION DE LA SAISON ============================== */
function eligibleEvents(block, game, usedIds) {
  return EVENTS.filter((e) => e.block === block && !usedIds.has(e.id) && (!e.condition || e.condition(game)));
}
function pickEventsForBlock(block, game, usedIds, count) {
  const pool = eligibleEvents(block, game, usedIds);
  const chosen = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const avail = pool.filter((e) => !chosen.find((c) => c.id === e.id));
    if (avail.length === 0) break;
    chosen.push(pick(avail));
  }
  return chosen;
}
function grandTourKindFor(spec) {
  if (spec === "grimpeur") return "montagne";
  if (spec === "rouleur") return "clm";
  if (spec === "sprinteur") return "sprint";
  if (spec === "puncheur") return pick(["montagne", "sprint"]);
  return pick(["montagne", "clm", "sprint"]);
}

// Formation (junior) et passage pro restent automatiques (pas de planification par le joueur).
// game.usedJuniorEventIds mémorise ce qui a déjà été vu les années précédentes, pour ne pas retomber
// deux fois sur le même événement sur les 3 ans de formation (16 à 18 ans).
function buildNonProQueue(game) {
  const player = game.player;
  if (player.phase === "formation") {
    const usedIds = new Set(game.usedJuniorEventIds || []);
    return pickEventsForBlock("junior", game, usedIds, 2).map((e) => ({ type: "event", data: e }));
  }
  return pickEventsForBlock("passage_pro", game, new Set(), 1).map((e) => ({ type: "event", data: e }));
}

// Une équipe Continentale ou ProTeam n'est pas alignée d'office sur le WorldTour : elle y est parfois invitée
// selon sa progression (réputation dans le peloton). Le championnat national reste toujours accessible.
function teamTierAllowsRace(player, raceTier) {
  const level = player.team?.level;
  if (!raceTier || raceTier === "National") return true;
  if (level === TEAM_LEVELS.WT) return true; // accès total, y compris ProSeries/Europe Tour pour les néo-pros de l'effectif
  if (level === TEAM_LEVELS.PT) return raceTier === "WT" ? player.reputation.peloton >= 35 : true;
  // Continentale
  if (raceTier === "WT") return player.reputation.peloton >= 55;
  if (raceTier === "Pro") return player.reputation.peloton >= 25;
  return true; // Europe Tour toujours accessible, c'est le terrain de jeu naturel d'une Continentale
}

// Éligibilité d'une course pour le profil ET le niveau d'équipe du joueur (planification de calendrier).
function eligibleFor(pool, player) {
  return pool.filter((r) => r.fit.includes(player.specialtyPrimary) && teamTierAllowsRace(player, r.raceTier));
}

// Construit la saison pro à partir des choix de calendrier faits par le joueur (early/classics/prep/grandTour).
function buildProSeasonQueue(game, selections) {
  const player = game.player;
  const used = new Set();
  const queue = [];

  if (selections.early) queue.push({ type: "race", data: selections.early });
  pickEventsForBlock("hiver", game, used, 1).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });

  if (selections.classics.length > 0) {
    selections.classics.forEach((race) => queue.push({ type: "race", data: race }));
    pickEventsForBlock("classiques", game, used, 1).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });
  }

  if (selections.prep) queue.push({ type: "race", data: selections.prep });

  // Le championnat national se dispute chaque année, quel que soit le niveau de l'équipe.
  queue.push({ type: "race", data: buildNationalChampionship(player) });

  // Le Grand Tour n'est plus obligatoire : une carrière 100% classiques ou 100% sprint est un choix
  // normal, pas une anomalie. S'il n'est pas sélectionné, on saute simplement cette étape.
  if (selections.grandTour) {
    const kind = grandTourKindFor(player.specialtyPrimary);
    pickEventsForBlock("coeur", game, used, 1).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });
    queue.push({ type: "race", data: buildGrandTourRace(selections.grandTour, kind) });
  }

  if (player.reputation.peloton >= 45) {
    queue.push({ type: "race", data: buildWorldsRace(player) });
  }
  if (selections.autumn) queue.push({ type: "race", data: selections.autumn });
  if (LOMBARDIA.fit.includes(player.specialtyPrimary)) {
    queue.push({ type: "race", data: LOMBARDIA });
  }
  pickEventsForBlock("fin", game, used, 2).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });

  return queue;
}

/* ============================== INIT ============================== */
function initialPlayer(form) {
  const baseSpec = { montagne: 25, sprint: 25, clm: 25, pave: 25 };
  const specMap = { grimpeur: "montagne", sprinteur: "sprint", rouleur: "clm", puncheur: "montagne", polyvalent: null };
  const boostKey = specMap[form.specialtyPrimary];
  if (boostKey) baseSpec[boostKey] += 30; else Object.keys(baseSpec).forEach((k) => (baseSpec[k] += 12));

  const lifestyleStats = {
    rigoureux: { fatigue: 10, ethique: 70, rep: 20 },
    equilibre: { fatigue: 20, ethique: 60, rep: 25 },
    festif: { fatigue: 30, ethique: 50, rep: 35 },
  }[form.lifestyle];

  return {
    name: form.name, nation: form.nation, origin: form.origin, specialtyPrimary: form.specialtyPrimary, lifestyle: form.lifestyle,
    age: 16, seasonNumber: 1, phase: "formation",
    team: null, role: "espoir", money: 0, skillPoints: 0, unlockedSkills: [], uciPoints: 0,
    stats: { forme: 55, fatigue: lifestyleStats.fatigue, fatigueChronique: 12, motivation: 75, relationEquipe: 50, ethique: lifestyleStats.ethique },
    reputation: { fans: Math.round(lifestyleStats.rep * 0.7), peloton: lifestyleStats.rep, sponsors: Math.round(lifestyleStats.rep * 0.5), medias: Math.round(lifestyleStats.rep * 0.8) },
    specialties: baseSpec,
    palmares: [], history: [`16 ans — débute le cyclisme en ${ORIGINS.find((o) => o.id === form.origin)?.label.toLowerCase()}.`],
    flags: {}, retired: false,
  };
}

function promoteToPro(game, team) {
  const player = { ...game.player, team, phase: "pro", role: "équipier", money: 12000, skillPoints: 2, currentYear: new Date().getFullYear(), teamsHistory: [{ name: team.name, level: team.level, fromAge: game.player.age }] };
  const peloton = generatePeloton();
  const rivalId = pickNewRivalId(peloton, player);
  return {
    ...game, player,
    justSignedPro: true,
    peloton,
    rivalId,
    rivalRelation: { haine: 25, respect: 30 },
    teammates: generateTeammates(),
    sponsor: { ...pick(SPONSOR_OBJECTIVES), fulfilled: false },
    worldHistory: {},
    seasonMajorResults: {},
    tacticalBonus: 0,
    raceState: initRaceState(),
    talentCharges: {},
    effortAccum: 0,
  };
}

function verdictFor(player) {
  if (player.flags?.careerEndingInjury) return "Carrière brisée avant d'avoir commencé";
  const wins = player.palmares.filter((p) => p.label.startsWith("Victoire")).length;
  const podiums = player.palmares.filter((p) => p.label.startsWith("Podium")).length;
  if (wins >= 6) return "Légende du peloton";
  if (wins >= 3) return "Grand nom du cyclisme";
  if (wins >= 1 || podiums >= 3) return "Coureur pro accompli";
  if (podiums >= 1) return "Solide professionnel";
  return "Carrière discrète, mais vécue à fond";
}

// Note générale de carrière — un score /100 dérivé du palmarès, de la réputation finale et de la
// longévité, aucune nouvelle statistique stockée. Pas de note pour une carrière interrompue avant le début.
function computeCareerScore(player) {
  if (player.flags?.careerEndingInjury) return null;
  const wins = player.palmares.filter((p) => /^(Victoire|Classement général)/.test(p.label)).length;
  const podiums = player.palmares.filter((p) => p.label.startsWith("Podium")).length;
  const monumentWins = player.palmares.filter((p) => /^(Victoire|Classement général)/.test(p.label) && [...MONUMENTS].some((m) => p.label.includes(m))).length;
  const jerseys = player.palmares.filter((p) => p.label.startsWith("Maillot")).length;
  const worldsWin = player.palmares.some((p) => p.label.includes("Championnats du Monde") && p.label.startsWith("Victoire"));
  let score = wins * 4 + podiums * 2 + monumentWins * 6 + jerseys * 3 + (worldsWin ? 15 : 0);
  score += Math.round((player.reputation?.peloton || 0) * 0.3);
  score += Math.min(15, (player.seasonNumber || 1) * 1.5); // bonus de longévité, plafonné
  return Math.max(0, Math.min(100, Math.round(score)));
}
function careerGrade(score) {
  if (score === null) return "—";
  if (score >= 85) return "S";
  if (score >= 65) return "A";
  if (score >= 45) return "B";
  if (score >= 25) return "C";
  if (score >= 10) return "D";
  return "E";
}

// Note de niveau ACTUEL (1-100, façon jeu de sport) — distincte de la note de fin de carrière ci-dessus :
// celle-ci mesure « à quel point tu es fort en ce moment », pas ton palmarès cumulé. Recalculée en
// permanence à partir de données déjà existantes (spécialités, forme, réputation, résultats récents).
function computeCurrentRating(player) {
  // Qualité physique dominante (les spécialités peuvent dépasser 100 avec les compétences — on ramène
  // une valeur réaliste ~130 vers 100 pour rester lisible).
  const topSpecialty = Math.max(player.specialties.montagne, player.specialties.sprint, player.specialties.clm, player.specialties.pave);
  const physicalScore = clamp(topSpecialty / 1.3);
  const formeScore = player.stats.forme;
  const repScore = player.reputation.peloton;
  // Résultats récents : victoires/podiums/top10 des deux dernières saisons — enchaîner de bons résultats
  // fait vraiment monter la note, pas seulement les stats brutes.
  const recentResults = player.palmares.filter((p) => p.age >= player.age - 2).length;
  const resultsScore = clamp(recentResults * 10);
  const overall = physicalScore * 0.3 + formeScore * 0.15 + repScore * 0.25 + resultsScore * 0.3;
  return Math.max(1, Math.min(100, Math.round(overall)));
}
function ratingTier(rating) {
  if (rating >= 88) return "Élite mondiale";
  if (rating >= 74) return "Cadre reconnu";
  if (rating >= 58) return "Pro solide";
  if (rating >= 40) return "En progression";
  return "Amateur / débutant";
}

// Épilogue post-carrière : un texte généré à partir de ce qui existe déjà (score, palmarès, dernière
// équipe, rival) — pas une nouvelle mécanique de jeu, juste une façon de clore l'histoire plutôt qu'un
// écran de fin statique.
function generateEpilogue(player, choice, rival) {
  const specLabel = SPECIALTIES.find((s) => s.id === player.specialtyPrimary)?.label || player.specialtyPrimary;
  const lastTeam = player.teamsHistory?.[player.teamsHistory.length - 1]?.name || "une modeste structure continentale";
  const score = computeCareerScore(player) ?? 0;
  const tier = score >= 65 ? "haut" : score >= 40 ? "moyen" : "discret";
  const rivalLine = rival ? ` Tu croises encore parfois ${rival.name} sur le bord des routes, comme deux vieilles connaissances qui se sont tout donné.` : "";

  if (choice === "ds") {
    if (tier === "haut") return `Ton palmarès parle pour toi : ${lastTeam} t'offre directement les clés du poste de directeur sportif. Tu passes de l'autre côté de l'oreillette, avec la légitimité d'une grande carrière derrière toi.${rivalLine}`;
    if (tier === "moyen") return `Tu débutes comme DS adjoint chez ${lastTeam}, où ton expérience de coureur solide est appréciée. Le chemin vers un poste de numéro un prendra quelques saisons, mais la passion est intacte.${rivalLine}`;
    return `Tu te reconvertis directeur sportif dans une petite structure continentale, loin des projecteurs, mais avec la même passion pour transmettre ce que tu as appris sur la route.${rivalLine}`;
  }
  if (choice === "tv") {
    if (tier === "haut") return `Ta notoriété t'ouvre directement un micro sur les grandes chaînes : tu deviens consultant vedette sur les Grands Tours, ton regard de champion très recherché par les diffuseurs.${rivalLine}`;
    if (tier === "moyen") return `Tu rejoins une petite équipe de commentateurs pour les classiques et les grands rendez-vous — ton vécu de coureur professionnel apporte un vrai regard de l'intérieur.${rivalLine}`;
    return `Tu commences en radio locale, à commenter les courses régionales que tu connais par cœur. Modeste, mais tu ne quittes jamais vraiment le monde du vélo.${rivalLine}`;
  }
  // choice === "scout"
  if (tier === "haut") return `Ton nom ouvre toutes les portes : tu deviens dénicheur de talents pour une grande structure WorldTour, à sillonner les courses juniors à la recherche du prochain grand ${specLabel.toLowerCase()}.${rivalLine}`;
  if (tier === "moyen") return `Tu rejoins la cellule de recrutement de ${lastTeam}, où ton œil de ${specLabel.toLowerCase()} expérimenté aide à repérer les jeunes coureurs prometteurs.${rivalLine}`;
  return `Tu deviens bénévole dans ton club amateur d'origine, à transmettre aux plus jeunes ce que personne ne t'avait appris à leur âge.${rivalLine}`;
}

const BLOCK_LABEL = { junior: "Formation", passage_pro: "Passage professionnel", hiver: "Préparation hivernale", classiques: "Classiques de printemps", coeur: "Cœur de saison", fin: "Fin de saison" };

/* ============================== UI HELPERS ============================== */
const Bar = ({ label, value, color }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.inkMuted, marginBottom: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
      <span>{label}</span><span>{value}</span>
    </div>
    <div style={{ height: 6, background: T.line, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${clamp(value)}%`, height: "100%", background: color, transition: "width .4s ease" }} />
    </div>
  </div>
);
const Card = ({ children, style }) => (<div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: 16, ...style }}>{children}</div>);
const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ background: active ? T.accent : T.panelAlt, color: active ? "#171614" : T.ink, border: `1px solid ${active ? T.accent : T.line}`, padding: "8px 14px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>
);
const ChoiceButton = ({ onClick, primary, children }) => (
  <button onClick={onClick} style={{ background: primary ? T.accent : T.panelAlt, color: primary ? "#171614" : T.ink, border: `1px solid ${primary ? T.accent : T.line}`, padding: 14, borderRadius: 8, textAlign: "left", cursor: "pointer", width: "100%", marginBottom: 8, fontSize: 14, fontWeight: primary ? 700 : 500 }}>{children}</button>
);
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');`;

/* ============================== COMPOSANT PRINCIPAL ============================== */
// Filet de sécurité : si un bug imprévu plante le rendu, on affiche un écran de récupération
// avec les détails techniques (utile pour que les testeurs puissent te les transmettre),
// plutôt qu'un écran blanc muet qui ferait croire à un simple freeze.
class ProCyclingLifeErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Pro Cycling Life — erreur interceptée :", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#121110", color: "#f5f0e8", minHeight: 400, padding: 24, borderRadius: 12, fontFamily: "Inter, sans-serif", textAlign: "center" }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, marginBottom: 8 }}>🚧 Un imprévu a interrompu la course</div>
          <p style={{ color: "#9a9086", fontSize: 14, maxWidth: 480, margin: "0 auto 16px" }}>
            Le jeu a rencontré une erreur inattendue. Ta progression est normalement sauvegardée automatiquement — recharge la page pour reprendre là où tu en étais.
            Si le souci persiste, note ce que tu faisais juste avant (quel écran, quelle action) et transmets-le, ça aide énormément à corriger le bug.
          </p>
          <button onClick={() => window.location.reload()} style={{ background: "#c65d3b", color: "#171614", border: "none", padding: "10px 20px", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            Recharger la page
          </button>
          <details style={{ marginTop: 20, fontSize: 11, color: "#9a9086", textAlign: "left", maxWidth: 480, margin: "20px auto 0" }}>
            <summary style={{ cursor: "pointer" }}>Détails techniques</summary>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{String(this.state.error?.stack || this.state.error)}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProCyclingLifeApp() {
  return (
    <ProCyclingLifeErrorBoundary>
      <ProCyclingLife />
    </ProCyclingLifeErrorBoundary>
  );
}

// Sauvegarde persistante (localStorage) — versionnée, pour ne jamais essayer de recharger une sauvegarde
// incompatible après une mise à jour du jeu (on efface simplement plutôt que de risquer un état corrompu).
const SAVE_KEY = "pro_cycling_life_save_v1";
function saveGameToStorage(game) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ game, savedAt: Date.now() })); } catch (e) { /* stockage plein ou indisponible : on continue sans sauvegarder */ }
}
function loadGameFromStorage() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.game || null;
  } catch (e) { return null; }
}
function clearSavedGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}

function ProCyclingLife() {
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", nation: null, origin: null, specialtyPrimary: null, lifestyle: null });
  const [game, setGame] = useState(null);
  const [view, setView] = useState("story");
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [raceLogs, setRaceLogs] = useState([]);
  const [seasonLog, setSeasonLog] = useState([]);
  const [pendingResult, setPendingResult] = useState(null);
  const [showRecap, setShowRecap] = useState(false);
  const [planning, setPlanning] = useState(null); // { early, classics: [], prep, grandTour } pendant la planification de saison
  const [skillSubTab, setSkillSubTab] = useState("physique");
  const [unlockCelebration, setUnlockCelebration] = useState(null); // { skill } — écran de célébration au déblocage
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [epilogueChoice, setEpilogueChoice] = useState(null);

  // Restauration au chargement de la page. Le calendrier/queue d'une course en cours contient des fonctions
  // (choix, résolutions) qui ne peuvent pas être sérialisées en JSON — donc en cas de rechargement en pleine
  // course, on ne perd que cette course en cours, jamais la progression de carrière (stats, palmarès,
  // compétences, peloton, rivalités), qui elle est sauvegardée en continu et restaurée intégralement.
  useEffect(() => {
    const saved = loadGameFromStorage();
    if (!saved || !saved.player) return;
    if (saved.player.retired) {
      setGame(saved);
      setScreen("end");
      return;
    }
    if (saved.player.phase !== "pro") {
      const q = buildNonProQueue(saved);
      setGame({ ...saved, usedJuniorEventIds: [...(saved.usedJuniorEventIds || []), ...q.map((item) => item.data.id)] });
      setQueue(q.slice(1));
      setCurrent(q[0] || null);
      setScreen("play");
      setView("story");
    } else {
      setGame(saved);
      setScreen("planning");
      setPlanning({ early: null, classics: [], prep: null, autumn: null, grandTour: null, objectives: [], altitudeCamp: false });
    }
    setRestoredNotice(true);
  }, []);

  // Sauvegarde automatique à chaque changement de l'état du joueur — pas besoin d'action manuelle.
  useEffect(() => {
    if (game) saveGameToStorage(game);
  }, [game]);

  function startCareer() {
    const player = initialPlayer(form);
    const g = { player, peloton: null, rivalId: null, rivalRelation: null, teammates: null, sponsor: null, usedJuniorEventIds: [] };
    const q = buildNonProQueue(g);
    const g2 = { ...g, usedJuniorEventIds: [...(g.usedJuniorEventIds || []), ...q.map((item) => item.data.id)] };
    setGame(g2);
    setQueue(q.slice(1));
    setCurrent(q[0] || null);
    setStageIndex(0);
    setRaceLogs([]);
    setSeasonLog([]);
    setScreen("play");
    setView("story");
  }

  function goToNextQueueItem() {
    setPendingResult(null);
    setRaceLogs([]);
    setStageIndex(0);
    // Récupération entre deux activités, proportionnelle à l'effort fatigant réellement fourni
    // (voir applyDelta -> effortAccum), amplifiée par les compétences de récupération (Récupération, Endurance...).
    setGame((prev) => {
      const skillBonus = SkillEngine.formeRecovery(prev.player) + SkillEngine.fatigueResist(prev.player) * 0.4;
      const fatigueRecovered = Math.round((prev.effortAccum || 0) * 0.5) + Math.round(skillBonus);
      let g = fatigueRecovered > 0 ? applyDelta(prev, { fatigue: -fatigueRecovered, forme: Math.round(fatigueRecovered * 0.25) }) : prev;

      // Pipeline Fatigue Chronique : Charge récente → Accumulation → Récupération (ci-dessus) → récupération
      // insuffisante ? → Fatigue chronique. Ce n'est plus l'ampleur de l'effort qui nourrit la fatigue
      // chronique, mais le fait que la fatigue récente RESTE élevée malgré la récupération qu'on vient
      // d'appliquer — une charge bien gérée (fatigue redescendue sous le seuil) ne laisse aucune trace chronique.
      const RECOVERY_THRESHOLD = 55;
      const residualFatigue = g.player.stats.fatigue;
      const insufficientRecoveryGain = residualFatigue > RECOVERY_THRESHOLD ? Math.round((residualFatigue - RECOVERY_THRESHOLD) * 0.4) : 0;
      const chronicBaselineRelief = Math.round(skillBonus * 0.15); // petite récupération passive de fond, comme avant
      const chronicDelta = insufficientRecoveryGain - chronicBaselineRelief;
      if (chronicDelta !== 0) g = applyDelta(g, { fatigueChronique: chronicDelta });

      g = { ...g, effortAccum: 0 };
      // Le bonus tactique accumulé (choix débloqués par l'arbre Tactique) et la charge d'Attaque surprise
      // ne valent que pour une course à la fois — on les réinitialise en entrant dans une nouvelle course.
      if (queue.length > 0 && queue[0].type === "race") {
        g = { ...g, tacticalBonus: 0, raceState: initRaceState(), player: { ...g.player, flags: { ...g.player.flags, savedForFinalClimb: false } }, talentCharges: { ...(g.talentCharges || {}), attaquant_surprise: SkillEngine.hasSkill(g.player, "talent_attaquant") } };
      }
      return g;
    });
    if (queue.length > 0) {
      let next = queue[0];
      // Météo + imprévus tirés au sort à l'entrée en course : deux passages sur la même course ne se ressemblent jamais.
      if (next.type === "race") {
        next = { ...next, data: injectDynamicIncidents(next.data, game) };
      }
      setCurrent(next);
      setQueue(queue.slice(1));
    } else {
      endSeasonOrPhase();
    }
  }

  function endSeasonOrPhase() {
    setGame((prev) => {
      let player = { ...prev.player };
      if (player.justSignedPro) {
        // Moment de la signature pro : on ne compte pas encore de saison écoulée.
        setShowRecap(true);
        return { ...prev, justSignedPro: false };
      }
      if (player.phase === "formation") {
        if (player.age >= 18) player.phase = "passage_pro";
        else player.age += 1;
        setShowRecap(true);
        return { ...prev, player };
      }
      player.age += 1;
      player.seasonNumber += 1;
      player.skillPoints += 2;
      player.currentYear = (player.currentYear || new Date().getFullYear()) + 1;
      const forced = player.age >= 40 || player.stats.forme <= 8;
      if (forced) player.retired = true;
      setShowRecap(true);
      return { ...prev, player, sponsor: prev.sponsor && !prev.sponsor.fulfilled ? prev.sponsor : { ...pick(SPONSOR_OBJECTIVES), fulfilled: false } };
    });
  }

  function continueAfterRecap() {
    setShowRecap(false);
    setSeasonLog([]);
    setGame((prev) => {
      if (prev.player.retired) { setScreen("end"); return prev; }

      if (prev.player.phase !== "pro") {
        const q = buildNonProQueue(prev);
        setQueue(q.slice(1));
        setCurrent(q[0] || null);
        setView("story");
        return { ...prev, usedJuniorEventIds: [...(prev.usedJuniorEventIds || []), ...q.map((item) => item.data.id)] };
      }

      // Trêve hivernale : contrairement à la récupération entre deux courses (plus modeste), l'intersaison
      // efface l'essentiel de la fatigue accumulée dans la saison — comme dans la vraie vie, 2-3 mois de coupure.
      // Amplifiée par la qualité d'entraînement de l'équipe et les compétences de récupération.
      let g = prev;
      const trainingQualityBonus = g.player.team ? Math.round((g.player.team.trainingQuality - 50) / 6) : 0;
      const skillRecovery = SkillEngine.formeRecovery(g.player) * 2; // la compétence Récupération pèse double à ce moment-clé
      const offSeasonFatigueRelief = Math.round(g.player.stats.fatigue * 0.6) + Math.round(trainingQualityBonus / 2);
      // La fatigue chronique ne se vide vraiment qu'ici — 55% de coupure hivernale, jamais 100% :
      // une trace de la charge des saisons précédentes persiste, comme dans une vraie carrière.
      const chronicRelief = Math.round(g.player.stats.fatigueChronique * 0.3) + Math.round(skillRecovery * 0.5);
      const formeBoost = Math.max(8, Math.round((75 - g.player.stats.forme) * 0.35)) + trainingQualityBonus + skillRecovery;
      g = applyDelta(g, { fatigue: -offSeasonFatigueRelief, forme: formeBoost, fatigueChronique: -chronicRelief });
      // Mental d'acier : la charge "ignore une baisse de motivation" se recharge à chaque nouvelle saison.
      if (SkillEngine.hasSkill(g.player, "talent_acier")) {
        g = { ...g, talentCharges: { ...(g.talentCharges || {}), mental_acier: true } };
      }
      // La réputation n'est plus un cliquet à sens unique : elle s'estompe légèrement chaque saison si elle
      // n'est pas entretenue par de nouveaux résultats — comme une vraie notoriété sportive. Sans ça, un bon
      // début de carrière restait acquis pour toujours, ce qui alimentait une spirale sans frein réel.
      const decay = (v) => Math.round(v - (v - 50) * 0.08);
      g = { ...g, player: { ...g.player, reputation: { fans: decay(g.player.reputation.fans), peloton: decay(g.player.reputation.peloton), sponsors: decay(g.player.reputation.sponsors), medias: decay(g.player.reputation.medias) } } };
      // Classement UCI de la saison écoulée (avant remise à zéro) — on ne le fait qu'à partir de la 2e saison pro,
      // puisque la toute première n'a encore aucun point à classer.
      if (g.player.seasonNumber > 1) {
        const priorStandings = [...(g.peloton || []), { id: "player", points: g.player.uciPoints || 0 }].sort((a, b) => (b.points || 0) - (a.points || 0));
        const priorRank = priorStandings.findIndex((s) => s.id === "player") + 1;
        g = { ...g, player: { ...g.player, history: [...g.player.history, `${g.player.age} ans — termine ${ordinal(priorRank)} du classement UCI de la saison, avec ${g.player.uciPoints || 0} points.`] } };
      }
      // Objectif de points UCI d'équipe de la saison écoulée : purement narratif et stratégique — un bon
      // apport personnel renforce ta relation avec l'équipe, mais aucune sanction si l'objectif est manqué.
      if (g.teamSeasonGoal && (g.player.uciPoints || 0) >= g.teamSeasonGoal * 0.4) {
        const bonusText = `${g.player.age} ans — contribue largement à l'objectif de points UCI de l'équipe (${g.player.uciPoints} pts apportés).`;
        g = applyDelta(g, { relationEquipe: 4 });
        g = { ...g, player: { ...g.player, history: [...g.player.history, bonusText] } };
      }
      // Objectifs de saison personnels choisis par le joueur : évalués à partir de ce qui vient de se
      // passer (nouvelles entrées de palmarès, points UCI accumulés) — narratif + petit vrai retour.
      if (g.seasonObjectives && g.seasonObjectives.length > 0) {
        const newPalmares = g.player.palmares.slice(g.seasonStartPalmaresCount || 0).map((p) => p.label);
        const ctx = { newPalmares, uciPointsThisSeason: g.player.uciPoints || 0, player: g.player, wasWTAtSeasonStart: g.wasWTAtSeasonStart };
        const met = g.seasonObjectives.filter((id) => evaluateSeasonObjective(id, ctx));
        const missed = g.seasonObjectives.filter((id) => !met.includes(id));
        if (met.length > 0) {
          const labels = met.map((id) => SEASON_OBJECTIVES.find((o) => o.id === id)?.label).filter(Boolean);
          g = applyDelta(g, { reputation: met.length * 3, relationEquipe: met.length * 2 });
          g = { ...g, player: { ...g.player, history: [...g.player.history, `${g.player.age} ans — objectifs de saison atteints : ${labels.join(", ")}.`] } };
        }
        if (missed.length > 0) {
          const labels = missed.map((id) => SEASON_OBJECTIVES.find((o) => o.id === id)?.label).filter(Boolean);
          g = { ...g, player: { ...g.player, history: [...g.player.history, `${g.player.age} ans — objectifs de saison manqués : ${labels.join(", ")}.`] } };
        }
      }
      g = { ...g, player: { ...g.player, uciPoints: 0 }, seasonBonusSkillPoints: 0, recentResultTiers: [] };
      // Nouvel objectif de points UCI pour la saison à venir, proportionné au niveau de l'équipe.
      const goalBase = { [TEAM_LEVELS.WT]: 400, [TEAM_LEVELS.PT]: 150, [TEAM_LEVELS.CT]: 60 };
      g = { ...g, teamSeasonGoal: g.player.team ? Math.round((goalBase[g.player.team.level] || 100) * (0.8 + Math.random() * 0.4)) : null };

      // Les médias suivent la construction de ton identité : si ton style de carrière émergent change,
      // ça fait l'actualité — et ça reste dans ta biographie. Aucune nouvelle statistique : tout est déjà
      // dérivé de tes compétences/palmarès via SkillEngine.getCareerStyle().
      let styleAnnouncement = null;
      if (g.player.seasonNumber > 1) {
        const newStyle = SkillEngine.getCareerStyle(g);
        if (newStyle && newStyle.id !== g.player.lastCareerStyleId) {
          styleAnnouncement = `La presse commence à surnommer ${g.player.name} « ${newStyle.label} ».`;
          const title = SkillEngine.computeTitle(g.player);
          const bio = `${g.player.age} ans — ${styleAnnouncement} Statut : ${title}.`;
          g = { ...g, player: { ...g.player, lastCareerStyleId: newStyle.id, history: [...g.player.history, bio] } };
        }
      }

      // Le peloton vit sa vie en coulisses : vieillissement, progressions/régressions, transferts, retraites, jeunes talents.
      // Ton rival N'EST PLUS géré séparément : c'est un coureur du peloton, il évolue avec tout le monde.
      // On vérifie juste s'il fait partie des retraités de la saison pour lui désigner un successeur.
      const oldRival = getRival(g);
      const { peloton: agedPeloton, summary } = simulateSeason(g.peloton || []);
      let rivalId = g.rivalId;
      let rivalRelation = g.rivalRelation;
      let retiredRival = null;
      if (!agedPeloton.some((r) => r.id === rivalId)) {
        retiredRival = oldRival;
        rivalId = pickNewRivalId(agedPeloton, g.player);
        rivalRelation = { haine: 20, respect: 20 };
      }
      const pelotonNews = { ...summary, retiredRival };
      const pelotonHeadlines = buildNewsFeed(pelotonNews, g.player);
      const { headlines: raceHeadlines, peloton: newPeloton, majorResults: backgroundMajors } = buildRaceResultsNews(agedPeloton, g.lastSeasonRaceNames, rivalId);

      // Les équipes vivent leur vie, joueur ou pas : DS qui change, sponsor qui part, promotion/relégation...
      const gForTeams = { ...g, peloton: newPeloton };
      const { teamsState, headlines: teamHeadlines } = simulateTeamsEvolution(gForTeams);
      // Ta propre équipe suit la même évolution — si elle change de nom, de DS ou de niveau, tu le vois directement.
      const resolvedPlayerTeam = g.player.team ? resolveTeam({ teamsState }, g.player.team) : g.player.team;

      const news = [...pelotonHeadlines, ...raceHeadlines, ...teamHeadlines, ...(styleAnnouncement ? [styleAnnouncement] : [])].sort(() => Math.random() - 0.5).slice(0, 30);

      // Le monde a une mémoire : on archive les vainqueurs des courses majeures de la saison écoulée
      // (tes propres courses + celles simulées en arrière-plan) dans worldHistory, année par année.
      let worldHistory = g.worldHistory || {};
      if (g.player.seasonNumber > 1) {
        const yearJustConcluded = (g.player.currentYear || new Date().getFullYear()) - 1;
        const seasonMajors = { ...backgroundMajors, ...(g.seasonMajorResults || {}) };
        worldHistory = { ...worldHistory, [yearJustConcluded]: seasonMajors };
      }

      g = { ...g, peloton: newPeloton, rivalId, rivalRelation, pelotonNews, news, worldHistory, seasonMajorResults: {}, teamsState, player: { ...g.player, team: resolvedPlayerTeam } };

      setPlanning({ early: null, classics: [], prep: null, autumn: null, grandTour: null, objectives: [], altitudeCamp: false });
      setScreen("planning");
      return g;
    });
  }

  function confirmPlanning() {
    setGame((prev) => {
      const q = buildProSeasonQueue(prev, planning);
      const racedNames = q.filter((item) => item.type === "race").map((item) => item.data.name);
      setQueue(q.slice(1));
      setCurrent(q[0] || null);
      // Stage en altitude : préparation distincte du calendrier de courses — un coût immédiat (argent,
      // fatigue) contre un bonus temporaire réservé au Grand Tour ciblé cette saison (voir runRaceField).
      // On repart de zéro à chaque saison, pour ne jamais laisser le bonus traîner d'une année sur l'autre.
      let g = { ...prev, player: { ...prev.player, flags: { ...prev.player.flags, altitudeCampActive: false } } };
      if (planning.altitudeCamp && planning.grandTour) {
        g = applyDelta(g, { money: -8000, fatigue: 6, flags: { altitudeCampActive: true } });
        g = { ...g, player: { ...g.player, history: [...g.player.history, `${g.player.age} ans — effectue un stage en altitude en préparation du ${planning.grandTour}.`] } };
      }
      // Snapshot pour évaluer les objectifs de saison en fin de saison : ce qui existe déjà avant que
      // la saison ne commence (palmarès, niveau d'équipe) — aucune nouvelle donnée persistante.
      return { ...g, lastSeasonRaceNames: racedNames, seasonObjectives: planning.objectives, seasonStartPalmaresCount: g.player.palmares.length, wasWTAtSeasonStart: g.player.team?.level === TEAM_LEVELS.WT };
    });
    setPlanning(null);
    setScreen("play");
    setView("story");
    setStageIndex(0);
    setRaceLogs([]);
  }

  function retireNow() {
    setGame((prev) => ({ ...prev, player: { ...prev.player, retired: true } }));
    setShowRecap(false);
    setScreen("end");
  }

  function handleEventChoice(choice) {
    const res = choice.resolve(game);
    let newGame = applyDelta(game, res.delta || {});
    if (res.delta && res.delta.team) newGame = promoteToPro(newGame, res.delta.team);
    setGame(newGame);
    setSeasonLog((log) => [...log, res.text]);
    // Blessure de carrière précoce (événement rare j_fragility) : la carrière s'arrête ici, avant même
    // d'avoir commencé — on bascule directement vers l'écran de fin plutôt que de continuer la formation.
    if (newGame.player.flags?.careerEndingInjury) {
      setGame((prev) => ({ ...prev, player: { ...prev.player, retired: true } }));
      setPendingResult({ text: res.text });
      setScreen("end");
      return;
    }
    setPendingResult({ text: res.text });
  }

  function handleRaceChoice(choice) {
    const res = choice.resolve(game);
    const newGame = applyDelta(game, res.delta || {});
    setGame(newGame);
    const isLast = stageIndex === current.data.stages.length - 1;
    setRaceLogs((logs) => [...logs, res.text]);
    if (isLast) {
      setSeasonLog((log) => [...log, `${current.data.name} : ${res.text}`]);
      setPendingResult({ text: res.text, classification: res.classification, playerPosition: res.playerPosition, fieldSize: res.fieldSize });
    } else {
      setStageIndex((i) => i + 1);
    }
  }

  function unlockSkill(skillId) {
    const { ok, skill } = SkillEngine.canUnlock(game, skillId);
    if (!ok) return;
    setGame((prev) => {
      const result = SkillEngine.unlock(prev, skillId);
      // Les talents et philosophies, prestigieux, laissent une trace dans la biographie de carrière.
      if (skill.category === "talent" || SKILL_TREE_CONFIG.philosophies.some((p) => p.id === skillId)) {
        const player = { ...result.player, history: [...result.player.history, `${result.player.age} ans — débloque « ${skill.label} ».`] };
        return { ...result, player };
      }
      return result;
    });
    setUnlockCelebration({ skill });
  }

  /* ---------------- HOME ---------------- */
  if (screen === "home") {
    return (
      <div style={{ background: T.bg, minHeight: 520, color: T.ink, fontFamily: "Inter, sans-serif", padding: 24, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 4, color: T.accent, textTransform: "uppercase", marginBottom: 10 }}>Un jeu de carrière cycliste</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 40, margin: "0 0 14px 0" }}>Pro Cycling Life</h1>
        <p style={{ color: T.inkMuted, maxWidth: 440, lineHeight: 1.6, marginBottom: 32 }}>
          De 16 ans à la retraite, écris la carrière d'un coureur cycliste, saison après saison.
          Classiques, grands tours, rivalités, dilemmes d'équipe : chaque choix compte.
        </p>
        <div style={{ width: "100%", maxWidth: 320 }}>
          <ChoiceButton primary onClick={() => { setForm({ name: "", nation: null, origin: null, specialtyPrimary: null, lifestyle: null }); setStep(0); setScreen("intro"); }}>
            🚴 Nouvelle carrière
          </ChoiceButton>
        </div>
      </div>
    );
  }

  /* ---------------- INTRO ---------------- */
  if (screen === "intro") {
    return (
      <div style={{ background: T.bg, minHeight: 520, color: T.ink, fontFamily: "Inter, sans-serif", padding: 24, borderRadius: 12 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 3, color: T.accent, textTransform: "uppercase", marginBottom: 4 }}>Pro Cycling Life</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 28, margin: "0 0 20px 0" }}>Crée ton coureur</h1>

        {step === 0 && (
          <div>
            <p style={{ color: T.inkMuted, marginBottom: 10 }}>Nationalité</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {NATIONS.map((n) => (<ChoiceButton key={n.code} primary={form.nation?.code === n.code} onClick={() => setForm((f) => ({ ...f, nation: n }))}>{n.flag} {n.label}</ChoiceButton>))}
            </div>
            <ChoiceButton primary onClick={() => form.nation && setStep(1)}>Continuer</ChoiceButton>
          </div>
        )}
        {step === 1 && (
          <div>
            <p style={{ color: T.inkMuted, marginBottom: 10 }}>Comment s'appelle ton coureur {form.nation?.flag} ?</p>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom du coureur"
              style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${T.line}`, background: T.panel, color: T.ink, marginBottom: 10, boxSizing: "border-box" }} />
            <ChoiceButton onClick={() => setForm((f) => ({ ...f, name: randomNameForNation(f.nation?.code) }))}>🎲 Nom aléatoire ({form.nation?.label})</ChoiceButton>
            <ChoiceButton primary onClick={() => form.name && setStep(2)}>Continuer</ChoiceButton>
          </div>
        )}
        {step === 2 && (
          <div>
            <p style={{ color: T.inkMuted, marginBottom: 10 }}>Origine</p>
            {ORIGINS.map((o) => (
              <ChoiceButton key={o.id} primary={form.origin === o.id} onClick={() => setForm((f) => ({ ...f, origin: o.id }))}>
                <div style={{ fontWeight: 700 }}>{o.label}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{o.desc}</div>
              </ChoiceButton>
            ))}
            <ChoiceButton primary onClick={() => form.origin && setStep(3)}>Continuer</ChoiceButton>
          </div>
        )}
        {step === 3 && (
          <div>
            <p style={{ color: T.inkMuted, marginBottom: 10 }}>Spécialité de départ</p>
            {SPECIALTIES.map((s) => (
              <ChoiceButton key={s.id} primary={form.specialtyPrimary === s.id} onClick={() => setForm((f) => ({ ...f, specialtyPrimary: s.id }))}>
                <div style={{ fontWeight: 700 }}>{s.label}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{s.desc}</div>
              </ChoiceButton>
            ))}
            <ChoiceButton primary onClick={() => form.specialtyPrimary && setStep(4)}>Continuer</ChoiceButton>
          </div>
        )}
        {step === 4 && (
          <div>
            <p style={{ color: T.inkMuted, marginBottom: 10 }}>Mode de vie</p>
            {LIFESTYLES.map((l) => (
              <ChoiceButton key={l.id} primary={form.lifestyle === l.id} onClick={() => setForm((f) => ({ ...f, lifestyle: l.id }))}>
                <div style={{ fontWeight: 700 }}>{l.label}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{l.desc}</div>
              </ChoiceButton>
            ))}
            <ChoiceButton primary onClick={() => form.lifestyle && startCareer()}>Lancer la carrière 🚴</ChoiceButton>
          </div>
        )}
      </div>
    );
  }

  if (!game) return null;
  const { player, teammates, sponsor } = game;
  const rival = getRival(game);

  /* ---------------- PLANNING (choix du calendrier de la saison) ---------------- */
  if (screen === "planning" && planning) {
    const earlyPool = eligibleFor(EARLY_SEASON_RACES, player);
    const classicsPool = eligibleFor(CLASSICS, player);
    const prepPool = eligibleFor(SUMMER_PREP_RACES, player);
    const autumnPool = eligibleFor(AUTUMN_CLASSICS, player);
    const grandTours = ["Tour de France", "Giro d'Italia", "Vuelta a España"];
    const MAX_CLASSICS = 4;

    // Le DS explique la stratégie de saison selon ton profil — chaque profil a des alternatives crédibles,
    // même quand certaines courses (pavés, classiques ardennaises...) ne lui sont pas adaptées.
    const DS_ADVICE = {
      grimpeur: "Les pavés, ce n'est pas pour toi — on va plutôt construire ta saison autour des courses par étapes vallonnées et des classiques ardennaises, avant de te lâcher sur le général du grand tour.",
      puncheur: "Ton profil est le plus polyvalent de l'équipe : pavés, classiques ardennaises, courses par étapes... presque tout peut te convenir. À toi de choisir tes batailles.",
      sprinteur: "On va miser sur les classiques roulantes et les sprints massifs. Les ardennaises, laisse ça aux grimpeurs — mais les pavés peuvent très bien te réussir.",
      rouleur: "Tu es taillé pour rouler fort et longtemps : les pavés et les courses par étapes te vont bien. Les ardennaises les plus sélectives, en revanche, ce sera compliqué.",
      polyvalent: "Tu n'as pas de point faible marqué, donc pas vraiment de limite non plus. À toi de construire un calendrier cohérent avec tes ambitions.",
    };

    function toggleEarly(race) { setPlanning((p) => ({ ...p, early: p.early?.id === race.id ? null : race })); }
    function togglePrep(race) { setPlanning((p) => ({ ...p, prep: p.prep?.id === race.id ? null : race })); }
    function toggleAutumn(race) { setPlanning((p) => ({ ...p, autumn: p.autumn?.id === race.id ? null : race })); }
    function toggleClassic(race) {
      setPlanning((p) => {
        const already = p.classics.find((r) => r.id === race.id);
        if (already) return { ...p, classics: p.classics.filter((r) => r.id !== race.id) };
        if (p.classics.length >= MAX_CLASSICS) return p;
        return { ...p, classics: [...p.classics, race] };
      });
    }
    function setGrandTour(name) { setPlanning((p) => ({ ...p, grandTour: p.grandTour === name ? null : name })); }
    function toggleObjective(id) {
      setPlanning((p) => {
        const already = p.objectives.includes(id);
        if (already) return { ...p, objectives: p.objectives.filter((o) => o !== id) };
        if (p.objectives.length >= 5) return p;
        return { ...p, objectives: [...p.objectives, id] };
      });
    }
    const TIER_BADGE = { WT: { label: "WorldTour", color: T.accent }, Pro: { label: "ProSeries", color: T.info }, Europe: { label: "Europe Tour", color: T.inkMuted } };
    const TierTag = ({ tier }) => { const t = TIER_BADGE[tier]; return t ? <span style={{ fontSize: 10, color: t.color, border: `1px solid ${t.color}`, borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>{t.label}</span> : null; };
    // Ligne d'adéquation profil/course : dérivée à la volée depuis le profil terrain réel de la course.
    // Fiche de course complète : durée, type, enjeu, profil terrain sur 6 dimensions, objectifs possibles.
    // Montagne/Sprint/Pavés viennent des vraies données (CALENDAR_META quand elle existe) ; Vallonné/Plat/CLM
    // sont dérivés de ces mêmes valeurs (pas de nouveau système de données parallèle).
    function fullTerrainProfile(race) {
      const p = terrainProfileFor(race);
      const clmEstimate = race.specKey === "clm" ? 75 : race.isStageRace && race.raceTier === "WT" ? 20 : 0;
      const plat = clamp(100 - p.mountains - p.cobbles * 0.4 - clmEstimate * 0.3);
      const vallonne = clamp(100 - Math.abs(p.mountains - 45) * 1.5);
      return { montagne: p.mountains, vallonne, plat, sprint: p.sprint, clm: clmEstimate, paves: p.cobbles };
    }
    const PROFILE_DIMS = [
      { key: "montagne", icon: "🏔️", label: "Montagne" },
      { key: "vallonne", icon: "⛰️", label: "Vallonné" },
      { key: "plat", icon: "🚴", label: "Plat" },
      { key: "sprint", icon: "💨", label: "Sprint" },
      { key: "clm", icon: "⏱️", label: "CLM" },
      { key: "paves", icon: "🪨", label: "Pavés" },
    ];
    const FitLine = ({ race }) => {
      const profile = fullTerrainProfile(race);
      const stars = enjeuStars(race);
      return (
        <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 4, marginBottom: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>{estimateDuration(race)} · {race.isStageRace ? "Course à étapes" : "Course d'un jour"}</span>
            <span title="Enjeu">{"⭐".repeat(stars)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px", marginBottom: 6 }}>
            {PROFILE_DIMS.map((d) => (
              <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 16 }}>{d.icon}</span>
                <div style={{ flex: 1, height: 5, background: T.line, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(profile[d.key] / 10) * 10}%`, height: "100%", background: T.accent }} />
                </div>
                <span style={{ width: 20, textAlign: "right", opacity: 0.7 }}>{Math.round(profile[d.key] / 10)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 4 }}>
            {possibleObjectives(race).map((o) => (
              <span key={o} style={{ fontSize: 10, border: `1px solid ${T.line}`, borderRadius: 4, padding: "1px 5px", marginRight: 4 }}>{o}</span>
            ))}
          </div>
          <div style={{ fontStyle: "italic" }}>{fitCommentary(player, race)}</div>
        </div>
      );
    };

    return (
      <div style={{ background: T.bg, minHeight: 620, color: T.ink, fontFamily: "Inter, sans-serif", padding: 20, borderRadius: 12 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 3, color: T.accent, textTransform: "uppercase", marginBottom: 4 }}>Réunion de début de saison</div>
        {restoredNotice && (
          <div style={{ background: "rgba(63,143,109,0.15)", border: `1px solid ${T.accent2}`, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: T.accent2, marginBottom: 12 }}>
            ✅ Progression restaurée — ta carrière a repris là où tu l'avais laissée. (Si tu étais en pleine course au moment de fermer, il faut simplement refaire le calendrier de cette saison.)
          </div>
        )}
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 24, margin: "0 0 4px 0" }}>Calendrier de la saison {player.seasonNumber}</h1>
        <p style={{ color: T.inkMuted, fontSize: 13, marginBottom: 14 }}>
          {player.name} · {SPECIALTIES.find((s) => s.id === player.specialtyPrimary)?.label} · {player.team?.name} ({player.team?.level})
        </p>

        <Card style={{ marginBottom: 16, borderColor: T.accent }}>
          <div style={{ fontSize: 11, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{player.team?.director} — Directeur sportif</div>
          <p style={{ margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>« {DS_ADVICE[player.specialtyPrimary]} »</p>
          {player.team && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}`, fontSize: 12, color: T.inkMuted }}>
              Équipe {TEAM_PHILOSOPHIES[player.team.philosophy]?.label.toLowerCase()} — {TEAM_PHILOSOPHIES[player.team.philosophy]?.desc}
              {game.teamSeasonGoal && <> Objectif de la saison : <b style={{ color: T.ink }}>{game.teamSeasonGoal} points UCI</b> pour l'équipe.</>}
            </div>
          )}
          {player.team?.level !== TEAM_LEVELS.WT && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}`, fontSize: 12, color: T.inkMuted }}>
              {teamTierAllowsRace(player, "WT")
                ? "Ta réputation te vaut quelques invitations sur le calendrier WorldTour cette saison."
                : `En ${player.team.level}, ton calendrier reste principalement ProSeries et Europe Tour — une meilleure réputation dans le peloton t'ouvrira les portes du WorldTour.`}
            </div>
          )}
          {(() => { const style = SkillEngine.getCareerStyle(game); return style ? (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}`, fontSize: 12, color: T.inkMuted }}>
              On commence à te surnommer <span style={{ color: T.accent, fontWeight: 700 }}>{style.label}</span> dans le peloton — {style.desc.toLowerCase()}
            </div>
          ) : null; })()}
          {SkillEngine.hasUnlockedEvent(player, "leader_request") && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 6 }}>Ton statut dans l'équipe cette saison : <b style={{ color: T.ink }}>{player.role === "leader" ? "Leader" : "Équipier"}</b></div>
              <ChoiceButton primary={player.role === "leader"} onClick={() => setGame((g) => ({ ...g, player: { ...g.player, role: g.player.role === "leader" ? "équipier" : "leader" } }))}>
                {player.role === "leader" ? "Rester leader de l'équipe" : "Demander le statut de leader"}
              </ChoiceButton>
            </div>
          )}
        </Card>

        {(player.stats.fatigueChronique >= 32) && (
          <Card style={{ marginBottom: 16, borderColor: T.danger }}>
            <div style={{ fontSize: 13, color: T.danger, fontWeight: 700, marginBottom: 4 }}>
              {isOvertrained(player) ? "⚠️ Signes de surentraînement" : "⚠️ Fatigue chronique élevée"}
            </div>
            <div style={{ fontSize: 12, color: T.inkMuted }}>
              Ta fatigue chronique est à {player.stats.fatigueChronique}%. Un calendrier trop chargé cette saison risque d'aggraver la situation
              et de coûter cher en performance. Envisage un programme plus léger (moins de classiques, pas d'ouverture de saison).
            </div>
          </Card>
        )}

        {game.pelotonNews && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, marginBottom: 6 }}>📰 Le peloton a bougé cet hiver</div>
            <div style={{ fontSize: 13, color: T.inkMuted, lineHeight: 1.6 }}>
              {game.pelotonNews.retirees.length} coureur{game.pelotonNews.retirees.length > 1 ? "s" : ""} prennent leur retraite,{" "}
              {game.pelotonNews.newcomers.length} jeune{game.pelotonNews.newcomers.length > 1 ? "s" : ""} talent{game.pelotonNews.newcomers.length > 1 ? "s" : ""} rejoignent le peloton professionnel,{" "}
              {game.pelotonNews.transfers.length} transfert{game.pelotonNews.transfers.length > 1 ? "s" : ""} {game.pelotonNews.transfers.length > 1 ? "ont" : "a"} eu lieu.
            </div>
            {game.pelotonNews.retiredRival && (
              <div style={{ fontSize: 13, color: T.accent, marginTop: 8 }}>
                ⚠️ {game.pelotonNews.retiredRival.name} raccroche le vélo — {rival.name} prend le relais comme rival principal.
              </div>
            )}
            <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 8, fontStyle: "italic" }}>Le détail est dans l'onglet 📰 News, une fois la saison lancée.</div>
          </Card>
        )}

        <Card style={{ marginBottom: 12, borderColor: T.accent }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 4 }}>
            🎯 Objectifs de la saison <span style={{ color: T.inkMuted, fontSize: 12 }}>— {planning.objectives.length}/5 sélectionnés</span>
          </div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 10 }}>Choisis ce qui compte vraiment pour toi cette saison — ton calendrier peut ensuite se construire librement autour.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {SEASON_OBJECTIVES.map((o) => (
              <ChoiceButton key={o.id} primary={planning.objectives.includes(o.id)} onClick={() => toggleObjective(o.id)}>{o.icon} {o.label}</ChoiceButton>
            ))}
          </div>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🏆 Grand Tour visé <span style={{ color: T.inkMuted, fontSize: 12 }}>(optionnel — une carrière sans Grand Tour est un choix normal)</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {grandTours.map((name) => (
              <ChoiceButton key={name} primary={planning.grandTour === name} onClick={() => setGrandTour(name)}>{name}</ChoiceButton>
            ))}
          </div>
          {planning.grandTour && (
            <>
              <FitLine race={{ name: planning.grandTour, isStageRace: true, raceTier: "WT" }} />
              <div style={{ fontSize: 11, color: T.inkMuted, marginTop: -4, marginBottom: 10, fontStyle: "italic" }}>Clique à nouveau sur ta sélection pour y renoncer.</div>
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
                <ChoiceButton primary={planning.altitudeCamp} onClick={() => setPlanning((p) => ({ ...p, altitudeCamp: !p.altitudeCamp }))}>
                  🏔️ Stage en altitude avant le {planning.grandTour} {planning.altitudeCamp ? "✅" : ""}
                </ChoiceButton>
                <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 4 }}>
                  Coût : 8 000 € et un peu de fatigue accumulée. En échange, un vrai coup de boost pour les étapes de montagne de ce Grand Tour précis —
                  sans effet si l'édition tirée au sort est plutôt taillée pour le contre-la-montre ou le sprint.
                  {player.money < 8000 && <span style={{ color: T.danger }}> Fonds insuffisants ({player.money.toLocaleString("fr-FR")} € disponibles).</span>}
                </div>
              </div>
            </>
          )}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🌞 Ouverture de saison (janvier-février)</div>
          {earlyPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS préfère te ménager en tout début de saison — rien de prévu ici cette année.</div>}
          {earlyPool.map((race) => (
            <div key={race.id}>
              <ChoiceButton primary={planning.early?.id === race.id} onClick={() => toggleEarly(race)}>{race.name} <TierTag tier={race.raceTier} /> <span style={{ opacity: 0.7, fontSize: 12 }}>({race.month})</span></ChoiceButton>
              <FitLine race={race} />
            </div>
          ))}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>
            🚵 Classiques & courses d'un jour (février-avril) <span style={{ color: T.inkMuted, fontSize: 12 }}>— {planning.classics.length}/{MAX_CLASSICS} sélectionnées</span>
          </div>
          {classicsPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS ne te positionnera pas ici cette saison — pas ton terrain de jeu.</div>}
          {classicsPool.map((race) => {
            const selected = planning.classics.some((r) => r.id === race.id);
            const disabled = !selected && planning.classics.length >= MAX_CLASSICS;
            return (
              <div key={race.id}>
                <ChoiceButton primary={selected} onClick={() => !disabled && toggleClassic(race)}>
                  <span style={{ opacity: disabled ? 0.4 : 1 }}>{race.name} <TierTag tier={race.raceTier} /> <span style={{ opacity: 0.7, fontSize: 12 }}>({race.month})</span></span>
                </ChoiceButton>
                <FitLine race={race} />
              </div>
            );
          })}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>⛰️ Préparation estivale (juin)</div>
          {prepPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS ne prévoit rien ici pour toi cette saison.</div>}
          {prepPool.map((race) => (
            <div key={race.id}>
              <ChoiceButton primary={planning.prep?.id === race.id} onClick={() => togglePrep(race)}>{race.name} <TierTag tier={race.raceTier} /></ChoiceButton>
              <FitLine race={race} />
            </div>
          ))}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🍂 Classiques d'automne (octobre)</div>
          {autumnPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS ne prévoit rien ici pour toi cette saison.</div>}
          {autumnPool.map((race) => (
            <div key={race.id}>
              <ChoiceButton primary={planning.autumn?.id === race.id} onClick={() => toggleAutumn(race)}>{race.name} <TierTag tier={race.raceTier} /></ChoiceButton>
              <FitLine race={race} />
            </div>
          ))}
        </Card>

        <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 14 }}>
          Le Championnat national (toujours disputé), les Championnats du Monde (si ta réputation le permet) et Il Lombardia (si ton profil s'y prête)
          seront ajoutés automatiquement à ton calendrier.
        </div>

        <ChoiceButton primary={true} onClick={() => confirmPlanning()}>
          ✅ Valider le calendrier{!planning.grandTour ? " (sans Grand Tour)" : ""}
        </ChoiceButton>
      </div>
    );
  }

  /* ---------------- END ---------------- */
  if (screen === "end") {
    const careerEndedEarly = player.flags?.careerEndingInjury;
    const statusText = careerEndedEarly ? "Carrière interrompue avant la signature pro" : "Retraité(e)";
    const score = computeCareerScore(player);
    return (
      <div style={{ background: T.bg, minHeight: 520, color: T.ink, fontFamily: "Inter, sans-serif", padding: 24, borderRadius: 12 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 3, color: T.accent, textTransform: "uppercase" }}>Fin de carrière</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 30, margin: "4px 0 2px 0" }}>{player.name}</h1>
        <div style={{ color: T.inkMuted, marginBottom: 16 }}>{player.nation.flag} {player.nation.label} · {player.age} ans · {statusText}</div>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, color: T.accent }}>{verdictFor(player)}</div>
            {score !== null && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 28, color: T.accent, lineHeight: 1 }}>{careerGrade(score)}</div>
                <div style={{ fontSize: 10, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>{score}/100</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, color: T.inkMuted }}>Réputation peloton : {player.reputation.peloton}/100 · Éthique : {player.stats.ethique}/100 · Gains : {(player.money || 0).toLocaleString("fr-FR")} €</div>
        </Card>

        {player.teamsHistory && player.teamsHistory.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Users size={16} color={T.accent} /> Équipes</div>
            {player.teamsHistory.map((t, i) => (
              <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between" }}>
                <span>{t.name} <span style={{ color: T.inkMuted, fontSize: 11 }}>({t.level})</span></span>
                <span style={{ color: T.inkMuted }}>{t.fromAge} — {t.toAge || player.age} ans</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Trophy size={16} color={T.accent} /> Palmarès</div>
          {player.palmares.length === 0 && <div style={{ color: T.inkMuted, fontSize: 13 }}>Aucune victoire ni podium majeur — une carrière de travailleur de l'ombre.</div>}
          {player.palmares.map((p, i) => (
            <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between" }}>
              <span>{p.label}</span><span style={{ color: T.inkMuted }}>{p.age} ans</span>
            </div>
          ))}
        </div>

        {!careerEndedEarly && (
          <div style={{ marginBottom: 16 }}>
            {!epilogueChoice ? (
              <Card>
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🎤 Et après le vélo ?</div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 10 }}>Ta carrière de coureur s'achève ici — mais pas forcément ton histoire dans le cyclisme.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <ChoiceButton onClick={() => setEpilogueChoice("ds")}>🚗 Devenir directeur sportif</ChoiceButton>
                  <ChoiceButton onClick={() => setEpilogueChoice("tv")}>🎙️ Devenir consultant TV</ChoiceButton>
                  <ChoiceButton onClick={() => setEpilogueChoice("scout")}>🔎 Devenir découvreur de jeunes talents</ChoiceButton>
                  <ChoiceButton onClick={() => setEpilogueChoice("none")}>Tourner la page du cyclisme</ChoiceButton>
                </div>
              </Card>
            ) : (
              <Card style={{ borderColor: T.accent }}>
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🎤 Et après le vélo ?</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                  {epilogueChoice === "none" ? "Tu tournes définitivement la page du cyclisme professionnel, pour te consacrer à autre chose. Ta carrière restera, elle, gravée dans les livres." : generateEpilogue(player, epilogueChoice, getRival(game))}
                </p>
              </Card>
            )}
          </div>
        )}

        <ChoiceButton primary onClick={() => { clearSavedGame(); setForm({ name: "", nation: null, origin: null, specialtyPrimary: null, lifestyle: null }); setStep(0); setGame(null); setEpilogueChoice(null); setScreen("intro"); }}>
          <RotateCcw size={14} style={{ display: "inline", marginRight: 6 }} /> Recommencer une carrière
        </ChoiceButton>
      </div>
    );
  }

  /* ---------------- RECAP ---------------- */
  if (showRecap) {
    const canRetire = player.age >= 30 && player.phase === "pro";
    return (
      <div style={{ background: T.bg, minHeight: 520, color: T.ink, fontFamily: "Inter, sans-serif", padding: 24, borderRadius: 12 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 3, color: T.accent, textTransform: "uppercase" }}>Bilan</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 24, margin: "4px 0 16px 0" }}>
          {player.phase === "pro" ? `Saison ${player.seasonNumber}` : player.phase === "passage_pro" ? "Passage professionnel" : `Formation — ${player.age} ans`}
        </h1>
        {seasonLog.map((l, i) => (<div key={i} style={{ fontSize: 13, color: T.inkMuted, padding: "6px 0", borderBottom: `1px solid ${T.line}` }}>{l}</div>))}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Bar label="Forme" value={player.stats.forme} color={T.accent2} />
          <Bar label="Fatigue" value={player.stats.fatigue} color={T.danger} />
          <Bar label="Réputation peloton" value={player.reputation.peloton} color={T.accent} />
          <Bar label="Relation équipe" value={player.stats.relationEquipe} color={T.info} />
        </div>
        {player.retired ? (
          <ChoiceButton primary onClick={() => setScreen("end")}>Voir le bilan de carrière</ChoiceButton>
        ) : (
          <>
            <ChoiceButton primary onClick={continueAfterRecap}>Saison suivante</ChoiceButton>
            {canRetire && <ChoiceButton onClick={retireNow}>Prendre sa retraite maintenant</ChoiceButton>}
          </>
        )}
      </div>
    );
  }

  /* ---------------- CÉLÉBRATION DE DÉBLOCAGE ---------------- */
  if (unlockCelebration) {
    const skill = unlockCelebration.skill;
    const treeIcon = skill.category === "talent" ? "🏅" : skill.category === "philosophie" ? "⚖️" : skill.category === "specialisation" ? "⭐" : skill.category === "transversal" ? "🌍" : SKILL_TREE_CONFIG.trees[skill.treeId]?.icon || "🔓";
    const describeEffect = (e) => {
      switch (e.type) {
        case "specialtyBonus": return `+${e.value} en ${e.key === "montagne" ? "montagne" : e.key === "sprint" ? "sprint" : e.key === "clm" ? "contre-la-montre" : "pavés"}`;
        case "allSpecialtyBonus": return `+${e.value} sur toutes tes qualités physiques`;
        case "fatigueResist": return "Réduit la fatigue accumulée en course";
        case "formeRecovery": return "Améliore ta récupération";
        case "craquageResist": return "Réduit le risque de craquer dans les moments décisifs";
        case "finalStageBonus": return "Bonus de performance à l'arrivée des courses";
        case "noiseReduction": return "Rend tes résultats plus réguliers";
        case "reputationDimBonus": return `Renforce ta réputation (${e.dim})`;
        case "moneyBonus": return "Améliore tes revenus";
        case "teammatesBonus": return "Renforce durablement l'efficacité de tes équipiers";
        case "relationEquipeBonus": return "Modifie ta relation avec l'équipe";
        case "ethiqueShield": return "Amortit les dégâts de réputation en cas de scandale";
        case "contextBonus": return "Bonus de performance dans un contexte de course précis";
        case "unlockChoice": return "Débloque une nouvelle décision pendant la course";
        case "unlockEvent": return "Débloque un nouvel événement de carrière";
        case "talentCharge": return `Débloque une capacité à charge limitée (${e.scope === "race" ? "1 fois par course" : "1 fois par saison"})`;
        default: return null;
      }
    };
    const effectLines = (skill.effects || []).map(describeEffect).filter(Boolean);
    return (
      <div style={{ background: T.bg, minHeight: 620, color: T.ink, fontFamily: "Inter, sans-serif", padding: 20, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: 3, color: T.accent, textTransform: "uppercase", marginBottom: 10 }}>Nouvelle compétence débloquée</div>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{treeIcon}</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 30, margin: "0 0 14px 0" }}>{skill.label}</h1>
        <p style={{ color: T.inkMuted, maxWidth: 440, lineHeight: 1.6, marginBottom: 20, fontStyle: "italic" }}>{SkillEngine.getUnlockNarrative(skill)}</p>
        {effectLines.length > 0 && (
          <Card style={{ maxWidth: 420, width: "100%", marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Effets</div>
            {effectLines.map((line, i) => (<div key={i} style={{ fontSize: 13, padding: "4px 0" }}>• {line}</div>))}
          </Card>
        )}
        <div style={{ width: "100%", maxWidth: 320 }}>
          <ChoiceButton primary onClick={() => setUnlockCelebration(null)}>Continuer</ChoiceButton>
        </div>
      </div>
    );
  }

  /* ---------------- PLAY ---------------- */
  return (
    <div style={{ background: T.bg, minHeight: 620, color: T.ink, fontFamily: "Inter, sans-serif", padding: 20, borderRadius: 12 }}>
      <style>{FONT_IMPORT}</style>

      {/* STATUS BAR */}
      <div style={{ display: "grid", gridTemplateColumns: player.phase === "pro" ? "repeat(4, 1fr)" : "1fr", gap: 10, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>Coureur</div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, margin: "2px 0" }}>{player.name} ({player.age} ans)</div>
              <div style={{ fontSize: 12, color: T.accent }}>{player.team ? `${player.team.name} (${player.team.level})` : "Espoir / Junior"}</div>
              {player.phase === "pro" && <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>Titre : <b style={{ color: T.ink }}>{SkillEngine.computeTitle(player)}</b></div>}
            </div>
            {player.phase === "pro" && (() => { const rating = computeCurrentRating(player); return (
              <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 8 }} title="Niveau actuel du coureur (physique + forme + réputation + résultats récents)">
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 24, color: T.accent, lineHeight: 1 }}>{rating}</div>
                <div style={{ fontSize: 9, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, maxWidth: 70 }}>{ratingTier(rating)}</div>
              </div>
            ); })()}
          </div>
        </Card>
        {player.phase === "pro" && (
          <>
            <Card>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>Gestion de saison</div>
              <div style={{ fontSize: 13, margin: "4px 0" }}>Fraîcheur : <span style={{ color: T.accent2 }}>{computeFraicheur(player)}%</span></div>
              <div style={{ fontSize: 13, color: T.danger }}>Fatigue récente : {player.stats.fatigue}%</div>
              <div style={{ fontSize: 13, color: isOvertrained(player) ? T.danger : T.inkMuted }}>
                Fatigue chronique : {player.stats.fatigueChronique}% {isOvertrained(player) && "⚠️ surentraînement"}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>Rival principal</div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, margin: "2px 0" }}>{flagFor(rival?.nation)} {rival?.name}</div>
              <div style={{ fontSize: 12 }}>Haine : {rival?.haine}% · Respect : {rival?.respect}%</div>
            </Card>
            <Card>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>Compte bancaire</div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, color: T.accent }}>{(player.money || 0).toLocaleString("fr-FR")} €</div>
            </Card>
          </>
        )}
      </div>

      {/* TABS */}
      {player.phase === "pro" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <TabButton active={view === "story"} onClick={() => setView("story")}>📖 Histoire</TabButton>
          <TabButton active={view === "team"} onClick={() => setView("team")}>🏢 Équipe</TabButton>
          <TabButton active={view === "skills"} onClick={() => setView("skills")}>🌳 Compétences</TabButton>
          <TabButton active={view === "teammates"} onClick={() => setView("teammates")}>👥 Équipiers</TabButton>
          <TabButton active={view === "peloton"} onClick={() => setView("peloton")}>🚴 Peloton</TabButton>
          <TabButton active={view === "news"} onClick={() => setView("news")}>📰 News</TabButton>
          <TabButton active={view === "uci"} onClick={() => setView("uci")}>🏆 Classement UCI</TabButton>
          <TabButton active={view === "palmares"} onClick={() => setView("palmares")}>🏛️ Palmarès</TabButton>
          <TabButton active={view === "history"} onClick={() => setView("history")}>📜 Journal</TabButton>
        </div>
      )}

      {/* SKILLS VIEW */}
      {view === "skills" && player.phase === "pro" && (() => {
        const careerStyle = SkillEngine.getCareerStyle(game);
        const SUB_TABS = [
          { id: "physique", label: "💪 Physique" },
          { id: "mental", label: "🧠 Mental" },
          { id: "tactique", label: "🧭 Tactique" },
          { id: "carriere", label: "📣 Carrière" },
          { id: "specialisation", label: `⭐ ${SPECIALTIES.find((s) => s.id === player.specialtyPrimary)?.label || "Spécialisation"}` },
          { id: "talents", label: "🏅 Talents" },
          { id: "philosophies", label: "⚖️ Philosophies" },
        ];
        let list = [];
        let listDesc = "";
        let treeIdForMastery = null;
        if (skillSubTab === "specialisation") { list = SKILL_TREE_CONFIG.specialisation[player.specialtyPrimary] || []; listDesc = "Propre à ton profil de départ — inaccessible aux autres spécialités."; treeIdForMastery = player.specialtyPrimary; }
        else if (skillSubTab === "talents") { list = [...SKILL_TREE_CONFIG.talents, ...SKILL_TREE_CONFIG.transversal]; listDesc = "Pas de simple bonus de stat : un vrai effet de gameplay, limité ou contextuel."; }
        else if (skillSubTab === "philosophies") { list = SKILL_TREE_CONFIG.philosophies; listDesc = "Embranchements exclusifs : débloquer l'un ferme définitivement l'autre de la même paire."; }
        else { list = SKILL_TREE_CONFIG.trees[skillSubTab]?.skills || []; listDesc = SKILL_TREE_CONFIG.trees[skillSubTab]?.desc || ""; treeIdForMastery = skillSubTab; }

        const mastery = treeIdForMastery ? SkillEngine.getMasteryLevel(player, treeIdForMastery) : null;
        // Regroupement visuel par palier : les compétences avancées (tier 2) au-dessus, reliées
        // visuellement aux compétences de base (tier 1) — une vraie hiérarchie plutôt qu'une liste plate.
        const tier2 = list.filter((s) => s.tier === 2);
        const tier1 = list.filter((s) => s.tier !== 2);

        const SkillNode = (skill) => {
          const unlocked = SkillEngine.hasSkill(player, skill.id);
          const exclusiveLocked = !unlocked && SkillEngine.isExclusiveLocked(player, skill.id);
          const progress = SkillEngine.baseSkillsProgress(player, skill);
          const tierLocked = !unlocked && progress && !progress.met;
          const locked = exclusiveLocked || tierLocked;
          const affordable = player.skillPoints >= skill.cost;
          return (
            <div key={skill.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", marginBottom: 8, borderRadius: 8,
              background: unlocked ? "rgba(63,143,109,0.12)" : T.panelAlt, border: `1px solid ${unlocked ? T.accent2 : T.line}`, opacity: locked ? 0.45 : 1,
            }}>
              <div>
                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  {unlocked && <span style={{ color: T.accent2 }}>✓</span>}
                  {skill.label}
                  {skill.unique && <span style={{ fontSize: 9, color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 4, padding: "1px 5px", textTransform: "uppercase" }}>Unique</span>}
                </div>
                <div style={{ fontSize: 12, color: T.inkMuted }}>{skill.desc}</div>
                {exclusiveLocked && <div style={{ fontSize: 11, color: T.danger, marginTop: 2 }}>Verrouillée par un autre choix exclusif</div>}
                {tierLocked && <div style={{ fontSize: 11, color: T.danger, marginTop: 2 }}>Débloque d'abord plus de la moitié des compétences de base ({progress.unlockedCount}/{progress.total})</div>}
              </div>
              <button onClick={() => unlockSkill(skill.id)} disabled={unlocked || locked || !affordable}
                style={{ background: unlocked ? T.accent2 : T.accent, color: unlocked ? "#fff" : "#171614", border: "none", padding: "8px 14px", borderRadius: 6, cursor: unlocked || locked ? "default" : "pointer", fontWeight: 600, fontSize: 12, opacity: (!unlocked && (!affordable || locked)) ? 0.5 : 1, whiteSpace: "nowrap", marginLeft: 12 }}>
                {unlocked ? "Débloqué" : `Débloquer (${skill.cost} pt)`}
              </button>
            </div>
          );
        };

        return (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18 }}>Progression</div>
                <div style={{ fontSize: 13, color: T.inkMuted }}>Points disponibles : <span style={{ color: T.accent, fontWeight: 700 }}>{player.skillPoints}</span></div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {mastery && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Maîtrise</div>
                    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, color: T.accent2 }}>{mastery.label}</div>
                    <div style={{ fontSize: 10, color: T.inkMuted }}>{mastery.unlockedCount}/{mastery.total} débloquées</div>
                  </div>
                )}
                {careerStyle && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Style de carrière</div>
                    <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, color: T.accent }}>{careerStyle.label}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {SUB_TABS.map((t) => (
                <button key={t.id} onClick={() => setSkillSubTab(t.id)}
                  style={{ background: skillSubTab === t.id ? T.accent : T.panelAlt, color: skillSubTab === t.id ? "#171614" : T.ink, border: `1px solid ${skillSubTab === t.id ? T.accent : T.line}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>
            {listDesc && <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 12, fontStyle: "italic" }}>{listDesc}</div>}

            {tier2.length > 0 && (
              <>
                <div style={{ fontSize: 10, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>▲ Compétences avancées</div>
                {tier2.map(SkillNode)}
                <div style={{ textAlign: "center", color: T.line, fontSize: 18, margin: "2px 0 10px 0" }}>│</div>
              </>
            )}
            <div style={{ fontSize: 10, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, textAlign: "center" }}>Compétences de base</div>
            {tier1.map(SkillNode)}
          </Card>
        );
      })()}

      {/* TEAM VIEW */}
      {view === "team" && player.phase === "pro" && player.team && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, marginBottom: 2 }}>{player.team.name}</div>
          <div style={{ fontSize: 12, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>{player.team.level} · {player.team.country}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Sponsor titre</div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>{player.team.sponsor}</div>
              <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Directeur sportif</div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>{player.team.director}</div>
              <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Budget annuel</div>
              <div style={{ fontSize: 14 }}>{player.team.budget.toLocaleString("fr-FR")} €</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Objectif de la saison</div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>{player.team.objective}</div>
              <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Taille de l'effectif</div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>{player.team.roster} coureurs</div>
              <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Leader actuel du peloton</div>
              <div style={{ fontSize: 14 }}>{(() => { const l = teamLeader(game, player.team); return l ? `${flagFor(l.nation)} ${l.name} (niv. ${l.level})` : "Aucune figure de proue identifiée"; })()}</div>
            </div>
          </div>
          <Bar label="Réputation de l'équipe" value={player.team.reputation} color={T.purple} />
          <Bar label="Qualité d'entraînement" value={player.team.trainingQuality} color={T.accent2} />
          <Bar label="Qualité du matériel" value={player.team.equipmentQuality} color={T.info} />
          <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 10 }}>
            La qualité d'entraînement influence ta récupération en début de saison ; la qualité du matériel donne un léger bonus (ou malus) direct à tes performances en course.
          </div>
        </Card>
      )}

      {/* TEAMMATES VIEW */}
      {view === "teammates" && player.phase === "pro" && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Users size={16} color={T.accent} /> Tes équipiers clés</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {teammates?.map((tm, idx) => (
              <div key={idx} style={{ background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{tm.name}</div>
                <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 8 }}>{tm.role} ({tm.spec})</div>
                <Bar label="Fidélité" value={tm.loyaute} color={T.info} />
                <Bar label="Moral" value={tm.moral} color={T.accent} />
              </div>
            ))}
          </div>
          {sponsor && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, marginBottom: 6 }}>Objectif sponsor — {sponsor.name}</div>
              <div style={{ fontSize: 13, color: T.inkMuted }}>{sponsor.objective} · {sponsor.reward}</div>
              <div style={{ fontSize: 13, color: sponsor.fulfilled ? T.accent2 : T.inkMuted, marginTop: 4 }}>{sponsor.fulfilled ? "✅ Rempli" : "⏳ En cours"}</div>
            </div>
          )}
        </Card>
      )}

      {/* PELOTON VIEW */}
      {view === "peloton" && player.phase === "pro" && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 4 }}>Le peloton international</div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 12 }}>
            {(game.peloton || []).length} coureurs suivis · vieillissent, progressent, régressent, changent d'équipe et prennent leur retraite chaque saison.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...(game.peloton || [])].sort((a, b) => b.level - a.level).slice(0, 15).map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 8, padding: "8px 12px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{flagFor(r.nation)} {r.name} {r.id === rival?.id ? "⚔️" : ""}</div>
                  <div style={{ fontSize: 11, color: T.inkMuted }}>{r.spec} · {r.age} ans · {r.team?.name} ({r.team?.level})</div>
                </div>
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, color: T.accent }}>{r.level}</div>
              </div>
            ))}
          </div>
          {game.pelotonNews && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}`, fontSize: 12, color: T.inkMuted }}>
              Dernière intersaison : {game.pelotonNews.retirees.length} retraites, {game.pelotonNews.newcomers.length} arrivées, {game.pelotonNews.transfers.length} transferts.
            </div>
          )}
        </Card>
      )}

      {/* UCI RANKING VIEW */}
      {view === "uci" && player.phase === "pro" && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 4 }}>Classement UCI — saison {player.seasonNumber}</div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 12 }}>
            Points remis à zéro chaque saison. 1er : 100 pts · 2e : 70 · 3e : 50 · ... · 10e : 10 (pondérés par le prestige de la course).
          </div>
          {(() => {
            const standings = [...(game.peloton || []).map((r) => ({ ...r, isPlayer: false })), { id: "player", name: player.name, nation: player.nation?.code, team: player.team, spec: player.specialtyPrimary, points: player.uciPoints || 0, isPlayer: true }]
              .sort((a, b) => (b.points || 0) - (a.points || 0));
            const playerRank = standings.findIndex((s) => s.isPlayer) + 1;
            const top15 = standings.slice(0, 15);
            return (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {top15.map((s, i) => (
                    <div key={s.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 8, padding: "8px 12px",
                      background: s.isPlayer ? "rgba(244,196,48,0.15)" : T.panelAlt,
                      border: s.isPlayer ? `1px solid ${T.accent}` : `1px solid ${T.line}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, color: T.inkMuted, width: 22 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: s.isPlayer ? T.accent : T.ink }}>
                            {flagFor(s.nation)} {s.name}{s.isPlayer ? " (toi)" : ""}{s.id === rival?.id ? " ⚔️" : ""}
                          </div>
                          <div style={{ fontSize: 11, color: T.inkMuted }}>{s.spec} · {s.team?.name || "—"}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, color: T.accent }}>{s.points || 0} pts</div>
                    </div>
                  ))}
                </div>
                {playerRank > 15 && (
                  <div style={{ marginTop: 10, padding: "8px 12px", fontSize: 13, color: T.inkMuted, fontStyle: "italic", borderTop: `1px solid ${T.line}` }}>
                    … tu es {ordinal(playerRank)} avec {player.uciPoints || 0} points sur {standings.length} coureurs classés.
                  </div>
                )}
              </>
            );
          })()}
        </Card>
      )}

      {/* PALMARÈS / WORLD HISTORY VIEW */}
      {view === "palmares" && player.phase === "pro" && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 4 }}>Palmarès du monde</div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 14 }}>
            Les vainqueurs des grandes courses (Monuments, Grands Tours, Mondiaux), année par année — que tu y aies participé ou non.
          </div>
          {(!game.worldHistory || Object.keys(game.worldHistory).length === 0) && (
            <div style={{ fontSize: 13, color: T.inkMuted, padding: "16px 0" }}>L'histoire commence tout juste — reviens après ta première saison complète.</div>
          )}
          {Object.entries(game.worldHistory || {}).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, results]) => (
            <div key={year} style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, color: T.accent, marginBottom: 6, borderBottom: `1px solid ${T.line}`, paddingBottom: 4 }}>{year}</div>
              {Object.entries(results).map(([raceName, winner]) => (
                <div key={raceName} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                  <span style={{ color: T.inkMuted }}>{raceName}</span>
                  <span style={{ fontWeight: 700, color: winner.id === "player" ? T.accent : winner.id === rival?.id ? T.info : T.ink }}>
                    {winner.id === "player" ? "Toi" : `${flagFor(winner.nation)} ${winner.name}`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}

      {/* NEWS VIEW */}
      {view === "news" && player.phase === "pro" && (
        <Card>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4, borderBottom: `2px solid ${T.accent}`, paddingBottom: 8 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, letterSpacing: 2, textTransform: "uppercase" }}>Cycling News</div>
            <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Saison {player.seasonNumber}</div>
          </div>
          {(!game.news || game.news.length === 0) && (
            <div style={{ fontSize: 13, color: T.inkMuted, padding: "16px 0" }}>Rien à signaler pour l'instant — reviens après ta prochaine intersaison.</div>
          )}
          {(game.news || []).map((headline, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${T.line}`, fontSize: 14, lineHeight: 1.5 }}>
              {headline}
            </div>
          ))}
        </Card>
      )}

      {/* HISTORY VIEW */}
      {view === "history" && player.phase === "pro" && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 12 }}>Journal de carrière</div>
          {player.history.map((h, i) => (<div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${T.line}` }}>{h}</div>))}
        </Card>
      )}

      {/* STORY VIEW */}
      {(view === "story" || player.phase !== "pro") && current && (
        <Card>
          {current.type === "event" && (
            <>
              <div style={{ fontSize: 11, letterSpacing: 1, color: T.accent, textTransform: "uppercase", marginBottom: 10 }}>{BLOCK_LABEL[current.data.block]}</div>
              {!pendingResult ? (
                <>
                  <p style={{ margin: "0 0 16px 0", lineHeight: 1.5 }}>{current.data.text}</p>
                  {(typeof current.data.choices === "function" ? current.data.choices(game) : current.data.choices).map((c, i) => (<ChoiceButton key={i} onClick={() => handleEventChoice(c)}>{c.label}</ChoiceButton>))}
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 16px 0", lineHeight: 1.5, color: T.accent2 }}>{pendingResult.text}</p>
                  <ChoiceButton primary onClick={goToNextQueueItem}>Continuer</ChoiceButton>
                </>
              )}
            </>
          )}

          {current.type === "race" && (
            <>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {current.data.name}
                {current.data.weather && <span style={{ fontSize: 11, color: T.inkMuted, border: `1px solid ${T.line}`, borderRadius: 4, padding: "2px 6px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{current.data.weather}</span>}
                {game.raceState && (
                  <span style={{ fontSize: 11, color: game.raceState.group === RACE_GROUPS.FRONT ? T.accent : game.raceState.group === RACE_GROUPS.DROPPED ? T.danger : T.info, border: `1px solid currentColor`, borderRadius: 4, padding: "2px 6px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                    📍 {game.raceState.group} · ⚡ {game.raceState.energy}%
                  </span>
                )}
                {(() => {
                  const p = computePressure(game, current.data.name);
                  if (p < 55) return null;
                  return <span style={{ fontSize: 11, color: T.danger, border: `1px solid ${T.danger}`, borderRadius: 4, padding: "2px 6px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>🔥 Pression {pressureTier(p)}</span>;
                })()}
              </div>
              {!pendingResult ? (
                <>
                  <div style={{ fontSize: 12, color: T.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{current.data.stages[stageIndex].phase}</div>
                  <p style={{ margin: "0 0 16px 0", lineHeight: 1.5 }}>{typeof current.data.stages[stageIndex].text === "function" ? current.data.stages[stageIndex].text(game) : current.data.stages[stageIndex].text}</p>
                  {current.data.stages[stageIndex].choices.map((c, i) => (<ChoiceButton key={i} onClick={() => handleRaceChoice(c)}>{c.label}</ChoiceButton>))}
                  {stageIndex < current.data.stages.length - 1 && SkillEngine.getExtraTacticalChoices(game, current.data.role).map((c, i) => (
                    <ChoiceButton key={`skill-${i}`} onClick={() => handleRaceChoice(c)}>{c.label}</ChoiceButton>
                  ))}
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 16px 0", lineHeight: 1.5, color: T.accent2 }}>{pendingResult.text}</p>
                  {pendingResult.classification && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Classement (top 10)</div>
                      {pendingResult.classification.map((entry, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", padding: "5px 8px", borderRadius: 4, marginBottom: 2,
                          background: entry.isPlayer ? "rgba(244,196,48,0.15)" : "transparent",
                          border: entry.isPlayer ? `1px solid ${T.accent}` : "1px solid transparent",
                        }}>
                          <span style={{ fontSize: 13, fontWeight: entry.isPlayer ? 700 : 400, color: entry.isPlayer ? T.accent : T.ink }}>
                            {i + 1}. {flagFor(entry.nation)} {entry.name}{entry.isPlayer ? " (toi)" : ""}{entry.isRival ? " ⚔️" : ""}
                          </span>
                          <span style={{ fontSize: 12, color: T.inkMuted }}>{entry.team || ""}</span>
                        </div>
                      ))}
                      {pendingResult.playerPosition > 10 && (
                        <div style={{ marginTop: 8, padding: "6px 8px", fontSize: 13, color: T.inkMuted, fontStyle: "italic" }}>
                          … tu termines {ordinal(pendingResult.playerPosition)} sur {pendingResult.fieldSize} coureurs classés.
                        </div>
                      )}
                    </div>
                  )}
                  <ChoiceButton primary onClick={goToNextQueueItem}>Continuer</ChoiceButton>
                </>
              )}
              {raceLogs.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 12, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Déroulement</div>
                  {raceLogs.map((log, idx) => (<div key={idx} style={{ fontSize: 13, padding: "4px 0" }}>• {log}</div>))}
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
