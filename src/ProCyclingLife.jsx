import React, { useState, useEffect } from "react";
import { Trophy, Mountain, Zap, Wind, TrendingUp, Bike, RotateCcw, Users } from "lucide-react";

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
  { id: "rural", label: "Club amateur rural", desc: "Peu de moyens, peu de visibilité au départ — mais une vraie rage de vaincre." },
  { id: "academie", label: "Académie structurée", desc: "Encadrement pro dès le plus jeune âge : plus de visibilité, et un vrai coup de pouce technique sur ta spécialité." },
  { id: "autodidacte", label: "Autodidacte", desc: "Formé seul, sans filet. Tu as développé un style atypique, très marqué, mais avec quelques lacunes techniques." },
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
        { id: "phys_puncheur", label: "Puncheur", desc: "+8 en puncheur", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "puncheur", value: 8 }] },
        { id: "phys_endurance", label: "Endurance", desc: "Réduit la fatigue accumulée en course", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 4 }] },
        { id: "phys_recuperation", label: "Récupération", desc: "Régénère mieux la forme à chaque intersaison", cost: 1, tier: 1, effects: [{ type: "formeRecovery", value: 3 }] },
        { id: "phys_acceleration", label: "Accélération", desc: "Fort bonus de performance dans les 200 derniers mètres, uniquement à l'arrivée d'un sprint massif", cost: 2, tier: 2, effects: [{ type: "contextBonus", context: "sprint_stage", value: 9 }] },
        { id: "phys_resistance", label: "Résistance", desc: "Réduit encore la fatigue et protège la forme dans les courses très dures — et encaisse mieux les secousses des pavés", cost: 2, tier: 2, effects: [{ type: "fatigueResist", value: 3 }, { type: "formeRecovery", value: 2 }, { type: "contextBonus", context: "paves_stage", value: 7 }] },
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
        { id: "tact_placement", label: "Placement", desc: "Réduit la fatigue dans les moments de bataille pour la position — et réduit aussi ton risque de chute, en descente comme sur les pavés", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 3 }] },
        { id: "tact_lecture", label: "Lecture de course", desc: "Te fait repérer les brèches dans le peloton — une vraie occasion de contre-attaquer se présentera en course", cost: 2, tier: 1, effects: [{ type: "unlockChoice", key: "contre_attaquer" }] },
        { id: "tact_vision", label: "Vision", desc: "Te fait repérer les mouvements de ton rival avant les autres — une vraie occasion de le marquer se présentera en course", cost: 3, tier: 2, effects: [{ type: "unlockChoice", key: "suivre_rival" }] },
        { id: "tact_releve", label: "Relais", desc: "Savoir demander de l'aide, ça s'apprend aussi — l'occasion de solliciter un équipier au bon moment se présentera en course", cost: 1, tier: 1, effects: [{ type: "unlockChoice", key: "demander_relais" }] },
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
      { id: "spec_g_descendeur", label: "Descendeur", desc: "Talent unique : bonus de performance dans les étapes de montagne des grands tours, et réduit ton risque de chute en descente", cost: 1, tier: 1, unique: true, effects: [{ type: "contextBonus", context: "montagne_stage", value: 8 }] },
      { id: "spec_g_ascensions", label: "Longues ascensions", desc: "Gérer patiemment jusqu'à l'ascension finale plutôt qu'un simple bonus de stat — l'occasion de garder tes forces pour le dernier col se présentera en course", cost: 2, tier: 2, effects: [{ type: "unlockChoice", key: "attendre_dernier_col" }] },
      { id: "spec_g_cols", label: "Gestion des cols", desc: "Réduit encore la fatigue en montagne", cost: 2, tier: 2, effects: [{ type: "fatigueResist", value: 4 }] },
    ],
    sprinteur: [
      { id: "spec_s_lance", label: "Sprint lancé", desc: "+10 au sprint", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "sprint", value: 10 }] },
      { id: "spec_s_explosif", label: "Sprint explosif", desc: "Un pari risqué mais payant dans les derniers mètres, plutôt qu'un simple bonus de stat — l'occasion de tout jouer sur un coup se présentera en course", cost: 2, tier: 2, effects: [{ type: "unlockChoice", key: "tout_pour_le_tout" }] },
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
      { id: "spec_pu_explosivite", label: "Explosivité courte", desc: "+10 en puncheur (efforts courts et intenses)", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "puncheur", value: 10 }] },
      { id: "spec_pu_rythme", label: "Changement de rythme", desc: "+8 en puncheur supplémentaires", cost: 1, tier: 1, effects: [{ type: "specialtyBonus", key: "puncheur", value: 8 }] },
      { id: "spec_pu_finisseur", label: "Finisseur", desc: "Talent unique : bonus de performance à l'arrivée des classiques vallonnées et ardennaises", cost: 1, tier: 1, unique: true, effects: [{ type: "contextBonus", context: "puncheur_stage", value: 8 }] },
      { id: "spec_pu_bosses", label: "Répétition des efforts", desc: "Réduit spécifiquement la fatigue sur les parcours vallonnés — l'avantage d'un puncheur habitué à répéter les relances, pas un simple bonus général", cost: 2, tier: 2, effects: [{ type: "contextFatigueResist", context: "vallonnee", value: 6 }] },
      { id: "spec_pu_anticipation", label: "Attaque tardive", desc: "Une capacité propre au puncheur — l'occasion de placer une attaque décisive et explosive dans le dernier tiers de la course se présentera en course", cost: 2, tier: 2, effects: [{ type: "unlockChoice", key: "attaque_tardive" }] },
    ],
    polyvalent: [
      { id: "spec_p_equilibre", label: "Équilibre athlétique", desc: "+4 sur toutes tes qualités", cost: 1, tier: 1, effects: [{ type: "allSpecialtyBonus", value: 4 }] },
      { id: "spec_p_adaptabilite", label: "Adaptabilité", desc: "Réduit la fatigue quel que soit le terrain", cost: 1, tier: 1, effects: [{ type: "fatigueResist", value: 3 }] },
      { id: "spec_p_lecture", label: "Lecture multi-terrain", desc: "Te fait repérer les brèches dans le peloton — une vraie occasion de contre-attaquer se présentera en course", cost: 1, tier: 1, effects: [{ type: "unlockChoice", key: "contre_attaquer" }] },
      { id: "spec_p_capitaine", label: "Capitaine naturel", desc: "Renforce durablement le moral de tous tes équipiers", cost: 2, tier: 2, effects: [{ type: "teammatesBonus", value: 10 }] },
      { id: "spec_p_couteau", label: "Couteau suisse", desc: "+2 supplémentaires répartis sur toutes tes qualités", cost: 2, tier: 2, effects: [{ type: "allSpecialtyBonus", value: 2 }] },
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
    { id: "talent_reconversion", label: "Reconversion", desc: "Repars de zéro : récupère tous les points investis dans tes autres compétences pour reconstruire un profil radicalement différent. Possible plusieurs fois en carrière, mais de plus en plus coûteux — ton corps supporte de moins en moins les changements radicaux de préparation.", cost: 5, tier: 2,
      effects: [{ type: "respec" }] },
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
    { id: "cannibale", label: "Le Cannibale", desc: "Une faim de victoires insatiable.", check: (ctx) => ctx.palmares.filter((p) => p.resultType === "victoire" || p.resultType === "victoire_etape").length >= 6 },
    { id: "chasseur_gt", label: "Chasseur de Grands Tours", desc: "Vit pour les trois semaines de juillet, mai et août.", check: (ctx) => ctx.palmares.some((p) => p.isGrandTour) },
    { id: "roi_classiques", label: "Roi des Classiques", desc: "Les Monuments sont son terrain de chasse.", check: (ctx) => ctx.palmares.filter((p) => p.isMonument).length >= 2 },
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

// Antagonisme physiologique montagne <-> sprint — un pur sprinteur ne peut physiquement pas être aussi un
// pur grimpeur (masse musculaire, filière énergétique, poids de corps). Les transformations inverses
// existent dans la réalité du cyclisme (à la Jalabert), mais restent rares, progressives, jamais
// gratuites — d'où le talent de reconversion plus bas, qui permet justement ce genre de virage de carrière.
//
// Plutôt qu'une opposition unique et figée sprint/montagne, l'antagonisme est dérivé de traits
// physiologiques sous-jacents que chaque spécialité mobilise à des degrés différents — puissance vs
// légèreté, explosivité vs endurance longue. Deux spécialités aux profils de traits très opposés (comme
// montagne/sprint) s'opposent fortement ; deux profils proches (comme contre-la-montre/pavés, tous deux
// portés par la puissance brute) s'opposent à peine. Ça donne une matrice complète des 10 paires possibles
// entre les 5 spécialités, avec des intensités variées, plutôt qu'une seule règle plaquée sur toutes.
const SPECIALTY_TRAITS = {
  montagne: { puissance: 0.3, legerete: 0.9, explosivite: 0.2, endurance: 0.9 },
  sprint: { puissance: 0.9, legerete: 0.15, explosivite: 0.95, endurance: 0.2 },
  clm: { puissance: 0.85, legerete: 0.35, explosivite: 0.25, endurance: 0.75 },
  pave: { puissance: 0.75, legerete: 0.2, explosivite: 0.45, endurance: 0.6 },
  // Puncheur : ni pur grimpeur ni pur sprinteur, mais nettement plus proche du premier que du second —
  // explosivité marquée (contrairement au grimpeur pur) et bonne légèreté (contrairement au sprinteur
  // pur), pour une endurance longue plus modeste (les efforts sont courts et répétés, pas soutenus).
  // Ce positionnement donne exactement la hiérarchie de compatibilité voulue une fois les distances
  // calculées : grimpeur-puncheur forte compatibilité, puncheur-sprinteur moyenne, grimpeur-sprinteur
  // la plus faible de toutes (la paire de référence, intensité 1.0).
  puncheur: { puissance: 0.5, legerete: 0.75, explosivite: 0.55, endurance: 0.65 },
};
const SPECIALTY_KEYS_LIST = Object.keys(SPECIALTY_TRAITS);
function traitDistance(keyA, keyB) {
  const a = SPECIALTY_TRAITS[keyA], b = SPECIALTY_TRAITS[keyB];
  return Math.sqrt(Object.keys(a).reduce((sum, t) => sum + (a[t] - b[t]) ** 2, 0));
}
// Normalisée sur l'opposition la plus forte du jeu (montagne/sprint = intensité 1.0, la référence déjà
// calibrée et testée) — toutes les autres paires s'expriment relativement à celle-ci.
const MAX_TRAIT_DISTANCE = traitDistance("montagne", "sprint");
// SPECIALTY_ANTAGONISM_MATRIX["montagne"] = [{ key: "sprint", intensity: 1.0 }, { key: "pave", intensity: 0.65 }, ...]
const SPECIALTY_ANTAGONISM_MATRIX = Object.fromEntries(SPECIALTY_KEYS_LIST.map((key) => [
  key,
  SPECIALTY_KEYS_LIST.filter((k) => k !== key).map((k) => ({ key: k, intensity: traitDistance(key, k) / MAX_TRAIT_DISTANCE })),
]));
// Correspondance entre une identité de l'arbre Spécialisation et la stat qu'elle représente le plus
// directement — sert à faire persister un reliquat de l'ancienne identité pendant la transition post-
// reconversion. Puncheur/Polyvalent n'ont pas de correspondance directe unique, donc pas de reliquat pour eux.
const IDENTITY_TO_SPECIALTY = { grimpeur: "montagne", sprinteur: "sprint", rouleur: "clm", puncheur: "puncheur" };
const ANTAGONISM_BANDS = [
  { from: 0, to: 75, rate: 0 },
  { from: 75, to: 80, rate: 0.2 },
  { from: 80, to: 85, rate: 0.4 },
  { from: 85, to: 90, rate: 0.8 },
  { from: 90, to: 100, rate: 1.2 },
];
// Calcule la pénalité totale d'un gain qui peut chevaucher plusieurs paliers (ex : passer de 72 à 80
// traverse à la fois la bande 0% et la bande 20%) — chaque portion du gain est taxée à son propre taux.
function progressiveAntagonismPenalty(beforeLevel, gain) {
  if (gain <= 0) return 0;
  let remaining = gain, level = beforeLevel, totalPenalty = 0;
  for (const band of ANTAGONISM_BANDS) {
    if (remaining <= 0) break;
    if (level >= band.to) continue;
    const roomInBand = Math.min(band.to, level + remaining) - Math.max(level, band.from);
    if (roomInBand <= 0) continue;
    totalPenalty += roomInBand * band.rate;
    level += roomInBand;
    remaining -= roomInBand;
  }
  return Math.round(totalPenalty);
}
// beforeLevel = niveau de la spécialité qui monte, AVANT que ce gain précis ne lui soit appliqué — ce
// niveau de départ détermine dans quelle(s) bande(s) de la courbe le gain tombe. La pénalité totale ainsi
// calculée est ensuite RÉPARTIE entre les 3 antagonistes au prorata de leur intensité respective (donc le
// total prélevé reste comparable à l'ancien système à paire unique, juste mieux distribué entre plusieurs
// qualités selon leur vraie proximité physiologique, plutôt que jeté en bloc sur une seule).
function applyAntagonismPenalty(specialties, key, beforeLevel, amount) {
  if (amount <= 0) return;
  const antagonists = SPECIALTY_ANTAGONISM_MATRIX[key];
  if (!antagonists || antagonists.length === 0) return;
  const basePenalty = progressiveAntagonismPenalty(beforeLevel, amount);
  if (basePenalty <= 0) return;
  const totalIntensity = antagonists.reduce((sum, a) => sum + a.intensity, 0);
  antagonists.forEach(({ key: antKey, intensity }) => {
    const share = Math.round(basePenalty * (intensity / totalIntensity));
    if (share > 0) specialties[antKey] = clamp((specialties[antKey] || 0) - share);
  });
}
// Note narrative discrète sur l'état de spécialisation d'une qualité — jamais de chiffre de "budget
// physique" affiché, juste un ressenti. Utilisée dans l'onglet Compétences, à côté de chaque spécialité.
function specializationNote(level) {
  if (level >= 90) return "Spécialisation extrême — chaque progrès ici se paie cher ailleurs.";
  if (level >= 80) return "Spécialisation poussée — ton développement ici se fait au détriment d'autres qualités physiques.";
  if (level >= 75) return "Ta progression ici commence à ralentir.";
  return null;
}
// Note narrative de déclin — quand le profil physique actuel est nettement en dessous du pic déjà
// atteint dans cette spécialité, ET que le palmarès garde une vraie trace de résultats obtenus dans
// cette discipline (pas juste un chiffre qui a baissé sans rien derrière). Utilise raceSpecKeyByName,
// défini plus bas dans le fichier — accessible ici par hoisting, comme les autres fonctions top-level.
const SPECIALTY_IDENTITY_LABELS = { montagne: "grimpeur", sprint: "sprinteur", clm: "rouleur", puncheur: "puncheur" };
function specialtyDeclineNote(player, specKey) {
  const peak = player.specialtyPeaks?.[specKey];
  const current = player.specialties?.[specKey];
  if (peak === undefined || current === undefined || peak - current < 10) return null;
  const winsInDiscipline = (player.palmares || []).filter((p) => {
    if (p.resultType !== "victoire" && p.resultType !== "victoire_etape") return false;
    if (specKey === "montagne" && p.isGrandTour) return true;
    return raceSpecKeyByName(p.raceName) === specKey;
  }).length;
  if (winsInDiscipline === 0) return null;
  const label = SPECIALTY_IDENTITY_LABELS[specKey] || specKey;
  return `Tu n'es plus le ${label} que tu étais. Ton palmarès garde pourtant la trace de ${winsInDiscipline} victoire${winsInDiscipline > 1 ? "s" : ""} dans cette discipline.`;
}

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
    let total = direct + all;
    // Saison de transition suivant une reconversion : les compétences fraîchement (re)choisies ne sont
    // pas encore pleinement maîtrisées — leur bonus de spécialité est temporairement amorti. En
    // contrepartie, un reliquat de l'ancienne identité persiste un temps sur SA spécialité propre.
    if (player.reconversionTransition?.seasonsRemaining > 0) {
      total = Math.round(total * 0.65);
      if (IDENTITY_TO_SPECIALTY[player.reconversionTransition.fadingSpecialty] === specKey) total += 5;
    }
    return total;
  }
  // Le pendant "savoir-faire appris" du profil physique — pas la même chose que specialtyBonus (un
  // chiffre brut ajouté à la performance), mais un pourcentage de maîtrise 0-100 directement comparable
  // au profil physique : sur toutes les compétences pertinentes pour cette spécialité (l'unique
  // compétence physique qui la vise, plus tout l'arbre de spécialisation correspondant), combien sont
  // débloquées ? Montagne -> grimpeur, Sprint -> sprinteur, CLM -> rouleur. Les pavés n'ont pas d'arbre
  // de spécialisation dédié dans le jeu actuel — pas de score de compétences pour eux.
  const SPECKEY_TO_IDENTITY = { montagne: "grimpeur", sprint: "sprinteur", clm: "rouleur", puncheur: "puncheur" };
  function competenceScore(player, specKey) {
    const identity = SPECKEY_TO_IDENTITY[specKey];
    if (!identity) return null;
    const relevantSkills = [
      ...SKILL_TREE_CONFIG.trees.physique.skills.filter((s) => s.effects.some((e) => e.type === "specialtyBonus" && e.key === specKey)),
      ...(SKILL_TREE_CONFIG.specialisation[identity] || []),
    ];
    if (relevantSkills.length === 0) return null;
    const unlockedCount = relevantSkills.filter((s) => hasSkill(player, s.id)).length;
    return clamp((unlockedCount / relevantSkills.length) * 100);
  }
  function fatigueResist(player) { return sumEffect(player, "fatigueResist"); }
  // Résistance à la fatigue spécifique à un archétype de terrain (ex : parcours vallonnés) — distincte de
  // la résistance globale, pour des compétences dont l'avantage ne se ressent vraiment que dans un
  // contexte précis plutôt que partout, tout le temps.
  function contextFatigueResist(player, archetype) { return sumEffect(player, "contextFatigueResist", (e) => e.context === archetype); }
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

  // Coût croissant des reconversions successives — 5, 8, 12, puis +7 à chaque fois : "ton corps supporte
  // de moins en moins les changements radicaux de préparation". Basé sur le nombre de reconversions déjà
  // effectuées cette carrière (specializationHistory), pas sur un compteur séparé.
  const RECONVERSION_COSTS = [5, 8, 12];
  function reconversionCost(player) {
    const n = (player.specializationHistory || []).length;
    return n < RECONVERSION_COSTS.length ? RECONVERSION_COSTS[n] : RECONVERSION_COSTS[RECONVERSION_COSTS.length - 1] + (n - RECONVERSION_COSTS.length + 1) * 7;
  }
  // L'identité de spécialisation dominante du profil actuel — l'arbre Spécialisation (grimpeur, sprinteur,
  // rouleur, puncheur, polyvalent) le plus investi parmi les compétences débloquées. Sert à raconter la
  // reconversion ("après plusieurs saisons consacrées au sprint...") plutôt que de rester un bouton muet.
  function dominantSpecialisation(player) {
    const counts = {};
    (player.unlockedSkills || []).forEach((id) => {
      const skill = findSkill(id);
      if (skill && skill.category === "specialisation") counts[skill.treeId] = (counts[skill.treeId] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.length > 0 ? entries[0][0] : player.specialtyPrimary;
  }

  function canUnlock(game, skillId) {
    const player = game.player;
    const skill = findSkill(skillId);
    if (!skill) return { ok: false, reason: "Compétence inconnue." };
    // La Reconversion n'est jamais "déjà débloquée" au sens classique — elle reste disponible toute la
    // carrière, mais à un coût qui grimpe à chaque utilisation (voir reconversionCost).
    if (skillId === "talent_reconversion") {
      const cost = reconversionCost(player);
      if ((player.skillPoints || 0) < cost) return { ok: false, reason: `Pas assez de points (coût actuel : ${cost}).` };
      return { ok: true, skill: { ...skill, cost } };
    }
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
    // Talent de reconversion : rembourse tous les points investis dans les AUTRES compétences (son
    // propre coût — croissant à chaque utilisation — n'est lui jamais remboursé), puis repart d'une
    // feuille blanche pour toute une saison de transition (compétences moins efficaces le temps de
    // s'adapter). Les stats de spécialité déjà acquises via l'entraînement, elles, ne s'effacent pas —
    // seul le plan de jeu futur change, exactement comme une vraie reconversion de carrière.
    if ((skill.effects || []).some((e) => e.type === "respec")) {
      const fadingSpecialty = dominantSpecialisation(game.player);
      const refund = game.player.unlockedSkills.reduce((sum, id) => sum + (findSkill(id)?.cost || 0), 0);
      const player = {
        ...game.player,
        skillPoints: game.player.skillPoints - skill.cost + refund,
        unlockedSkills: [],
        specializationHistory: [...(game.player.specializationHistory || []), fadingSpecialty],
        reconversionTransition: { seasonsRemaining: 1, fadingSpecialty },
      };
      return { ...game, player, talentCharges: {}, respecInfo: { fadingSpecialty } };
    }
    const specialties = { ...game.player.specialties };
    // Une compétence de spécialité peut, selon la courbe de coût progressif, entamer un peu ses
    // antagonistes physiologiques — voir SPECIALTY_ANTAGONISM_MATRIX et ANTAGONISM_BANDS plus haut. Le
    // niveau effectif (stat de base + bonus des compétences déjà débloquées) sert de point de départ sur
    // la courbe : un coureur déjà très spécialisé grâce à son arbre de compétences l'est vraiment, pas
    // seulement sur le papier.
    (skill.effects || []).forEach((e) => {
      if (e.type === "specialtyBonus" && SPECIALTY_ANTAGONISM_MATRIX[e.key]) {
        const beforeLevel = (specialties[e.key] || 0) + specialtyBonus(game.player, e.key);
        applyAntagonismPenalty(specialties, e.key, beforeLevel, e.value);
      }
      // Un bonus réparti sur toutes les qualités (Polyvalent) n'échappe pas à la compensation physique :
      // chacune des 5 spécialités gagne simultanément, donc chacune déclenche sa propre pénalité envers
      // ses antagonistes — cohérent avec un bonus ciblé, plutôt qu'un angle mort qui rendait la largeur
      // structurellement immunisée contre le système censé limiter justement l'excellence tous azimuts.
      if (e.type === "allSpecialtyBonus") {
        SPECIALTY_KEYS_LIST.forEach((key) => {
          const beforeLevel = (specialties[key] || 0) + specialtyBonus(game.player, key);
          applyAntagonismPenalty(specialties, key, beforeLevel, e.value);
        });
      }
    });
    const player = { ...game.player, skillPoints: game.player.skillPoints - skill.cost, unlockedSkills: [...game.player.unlockedSkills, skillId], specialties };
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
    const wins = (player.palmares || []).filter((p) => p.resultType === "victoire" || p.isWorlds).length;
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
    specialtyBonus, fatigueResist, contextFatigueResist, formeRecovery, craquageResist, finalStageBonus, noiseReduction,
    reputationDimBonus, moneyMultiplier, teammatesBonus, relationEquipeBonus, ethiqueShield, contextBonus,
    hasUnlockedChoice, hasUnlockedEvent, getExtraTacticalChoices, getCareerStyle,
    getUnlockNarrative, getMasteryLevel, computeTitle, baseSkillsProgress,
    reconversionCost, dominantSpecialisation, competenceScore,
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
  grands_tours: { label: "Grands Tours", desc: "Toute la saison est construite autour des trois grands tours.", favors: ["grimpeur", "rouleur", "polyvalent"], style: "conservateur", motto: "Ne gaspille pas ton énergie — on la joue sur trois semaines, pas sur un jour." },
  classiques: { label: "Classiques", desc: "Le printemps et les pavés sont sacrés ici.", favors: ["puncheur", "rouleur", "polyvalent"], style: "offensif", motto: "Attaque dès que possible. Une classique se gagne, elle ne se gère pas." },
  sprint: { label: "Sprinteurs", desc: "L'équipe vit pour les arrivées massives et le maillot vert.", favors: ["sprinteur", "puncheur"], style: "conservateur", motto: "Garde tes jambes pour l'essentiel — le sprint ne pardonne pas la fatigue." },
  jeunes: { label: "Jeunes talents", desc: "Un projet de développement, patient, tourné vers l'avenir.", favors: ["grimpeur", "puncheur", "sprinteur", "rouleur", "polyvalent"], style: "developpement", motto: "Ton résultat compte moins que ta progression." },
  opportuniste: { label: "Opportuniste", desc: "Pas de plan figé : l'équipe saisit ce qui se présente, échappée ou sprint.", favors: ["puncheur", "polyvalent"], style: "offensif", motto: "Saisis ce qui se présente, sans attendre la permission." },
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
    { name: "Julien Faure", role: "Poisson-pilote", loyaute: 85, moral: 75, spec: "sprinteur", level: 66, age: 27, fraicheur: 100 },
    { name: "Marc Keller", role: "Capitaine de route", loyaute: 90, moral: 80, spec: "rouleur", level: 79, age: 31, fraicheur: 100 },
    { name: "Santi Ibáñez", role: "Grimpeur dévoué", loyaute: 70, moral: 65, spec: "grimpeur", level: 71, age: 26, fraicheur: 100 },
    { name: "Lukas Weber", role: "Baroudeur", loyaute: 75, moral: 70, spec: "puncheur", level: 64, age: 28, fraicheur: 100 },
    { name: "Antoine Petit", role: "Jeune espoir", loyaute: 80, moral: 85, spec: "polyvalent", level: 58, age: 20, fraicheur: 100 },
    { name: "Diego Fontana", role: "Co-leader ambitieux", loyaute: 60, moral: 72, spec: "grimpeur", level: 76, age: 29, fraicheur: 100 },
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
// Pour les scènes propres à un classement (maillot vert, général...), le rival établi de carrière n'est
// pertinent que s'il correspond vraiment au profil recherché — un rival grimpeur n'a rien à faire dans
// une bagarre de sprinteurs pour les points. Cherche d'abord parmi les meilleurs coureurs du peloton
// correspondant au profil ; à défaut, retombe sur un adversaire anonyme plutôt que de nommer quelqu'un
// d'incohérent. Ne porte JAMAIS de relation haine/respect (contrairement à getRival) — cet adversaire de
// classement n'est pas suivi d'une course à l'autre, seul le vrai rival de carrière l'est.
function getClassificationRival(game, specs) {
  const rival = getRival(game);
  if (rival && specs.includes(rival.spec)) return rival;
  const pool = (game.peloton || []).filter((r) => specs.includes(r.spec) && r.id !== game.rivalId);
  if (pool.length === 0) return null;
  const top = [...pool].sort((a, b) => b.level - a.level).slice(0, 4);
  return pick(top);
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
  const recentWins = (player.palmares || []).slice(-4).filter((p) => p.resultType === "victoire" || p.isWorlds).length;
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

  // Académie : l'encadrement précoce vient avec des attentes plus élevées — la pression ressentie
  // est structurellement un peu plus forte, quel que soit le contexte de la course.
  if (player.flags?.originAcademie) pressure += 6;

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

// ============================================================================
// PALMARÈS STRUCTURÉ — chaque entrée porte un texte d'affichage ET des champs machine-lisibles
// (resultType, raceName, isMonument, isGrandTour, isWorlds), construits UNE SEULE FOIS ici. Tout le
// reste du jeu (succès, score de carrière, titre, objectifs de saison, styles de carrière...) lit ces
// champs structurés — plus personne ne doit ré-interpréter le texte affiché pour en déduire quoi que
// ce soit. Le texte peut changer librement sans jamais rien casser ailleurs.
// ============================================================================
const PALMARES_LABEL_PREFIX = {
  victoire: "Victoire", victoire_gc: "🟡 Classement général", podium: "Podium", top10: "Top 10",
  maillot_pois: "🔴 Maillot à pois", maillot_points: "🟢 Maillot par points", maillot_jeune: "⚪ Maillot du meilleur jeune",
  victoire_etape: "Victoire d'étape",
};
const PALMARES_RESULT_TYPE = {
  victoire: "victoire", victoire_gc: "victoire", podium: "podium", top10: "top10",
  maillot_pois: "maillot", maillot_points: "maillot", maillot_jeune: "maillot",
  victoire_etape: "victoire_etape",
};
function buildPalmaresEntry(raceName, kind) {
  return {
    label: `${PALMARES_LABEL_PREFIX[kind]} — ${raceName}`,
    resultType: PALMARES_RESULT_TYPE[kind],
    kind,
    raceName,
    isMonument: MONUMENTS.has(raceName),
    isGrandTour: !!GRAND_TOUR_FLAVOR[raceName],
    isWorlds: raceName === "Championnats du Monde",
  };
}

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
    case "monument": return newPalmares.some((p) => p.resultType === "victoire" && p.isMonument);
    case "anywin": return newPalmares.some((p) => p.resultType === "victoire");
    case "worlds": return newPalmares.some((p) => p.isWorlds);
    case "gc": return newPalmares.some((p) => (p.resultType === "victoire" || p.resultType === "podium") && p.isGrandTour);
    case "jersey": return newPalmares.some((p) => p.resultType === "maillot");
    case "uci": return uciPointsThisSeason >= 150;
    case "wt_debut": return player.team?.level === TEAM_LEVELS.WT && !wasWTAtSeasonStart;
    default: return false;
  }
}

// Points de compétence de fin de saison — plus une saison a été réussie (victoires, podiums, objectifs
// personnels atteints), plus la progression est rapide, à l'image d'un coureur qui apprend davantage
// d'une belle année que d'une saison blanche. Le pic de progression physique et technique se situe
// généralement avant 28 ans dans le cyclisme ; au-delà, un vétéran continue d'apprendre, mais nettement
// plus lentement — jamais à l'arrêt complet (1 point minimum garanti, quelle que soit la situation).
function seasonSkillPointsAward(player, seasonStats) {
  const { wins, podiums, objectivesMet } = seasonStats;
  let base = 1;
  if (wins > 0) base += 1;
  if (wins >= 3 || podiums >= 3) base += 1;
  if (objectivesMet >= 2) base += 1;
  const ageFactor = player.age < 28 ? 1 : player.age < 32 ? 0.75 : player.age < 36 ? 0.5 : 0.3;
  return Math.max(1, Math.round(base * ageFactor));
}

const SPONSOR_OBJECTIVES = [
  { name: "Banque Cycliste Pro", objective: "Décrocher un podium cette saison", reward: "Prime de 15 000 € & +réputation sponsors", bonusMoney: 15000 },
  { name: "Aqua Vitale", objective: "Terminer une classique dans le top 10", reward: "Prime de 8 000 € & +réputation sponsors", bonusMoney: 8000 },
  { name: "Groupe Média Sportif", objective: "Décrocher une victoire d'étape", reward: "Prime de 20 000 € & forte exposition médiatique", bonusMoney: 20000 },
];
// Évalue si une entrée de palmarès donnée correspond précisément à l'objectif du sponsor nommé — sans
// cette vérification, l'objectif affiché au joueur ("⏳ En cours") ne pouvait littéralement jamais passer
// à "✅ Rempli", quel que soit son résultat : la prime n'était jamais versée, le sponsor ne changeait jamais.
function sponsorObjectiveMet(sponsorName, entry) {
  if (sponsorName === "Banque Cycliste Pro") return entry.resultType === "podium" || entry.resultType === "victoire" || entry.resultType === "victoire_etape" || entry.resultType === "victoire_gc";
  if (sponsorName === "Aqua Vitale") return !entry.isGrandTour && !entry.isWorlds && (entry.resultType === "top10" || entry.resultType === "podium" || entry.resultType === "victoire");
  if (sponsorName === "Groupe Média Sportif") return entry.resultType === "victoire_etape";
  return false;
}

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

// Estimation du profil terrain pour les courses sans fiche détaillée (ProSeries/Continental) — dérivée
// simplement de leur specKey dominant, pour rester cohérent avec les vraies fiches CALENDAR_META.
const SPEC_TERRAIN_ESTIMATE = {
  montagne: { mountains: 65, sprint: 15, cobbles: 5, punch: 30 },
  sprint: { mountains: 10, sprint: 70, cobbles: 5, punch: 15 },
  pave: { mountains: 10, sprint: 30, cobbles: 65, punch: 20 },
  clm: { mountains: 25, sprint: 10, cobbles: 0, punch: 10 },
  puncheur: { mountains: 35, sprint: 20, cobbles: 5, punch: 75 },
};
function terrainProfileFor(race) {
  // Priorité absolue au vrai profil de terrain pondéré de la course, quand elle en porte un (la source
  // la plus fiable — construite spécifiquement pour Amstel/Flèche/Liège, extensible à d'autres).
  if (race.terrainProfile) {
    return {
      mountains: race.terrainProfile.montagne ?? 20,
      sprint: race.terrainProfile.sprint ?? 15,
      cobbles: race.terrainProfile.pave ?? 0,
      punch: race.terrainProfile.puncheur ?? 0,
    };
  }
  const meta = CALENDAR_META[race.name];
  if (meta) {
    // Les métadonnées historiques (montagnes/sprint/pavés) n'ont pas de dimension puncheur propre — on
    // l'estime à partir du specKey réel de la course, plus fiable qu'une pure heuristique numérique.
    const punchEstimate = race.specKey === "puncheur" ? 75 : SPEC_TERRAIN_ESTIMATE[race.specKey]?.punch ?? 20;
    return { mountains: meta.mountains, sprint: meta.sprint, cobbles: meta.cobbles, punch: punchEstimate };
  }
  return SPEC_TERRAIN_ESTIMATE[race.specKey] || { mountains: 30, sprint: 30, cobbles: 10, punch: 20 };
}

// Commentaire d'adéquation profil/course — purement dérivé (profil terrain × spécialité du joueur),
// jamais stocké. C'est ce qui rend le calendrier lisible comme un vrai outil stratégique.
function fitCommentary(player, race) {
  const p = terrainProfileFor(race);
  const spec = player.specialtyPrimary;
  if (spec === "grimpeur") return p.mountains >= 55 ? "Course très intéressante pour ton profil." : p.mountains >= 35 ? "Un profil correct, sans être ton terrain de prédilection." : "Peu d'occasions pour un grimpeur ici.";
  if (spec === "sprinteur") return p.sprint >= 55 ? "Course très intéressante pour ton profil." : p.mountains >= 55 ? "Quelques opportunités d'étapes, mais peu intéressante pour le classement général." : "Un profil correct pour toi.";
  if (spec === "rouleur") return p.cobbles >= 45 ? "Un terrain qui te correspond parfaitement." : p.sprint <= 20 && p.mountains <= 30 ? "Un profil roulant taillé pour toi." : "Un profil correct pour toi.";
  if (spec === "puncheur") return p.punch >= 55 ? "Un profil taillé pour ton explosivité." : p.punch >= 35 ? "Un profil correct, sans être ton terrain idéal." : "Peu d'occasions pour un puncheur ici.";
  return "Un terrain où ta polyvalence peut faire la différence.";
}

// Résumé compact en 2-3 lignes répondant directement à "pourquoi cette course m'intéresse" — pensé pour
// transformer le calendrier en outil de décision plutôt qu'en simple liste. Toujours en tête : l'adéquation
// avec le profil RÉELLEMENT construit (dominantSpecialisation, cohérent avec la note actuelle). Ensuite,
// jusqu'à 2 signaux parmi les plus notables pour CETTE course précise (fatigue, concurrence, réputation) —
// pas tous systématiquement, pour éviter de noyer le joueur sous des évidences répétées à chaque course.
const SPEC_INSIGHT_LABELS = { grimpeur: "Grimpeurs", sprinteur: "Sprinteurs", rouleur: "Rouleurs", puncheur: "Puncheurs", polyvalent: "profils polyvalents" };
const SPEC_INSIGHT_ICONS = { grimpeur: "🏔️", sprinteur: "💨", rouleur: "⏱️", puncheur: "🎯", polyvalent: "🚴" };
function raceInsights(player, race) {
  const p = terrainProfileFor(race);
  const identity = SkillEngine.dominantSpecialisation(player);
  const fitValue = { grimpeur: p.mountains, sprinteur: p.sprint, rouleur: p.cobbles, puncheur: p.punch }[identity] ?? (p.mountains + p.sprint + p.cobbles + p.punch) / 4;
  const insights = [];
  if (fitValue >= 55) insights.push({ icon: SPEC_INSIGHT_ICONS[identity] || "🎯", text: `Très favorable à ton profil ${SPEC_INSIGHT_LABELS[identity] || "actuel"}`, tone: "positive" });
  else if (fitValue >= 35) insights.push({ icon: SPEC_INSIGHT_ICONS[identity] || "🎯", text: "Profil correct, sans être ton terrain de prédilection", tone: "neutral" });
  else insights.push({ icon: "🤷", text: "Peu d'occasions pour ton profil ici", tone: "warning" });

  const rating = computeCurrentRating(player);
  let objectiveText;
  if (fitValue >= 55 && rating >= 70) objectiveText = "Objectif réaliste : Victoire";
  else if (fitValue >= 45 && rating >= 55) objectiveText = "Objectif réaliste : Podium";
  else if (fitValue >= 30 || rating >= 45) objectiveText = "Objectif réaliste : Top 10";
  else objectiveText = "Objectif réaliste : faire ses gammes";
  insights.push({ icon: "🟢", text: objectiveText, tone: "info" });

  const meta = CALENDAR_META[race.name];
  const prestige = meta ? meta.prestige : race.raceTier === "WT" ? 65 : race.raceTier === "Pro" ? 45 : 30;
  const fatigueRating = meta ? meta.fatigue : race.isStageRace ? 60 : 40;
  const candidates = [];
  if (fatigueRating >= 70) candidates.push({ icon: "⚠️", text: "Fatigue élevée à prévoir", tone: "warning", priority: fatigueRating });
  if (race.raceTier === "WT" || MAJOR_RACE_NAMES.has(race.name)) candidates.push({ icon: "⚠️", text: "Forte concurrence attendue", tone: "warning", priority: 80 });
  if (prestige >= 65) candidates.push({ icon: "💰", text: "Gros potentiel de réputation", tone: "positive", priority: prestige });
  candidates.sort((a, b) => b.priority - a.priority);
  if (candidates[0]) insights.push(candidates[0]);
  return insights;
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

function initRaceState() { return { group: RACE_GROUPS.PELOTON, energy: 100, role: null, leaderName: null, leaderLevel: null, strategy: null }; }

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

// Composantes déterministes de la performance — extraites de performanceScore pour être réutilisées telles
// quelles à l'affichage (voir performanceBreakdownTiers plus bas), sans jamais dupliquer la formule.
function computePerformanceComponents(player, specKeyOrProfile) {
  let spec, skillBonus;
  if (typeof specKeyOrProfile === "string") {
    spec = player.specialties[specKeyOrProfile] ?? 30;
    skillBonus = SkillEngine.specialtyBonus(player, specKeyOrProfile);
  } else {
    const entries = Object.entries(specKeyOrProfile).filter(([, w]) => w > 0);
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0) || 1;
    spec = entries.reduce((sum, [k, w]) => sum + (player.specialties[k] ?? 30) * (w / totalWeight), 0);
    skillBonus = entries.reduce((sum, [k, w]) => sum + SkillEngine.specialtyBonus(player, k) * (w / totalWeight), 0);
  }
  const overtrainingPenalty = isOvertrained(player) ? Math.min(15, (player.stats.fatigueChronique - OVERTRAINING_THRESHOLD) * 0.6) : 0;
  return {
    basePhysique: spec * 0.5 + skillBonus,
    forme: player.stats.forme * 0.35,
    fatigueRecente: -(player.stats.fatigue * 0.35) * 0.3,
    fatigueChronique: -overtrainingPenalty,
    equipement: player.team ? clamp((player.team.equipmentQuality - 50) / 8, -6, 6) : 0,
  };
}
function performanceScore(player, specKeyOrProfile, extraBonus = 0) {
  const c = computePerformanceComponents(player, specKeyOrProfile);
  // Régularité (Mental) réduit la part d'aléatoire, sans jamais la supprimer entièrement.
  const noiseMax = Math.max(10, 30 - SkillEngine.noiseReduction(player));
  const noise = rand(0, noiseMax);
  return c.basePhysique + c.forme + c.fatigueRecente + c.fatigueChronique + c.equipement + extraBonus + noise;
}

// Traduit chaque composante en indicateur qualitatif (🟢🟡🔴 + courte phrase) plutôt que d'exposer les
// chiffres bruts de la formule — répond à "pourquoi suis-je moins bon aujourd'hui" sans casser le mystère
// du moteur. La pression n'y figure pas : elle dépend d'une course précise (médiatisation, enjeu du jour),
// pas d'un état permanent du joueur — elle reste affichée en direct pendant la course elle-même (🔥 Pression).
function performanceBreakdownTiers(player) {
  const rows = [];
  const identity = SkillEngine.dominantSpecialisation(player);
  const specKey = IDENTITY_TO_SPECIALTY[identity];
  const relevantSpecialty = specKey ? player.specialties[specKey] : Object.values(player.specialties).reduce((a, b) => a + b, 0) / 5;
  rows.push({ label: "Base physique", icon: relevantSpecialty >= 70 ? "🟢" : relevantSpecialty >= 45 ? "🟡" : "🔴", text: relevantSpecialty >= 70 ? "Physique de très haut niveau" : relevantSpecialty >= 45 ? "Physique correct" : "Physique encore en construction" });
  const forme = player.stats.forme;
  rows.push({ label: "Forme", icon: forme >= 75 ? "🟢" : forme >= 45 ? "🟡" : "🔴", text: forme >= 75 ? "Forme excellente" : forme >= 45 ? "Forme correcte" : "Forme fatiguée" });
  const fatigue = player.stats.fatigue;
  rows.push({ label: "Fatigue récente", icon: fatigue <= 20 ? "🟢" : fatigue <= 45 ? "🟡" : "🔴", text: fatigue <= 20 ? "Fraîcheur quasi totale" : fatigue <= 45 ? "Fatigue modérée" : "Fatigue lourde" });
  const chronique = player.stats.fatigueChronique;
  rows.push({ label: "Fatigue chronique", icon: chronique < 40 ? "🟢" : chronique < OVERTRAINING_THRESHOLD ? "🟡" : "🔴", text: chronique < 40 ? "Aucune usure de fond" : chronique < OVERTRAINING_THRESHOLD ? "Usure qui s'installe" : "Surmenage — grosse perte de performance" });
  const equip = player.team ? player.team.equipmentQuality : 50;
  rows.push({ label: "Équipement", icon: equip >= 65 ? "🟢" : equip >= 40 ? "🟡" : "🔴", text: equip >= 65 ? "Bon matériel" : equip >= 40 ? "Matériel correct" : "Matériel en retrait" });
  return rows;
}
// Score de synthèse 0-100 affiché en tête de l'explication post-course ("Performance : 78/100") — dérivé
// des mêmes composantes déterministes que le détail qualitatif juste en dessous, pour que les deux
// racontent la même histoire sans jamais se contredire.
function performanceSummaryScore(player) {
  const identity = SkillEngine.dominantSpecialisation(player);
  const specKey = IDENTITY_TO_SPECIALTY[identity];
  const profile = specKey || { montagne: 1, sprint: 1, clm: 1, pave: 1, puncheur: 1 };
  const c = computePerformanceComponents(player, profile);
  const raw = c.basePhysique + c.forme + c.fatigueRecente + c.fatigueChronique + c.equipement;
  return Math.max(1, Math.min(100, Math.round(raw)));
}

function raceOutcome(player, specKey, raceName, tier) {
  const meta = CALENDAR_META[raceName];
  const repFactor = metaFactor(meta?.prestige, 70);
  const costFactor = metaFactor(meta?.fatigue, 65);
  // La résistance à la fatigue (Endurance, Gestion du stress, Gestion de l'effort...) réduit le coût réel,
  // plafonnée à 60% de réduction pour qu'un effort décisif reste toujours un effort. Un bonus contextuel
  // (ex : Répétition des efforts, spécifique aux parcours vallonnés) s'y ajoute uniquement quand la course
  // porte effectivement l'archétype concerné — pas un simple bonus global de plus.
  const archetypes = raceArchetypesByName(raceName);
  const contextualResist = archetypes.reduce((sum, a) => sum + SkillEngine.contextFatigueResist(player, a), 0);
  const fatigueReduction = clamp01(1 - (SkillEngine.fatigueResist(player) + contextualResist) / 25, 0.4, 1);
  if (tier === "victoire") return { tier, text: `Victoire sur ${raceName} ! Le public scande ton nom.`, palmares: [buildPalmaresEntry(raceName, "victoire")], reputation: Math.round(16 * repFactor), forme: -Math.round(8 * costFactor * fatigueReduction), fatigue: Math.round(10 * costFactor * fatigueReduction) };
  if (tier === "podium") return { tier, text: `Tu montes sur le podium de ${raceName}. Une belle carte de visite.`, palmares: [buildPalmaresEntry(raceName, "podium")], reputation: Math.round(9 * repFactor), forme: -Math.round(6 * costFactor * fatigueReduction), fatigue: Math.round(8 * costFactor * fatigueReduction) };
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

  if (jerseys.kom.position === 1) { text += ` Tu t'empares aussi du maillot à pois de meilleur grimpeur !`; palmares.push(buildPalmaresEntry(raceName, "maillot_pois")); uciPoints += JERSEY_UCI_POINTS; }
  else if (jerseys.kom.position <= 3) { text += ` Tu termines ${ordinal(jerseys.kom.position)} du classement de meilleur grimpeur.`; }

  if (jerseys.points.position === 1) { text += ` Le maillot par points te revient également !`; palmares.push(buildPalmaresEntry(raceName, "maillot_points")); uciPoints += JERSEY_UCI_POINTS; }
  else if (jerseys.points.position <= 3) { text += ` Tu es ${ordinal(jerseys.points.position)} du classement par points.`; }

  if (jerseys.youth) {
    if (jerseys.youth.position === 1) { text += ` Chez les jeunes, tu domines aussi le classement et repars avec le maillot blanc !`; palmares.push(buildPalmaresEntry(raceName, "maillot_jeune")); uciPoints += Math.round(JERSEY_UCI_POINTS * 0.75); }
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
  puncheur: { puncheur: 1.0, grimpeur: 0.75, polyvalent: 0.7, sprinteur: 0.5, rouleur: 0.35 },
};
function specFit(spec, specKey) {
  return SPEC_FIT_WEIGHTS[specKey]?.[spec] ?? 0.4;
}

// Déduit le type d'effort dominant d'une course du calendrier à partir de ses métadonnées.
function dominantSpecKey(meta) {
  // Priorité à la vraie identité mécanique de la course (son specKey réel), quand elle existe déjà
  // quelque part dans le calendrier détaillé — plus fiable que les 3 dimensions brutes (montagnes/sprint/
  // pavés), qui ne couvrent ni le CLM ni le puncheur et biaisaient la simulation du monde en arrière-plan.
  const realSpecKey = meta.name ? raceSpecKeyByName(meta.name) : null;
  if (realSpecKey) return realSpecKey;
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
// Complète le champ d'un championnat national quand le peloton simulé ne contient pas assez de
// compatriotes pour un classement crédible (30 nations pour 30 coureurs : c'est la norme, pas
// l'exception). Même forme qu'un coureur généré normalement, nationalité forcée.
function generateCompatriotFiller(nationCode) {
  const level = rand(45, 88);
  return { id: nextRiderId(), name: randomNameForNation(nationCode), nation: nationCode, spec: pick(SPEC_IDS), level, age: rand(19, 34), team: pick(teamPoolForLevel(level)), points: 0 };
}

// explicitTerrainProfile : profil de terrain pondéré fourni directement par l'appelant (utilisé par le
// Grand Tour, dont les étapes n'ont pas de nom de course propre à chercher dans raceTerrainProfileByName).
// Ne concerne QUE le calcul de performance du joueur — specKey reste une chaîne de bout en bout pour tout
// le reste (composition du peloton NPC, bonus contextuel), jamais remplacé par un objet.
function runRaceField(game, specKey, raceName, nationalOnly = false, explicitTerrainProfile = null) {
  const rival = getRival(game);
  const raceState = game.raceState || initRaceState();
  const nationCode = game.player.nation?.code;
  let sourcePeloton = game.peloton || [];
  if (nationalOnly && nationCode) {
    sourcePeloton = sourcePeloton.filter((r) => r.nation === nationCode);
    // Un championnat national doit rester un vrai classement, même si le peloton simulé ne compte
    // presque aucun compatriote cette saison-là — on complète plutôt que de courir à 3.
    while (sourcePeloton.length < 18) sourcePeloton = [...sourcePeloton, generateCompatriotFiller(nationCode)];
  }
  let field = sourcePeloton.filter((r) => specFit(r.spec, specKey) >= 0.3);
  field = [...field].sort(() => Math.random() - 0.5).slice(0, 25);
  // Le rival est toujours engagé sur tes courses clés, même s'il n'est pas tombé dans l'échantillon
  // aléatoire — sauf sur un championnat national : il n'a rien à y faire s'il n'est pas compatriote.
  if (rival && !field.some((r) => r.id === rival.id) && (!nationalOnly || rival.nation === nationCode)) field = [...field, rival];

  const major = MAJOR_RACE_NAMES.has(raceName);
  // Chaque coureur du peloton simulé est assigné à un groupe (pondéré par son niveau ET son adéquation
  // au type de course) — cohérent avec la façon dont ton propre groupe s'est construit pendant la course.
  const entries = field.map((r) => {
    const fit = specFit(r.spec, specKey);
    const teamAmbitionBonus = major ? ((r.team?.reputation || 50) - 50) * 0.06 : 0;
    // Le multiplicateur (0.65 -> 0.95) comble un écart structurel qui rendait le statut de Légende
    // trivial dès le milieu de la vingtaine, tous profils confondus : le meilleur adversaire possible du
    // peloton (niveau 92, parfaitement adapté au terrain) ne dépassait jamais ~70 de score moyen, alors
    // qu'un joueur seulement "bien construit" (pas même exceptionnel) atteignait déjà plus de 100.
    return { id: r.id, name: r.name, nation: r.nation, team: r.team?.name, isPlayer: false, isRival: rival ? r.id === rival.id : false, group: assignFieldGroup(r.level, fit), score: r.level * 0.95 * (0.55 + 0.45 * fit) + rand(0, 20) + teamAmbitionBonus };
  });
  // Bonus mental (Confiance/Sang-froid/Résilience) et bonus contextuel de spécialisation restent des bonus
  // de score classiques — mais l'énergie qu'il te reste (Race Engine V2) module maintenant directement
  // ta performance À L'INTÉRIEUR de ton groupe, plutôt que de simplement s'additionner au score final.
  const context = specKey === "montagne" ? "montagne_stage" : specKey === "sprint" ? "sprint_stage" : specKey === "pave" ? "paves_stage" : specKey === "puncheur" ? "puncheur_stage" : null;
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
  // Le profil de terrain pondéré (optionnel) ne s'applique qu'au calcul du JOUEUR — la composition du
  // peloton NPC et les bonus contextuels restent basés sur le specKey dominant, une simplification
  // volontaire qui évite d'avoir à réécrire toute la simulation d'adversaires pour un mélange de qualités.
  const terrainProfile = explicitTerrainProfile || raceTerrainProfileByName(raceName);
  const playerScore = performanceScore(game.player, terrainProfile || specKey, mentalBonus) + energyModifier;
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
function raceOutcomeVsRival(game, specKey, raceName, nationalOnly = false) {
  const field = runRaceField(game, specKey, raceName, nationalOnly);
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
  let currentGT = game.currentGT ? { ...game.currentGT } : null;
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
    // Style de DS : un DS offensif pousse plus fort (fatigue accrue, le prix du risque), un DS
    // conservateur gère mieux l'effort (fatigue réduite) — la vraie différenciation entre philosophies.
    if (k === "fatigue" && amount > 0) {
      const teamStyle = player.team ? TEAM_PHILOSOPHIES[player.team.philosophy]?.style : null;
      if (teamStyle === "offensif") amount = Math.round(amount * 1.2);
      else if (teamStyle === "conservateur") amount = Math.round(amount * 0.8);
    }
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
    // Un DS développement construit la confiance plus vite — la progression compte plus que le résultat immédiat.
    const teamStyle = player.team ? TEAM_PHILOSOPHIES[player.team.philosophy]?.style : null;
    const styleBonus = (delta.relationEquipe > 0 && teamStyle === "developpement") ? delta.relationEquipe * 0.3 : 0;
    player.stats.relationEquipe = clamp(player.stats.relationEquipe + delta.relationEquipe + bonus + styleBonus);
  }
  if (delta.reputation !== undefined) {
    // Image publique / Athlète discret amortissent les pertes de réputation liées à un scandale.
    // Académie, à l'inverse, les amplifie légèrement : des attentes plus élevées dès le départ font
    // que les échecs y pèsent un peu plus lourd — le revers de la longueur d'avance initiale.
    const academiePenalty = player.flags?.originAcademie ? 1.12 : 1;
    const effective = delta.reputation < 0 ? delta.reputation * (1 - SkillEngine.ethiqueShield(player)) * academiePenalty : delta.reputation;
    const dims = addRep(effective);
    Object.entries(dims).forEach(([k, v]) => {
      // Popularité / Charisme / Sponsors ajoutent un petit bonus ciblé quand la réputation progresse.
      const skillBonus = effective > 0 ? Math.round(SkillEngine.reputationDimBonus(player, k) * 0.3) : 0;
      player.reputation[k] = clamp(player.reputation[k] + v + skillBonus);
    });
  }
  // Cible UNE SEULE dimension de réputation précisément — contrairement à delta.reputation qui se répand
  // sur les 4 à la fois. Utile pour les événements mémorables propres à une dimension (une interview
  // hostile touche ta réputation médias, pas ta réputation peloton).
  if (delta.reputationDimDelta) {
    const { dim, amount } = delta.reputationDimDelta;
    player.reputation[dim] = clamp(player.reputation[dim] + amount);
  }
  // Cible PLUSIEURS dimensions de réputation à la fois en un seul delta — utile quand un même événement a
  // des répercussions combinées (une victoire au maillot vert touche fans, médias ET sponsors ensemble).
  if (delta.extraRepDims) {
    Object.entries(delta.extraRepDims).forEach(([dim, amount]) => {
      player.reputation[dim] = clamp(player.reputation[dim] + amount);
    });
  }
  // Trace narrative generique — n'importe quel choix du jeu peut desormais laisser une marque dans
  // l'histoire du personnage sans coder un cas particulier a chaque fois. Reserve aux moments vraiment
  // memorables (evenements rares, reputation marquante, jalons de rivalite) — pas chaque petit choix,
  // sous peine de noyer le journal sous des banalites repetees des dizaines de fois par carriere.
  if (delta.historyNote) {
    player.history.push(`${player.age} ans — ${delta.historyNote}`);
  }
  if (delta.specialtyDeltas) {
    // Autodidacte (Talent brut) : une progression qui dépend surtout de ses propres choix — les gains
    // de spécialité obtenus en cours de carrière (événements, choix tactiques) sont donc amplifiés.
    const talentBrutBonus = player.flags?.originAutodidacte ? 1.2 : 1;
    // DS développement : "ton résultat compte moins que ta progression" — un jeune coureur (moins de 25
    // ans) progresse plus vite dans ce projet patient, cumulable avec le bonus autodidacte ci-dessus.
    const devTeamBonus = (player.age < 25 && player.team && TEAM_PHILOSOPHIES[player.team.philosophy]?.style === "developpement") ? 1.25 : 1;
    const growthMultiplier = talentBrutBonus * devTeamBonus;
    if (!player.specialtyPeaks) player.specialtyPeaks = { ...player.specialties };
    Object.entries(delta.specialtyDeltas).forEach(([k, v]) => {
      const amount = v > 0 ? v * growthMultiplier : v;
      const beforeLevel = (player.specialties[k] || 0) + SkillEngine.specialtyBonus(player, k);
      player.specialties[k] = clamp((player.specialties[k] || 0) + amount);
      applyAntagonismPenalty(player.specialties, k, beforeLevel, amount);
      player.specialtyPeaks[k] = Math.max(player.specialtyPeaks[k] || 0, player.specialties[k]);
    });
  }
  if (delta.palmares) {
    delta.palmares.forEach((entry) => {
      player.palmares.push({ ...entry, age: player.age });
      player.history.push(`${player.age} ans — ${entry.label}`);
      // Prime de victoire négociée au contrat : ne paie que sur une vraie victoire, proportionnelle au
      // multiplicateur négocié au mercato — vérifié sur resultType, plus jamais sur le texte affiché.
      if (entry.resultType === "victoire" && player.contract?.winBonusMultiplier > 1) {
        const bonus = Math.round(4000 * (player.contract.winBonusMultiplier - 1));
        player.money = (player.money || 0) + bonus;
        player.history.push(`${player.age} ans — touche une prime de victoire contractuelle de ${bonus.toLocaleString("fr-FR")} €.`);
      }
      // Confirmation de reconversion — le moment initial ("quitte le profil X") est déjà loggé ailleurs,
      // mais l'histoire ne s'arrête pas là : la première victoire qui confirme vraiment la nouvelle
      // identité mérite sa propre trace, loggée une seule fois via un flag.
      if ((entry.resultType === "victoire" || entry.resultType === "victoire_etape") && (player.specializationHistory || []).length > 0 && !player.flags?.reconversionConfirmed) {
        const fadingIdentity = player.specializationHistory[player.specializationHistory.length - 1];
        const currentIdentity = SkillEngine.dominantSpecialisation(player);
        if (currentIdentity !== fadingIdentity) {
          const label = SPECIALTIES.find((s) => s.id === currentIdentity)?.label || currentIdentity;
          player.history.push(`${player.age} ans — première victoire depuis sa reconversion : la transformation en ${label.toLowerCase()} n'est plus un pari, c'est une réalité.`);
          player.flags.reconversionConfirmed = true;
        }
      }
      // Objectif sponsor — vérifié sur CHAQUE nouvelle entrée de palmarès, pas seulement à la fin de
      // saison, pour que la prime tombe au moment même où le joueur vient de la décrocher.
      if (sponsor && !sponsor.fulfilled && sponsorObjectiveMet(sponsor.name, entry)) {
        sponsor.fulfilled = true;
        player.money = (player.money || 0) + (sponsor.bonusMoney || 0);
        player.reputation.sponsors = clamp((player.reputation.sponsors || 50) + 8);
        player.history.push(`${player.age} ans — remplit l'objectif fixé par ${sponsor.name} et touche une prime de ${(sponsor.bonusMoney || 0).toLocaleString("fr-FR")} €.`);
      }
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
  // Contrat négocié au mercato : durée (verrouille f2 tant qu'elle court), prime de victoire, clause de sortie.
  if (delta.contract) { player.contract = delta.contract; }
  if (delta.uciPoints) { player.uciPoints = (player.uciPoints || 0) + delta.uciPoints; }
  if (delta.leaderWinContributed) { player.leaderWinsContributed = (player.leaderWinsContributed || 0) + 1; }
  // Grand Tour Engine V2 : le classement général et les maillots annexes s'accumulent jour après jour
  // dans game.currentGT, plutôt que d'être décidés par une seule étape. reset initialise un nouveau
  // Grand Tour (grand départ), clear le referme (arrivée finale) — les deux jamais en même temps que
  // gcPoints/komPoints/pointsPoints, qui eux s'ajoutent simplement à l'existant.
  if (delta.gtUpdate) {
    if (delta.gtUpdate.reset) {
      currentGT = { tourName: delta.gtUpdate.tourName, kind: delta.gtUpdate.kind, totalDays: delta.gtUpdate.totalDays, objective: delta.gtUpdate.objective || "general", gcScore: 0, komScore: 0, pointsScore: 0 };
    } else if (delta.gtUpdate.clear) {
      currentGT = null;
    } else if (currentGT) {
      currentGT = {
        ...currentGT,
        gcScore: (currentGT.gcScore || 0) + (delta.gtUpdate.gcPoints || 0),
        komScore: (currentGT.komScore || 0) + (delta.gtUpdate.komPoints || 0),
        pointsScore: (currentGT.pointsScore || 0) + (delta.gtUpdate.pointsPoints || 0),
      };
    }
  }
  // Chute grave forçant la fin de course : plutôt que de restructurer le déroulé des étapes, on force
  // directement le groupe au plancher (décroché) et l'énergie au minimum — le Race Engine V2 garantit
  // alors mécaniquement un résultat anonyme, sans avoir besoin d'interrompre la séquence de la course.
  // Persiste le rôle du jour et l'identité du leader présumé (calculés au briefing) jusqu'à l'arrivée —
  // c'est ce qui permet à un équipier de voir le résultat de SON leader plutôt que le sien à l'arrivée.
  if (delta.raceLeaderInfo) {
    raceState.role = delta.raceLeaderInfo.role;
    raceState.leaderName = delta.raceLeaderInfo.leaderName || null;
    raceState.leaderLevel = delta.raceLeaderInfo.leaderLevel || null;
  }
  // Persiste la stratégie choisie au plan de course jusqu'à l'arrivée — c'est elle qui biaise ensuite le
  // tirage des situations dans buildRaceMomentsSequence.
  if (delta.raceStrategy) {
    raceState.strategy = delta.raceStrategy;
  }
  if (delta.forceDropped) {
    raceState.group = RACE_GROUPS.DROPPED;
    raceState.energy = 5;
  }
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
    // Bornée explicitement entre 5% et 95% : même avec un très gros bonus tactique, il reste toujours
    // une petite part d'incertitude — jamais une réussite (ou un échec) mathématiquement garanti.
    const cooperationChance = clamp01(0.35 + delta.tacticalBonus / 40 + pelotonCooperationModifier, 0.05, 0.95);
    if (delta.tacticalBonus >= 5 && raceState.energy > 15 && Math.random() < cooperationChance) {
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
    // Jalons de rivalité — une bascule marquante dans la relation, loggée une seule fois (via un flag),
    // pas répétée à chaque course où le seuil reste franchi ensuite.
    const rivalName = getRival({ player, rivalId: game.rivalId, peloton })?.name;
    if (rivalName) {
      if (rivalRelation.haine >= 75 && !player.flags?.rivalryBitterLogged) {
        player.history.push(`${player.age} ans — la rivalité avec ${rivalName} a tourné à quelque chose de vraiment amer.`);
        player.flags.rivalryBitterLogged = true;
      }
      if (rivalRelation.respect >= 75 && !player.flags?.rivalryRespectLogged) {
        player.history.push(`${player.age} ans — malgré la rivalité, un vrai respect mutuel s'est installé avec ${rivalName}.`);
        player.flags.rivalryRespectLogged = true;
      }
    }
  }
  if (delta.teammatesDelta && teammates) {
    // Patron / Train de sprint / Relais / Capitaine naturel renforcent l'effet de tout événement d'équipe.
    const teamBonusFactor = 1 + SkillEngine.teammatesBonus(player) / 100;
    Object.entries(delta.teammatesDelta).forEach(([k, v]) => {
      const boosted = v > 0 ? Math.round(v * teamBonusFactor) : v;
      teammates.forEach((tm) => { if (tm[k] !== undefined) tm[k] = clamp(tm[k] + boosted); });
    });
  }
  // Contrairement à teammatesDelta (effet groupé sur tout le monde), celui-ci cible UN équipier nommé —
  // utilisé quand un équipier précis vient t'aider en course et y laisse de sa fraîcheur personnelle.
  if (delta.teammateAssistDelta && teammates) {
    const { name, fraicheurDelta } = delta.teammateAssistDelta;
    teammates = teammates.map((tm) => (tm.name === name ? { ...tm, fraicheur: clamp((tm.fraicheur ?? 100) + fraicheurDelta) } : tm));
  }
  // Ferme la boucle entre un service rendu à un leader NOMMÉ et sa fidélité envers toi spécifiquement —
  // distinct de relationEquipe (confiance globale de l'encadrement), qui reste inchangée par ce delta.
  if (delta.teammateLoyaltyDelta && teammates) {
    const { name, loyauteDelta } = delta.teammateLoyaltyDelta;
    teammates = teammates.map((tm) => (tm.name === name ? { ...tm, loyaute: clamp((tm.loyaute ?? 70) + loyauteDelta) } : tm));
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

  return { ...game, player, rivalRelation, teammates, sponsor, peloton, seasonMajorResults, tacticalBonus, talentCharges, effortAccum, raceState, recentResultTiers, seasonBonusSkillPoints, currentGT };
}

/* ============================== DILEMMES NARRATIFS ============================== */
const EVENTS = [
  /* ---- JUNIOR (16-18) ---- */
  { id: "j1", block: "junior",
    text: (g) => { const rival = getRival(g); return `Ton club amateur t'inscrit à une course régionale importante. Le sélectionneur régional sera présent dans les tribunes.${rival ? ` ${rival.name} y court aussi — déjà un nom qui revient souvent dans les résultats de ta catégorie.` : ""}`; },
    choices: [
      { label: "Tout donner dès le départ", resolve: () => ({ text: "Tu pars trop fort et craques dans le final, mais on remarque ton culot.", delta: { forme: -5, reputation: 4, fatigue: 8, rival: { respect: 2 } } }) },
      { label: "Courir intelligemment, économiser ses forces", resolve: () => ({ text: "Tu places ton effort au bon moment et termines dans le groupe de tête.", delta: { forme: -2, reputation: 6, fatigue: 4, rival: { respect: 1 } } }) },
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
  { id: "j9p", block: "junior", text: "Une petite course locale enchaîne les relances sur des côtes courtes et sèches. Là où les autres peinent à répéter les efforts, toi, tu recommences encore et encore.",
    choices: [
      { label: "Placer une attaque sur chaque bosse", resolve: () => ({ text: "Tu découvres que l'explosivité répétée sur du court est vraiment ton truc — un profil de puncheur qui ne demande qu'à s'affirmer.", delta: { specialtyDeltas: { puncheur: 5 }, fatigue: 5 } }) },
      { label: "Garder un rythme constant, sans relancer", resolve: () => ({ text: "Tu roules à ton rythme, sans chercher à tester ces changements d'allure répétés.", delta: { fatigue: 2 } }) },
    ] },
  { id: "j10", block: "junior",
    text: (g) => { const rival = getRival(g); return `Le championnat national junior approche. C'est la course la plus regardée de ta catégorie d'âge.${rival ? ` ${rival.name} sera sur la ligne de départ — l'occasion rêvée de vraiment se mesurer à lui.` : ""}`; },
    choices: [
      { label: "Viser le maillot à tout prix", resolve: (g) => { const rival = getRival(g); return { text: `Tu joues le tout pour le tout devant tout le pays${rival ? `, avec ${rival.name} dans le viseur` : ""} — un souvenir marquant, quel que soit le résultat.`, delta: { reputation: 9, fatigue: 8, forme: -3, rival: { haine: 3, respect: 2 } } }; } },
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
      { label: "Rester les pieds sur terre malgré la nouvelle", resolve: () => ({ text: "Tu prends cette révélation avec calme — un potentiel brut ne remplace jamais le travail, mais c'est un sacré atout pour la suite.", delta: { specialtyDeltas: { montagne: 6, sprint: 6, clm: 6, pave: 6, puncheur: 6 }, flags: { geneticsRolled: true, giftedGenetics: true } } }) },
      { label: "En faire désormais ton objectif de vie", resolve: () => ({ text: "Cette révélation change ta façon de voir ta trajectoire — tu vises désormais plus haut que jamais.", delta: { specialtyDeltas: { montagne: 6, sprint: 6, clm: 6, pave: 6, puncheur: 6 }, reputation: 4, flags: { geneticsRolled: true, giftedGenetics: true } } }) },
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
  { id: "pro1", block: "passage_pro",
    text: (g) => {
      const byOrigin = {
        rural: "Une équipe continentale te propose un contrat de développement — après des années à te battre avec peu de moyens, la porte du monde professionnel s'entrouvre enfin.",
        academie: "Une équipe WorldTour souhaite t'intégrer à son programme de jeunes — la suite logique de ton parcours en académie, mais avec elle vient tout de suite l'exigence du plus haut niveau.",
        autodidacte: "Un recruteur t'a repéré après une performance inattendue — personne ne t'avait vu venir, mais quelque chose dans ta façon de courir a suffi à convaincre.",
      };
      return byOrigin[g.player.origin] || "Tes performances en junior/espoir attirent l'attention. Des équipes te font une offre.";
    },
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
  { id: "f2", block: "fin",
    // Tant qu'un contrat pluriannuel court encore, le mercato ne s'ouvre pas pour toi cette saison-là —
    // une vraie signature de plusieurs saisons doit se ressentir comme un engagement, pas une formalité.
    condition: (g) => !(g.player.contract && g.player.contract.yearsRemaining > 0),
    text: "Fin août : ton contrat arrive à échéance. Le mercato cycliste s'ouvre.",
    choices: (g) => {
      const level = g.player.team.level;
      const rep = g.player.reputation.peloton;
      // Le niveau EFFECTIF d'une équipe (après une éventuelle promotion/relégation en cours de saison)
      // peut différer de son niveau de création — on recalcule donc les pools à la volée.
      const teamsAtLevel = (lvl) => ALL_TEAMS.map((t) => resolveTeam(g, t)).filter((t) => t.level === lvl);
      // Une équipe ne prolonge pas indéfiniment un coureur dont la réputation s'est trop effondrée — une
      // vraie conséquence d'un fort déclin, pas juste un décor. Mais JAMAIS de blocage : une équipe de
      // niveau inférieur reste toujours prête à t'accueillir, à des conditions plus modestes.
      const currentTeamWantsYou = rep >= 28;
      const base = [];
      if (currentTeamWantsYou) {
        base.push({ label: "Prolonger dans ton équipe actuelle, sans clause particulière", resolve: () => ({ text: "La continuité rassure le staff, sans forcément faire progresser ton salaire.", delta: { relationEquipe: 6, contract: { teamId: g.player.team.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: false } } }) });
        base.push({ label: "Rester, mais négocier une clause de sortie facilitée", resolve: () => ({ text: "Tu acceptes de rester, mais t'assures de pouvoir partir plus facilement si une meilleure occasion se présente.", delta: { relationEquipe: 2, contract: { teamId: g.player.team.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: true } } }) });
      } else {
        const lowerLevel = level === TEAM_LEVELS.WT ? TEAM_LEVELS.PT : TEAM_LEVELS.CT;
        const lowerPool = teamsAtLevel(lowerLevel).filter((t) => t.id !== g.player.team.id);
        const fallbackTeam = lowerPool.length > 0 ? pick(lowerPool) : g.player.team;
        base.push({ label: `Ton équipe ne te prolonge pas — signer où tu peux (${fallbackTeam.name})`, resolve: () => ({ text: `Ton équipe ne te fait pas de nouvelle offre — ta réputation ne pesait plus assez lourd cette saison. ${fallbackTeam.name} accepte de te prendre, mais à des conditions bien plus modestes.`, delta: { relationEquipe: -3, teamUpgrade: fallbackTeam, contract: { teamId: fallbackTeam.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: true } } }) });
        base.push({ label: "Tenter de convaincre ton équipe de te garder quand même", resolve: () => {
            const success = Math.random() < 0.25;
            if (success) return { text: "Ton insistance et ta connaissance de la maison finissent par payer — le staff te garde, à contrecœur.", delta: { relationEquipe: -2, contract: { teamId: g.player.team.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: false } } };
            return { text: "Malgré tes efforts, la décision est actée — il est temps de repartir ailleurs.", delta: { relationEquipe: -5, teamUpgrade: fallbackTeam, contract: { teamId: fallbackTeam.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: true } } };
          } });
      }
      let upgradePool = null, upgradeLabel = "";
      if (level === TEAM_LEVELS.CT && g.player.reputation.peloton >= 40) { upgradePool = teamsAtLevel(TEAM_LEVELS.PT); upgradeLabel = "ProTeam"; }
      else if (level === TEAM_LEVELS.PT && g.player.reputation.peloton >= 60) { upgradePool = teamsAtLevel(TEAM_LEVELS.WT); upgradeLabel = "WorldTour"; }
      if (upgradePool && upgradePool.length > 0) {
        const bigTeam = pick(upgradePool);
        const modestPool = teamsAtLevel(level).filter((t) => t.id !== g.player.team.id);
        const modestTeam = modestPool.length > 0 ? pick(modestPool) : g.player.team;
        base.push({ label: `${bigTeam.name} (${upgradeLabel}) — contrat longue durée (3 ans), rôle d'équipier`, resolve: () => ({ text: `${bigTeam.name} t'offre la sécurité d'un contrat de 3 saisons — en tant qu'équipier au service de leaders déjà installés. Le tremplin idéal vers les Grands Tours, sans garantie de résultats personnels, mais sans avoir à repasser par le mercato avant un moment.`, delta: { reputation: 4, money: 15000, teamUpgrade: bigTeam, contract: { teamId: bigTeam.id, yearsRemaining: 3, winBonusMultiplier: 1, exitClauseFlexible: false } } }) });
        base.push({ label: `${bigTeam.name} (${upgradeLabel}) — prime de victoire élevée, sans garantie de rôle`, resolve: () => ({ text: `${bigTeam.name} te propose un contrat plus court (1 saison), sans garantie de rôle mais avec une prime de victoire nettement plus généreuse — à toi de faire tes preuves.`, delta: { reputation: 3, teamUpgrade: bigTeam, contract: { teamId: bigTeam.id, yearsRemaining: 1, winBonusMultiplier: 1.6, exitClauseFlexible: true } } }) });
        base.push({ label: `${modestTeam.name} — leadership garanti (1 an)`, resolve: () => ({ text: `${modestTeam.name} t'offre moins de prestige, mais un rôle de leader garanti et un calendrier construit autour de toi.`, delta: { reputation: 2, relationEquipe: 5, teamUpgrade: modestTeam, flags: { leadershipGuarantee: true }, contract: { teamId: modestTeam.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: false } } }) });
        // Un vrai pari de négociation — jamais accessible sans qu'au moins une offre de promotion existe
        // déjà (il faut un vrai rapport de force pour pouvoir se permettre de tout refuser). Plus la
        // réputation est haute, plus le pari est sûr, mais un échec ne laisse jamais le joueur sans
        // équipe : il retombe simplement sur un contrat plus modeste dans son équipe actuelle.
        base.push({ label: "Décliner toutes ces offres, tenter d'obtenir mieux", resolve: (g2) => {
            const rep = g2.player.reputation.peloton;
            const successChance = clamp01(0.3 + (rep - 60) * 0.01, 0.1, 0.75);
            const success = Math.random() < successChance;
            if (success) {
              return { text: `Ton audace paie : ${bigTeam.name} revient avec une offre bien plus généreuse, impressionnée par ta confiance en toi.`, delta: { reputation: 6, money: 10000, teamUpgrade: bigTeam, flags: { leadershipGuarantee: true }, contract: { teamId: bigTeam.id, yearsRemaining: 2, winBonusMultiplier: 1.3, exitClauseFlexible: true } } };
            }
            return { text: "Le marché se referme plus vite que prévu — tu dois finalement accepter, dans l'urgence, un contrat plus modeste que prévu dans ton équipe actuelle.", delta: { relationEquipe: -4, reputation: -2, contract: { teamId: g2.player.team.id, yearsRemaining: 1, winBonusMultiplier: 1, exitClauseFlexible: false } } };
          } });
      } else if (currentTeamWantsYou) {
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
function finishChoices(specKey, raceName, extra = {}, isStageRace = false, nationalOnly = false) {
  function majorResultFor(o) {
    if (!MAJOR_RACE_NAMES.has(raceName) || !o.classification || !o.classification[0]) return undefined;
    const w = o.classification[0];
    return { raceName, winner: { id: w.id, name: w.name, nation: w.nation } };
  }
  function withJerseys(o, g, baseText) {
    // Une course à étapes requalifie une victoire en classement général — on le fait maintenant sur le
    // champ structuré resultType, plus jamais en trafiquant le texte affiché après coup.
    const gcPalmares = (o.palmares || []).map((entry) => (isStageRace && entry.resultType === "victoire" ? buildPalmaresEntry(raceName, "victoire_gc") : entry));
    if (!isStageRace) return { text: baseText, palmares: gcPalmares, uciPoints: o.uciPoints || 0 };
    const j = applyStageRaceJerseys(g, raceName, baseText);
    return { text: j.text, palmares: [...gcPalmares, ...j.palmares], uciPoints: (o.uciPoints || 0) + j.uciPoints };
  }
  // Rôle Équipier pur (pas Carte secondaire, pas Co-leader) : tu ne joues pas ta propre carte aujourd'hui,
  // donc l'arrivée ne doit pas résoudre TON résultat individuel — elle doit montrer ce que devient TON
  // LEADER, la vraie conséquence visible d'avoir bien (ou mal) fait ton travail de soutien.
  function domestiqueFinishOutcome(g, allIn) {
    const leaderLevel = (g.raceState?.leaderLevel || 60) + (allIn ? 4 : 0);
    const leaderName = g.raceState?.leaderName || "ton leader";
    const roll = rand(0, 100) + (leaderLevel - 60);
    const tier = roll >= 85 ? "victoire" : roll >= 62 ? "podium" : roll >= 38 ? "top10" : "anonyme";
    const texts = {
      victoire: `Grâce à un travail collectif payant, ${leaderName} lève les bras à l'arrivée sur ${raceName} !`,
      podium: `${leaderName} monte sur le podium de ${raceName} — ton travail en amont y est pour beaucoup.`,
      top10: `${leaderName} termine dans le top 10 de ${raceName}, une course sans éclat particulier pour l'équipe.`,
      anonyme: `Malgré tes efforts, ${leaderName} ne parvient pas à se montrer aujourd'hui sur ${raceName}.`,
    };
    const relDelta = { victoire: 6, podium: 4, top10: 1, anonyme: -1 }[tier];
    const repDelta = { victoire: 3, podium: 2, top10: 0, anonyme: 0 }[tier];
    // Fidélité du leader envers TOI spécifiquement — distincte de relationEquipe (confiance globale de
    // l'encadrement). Seules les issues positives la font progresser : un coup dur n'est pas forcément ta
    // faute, inutile de punir le joueur en plus du malus de relation équipe déjà appliqué.
    const loyauteDelta = { victoire: 8, podium: 4, top10: 0, anonyme: 0 }[tier];
    return { text: texts[tier], delta: { forme: allIn ? -5 : -2, fatigue: allIn ? 11 : 6, relationEquipe: relDelta, reputation: repDelta, teammatesDelta: (tier === "victoire" || tier === "podium") ? { moral: 3 } : {}, ...(loyauteDelta > 0 && g.raceState?.leaderName ? { teammateLoyaltyDelta: { name: g.raceState.leaderName, loyauteDelta } } : {}), leaderWinContributed: tier === "victoire", ...extra } };
  }
  return [
    { label: "Attaquer pour la victoire", resolve: (g) => {
        if (g.raceState?.role === RACE_ROLES.DOMESTIQUE) return domestiqueFinishOutcome(g, true);
        const o = raceOutcomeVsRival(g, specKey, raceName, nationalOnly);
        const r = withJerseys(o, g, o.text);
        return { text: r.text, classification: o.classification, playerPosition: o.playerPosition, fieldSize: o.fieldSize, delta: { forme: o.forme, fatigue: o.fatigue, reputation: o.reputation, palmares: r.palmares, rival: o.rivalDelta, uciPoints: r.uciPoints, pelotonPoints: o.pelotonPoints, majorResult: majorResultFor(o), resultTier: o.tier, ...extra } };
      } },
    { label: "Gérer ton effort, viser un résultat solide", resolve: (g) => {
        if (g.raceState?.role === RACE_ROLES.DOMESTIQUE) return domestiqueFinishOutcome(g, false);
        const o = raceOutcomeVsRival(g, specKey, raceName, nationalOnly);
        const r = withJerseys(o, g, o.text);
        return { text: r.text, classification: o.classification, playerPosition: o.playerPosition, fieldSize: o.fieldSize, delta: { forme: o.forme + 3, fatigue: o.fatigue - 3, reputation: Math.round(o.reputation * 0.7), palmares: r.palmares, rival: o.rivalDelta, uciPoints: r.uciPoints, pelotonPoints: o.pelotonPoints, majorResult: majorResultFor(o), resultTier: o.tier, ...extra } };
      } },
  ];
}

// Génère une course "standard" à 2 étapes (moins de narration sur-mesure que les Monuments, mais un vrai
// calcul de performance et un vrai enjeu). Utilisé pour étoffer massivement le calendrier ProSeries/Continental.
function genericRace(id, name, month, fit, specKey, raceTier, tacticalText, isStageRace = false, archetypes = null) {
  return {
    id, name, month, fit, specKey, raceTier, isStageRace, ...(archetypes ? { archetypes } : {}),
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
// Championnat national : une course à part, disputée face aux meilleurs compatriotes, ouverte à tous les niveaux
// d'équipe. Généré dynamiquement car son nom dépend de la nationalité du joueur.
function buildNationalChampionship(player) {
  const specMap = { grimpeur: "montagne", puncheur: "puncheur", sprinteur: "sprint", rouleur: "clm", polyvalent: "montagne" };
  const specKey = specMap[player.specialtyPrimary] || "montagne";
  const raceName = `Championnat de ${player.nation.label} sur route`;
  return {
    id: "national_champs", name: raceName, month: "Juin", week: 26, raceTier: "National", archetypes: ["tactique"],
    stages: [
      { phase: "Face aux meilleurs compatriotes", text: (g) => `Le maillot de champion national se joue aujourd'hui, face à l'élite de ${g.player.nation.label}.${raceContextLine(g, raceName)}`,
        choices: [
          { label: "Prendre la course à ton compte", resolve: () => ({ text: "Tu assumes le rôle de favori face à tes compatriotes.", delta: { fatigue: 4 } }) },
          { label: "Rester discret, attendre le final", resolve: () => ({ text: "Tu laisses les autres animer la course avant de te positionner.", delta: { fatigue: 1 } }) },
        ] },
      { phase: "Ligne d'arrivée", text: "Le maillot distinctif de champion national attend le vainqueur.", choices: finishChoices(specKey, raceName, {}, false, true) },
    ],
  };
}

const CLASSICS = [
  { id: "omloop", name: "Omloop Het Nieuwsblad", month: "Février", fit: ["rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "pave", raceTier: "WT", archetypes: ["paves"],
    stages: [
      { phase: "Les monts flandriens en ouverture", text: "Premier vrai test de la saison sur les pavés et les monts de Flandre-Occidentale. Le froid mord, le rythme est déjà élevé.",
        choices: [
          { label: "Te montrer offensif d'entrée", resolve: () => ({ text: "Tu montres tes jambes dès l'ouverture de saison, jambes lourdes mais présentes.", delta: { fatigue: 5, rival: { haine: 3 } } }) },
          { label: "Prendre la mesure de la course", resolve: () => ({ text: "Tu observes, encore un peu rouillé après la trêve hivernale.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Arrivée à Ninove", text: "Les derniers secteurs pavés avant l'arrivée décideront de cette première classique de la saison.", choices: finishChoices("pave", "Omloop Het Nieuwsblad") },
    ] },

  { id: "strade-bianche", name: "Strade Bianche", month: "Mars", fit: ["puncheur", "grimpeur", "rouleur", "polyvalent"], specKey: "pave", raceTier: "WT", archetypes: ["paves"], keepOwnFinish: true,
    terrainProfile: { pave: 70, puncheur: 60, montagne: 25 },
    stages: [
      { phase: "Les premiers secteurs blancs", text: (g) => `La poussière blanche des strade bianche toscanes se soulève déjà. ${getRival(g).name} place une première accélération sur un secteur de gravier étroit, où la moindre erreur de trajectoire coûte cher.${raceContextLine(g, "Strade Bianche")}`,
        choices: [
          { label: "Te battre pour rester devant, quitte à t'épuiser", resolve: () => ({ text: "Tu te bats pour la tête de course sur le gravier, là où les chutes et crevaisons se font plus rares.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
          { label: "Gérer en seconde ligne, économiser tes forces", resolve: () => ({ text: "Tu roules à l'abri du peloton, prêt à réagir plus tard sur les secteurs décisifs.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Montée vers la Piazza del Campo", text: "Après des kilomètres de gravier, la toute dernière montée bascule brutalement sur le pavé du centre historique de Sienne, raide et sinueuse, jusqu'au cœur de la ville — l'une des arrivées les plus spectaculaires et redoutées du calendrier.", choices: finishChoices("pave", "Strade Bianche") },
    ] },

  { id: "paris-nice", name: "Paris-Nice", month: "Mars", fit: ["grimpeur", "rouleur", "sprinteur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true, archetypes: ["tactique"],
    stages: [
      buildTeamTTTStage("Étape 1 — Contre-la-montre par équipes"),
      { phase: "La Course au Soleil", text: "Une semaine pour relier Paris à Nice, entre étapes de plaine et arrivée en altitude.",
        choices: [
          { label: "Attaquer sur les étapes vallonnées", resolve: () => ({ text: "Tu grappilles des secondes sur les étapes intermédiaires.", delta: { fatigue: 5 } }) },
          { label: "Économiser tes forces pour la dernière étape", resolve: () => ({ text: "Tu patientes, prêt à jouer ta carte au meilleur moment.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Étape reine, col d'Èze", text: "La dernière étape, vers Nice, tranche généralement le classement général.", choices: finishChoices("montagne", "Paris-Nice", {}, true) },
    ] },
  { id: "tirreno", name: "Tirreno-Adriatico", month: "Mars", fit: ["grimpeur", "rouleur", "sprinteur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true, archetypes: ["tactique"],
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

  { id: "e3-harelbeke", name: "E3 Saxo Classic", month: "Mars", fit: ["puncheur", "rouleur", "polyvalent"], specKey: "pave", raceTier: "WT", archetypes: ["paves"],
    terrainProfile: { pave: 70, puncheur: 60, montagne: 20 },
    stages: [
      { phase: "Le Taaienberg", text: (g) => `Les hellingen flamandes s'enchaînent déjà, bien avant l'arrivée à Harelbeke. Sur le Taaienberg, ${getRival(g).name} place une première sélection qui fait déjà mal aux jambes.${raceContextLine(g, "E3 Saxo Classic")}`,
        choices: [
          { label: "Répondre immédiatement, rester dans le groupe de tête", resolve: () => ({ text: "Tu réponds présent sur le Taaienberg, au prix d'un effort sec et douloureux.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
          { label: "Laisser la sélection se faire, revenir ensuite", resolve: () => ({ text: "Tu laisses filer la première salve, comptant sur ta régularité pour revenir plus tard.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Vieux Quaremont — Paterberg", text: "Le double passage Vieux Quaremont puis Paterberg, répétition générale du Tour des Flandres une semaine plus tard, décide traditionnellement de la course.", choices: finishChoices("pave", "E3 Saxo Classic") },
    ] },

  { id: "flandres", name: "Tour des Flandres", month: "Avril", fit: ["puncheur", "rouleur", "sprinteur", "polyvalent"], specKey: "pave", raceTier: "WT", archetypes: ["paves"],
    stages: [
      { phase: "Le Mur de Grammont", text: (g) => `Les monts flandriens s'enchaînent. ${getRival(g).name} place une première attaque sur les pavés en pente.${raceContextLine(g, "Tour des Flandres")}`,
        choices: [
          { label: "Forcer l'allure dans le mur", resolve: () => ({ text: "Tu passes en force, jambes lourdes mais toujours devant.", delta: { fatigue: 6 } }) },
          { label: "Te faufiler dans les roues", resolve: () => ({ text: "Tu économises un peu d'énergie en te faufilant intelligemment.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "Le Vieux Quaremont, final", text: "Dernier passage sur les pavés emblématiques avant l'arrivée à Audenarde.", choices: finishChoices("pave", "Tour des Flandres") },
    ] },
  { id: "roubaix", name: "Paris-Roubaix", month: "Avril", fit: ["rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "pave", raceTier: "WT", archetypes: ["paves"],
    stages: [
      { phase: "La tranchée d'Arenberg", text: (g) => `Le secteur le plus redouté de la course. Une chute générale se produit devant toi.${raceContextLine(g, "Paris-Roubaix")}`,
        choices: [
          { label: "Freiner et contourner", resolve: () => ({ text: "Tu évites la chute mais perds du temps précieux.", delta: { forme: -2 } }) },
          { label: "Prendre le risque de passer par le bas-côté", resolve: () => ({ text: "Un pari payant : tu restes dans le bon wagon !", delta: { reputation: 4, fatigue: 4 } }) },
        ] },
      { phase: "Le vélodrome de Roubaix", text: "L'arrivée légendaire sur la piste du vélodrome.", choices: finishChoices("pave", "Paris-Roubaix") },
    ] },

  { id: "brabancon", name: "Flèche Brabançonne", month: "Avril", fit: ["puncheur", "grimpeur", "polyvalent"], specKey: "puncheur", raceTier: "Pro", archetypes: ["vallonnee"],
    terrainProfile: { puncheur: 80, montagne: 30 },
    stages: [
      { phase: "Les côtes du Brabant flamand", text: (g) => `Entre les pavés qui viennent de se taire et les ardennaises qui approchent, le Brabant flamand impose son propre style — des côtes courtes et sèches, enchaînées sans répit. ${getRival(g).name} teste déjà le rythme sur la Moskesstraat.${raceContextLine(g, "Flèche Brabançonne")}`,
        choices: [
          { label: "Suivre chaque accélération, sans rien laisser filer", resolve: () => ({ text: "Tu colles à chaque relance, refusant de laisser la course s'échapper sans toi.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
          { label: "Rester dans le peloton, économiser tes forces", resolve: () => ({ text: "Tu laisses les autres s'épuiser, comptant sur ta fraîcheur dans le final.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "La descente vers Overijse", text: "Le final, technique et nerveux, plonge vers l'arrivée d'Overijse — une transition parfaite entre les classiques flandriennes et les ardennaises à venir.", choices: finishChoices("puncheur", "Flèche Brabançonne") },
    ] },

  { id: "amstel", name: "Amstel Gold Race", month: "Avril", fit: ["grimpeur", "puncheur", "rouleur", "polyvalent"], specKey: "puncheur", raceTier: "WT", archetypes: ["vallonnee"], keepOwnFinish: true,
    terrainProfile: { puncheur: 85, montagne: 40, sprint: 25 },
    stages: [
      { phase: "Les côtes du Limbourg", text: "Une trentaine de côtes courtes s'enchaînent dans les collines néerlandaises, usant les organismes.",
        choices: [
          { label: "Placer une attaque à mi-course", resolve: () => ({ text: "Tu testes le peloton, sans forcément faire la différence tout de suite.", delta: { fatigue: 5 } }) },
          { label: "Rester econome jusqu'au Cauberg", resolve: () => ({ text: "Tu gardes tes forces pour la dernière difficulté.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Le Cauberg, juge de paix", text: "La dernière ascension du Cauberg décide traditionnellement de la course.", choices: finishChoices("puncheur", "Amstel Gold Race") },
    ] },
  { id: "fleche", name: "Flèche Wallonne", month: "Avril", fit: ["puncheur", "grimpeur", "polyvalent"], specKey: "puncheur", raceTier: "WT", archetypes: ["vallonnee"], keepOwnFinish: true,
    terrainProfile: { puncheur: 90, montagne: 45, sprint: 20 },
    stages: [
      { phase: "Approche du Mur de Huy", text: "La course se resserre à l'approche de la triple ascension du Mur de Huy.",
        choices: [
          { label: "Te positionner en tête avant la dernière ascension", resolve: () => ({ text: "Tu te bats pour une place idéale dans le peloton compressé.", delta: { fatigue: 4 } }) },
          { label: "Rester au calme, économiser tes jambes", resolve: () => ({ text: "Tu restes patient avant l'explication finale.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Le Mur de Huy, dernière rampe", text: "Les pentes à plus de 20% du Mur de Huy ne pardonnent aucune erreur de jugement.", choices: finishChoices("puncheur", "Flèche Wallonne") },
    ] },
  { id: "lbl", name: "Liège-Bastogne-Liège", month: "Avril", fit: ["grimpeur", "puncheur", "polyvalent"], specKey: "puncheur", raceTier: "WT", archetypes: ["vallonnee"], keepOwnFinish: true,
    terrainProfile: { puncheur: 75, montagne: 65, sprint: 15 },
    stages: [
      { phase: "La Côte de la Redoute", text: (g) => `La pente s'élève brutalement. ${getRival(g).name} sort les crocs en tête du groupe des favoris.${raceContextLine(g, "Liège-Bastogne-Liège")}`,
        choices: [
          { label: "Suivre les meilleurs sans faiblir", resolve: () => ({ text: "Tu tiens le rythme des favoris, au prix d'un effort colossal.", delta: { fatigue: 6 } }) },
          { label: "Laisser filer, revenir plus tard", resolve: () => ({ text: "Tu limites la casse en gérant ton effort.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "La Côte de la Roche-aux-Faucons", text: "La dernière difficulté avant Liège décidera de la course.", choices: finishChoices("puncheur", "Liège-Bastogne-Liège") },
    ] },

  { id: "tro-bro-leon", name: "Tro Bro Léon", month: "Mai", fit: ["rouleur", "puncheur", "polyvalent"], specKey: "pave", raceTier: "Pro", archetypes: ["paves"], keepOwnFinish: true,
    terrainProfile: { pave: 75, puncheur: 40 },
    stages: [
      { phase: "Les premiers ribinoù", text: (g) => `Le Finistère breton dévoile ses fameux "ribinoù", ces chemins de terre étroits et cabossés qui font toute la réputation de la course. ${getRival(g).name} se faufile en tête pour aborder le premier d'entre eux en position.${raceContextLine(g, "Tro Bro Léon")}`,
        choices: [
          { label: "Te battre pour entrer en tête sur le ribin", resolve: () => ({ text: "Tu te bats pour la bonne position — sur ces chemins étroits, être devant change tout.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
          { label: "Rester prudent, éviter la bousculade", resolve: () => ({ text: "Tu laisses la bagarre se faire devant, préférant limiter les risques de chute ou de crevaison.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Le Circuit du Cochonou", text: "Le final multiplie les changements de rythme sur les derniers chemins de terre, dans une ambiance rurale et festive unique au calendrier.", choices: finishChoices("pave", "Tro Bro Léon") },
    ] },

  { id: "romandie", name: "Tour de Romandie", month: "Avril", fit: ["grimpeur", "rouleur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true, archetypes: ["tactique"],
    terrainProfile: { montagne: 65, puncheur: 35, sprint: 20 },
    stages: [
      { phase: "Contre-la-montre au bord du lac Léman", text: (g) => `Le chrono initial du Tour de Romandie donne le ton pour toute la semaine — un exercice solitaire, sans coéquipier pour t'aider.${raceContextLine(g, "Tour de Romandie")}`,
        choices: [
          { label: "Partir à fond dès le premier kilomètre", resolve: () => ({ text: "Tu attaques le chrono sans calcul, quitte à payer la note dans les derniers hectomètres.", delta: { fatigue: 5, tacticalBonus: 5 } }) },
          { label: "Gérer ton effort sur la durée", resolve: () => ({ text: "Tu répartis ton effort intelligemment, sans jamais entrer dans le rouge.", delta: { fatigue: 2, tacticalBonus: 2 } }) },
        ] },
      { phase: "L'étape reine dans les Alpes vaudoises", text: "La dernière grande étape de montagne, avec une arrivée en altitude, décide traditionnellement du classement général — et sert de répétition avant les grands tours de l'été.", choices: finishChoices("montagne", "Tour de Romandie", {}, true) },
    ] },

  // ---- ProSeries (niveau 2, calendrier UCI ProSeries 2026) ----
  genericRace("laigueglia", "Trofeo Laigueglia", "Février", ["grimpeur", "puncheur", "polyvalent"], "puncheur", "Pro", "La classique ligure ouvre la saison des puncheurs sur les hauteurs de la Riviera.", false, ["vallonnee"]),
  genericRace("nokere", "Danilith Nokere Koerse", "Mars", ["rouleur", "puncheur", "sprinteur", "polyvalent"], "pave", "Pro", "Les pavés flandriens s'invitent tôt dans la saison, sur un parcours court et nerveux.", false, ["paves"]),
  genericRace("milano-torino", "Milano-Torino", "Mars", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Pro", "La plus vieille classique du calendrier italien se termine par une ascension décisive.", false, ["classique"]),
  genericRace("denain", "Grand Prix de Denain", "Mars", ["rouleur", "sprinteur", "puncheur", "polyvalent"], "pave", "Pro", "Une classique pavée du Nord, réputée pour son exigence malgré sa courte distance.", false, ["paves"]),
  genericRace("scheldeprijs", "Scheldeprijs", "Avril", ["sprinteur", "rouleur", "polyvalent"], "sprint", "Pro", "La \"classique des sprinteurs\" traverse la Flandre avant un sprint massif à Schoten.", false, ["sprint"]),

  // ---- Continental (niveau 3, courses 1.1/1.2/2.1 — calendrier 2026 réel) ----
  genericRace("palma", "Trofeo Palma", "Février", ["sprinteur", "puncheur", "rouleur", "polyvalent"], "sprint", "Continental", "Le traditionnel lever de rideau de la saison à Majorque, souvent promis à un sprint.", false, ["sprint"]),
  genericRace("bessges", "Étoile de Bessèges", "Février", ["grimpeur", "rouleur", "puncheur", "polyvalent"], "puncheur", "Continental", "Une course par étapes gardoise qui sert de test de forme hivernal à tout le peloton continental.", true, ["vallonnee"]),
  genericRace("antalya", "Grand Prix Antalya", "Février", ["sprinteur", "rouleur", "polyvalent"], "sprint", "Continental", "Une classique turque roulante, généralement décidée au sprint.", false, ["sprint"]),
  genericRace("provence", "Tour de la Provence", "Février", ["grimpeur", "rouleur", "puncheur", "polyvalent"], "puncheur", "Continental", "Une course par étapes provençale avec une arrivée en altitude décisive.", true, ["vallonnee"]),
  genericRace("jaen", "Clásica Jaén", "Février", ["puncheur", "grimpeur", "polyvalent"], "puncheur", "Continental", "Une classique andalouse aux monts courts et répétés, taillée pour les puncheurs.", false, ["vallonnee"]),
  genericRace("var", "Classic Var", "Février", ["puncheur", "rouleur", "sprinteur", "polyvalent"], "puncheur", "Continental", "Une classique varoise vallonnée, disputée tôt dans la saison méditerranéenne.", false, ["vallonnee"]),
  genericRace("alpes-maritimes", "Tour des Alpes-Maritimes", "Février", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Continental", "Un parcours accidenté dans l'arrière-pays niçois, propice aux baroudeurs.", false, ["classique"]),
  genericRace("sardegna", "Giro di Sardegna", "Février", ["sprinteur", "rouleur", "puncheur", "polyvalent"], "montagne", "Continental", "Une course par étapes sarde qui alterne étapes de plaine et arrivées vallonnées.", true, ["accidentee"]),
  genericRace("san-sebastian", "Klasikoa San Sebastián", "Août", ["grimpeur", "puncheur", "polyvalent"], "montagne", "WT", "La grande classique basque, disputée sur des routes vallonnées et souvent sous la pluie, juste après le Tour de France.", false, ["montagne"]),
  genericRace("burgos", "Vuelta a Burgos", "Août", ["grimpeur", "rouleur", "puncheur", "polyvalent"], "montagne", "Pro", "Une course par étapes exigeante dans le nord de l'Espagne, prisée pour se relancer après le Tour de France.", true, ["accidentee"]),
  genericRace("pologne", "Tour de Pologne", "Août", ["sprinteur", "rouleur", "puncheur", "polyvalent"], "sprint", "WT", "Le grand rendez-vous du calendrier polonais, entre étapes roulantes et quelques difficultés vallonnées.", true, ["accidentee"]),

  { id: "bretagne-classic", name: "Bretagne Classic", month: "Août", fit: ["puncheur", "grimpeur", "polyvalent"], specKey: "puncheur", raceTier: "WT", archetypes: ["vallonnee"],
    terrainProfile: { puncheur: 75, montagne: 35 },
    stages: [
      { phase: "Les monts du pays de Lorient", text: (g) => `La campagne bretonne enchaîne les côtes courtes et sèches, sous un vent qui ne faiblit jamais vraiment. ${getRival(g).name} teste le rythme dans une bosse mal placée, à contre-pied du peloton.${raceContextLine(g, "Bretagne Classic")}`,
        choices: [
          { label: "Répondre présent, ne rien laisser filer", resolve: () => ({ text: "Tu réagis immédiatement, refusant de laisser la course se jouer sans toi.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
          { label: "Rester groupé, garder tes forces pour la fin", resolve: () => ({ text: "Tu laisses passer l'orage, confiant dans tes réserves pour le final.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Le final vallonné de Plouay", text: "Les derniers circuits autour de Plouay, disputés sur des routes étroites et bosselées, ne laissent aucun répit avant l'arrivée.", choices: finishChoices("puncheur", "Bretagne Classic") },
    ] },

  { id: "gp-quebec", name: "Grand Prix Cycliste de Québec", month: "Septembre", fit: ["puncheur", "grimpeur", "sprinteur", "polyvalent"], specKey: "puncheur", raceTier: "WT", archetypes: ["vallonnee"],
    terrainProfile: { puncheur: 80, sprint: 30 },
    stages: [
      { phase: "La Côte de la Montagne, encore et encore", text: (g) => `Les remparts du Vieux-Québec défilent, tour après tour, alors que le peloton s'use sur la Côte de la Montagne et la Grande Allée. ${getRival(g).name} place une accélération dans la pente, testant qui tient encore.${raceContextLine(g, "Grand Prix Cycliste de Québec")}`,
        choices: [
          { label: "Suivre chaque relance dans la côte", resolve: () => ({ text: "Tu colles à chaque accélération, tour après tour, refusant de perdre le fil de la course.", delta: { fatigue: 5, tacticalBonus: 4 } }) },
          { label: "Gérer ton effort sur la distance", resolve: () => ({ text: "Tu doses ton effort, conscient que la répétition des tours finira par payer.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Dernier passage devant le Château Frontenac", text: "Le peloton s'élance pour le dernier tour, avec la Côte de la Montagne à négocier une ultime fois avant la ligne.", choices: finishChoices("puncheur", "Grand Prix Cycliste de Québec") },
    ] },

  { id: "gp-montreal", name: "Grand Prix Cycliste de Montréal", month: "Septembre", fit: ["puncheur", "grimpeur", "polyvalent"], specKey: "puncheur", raceTier: "WT", archetypes: ["vallonnee"],
    terrainProfile: { puncheur: 82, montagne: 30 },
    stages: [
      { phase: "Le mont Royal, boucle après boucle", text: (g) => `Deux jours après Québec, le peloton retrouve les jambes lourdes pour affronter le mont Royal, gravi une dizaine de fois par la redoutée côte Camillien-Houde. ${getRival(g).name} sait que c'est là, et nulle part ailleurs, que la course se jouera.${raceContextLine(g, "Grand Prix Cycliste de Montréal")}`,
        choices: [
          { label: "Placer une attaque dans la Camillien-Houde", resolve: () => ({ text: "Tu tentes ta chance dans la montée la plus raide du circuit, quitte à devoir tout gérer ensuite.", delta: { fatigue: 6, tacticalBonus: 5 } }) },
          { label: "Économiser tes jambes pour les derniers tours", resolve: () => ({ text: "Tu résistes à la tentation d'attaquer trop tôt, gardant tes forces pour la fin.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Dernière ascension avant le centre-ville", text: "Le dernier passage au sommet du mont Royal, suivi d'une longue descente technique vers le centre-ville de Montréal, décide traditionnellement de la course.", choices: finishChoices("puncheur", "Grand Prix Cycliste de Montréal") },
    ] },
];

// Classiques d'automne (octobre) — un choix parmi ces trois courses, en plus d'Il Lombardia (automatique).
const AUTUMN_CLASSICS = [
  genericRace("emilia", "Giro dell'Emilia", "Octobre", ["grimpeur", "puncheur", "polyvalent"], "montagne", "Pro", "La montée répétée du Santuario di San Luca décide traditionnellement de la course.", false, ["accidentee"]),
  genericRace("varesine", "Tre Valli Varesine", "Octobre", ["puncheur", "grimpeur", "polyvalent"], "montagne", "Pro", "Un parcours vallonné et nerveux dans la région de Varèse, en clôture de saison italienne.", false, ["accidentee"]),
  { id: "paris-tours", name: "Paris-Tours", month: "Octobre", fit: ["sprinteur", "rouleur", "puncheur", "polyvalent"], specKey: "sprint", raceTier: "Pro", archetypes: ["sprint"],
    stages: [
      { phase: "Les chemins de vigne de Touraine", text: (g) => `Les vignobles de Touraine défilent, entrecoupés de plusieurs chemins de terre blanche qui secouent le peloton — un ajout récent au parcours qui a considérablement relevé le niveau d'exigence de cette classique longtemps réputée toute plate. ${getRival(g).name} se replace en tête avant d'aborder le premier chemin.${raceContextLine(g, "Paris-Tours")}`,
        choices: [
          { label: "Te placer en tête avant chaque chemin", resolve: () => ({ text: "Tu te bats pour rester bien placé à chaque passage, refusant de te faire surprendre.", delta: { fatigue: 5, tacticalBonus: 3 } }) },
          { label: "Rester groupé, économiser tes forces pour le sprint", resolve: () => ({ text: "Tu laisses la bagarre se faire devant, confiant dans tes jambes pour l'arrivée.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Ligne d'arrivée", text: `Derniers kilomètres de Paris-Tours, tout reste à jouer.`, choices: finishChoices("sprint", "Paris-Tours") },
    ] },
];

// Ouverture de saison (janvier-février) — un choix parmi ces deux courses selon le profil.
const EARLY_SEASON_RACES = [
  { id: "tdu", name: "Tour Down Under", month: "Janvier", fit: ["sprinteur", "rouleur", "puncheur", "polyvalent"], specKey: "sprint", raceTier: "WT", isStageRace: true, archetypes: ["sprint"],
    stages: [
      { phase: "Premières kermesses australiennes", text: "Le peloton retrouve la compétition sous le soleil d'Adelaide, dans une ambiance encore décontractée.",
        choices: [
          { label: "Se montrer déjà offensif", resolve: () => ({ text: "Tu forces un peu le rythme, histoire de tester tes jambes dès janvier.", delta: { fatigue: 4 } }) },
          { label: "Prendre la course comme un entraînement", resolve: () => ({ text: "Tu profites surtout de la mise en jambes collective.", delta: { fatigue: 1 } }) },
        ] },
      { phase: "Sprint final à Adelaide", text: "Le peloton se présente groupé pour la dernière étape.", choices: finishChoices("sprint", "Tour Down Under", {}, true) },
    ] },
  { id: "uae-tour", name: "UAE Tour", month: "Février", fit: ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true, archetypes: ["montagne"],
    stages: [
      { phase: "Entre désert et gratte-ciel", text: "La course par étapes émirienne alterne étapes de plaine balayées par le vent et arrivées en altitude.",
        choices: [
          { label: "Te placer en vue du général", resolve: () => ({ text: "Tu te mêles à la bagarre pour le classement général dès le début de saison.", delta: { fatigue: 5 } }) },
          { label: "Utiliser la course pour monter en forme", resolve: () => ({ text: "Tu roules pour construire ta condition, sans te mettre en danger.", delta: { fatigue: 2 } }) },
        ] },
      { phase: "Arrivée au sommet de Jebel Hafeet", text: "La dernière ascension décide traditionnellement du classement général.", choices: finishChoices("montagne", "UAE Tour", {}, true) },
    ] },
];

// Préparation estivale (juin) — un choix parmi ces deux courses avant le grand tour.
const SUMMER_PREP_RACES = [
  { id: "dauphine", name: "Critérium du Dauphiné", month: "Juin", fit: ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true, archetypes: ["montagne"],
    stages: [
      { phase: "Répétition générale avant le Tour", text: "Le Dauphiné sert de dernier test grandeur nature avant le Tour de France, avec un plateau très relevé.",
        choices: [
          { label: "Te tester à fond face aux favoris du Tour", resolve: () => ({ text: "Tu prends des renseignements précieux sur ta forme actuelle.", delta: { fatigue: 6 } }) },
          { label: "Gérer prudemment ta charge de course", resolve: () => ({ text: "Tu roules avec la prudence de qui garde le meilleur pour plus tard.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "Étape de montagne décisive", text: "Une dernière étape alpestre pour clore la course.", choices: finishChoices("montagne", "Critérium du Dauphiné", {}, true) },
    ] },
  { id: "suisse", name: "Tour de Suisse", month: "Juin", fit: ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], specKey: "montagne", raceTier: "WT", isStageRace: true, archetypes: ["montagne"],
    stages: [
      { phase: "Les Alpes suisses en guise de répétition", text: "Une course exigeante dans les cols helvétiques, prisée par les prétendants aux grands tours.",
        choices: [
          { label: "Chercher la victoire d'étape", resolve: () => ({ text: "Tu places une offensive pour tester tes rivaux directs.", delta: { fatigue: 6 } }) },
          { label: "Rouler pour la forme, pas pour le résultat", resolve: () => ({ text: "Tu utilises la course avant tout pour affûter ta condition.", delta: { fatigue: 3 } }) },
        ] },
      { phase: "Dernière étape alpestre", text: "Le classement général se joue dans les derniers lacets.", choices: finishChoices("montagne", "Tour de Suisse", {}, true) },
    ] },
  genericRace("wallonie", "Tour de Wallonie", "Juin", ["grimpeur", "rouleur", "puncheur", "sprinteur", "polyvalent"], "puncheur", "Pro", "Une course par étapes vallonnée à travers la Wallonie, prisée pour la préparation estivale.", true, ["vallonnee"]),
  genericRace("brussels", "Brussels Cycling Classic", "Juin", ["sprinteur", "puncheur", "rouleur", "polyvalent"], "sprint", "Pro", "Une classique roulante autour de Bruxelles, généralement promise aux rapides.", false, ["sprint"]),
];

// Chaque Grand Tour a sa propre identité — de vrais cols et lieux iconiques, pas un template générique
// interchangeable. Un col principal + des alternatives tirées au sort d'une saison à l'autre, pour la variété.
// Ordre chronologique réel de la saison — utilisé pour trier TOUTES les courses sélectionnées (peu
// importe leur pool d'origine) dans le bon ordre, plutôt que par catégorie comme avant. C'est ce qui
// manquait pour qu'un Giro (mai) ne se retrouve plus après une préparation de juin, ou qu'une course
// d'août (San Sebastián, Burgos, Pologne...) ne se retrouve plus avant le Tour de France.
const MONTH_ORDER = { "Janvier": 1, "Février": 2, "Mars": 3, "Avril": 4, "Mai": 5, "Juin": 6, "Juillet": 7, "Août": 8, "Septembre": 9, "Octobre": 10, "Novembre": 11, "Décembre": 12 };

// Vraies semaines calendaires (1-52), basées sur le calendrier UCI réel — approximatives (les dates
// exactes varient d'une année sur l'autre) mais réalistes, jusqu'au niveau "même semaine = vrai conflit".
// C'est ce qui permet de détecter que Paris-Nice et Tirreno-Adriatico tombent RÉELLEMENT la même semaine
// dans la vraie vie (un coureur choisit l'une ou l'autre, jamais les deux), ou qu'une course d'août ne
// peut pas être courue pendant que le Tour de France est encore en cours.
const RACE_WEEK = {
  "Tour Down Under": 3, "UAE Tour": 8,
  "Omloop Het Nieuwsblad": 9, "Strade Bianche": 10, "Paris-Nice": 11, "Tirreno-Adriatico": 11, "Milan-San Remo": 12,
  "E3 Saxo Classic": 13, "Tour des Flandres": 14, "Paris-Roubaix": 15, "Flèche Brabançonne": 15.5, "Amstel Gold Race": 16, "Flèche Wallonne": 17, "Liège-Bastogne-Liège": 17,
  "Tro Bro Léon": 17.5, "Tour de Romandie": 17.8,
  "Trofeo Laigueglia": 7, "Danilith Nokere Koerse": 13, "Milano-Torino": 12, "Grand Prix de Denain": 13, "Scheldeprijs": 15,
  "Trofeo Palma": 4, "Étoile de Bessèges": 5, "Grand Prix Antalya": 6, "Tour de la Provence": 6, "Clásica Jaén": 7,
  "Classic Var": 6, "Tour des Alpes-Maritimes": 7, "Giro di Sardegna": 8,
  "Klasikoa San Sebastián": 31, "Vuelta a Burgos": 31, "Bretagne Classic": 34, "Tour de Pologne": 33,
  "Grand Prix Cycliste de Québec": 37, "Grand Prix Cycliste de Montréal": 37.3,
  "Critérium du Dauphiné": 23, "Tour de Suisse": 25, "Tour de Wallonie": 26, "Brussels Cycling Classic": 26,
  "Giro dell'Emilia": 40, "Tre Valli Varesine": 40, "Paris-Tours": 41,
  "Il Lombardia": 42, "Championnats du Monde": 39,
};
// Semaine de départ de chaque Grand Tour — bloque 3 semaines complètes (21 jours), pendant lesquelles
// aucune autre course ne peut raisonnablement être courue.
const GRAND_TOUR_WEEK = { "Giro d'Italia": 18, "Tour de France": 27, "Vuelta a España": 33 };
const GRAND_TOUR_MONTH = { "Giro d'Italia": "Mai", "Tour de France": "Juillet", "Vuelta a España": "Août" };

// Semaine réelle d'une course — la valeur explicite (GT, Mondiaux, championnat national) prime, sinon
// on cherche dans la table par nom, et en dernier recours on estime à partir du mois pour ne jamais
// planter si une course était oubliée dans la table.
function getRaceWeek(race) {
  if (race.week !== undefined) return race.week;
  if (RACE_WEEK[race.name] !== undefined) return RACE_WEEK[race.name];
  return (MONTH_ORDER[race.month] || 6) * 4 - 2;
}

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

// ============================================================================
// GRAND TOUR ENGINE V2 — un Grand Tour n'est plus une seule étape décisive, mais ~21 jours de course :
// seuls les jours ACTIFS (montagne, contre-la-montre, étape accidentée) te demandent de vraies décisions
// et utilisent le Race Engine V2 (groupe/énergie) comme n'importe quelle course. Les jours DE FOND sont
// simulés en un éclair narratif — mais peuvent quand même t'offrir une victoire d'étape si ton profil
// correspond (un sprinteur peut lever les bras sur une étape de plaine sans jamais viser le général).
// Le classement général, les maillots annexes et les victoires d'étape s'accumulent jour après jour et
// ne sont scellés qu'à l'arrivée finale — pas un seul jet de dés qui décide de trois semaines de course.
// ============================================================================
const GT_DAY_LAYOUT = [
  { day: 1, type: "background", terrain: "sprint" },
  { day: 2, type: "active", terrain: "clm_equipe" },
  { day: 3, type: "background", terrain: "sprint" },
  { day: 4, type: "active", terrain: "montagne" },
  { day: 5, type: "background", terrain: "sprint" },
  { day: 6, type: "background", terrain: "vallonne" },
  { day: 7, type: "active", terrain: "clm" },
  { day: 8, type: "background", terrain: "sprint" },
  { day: 9, type: "active", terrain: "montagne" },
  { day: 10, type: "background", terrain: "vallonne" },
  { day: 11, type: "background", terrain: "sprint" },
  { day: 12, type: "active", terrain: "vallonne" },
  { day: 13, type: "background", terrain: "sprint" },
  { day: 14, type: "active", terrain: "montagne" },
  { day: 15, type: "background", terrain: "vallonne" },
  { day: 16, type: "background", terrain: "sprint" },
  { day: 17, type: "active", terrain: "montagne" },
  { day: 18, type: "background", terrain: "sprint" },
  { day: 19, type: "background", terrain: "sprint" },
];
const GT_TIER_GC_POINTS = { victoire: 40, podium: 25, top10: 10, anonyme: -5 };
const GT_TIER_JERSEY_POINTS = { victoire: 20, podium: 12, top10: 5, anonyme: 0 };
const GT_TIER_FORME = { victoire: 6, podium: 3, top10: 1, anonyme: -3 };

// Récupération nocturne au sein du Grand Tour — un jour de course dans un GT n'est pas suivi d'une vraie
// coupure comme entre deux courses de la saison, mais d'une nuit de récupération partielle. Sans ce
// mécanisme, la fatigue plafonne à 100 dès le premier tiers du Tour et y reste pour le reste de la
// course (bug confirmé en testant) — y compris sur les étapes les plus décisives de la 3e semaine.
function gtOvernightRecovery(player) {
  return 6 + SkillEngine.formeRecovery(player) * 0.6 + SkillEngine.fatigueResist(player) * 0.18;
}

// Finish d'une étape ACTIVE : réutilise runRaceField tel quel (donc le Race Engine V2 complet — groupe,
// énergie, pression, tout) pour déterminer le résultat DU JOUR, puis alimente l'accumulateur du Grand
// Tour plutôt que de payer directement palmarès/réputation/points UCI (réservés à l'arrivée finale).
// Contre-la-montre par équipes : le niveau moyen de tes équipiers influence directement le bonus
// tactique — réutilisé partout où un CLM par équipe apparaît (Grand Tours, Paris-Nice...), plutôt que
// dupliqué comme une course autonome avec son propre palmarès séparé.
function teamTTTBonus(game) {
  const teammates = game.teammates || [];
  const avgLevel = teammates.length ? teammates.reduce((a, t) => a + t.level, 0) / teammates.length : 60;
  return Math.round((avgLevel - 60) * 0.3);
}
// Étape de CLM par équipe, insérable dans le déroulé de n'importe quelle course à étapes — le texte et
// le bonus reflètent le niveau collectif de l'équipe, mais le résultat final reste résolu par la étape
// d'arrivée EXISTANTE de la course qui l'accueille (pas de palmarès séparé).
function buildTeamTTTStage(phaseLabel) {
  return {
    phase: phaseLabel || "Contre-la-montre par équipes",
    text: (g) => {
      const teammates = g.teammates || [];
      const avgLevel = teammates.length ? Math.round(teammates.reduce((a, t) => a + t.level, 0) / teammates.length) : 60;
      return `Toute l'équipe s'élance ensemble contre le chrono sur cette étape. Le niveau collectif de tes équipiers (moyenne ${avgLevel}) va peser autant que tes propres jambes dans le résultat.`;
    },
    choices: [
      { label: "Prendre de longs relais en tête", resolve: (g) => ({ text: "Tu tires le groupe vers l'avant, en confiance dans le niveau de tes équipiers.", delta: { fatigue: 8, tacticalBonus: 4 + teamTTTBonus(g), teammatesDelta: { moral: 2 } } }) },
      { label: "Rester prudent, suivre le rythme du groupe", resolve: (g) => ({ text: "Tu économises tes forces et laisses le collectif porter l'effort.", delta: { fatigue: 4, tacticalBonus: 1 + teamTTTBonus(g) } }) },
    ],
  };
}

function gtStageFinishChoices(specKey, terrain, tourName, explicitTerrainProfile) {
  const buildResult = (extraForme) => (g) => {
    const field = runRaceField(g, specKey, tourName, false, explicitTerrainProfile);
    const gcPoints = GT_TIER_GC_POINTS[field.tier];
    const jerseyPoints = GT_TIER_JERSEY_POINTS[field.tier];
    const komPoints = terrain === "montagne" ? jerseyPoints : 0;
    const pointsPoints = (terrain === "sprint" || terrain === "vallonne") ? jerseyPoints : 0;
    const stageWin = field.tier === "victoire" ? [buildPalmaresEntry(tourName, "victoire_etape")] : [];
    const texts = { victoire: "Tu lèves les bras : victoire d'étape !", podium: "Tu montes sur le podium du jour, une belle opération pour le général.", top10: "Un discret top 10 aujourd'hui, sans éclat mais sans dégâts.", anonyme: "Une étape difficile, tu perds du temps sur les meilleurs." };
    return { text: texts[field.tier], classification: field.top10, playerPosition: field.playerPosition, fieldSize: field.fieldSize, delta: { forme: GT_TIER_FORME[field.tier] + extraForme, fatigue: Math.round(12 - gtOvernightRecovery(g.player)), reputation: Math.round(jerseyPoints * 0.3), palmares: stageWin, gtUpdate: { gcPoints, komPoints, pointsPoints } } };
  };
  return [
    { label: "Attaquer pour la victoire d'étape", resolve: buildResult(0) },
    { label: "Gérer ton effort, viser le classement général", resolve: buildResult(2) },
  ];
}

// Étape ACTIVE : structure identique à une course normale (choix tactique + finish), avec le Race Engine V2
// complet (groupe/énergie remis à zéro pour cette étape, comme n'importe quelle course).
function buildGTActiveStage(dayInfo, tourName, flavor, usedClimbs) {
  const templates = {
    montagne: () => {
      const options = [flavor.montagne.main, ...flavor.montagne.alt].filter((c) => !usedClimbs.includes(c.name));
      const climb = options.length > 0 ? pick(options) : pick([flavor.montagne.main, ...flavor.montagne.alt]);
      usedClimbs.push(climb.name);
      // La montagne reste dominante (specKey inchangé, pour le peloton NPC et le bonus contextuel), mais
      // le calcul du JOUEUR laisse désormais une vraie place au puncheur — un profil explosif peut tenir
      // dans une ascension, sans jamais valoir un pur grimpeur.
      return { specKey: "montagne", terrainProfile: { montagne: 80, puncheur: 30 }, phase: `Étape ${dayInfo.day} — Ascension ${climb.de}`,
        text: (g) => `Le peloton explose sur les pentes ${climb.de}. ${getRival(g).name} place une première accélération.${raceContextLine(g, tourName)}`,
        komChoices: true };
    },
    clm: () => {
      const [situation] = weightedPickMultiple(ARCHETYPE_SITUATIONS.chrono, 1);
      const pseudoRaceObj = { name: tourName, specKey: "clm", archetypes: ["chrono"] };
      return { specKey: "clm", phase: `Étape ${dayInfo.day} — Contre-la-montre individuel`,
        text: (g) => `${contextualReframe({ ...situation, text: () => situation.text(flavor.clm.location) }, pseudoRaceObj, g)} ${getRival(g).name} vient de s'élancer deux minutes devant toi.${raceContextLine(g, tourName)}`,
        choiceA: situation.choiceA, choiceB: situation.choiceB };
    },
    vallonne: () => ({ specKey: "puncheur", terrainProfile: { puncheur: 70, sprint: 40, montagne: 15 }, phase: `Étape ${dayInfo.day} — Étape accidentée`,
      text: (g) => `Une succession de bosses courtes et sèches rend cette étape idéale pour les puncheurs. ${getRival(g).name} guette la bonne échappée.${raceContextLine(g, tourName)}`,
      choiceA: "Te placer dans le bon coup dès le début", choiceB: "Attendre le final pour te positionner" }),
    clm_equipe: () => ({ specKey: "clm", phase: `Étape ${dayInfo.day} — Contre-la-montre par équipes`,
      isTeamStage: true,
      text: (g) => {
        const teammates = g.teammates || [];
        const avgLevel = teammates.length ? Math.round(teammates.reduce((a, t) => a + t.level, 0) / teammates.length) : 60;
        return `Toute l'équipe s'élance ensemble contre le chrono. Le niveau collectif de tes équipiers (moyenne ${avgLevel}) va peser autant que tes propres jambes dans le résultat.${raceContextLine(g, tourName)}`;
      },
      choiceA: "Prendre de longs relais en tête", choiceB: "Rester prudent, suivre le rythme du groupe" }),
  };
  const t = templates[dayInfo.terrain]();
  // La montagne a son propre point de décision, spécifique aux points du Grand Prix de la montagne au
  // sommet — les 3 autres terrains gardent le mécanisme générique attaque/gestion partagé.
  const choices = t.komChoices ? [
    { label: "🔥 Attaquer pour passer au sommet en tête", resolve: () => ({ text: "Tu places une attaque décisive dans la difficulté du jour, raflant au passage les points de la montagne au sommet.", delta: { fatigue: 6, tacticalBonus: 5, gtUpdate: { komPoints: 8 } } }) },
    { label: "🧠 Gérer pour économiser tes forces", resolve: () => ({ text: "Tu restes patient, préservant tes forces pour la suite de l'étape plutôt que de viser les points du jour.", delta: { fatigue: 2, tacticalBonus: 1 } }) },
    { label: "🤝 Laisser partir un concurrent", resolve: () => ({ text: "Tu laisses filer un concurrent sans réagir — un geste qui n'échappe pas au peloton.", delta: { fatigue: 0, relationEquipe: 2 } }) },
  ] : [
    { label: t.choiceA, resolve: (g) => ({ text: "Tu places ton effort tôt, quitte à en payer le prix plus tard.", delta: { fatigue: 5, tacticalBonus: 7 + (t.isTeamStage ? teamTTTBonus(g) : 0) } }) },
    { label: t.choiceB, resolve: (g) => ({ text: "Tu restes patient, économe, prêt à frapper au bon moment.", delta: { fatigue: 2, tacticalBonus: t.isTeamStage ? Math.round(teamTTTBonus(g) * 0.4) : 0 } }) },
  ];
  return {
    phase: t.phase, text: t.text,
    choices,
    isGTApproachStage: true, needsJerseyMoment: !t.isTeamStage,
    finish: { phase: `${t.phase} — Arrivée`, text: "Les derniers hectomètres avant la ligne, tout reste à jouer.", choices: gtStageFinishChoices(t.specKey, dayInfo.terrain, tourName, t.terrainProfile) },
  };
}

// Étape DE FOND : un éclair narratif, une seule décision. La plupart du temps sans conséquence sur le
// général, mais une vraie chance de victoire d'étape pour un profil adapté (sprinteur sur le plat,
// puncheur sur le vallonné) — comme dans la vraie vie, où la majorité des étapes de sprint se jouent
// justement sur ces journées de transition, pas sur les étapes reines.
function buildGTBackgroundStage(dayInfo, tourName) {
  const specKey = dayInfo.terrain === "sprint" ? "sprint" : "montagne";
  const label = dayInfo.terrain === "sprint" ? "de plaine, promise à un sprint massif" : "vallonnée, avec quelques difficultés à négocier";
  return {
    phase: `Étape ${dayInfo.day}`,
    text: () => `Étape ${dayInfo.day} : une journée ${label}. Tu roules dans le peloton, sans prendre de risque inutile — sauf si une occasion se présente.`,
    choices: [
      { label: "Continuer", resolve: (g) => {
          const score = performanceScore(g.player, specKey, 0);
          const winChance = dayInfo.terrain === "sprint" ? (score > 100 ? 0.18 : score > 85 ? 0.07 : score > 70 ? 0.02 : 0) : (score > 95 ? 0.1 : score > 80 ? 0.03 : 0);
          const won = Math.random() < winChance;
          const gcPoints = won ? 5 : Math.round((score - 75) / 20);
          const pointsPoints = dayInfo.terrain === "sprint" && won ? 15 : dayInfo.terrain === "sprint" ? 2 : 0;
          const text = won ? `Étape ${dayInfo.day} : tu profites de cette journée tranquille pour lever les bras à l'arrivée !` : `Étape ${dayInfo.day} : journée sans histoire, le peloton reste groupé. Aucun changement notable au classement général.`;
          return { text, delta: { fatigue: Math.round(6 - gtOvernightRecovery(g.player)), forme: won ? 3 : 0, palmares: won ? [buildPalmaresEntry(tourName, "victoire_etape")] : [], gtUpdate: { gcPoints, pointsPoints } } };
        } },
    ],
  };
}

// Habillage d'entrée — pour que le joueur sente immédiatement qu'il aborde quelque chose de différent
// d'une course normale, avant même la première étape.
function buildGTIntroStage(tourName, kind, playerAge) {
  const activeDays = GT_DAY_LAYOUT.filter((d) => d.type === "active").length;
  const totalDays = GT_DAY_LAYOUT.length + 2;
  function makeChoice(label, objective, extraDelta, extraText) {
    return {
      label,
      resolve: () => ({
        text: `Le peloton s'élance pour le grand départ.${extraText ? " " + extraText : ""}`,
        delta: { gtUpdate: { reset: true, tourName, kind, totalDays, objective }, ...extraDelta },
      }),
    };
  }
  const choices = [
    makeChoice("🟡 Viser le classement général", "general"),
    makeChoice("🟢 Viser le maillot vert (points)", "points",
      { reputationDimDelta: { dim: "peloton", amount: 2 }, historyNote: `déclare viser le maillot vert sur le ${tourName} — les sprinteurs du peloton le considèrent désormais comme un concurrent direct.` },
      "Dans le peloton, les sprinteurs prennent note : tu es désormais un concurrent pour le maillot vert."),
    makeChoice("🔴 Viser le maillot à pois (montagne)", "mountain",
      { historyNote: `déclare viser le maillot à pois sur le ${tourName}.` }),
  ];
  if (playerAge === undefined || playerAge < YOUTH_AGE_LIMIT) {
    choices.push(makeChoice("⚪ Viser le maillot blanc (meilleur jeune)", "young",
      { historyNote: `déclare viser le classement du meilleur jeune sur le ${tourName}.` }));
  }
  return {
    phase: "🏆 GRAND DÉPART",
    text: (g) => {
      const base = `${tourName} — ${totalDays} jours de course, trois semaines de bataille. ${activeDays} journées décisives t'attendent (montagne, contre-la-montre, étape accidentée) : c'est là que se jouera vraiment ton général. Le reste, ce sont des étapes de transition — l'occasion, pour les profils adaptés, de chiper une victoire d'étape au passage.${raceContextLine(g, tourName)}`;
      // Rappel historique — si ce joueur a déjà remporté un maillot sur CE Grand Tour par le passé, le jeu
      // s'en souvient. C'est exactement ce qui rend player.history réellement utile, pas juste un journal
      // qu'on écrit sans jamais le relire.
      const priorJerseyWin = (g.player.palmares || []).find((p) => p.raceName === tourName && (p.kind === "maillot_points" || p.kind === "maillot_pois" || p.kind === "victoire_gc"));
      if (!priorJerseyWin) return base;
      const priorLabel = { maillot_points: "le maillot vert", maillot_pois: "le maillot à pois", victoire_gc: "le classement général" }[priorJerseyWin.kind];
      const yearsAgo = g.player.age - priorJerseyWin.age;
      return `${base} Tu avais déjà remporté ${priorLabel} sur ce ${tourName}${yearsAgo > 0 ? ` il y a ${yearsAgo} an${yearsAgo > 1 ? "s" : ""}` : ""} — le public s'en souvient encore.`;
    },
    choices,
  };
}

function gtFinalTier(score, thresholds) {
  if (score >= thresholds.victoire) return "victoire";
  if (score >= thresholds.podium) return "podium";
  if (score >= thresholds.top10) return "top10";
  return "anonyme";
}
// Traduit un score accumulé jour après jour en une estimation de rang lisible ("2e", "Leader"...) — une
// approximation construite à partir des mêmes seuils que gtFinalTier, sans simuler un classement complet
// de tous les autres coureurs. Donne un vrai fil de classement vivant pendant le GT, pas seulement au
// tout dernier jour.
function gtJerseyRankEstimate(score, thresholds) {
  if (score >= thresholds.victoire) return { label: "Leader", close: false };
  if (score >= thresholds.podium) {
    const progress = (score - thresholds.podium) / (thresholds.victoire - thresholds.podium);
    return { label: progress > 0.5 ? "2e" : "3e", close: progress > 0.7 };
  }
  if (score >= thresholds.top10) {
    const progress = (score - thresholds.top10) / (thresholds.podium - thresholds.top10);
    const rank = Math.max(4, Math.round(10 - progress * 6));
    return { label: `${rank}e`, close: progress > 0.7 };
  }
  return { label: "Hors du top 10", close: false };
}

// Arrivée finale — scelle le classement général ET les maillots annexes à partir de ce qui s'est
// RÉELLEMENT accumulé jour après jour, pas un jet de dés isolé.
function buildGTFinalStage(tourName, kind) {
  return {
    phase: "🏁 Arrivée finale à Paris",
    text: () => `Dernière étape du ${tourName} — le classement général est sur le point d'être scellé après trois semaines de course.`,
    choices: [
      { label: "Voir le classement final", resolve: (g) => {
          const gt = g.currentGT || { gcScore: 0, komScore: 0, pointsScore: 0 };
          const gcTier = gtFinalTier(gt.gcScore, { victoire: 150, podium: 95, top10: 45 });
          const komTier = gtFinalTier(gt.komScore, { victoire: 45, podium: 25, top10: 10 });
          const pointsTier = gtFinalTier(gt.pointsScore, { victoire: 45, podium: 25, top10: 10 });
          const palmares = [];
          if (gcTier === "victoire") palmares.push(buildPalmaresEntry(tourName, "victoire_gc"));
          else if (gcTier === "podium") palmares.push(buildPalmaresEntry(tourName, "podium"));
          else if (gcTier === "top10") palmares.push(buildPalmaresEntry(tourName, "top10"));
          if (komTier === "victoire") palmares.push(buildPalmaresEntry(tourName, "maillot_pois"));
          if (pointsTier === "victoire") palmares.push(buildPalmaresEntry(tourName, "maillot_points"));
          if (g.player.age < YOUTH_AGE_LIMIT && (gcTier === "victoire" || gcTier === "podium")) palmares.push(buildPalmaresEntry(tourName, "maillot_jeune"));
          const reputation = { victoire: 45, podium: 28, top10: 14, anonyme: 3 }[gcTier];
          const uciPoints = { victoire: 100, podium: 65, top10: 30, anonyme: 8 }[gcTier];
          const texts = { victoire: `Tu remportes le classement général du ${tourName} ! Le sommet du cyclisme mondial.`, podium: `Tu montes sur le podium final du ${tourName} — une très belle performance sur trois semaines.`, top10: `Tu termines dans le top 10 du classement général du ${tourName}.`, anonyme: `Tu termines ce ${tourName} loin du classement général, mais l'expérience de trois semaines de course reste précieuse.` };
          const rival = getRival(g);
          const majorResult = MAJOR_RACE_NAMES.has(tourName) ? { raceName: tourName, winner: gcTier === "victoire" ? { id: "player", name: g.player.name } : (rival ? { id: rival.id, name: rival.name } : { id: "field", name: "un coureur du peloton" }) } : undefined;
          // Trois semaines de course laissent une vraie trace durable — la fatigue chronique augmente,
          // proportionnellement à l'état de fatigue avec lequel tu termines le Tour (une course bien
          // gérée jusqu'au bout laisse moins de séquelles qu'une fin de Tour au bord de la rupture).
          const chronicToll = Math.round(8 + Math.max(0, g.player.stats.fatigue - 50) * 0.2);
          // Chaque maillot remporté laisse sa propre empreinte, distincte de la seule ligne de palmarès —
          // des conséquences de réputation ciblées, et une trace mémorable dans l'histoire du personnage,
          // qui pourra ressortir des années plus tard si ce même Grand Tour revient au calendrier.
          let extraRepDims = {};
          let historyNotes = [];
          if (pointsTier === "victoire") {
            extraRepDims.fans = (extraRepDims.fans || 0) + 10;
            extraRepDims.medias = (extraRepDims.medias || 0) + 6;
            extraRepDims.sponsors = (extraRepDims.sponsors || 0) + 5;
            historyNotes.push(`${tourName} : maillot vert — les médias le présentent désormais comme un spécialiste des sprints, et des opportunités commerciales s'ouvrent.`);
          }
          if (komTier === "victoire") {
            extraRepDims.fans = (extraRepDims.fans || 0) + 8;
            extraRepDims.medias = (extraRepDims.medias || 0) + 4;
            historyNotes.push(`${tourName} : maillot à pois — le public retient désormais son nom pour la montagne.`);
          }
          if (palmares.some((p) => p.kind === "maillot_jeune")) {
            extraRepDims.fans = (extraRepDims.fans || 0) + 6;
            historyNotes.push(`${tourName} : meilleur jeune — un signal fort pour la suite de sa carrière.`);
          }
          if (gcTier === "victoire") historyNotes.push(`${tourName} : victoire au classement général — le sommet de sa carrière jusqu'ici.`);
          return {
            text: texts[gcTier],
            delta: {
              forme: -4, fatigue: 8, fatigueChronique: chronicToll, reputation, uciPoints, palmares, majorResult, gtUpdate: { clear: true },
              ...(Object.keys(extraRepDims).length > 0 ? { extraRepDims } : {}),
              ...(historyNotes.length > 0 ? { historyNote: historyNotes.join(" ") } : {}),
            },
          };
        } },
    ],
  };
}

function buildGrandTourRace(tourName, kind, playerAge) {
  const flavor = GRAND_TOUR_FLAVOR[tourName] || GRAND_TOUR_FLAVOR["Tour de France"];
  const usedClimbs = [];
  const stages = [buildGTIntroStage(tourName, kind, playerAge)];
  GT_DAY_LAYOUT.forEach((dayInfo) => {
    if (dayInfo.type === "active") {
      const active = buildGTActiveStage(dayInfo, tourName, flavor, usedClimbs);
      stages.push({ phase: active.phase, text: active.text, choices: active.choices, isGTApproachStage: active.isGTApproachStage, needsJerseyMoment: active.needsJerseyMoment });
      stages.push(active.finish);
    } else {
      stages.push(buildGTBackgroundStage(dayInfo, tourName));
    }
  });
  stages.push(buildGTFinalStage(tourName, kind));
  return {
    id: `gt_${kind}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${tourName} — étape décisive`,
    raceTier: "WT",
    isStageRace: true,
    isGrandTour: true,
    totalGTDays: GT_DAY_LAYOUT.length + 2,
    stages,
  };
}

const LOMBARDIA = {
  id: "lombardia", name: "Il Lombardia", month: "Octobre", fit: ["grimpeur", "puncheur", "polyvalent"], specKey: "montagne", raceTier: "WT", archetypes: ["montagne"],
  stages: [
    { phase: "Madonna del Ghisallo", text: (g) => `La classique des feuilles mortes entame ses ascensions vallonnées autour du lac de Côme.${raceContextLine(g, "Il Lombardia")}`,
      choices: [
        { label: "Imprimer un tempo élevé", resolve: () => ({ text: "Tu mènes la danse dès les premières pentes.", delta: { fatigue: 5 } }) },
        { label: "Rester au chaud dans le peloton", resolve: () => ({ text: "Tu observes, patient, avant de frapper plus tard.", delta: { fatigue: 2 } }) },
      ] },
    { phase: "Arrivée à Côme", text: "La dernière difficulté avant la descente vers l'arrivée.", choices: finishChoices("montagne", "Il Lombardia") },
  ],
};
// Rejoint le pool sélectionnable des classiques d'automne — un Monument mérite un vrai choix du joueur,
// pas un ajout automatique basé sur son profil qui pouvait forcer un puncheur à courir une course de
// montagne pure qu'il n'était pas venu chercher, sans jamais pouvoir s'y soustraire.
AUTUMN_CLASSICS.push(LOMBARDIA);

function buildWorldsRace(player) {
  return {
    id: "worlds", name: "Championnats du Monde", month: "Septembre", archetypes: ["tactique"],
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
// Habileté technique sur le vélo — réutilise Placement (Tactique, accessible à tous les profils : bien
// se placer dans le peloton, c'est aussi éviter les embrouilles) et Descendeur (bonus supplémentaire pour
// les grimpeurs, spécifiquement dans les descentes). Aucune nouvelle compétence, juste un usage de plus
// pour deux compétences déjà existantes.
function bikeHandlingSkill(player) {
  let skill = 0;
  if (SkillEngine.hasSkill(player, "tact_placement")) skill += 1;
  if (SkillEngine.hasSkill(player, "spec_g_descendeur")) skill += 1;
  return skill;
}

const INCIDENT_POOL = [
  {
    // Distinct de "chute_grave" (qui frappe au hasard selon ta fatigue de fond) : ici, c'est un VRAI
    // choix explicite du joueur qui porte le risque — prendre des trajectoires limites en descente ou
    // dépasser par le bas-côté. La plupart du temps ça paie, mais parfois ça se termine mal.
    id: "prise_de_risque", weight: 3, phaseLabel: "Moment décisif, prise de risque",
    condition: (ctx) => { const p = terrainProfileFor(ctx.raceObj); return p.mountains > 25 || p.cobbles > 15 || p.punch > 40; },
    text: () => "Une portion technique s'annonce — une descente sinueuse, ou un passage étroit où il faut choisir entre jouer la sécurité ou tenter de grappiller une position en prenant des risques.",
    choices: (ctx) => [
      { label: "Prendre des trajectoires limites pour revenir", resolve: () => {
          const roll = Math.random();
          const mentalMitigation = SkillEngine.craquageResist(ctx.game.player) * 0.006;
          const handlingMitigation = bikeHandlingSkill(ctx.game.player) * 0.02;
          if (roll < Math.max(0.015, 0.07 - mentalMitigation - handlingMitigation)) {
            // Chute grave : blessure, la course s'arrête ici pour toi (résultat forcé au plus bas).
            return { text: "Tu perds le contrôle dans un virage serré. La chute est sérieuse — ta course s'arrête ici, et il va falloir du temps pour t'en remettre.", delta: { forme: -25, fatigue: -30, fatigueChronique: -20, reputation: -4, flags: { hadMajorInjury: true }, forceDropped: true } };
          }
          if (roll < Math.max(0.10, 0.22 - handlingMitigation)) {
            // Chute superficielle : plus de peur que de mal, mais du temps et de l'énergie perdus.
            return { text: "Une glissade sans gravité — plus de peur que de mal, mais tu perds un temps précieux à te relever et à revenir dans la course.", delta: { fatigue: 7, tacticalBonus: -4 } };
          }
          return { text: "Le pari est payant : tu prends des risques calculés et ça se termine parfaitement bien.", delta: { fatigue: 5, tacticalBonus: 7 } };
        } },
      { label: "Rester prudent, ne pas forcer", resolve: () => ({ text: "Tu passes ce moment délicat sans prendre de risque inutile.", delta: { fatigue: 1 } }) },
    ],
  },
  {
    // Risque réel de chute grave en carrière pro — jusqu'ici seule la formation (16 ans) comportait ce
    // risque. Le risque grimpe en continu avec la fatigue chronique et la pression du moment (mêmes
    // moteurs que Fatigue Pipeline et Pressure Engine), atténué par le mental (craquageResist) ET
    // l'habileté technique (Placement / Descendeur).
    id: "chute_grave", weight: 2, phaseLabel: "Chute sérieuse",
    condition: (ctx) => {
      const chronic = ctx.game.player.stats.fatigueChronique || 0;
      const pressure = computePressure(ctx.game, ctx.raceObj.name);
      const mentalMitigation = SkillEngine.craquageResist(ctx.game.player) * 0.4;
      const handlingMitigation = bikeHandlingSkill(ctx.game.player) * 6;
      const riskFactor = Math.max(0, Math.max(0, (chronic - 22) * 0.0032) + Math.max(0, (pressure - 50) * 0.0012) - mentalMitigation * 0.001 - handlingMitigation * 0.001);
      return Math.random() < riskFactor;
    },
    text: () => "Une chute sérieuse, dans un moment de fatigue extrême où tes réflexes n'étaient plus tout à fait là. Le diagnostic tombe : une blessure qui va t'écarter des routes plusieurs semaines.",
    choices: () => [
      { label: "Accepter la pause forcée et bien récupérer", resolve: () => ({ text: "Tu prends le temps nécessaire pour guérir correctement, sans précipiter les choses.", delta: { forme: -25, fatigue: -30, fatigueChronique: -20, reputation: -4, flags: { hadMajorInjury: true } } }) },
      { label: "Revenir le plus vite possible, quitte à forcer", resolve: () => ({ text: "Tu précipites ton retour à la compétition — risqué, mais tu limites la casse sur ta saison.", delta: { forme: -32, fatigue: -8, reputation: -2, flags: { hadMajorInjury: true } } }) },
    ],
  },
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
      const playerLevel = Math.max(ctx.game.player.specialties.montagne, ctx.game.player.specialties.sprint, ctx.game.player.specialties.clm, ctx.game.player.specialties.pave, ctx.game.player.specialties.puncheur) * 0.75;
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
      // Un coéquipier de trade-team n'a logiquement rien à faire au Championnat national, disputé entre
      // compatriotes — la course continue, mais sans lui.
      const teammate = ctx.raceObj?.raceTier === "National" ? null : ctx.game.teammates?.[0];
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
    // Pendant positif de peloton_hostile — la réputation peloton doit se voir dans les deux sens, pas
    // seulement quand elle punit.
    id: "peloton_allie", weight: 3, phaseLabel: "Un allié inattendu",
    condition: (ctx) => (ctx.game.player.reputation?.peloton || 50) > 70,
    text: (ctx) => `Un coureur d'une équipe adverse revient à ta hauteur : "${isFavoriteContext(ctx.game.player) ? "On sait ce que tu vaux, mais" : "Je ne te dois rien, mais"} ta réputation dans le peloton te précède — je te donne un coup de main jusqu'au prochain ravitaillement."`,
    choices: () => [
      { label: "Accepter et rouler ensemble", resolve: () => ({ text: "Vous vous relayez efficacement — la coopération, ça se mérite, et la tienne paie.", delta: { tacticalBonus: 4, fatigue: -2, historyNote: "un coureur d'une équipe adverse lui vient en aide en course, sa réputation dans le peloton parlant pour lui." } }) },
      { label: "Le remercier mais rester prudent", resolve: () => ({ text: "Tu préfères garder ton indépendance tactique, quitte à rouler un peu plus seul.", delta: { tacticalBonus: 1 } }) },
    ],
  },
  {
    id: "interview_hostile", weight: 2, phaseLabel: "Question piège avant le départ",
    condition: (ctx) => (ctx.game.player.reputation?.medias || 50) < 30,
    text: () => "Un journaliste te coince avant le départ, ton attitude récente dans le collimateur : \"Certains disent que vous n'êtes plus fiable pour votre équipe. Vous répondez quoi ?\" Le ton est clairement hostile.",
    choices: (ctx) => {
      const list = [
        { label: "Rester factuel et courtois, sans mordre à l'hameçon", resolve: () => ({ text: "Tu réponds posément, sans t'énerver — l'orage passe sans faire de vagues.", delta: { forme: -1 } }) },
        { label: "Répliquer sèchement, tant pis pour l'image", resolve: () => ({ text: "Ta réplique cinglante fait le tour des réseaux dans l'heure — les avis sont partagés.", delta: { reputationDimDelta: { dim: "medias", amount: -4 }, tacticalBonus: 2, historyNote: "une réplique cinglante à un journaliste fait le tour des réseaux — les avis sont partagés." } }) },
      ];
      if (SkillEngine.hasSkill(ctx.game.player, "car_medias")) {
        list.push({ label: "Retourner la question avec aisance", resolve: () => ({ text: "Ton aisance médiatique, déjà travaillée, désamorce la question en quelques mots bien choisis.", delta: { reputationDimDelta: { dim: "medias", amount: 5 } } }) });
      }
      return list;
    },
  },
  {
    // Pendant positif — une vraie interview flatteuse, pas seulement l'absence de la mauvaise.
    id: "interview_flatteuse", weight: 2, phaseLabel: "Portrait élogieux",
    condition: (ctx) => (ctx.game.player.reputation?.medias || 50) > 75,
    text: () => "Un média spécialisé te consacre un long portrait avant la course — ton parcours récent inspire visiblement, et la question qu'on te pose est presque amicale : \"Qu'est-ce qui vous anime encore, après tout ça ?\"",
    choices: () => [
      { label: "Répondre avec sincérité sur ta trajectoire", resolve: () => ({ text: "Ta réponse touche juste — l'article qui en résulte élargit encore ta popularité.", delta: { reputationDimDelta: { dim: "fans", amount: 4 }, historyNote: "un portrait élogieux dans un média spécialisé élargit encore sa popularité." } }) },
      { label: "Rester bref et concentré sur la course du jour", resolve: () => ({ text: "Tu restes professionnel, sans en faire trop — l'article salue justement cette sobriété.", delta: { reputationDimDelta: { dim: "medias", amount: 2 }, forme: 1 } }) },
    ],
  },
  {
    id: "opportunite_commerciale", weight: 2, phaseLabel: "Une proposition inattendue",
    condition: (ctx) => (ctx.game.player.reputation?.sponsors || 50) > 70,
    text: () => "Ton agent t'appelle, tout excité : une marque, séduite par ton image auprès des partenaires commerciaux, propose un contrat publicitaire ponctuel — bien au-delà de ce que prévoyait ton contrat d'équipe.",
    choices: () => [
      { label: "Accepter l'opportunité", resolve: () => ({ text: "Le contrat est signé — un vrai coup de pouce financier, sans rien devoir changer à ta préparation.", delta: { money: 8000, reputationDimDelta: { dim: "sponsors", amount: 2 }, historyNote: "signe un contrat publicitaire ponctuel, séduit par son image auprès des partenaires commerciaux." } }) },
      { label: "Décliner pour rester focalisé sur la course", resolve: () => ({ text: "Tu préfères ne pas te disperser — ton agent comprend, l'occasion se représentera.", delta: { forme: 1 } }) },
    ],
  },
  {
    // Pendant negatif des sponsors, jusqu'ici totalement absent — la reputation sponsors doit aussi
    // pouvoir faire mal, pas seulement rapporter.
    id: "sponsor_impatient", weight: 2, phaseLabel: "Coup de fil tendu",
    condition: (ctx) => (ctx.game.player.reputation?.sponsors || 50) < 30,
    text: () => "Ton DS t'informe d'un coup de fil tendu avec l'un des partenaires principaux : ton image commerciale en berne inquiète, et la question du renouvellement de contrat plane déjà.",
    choices: () => [
      { label: "Prendre l'avertissement au sérieux, redoubler d'exemplarité", resolve: () => ({ text: "Tu prends note et soignes davantage ton attitude publique dans les jours qui suivent.", delta: { ethique: 2 } }) },
      { label: "Ne pas t'en laisser distraire aujourd'hui", resolve: () => ({ text: "Tu mets le sujet de côté, focalisé sur la course — le problème, lui, ne disparaît pas.", delta: { reputationDimDelta: { dim: "sponsors", amount: -2 }, historyNote: "un partenaire commercial principal s'impatiente ouvertement, le renouvellement de contrat menacé." } }) },
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

// ============================================================================
// ARCHÉTYPES DE COURSES — au lieu du même "Attaquer / Gérer ton effort" générique partout, chaque course
// taguée d'un ou plusieurs archétypes pioche dans un vocabulaire tactique qui lui est propre, inspiré de
// vrais moments du cyclisme. Deux courses avec le même moteur (Race Engine V2) peuvent ainsi produire des
// scènes complètement différentes — piochées au hasard (pondéré) à chaque course, jamais figées.
// ============================================================================
const ARCHETYPE_SITUATIONS = {
  montagne: [
    { weight: 2, phase: "Attaque dans la pente", tendency: "offensive", label: "Attaque à la Pantani",
      text: (raceName) => `Comme Pantani à l'Alpe d'Huez, l'occasion est là : une accélération sèche et brutale, dès le pied de la difficulté décisive de ${raceName}, peut faire exploser le peloton d'un coup.`,
      choiceA: "Placer une attaque sèche, tout de suite", choiceB: "Rester au train, garder tes forces" },
    { weight: 2, phase: "Duel dans les lacets", tendency: "neutral", label: "Duel au sommet",
      text: (raceName) => `Un rival colle à ta roue, lacet après lacet, dans l'ascension décisive de ${raceName}. Le genre de duel qui se joue au mental autant qu'aux jambes.`,
      choiceA: "Relancer plusieurs fois pour le décrocher", choiceB: "Attendre les derniers hectomètres pour trancher" },
    { weight: 1, phase: "Jouer la gestion", tendency: "defensive", label: "Gestion pure",
      text: (raceName) => `Pas besoin de faire l'étalage de tes jambes tout de suite sur ${raceName} — la vraie difficulté arrive plus tard, et l'écart se creuse rarement avant.`,
      choiceA: "Prendre un risque en anticipant l'attaque", choiceB: "Gérer sobrement, sans rien lâcher au classement" },
    { weight: 1, phase: "Dernier col, dernière chance", tendency: "offensive", label: "Tout ou rien",
      text: (raceName) => `Le dernier col de ${raceName} approche. Après lui, plus rien — c'est maintenant ou jamais si tu veux vraiment jouer la victoire.`,
      choiceA: "Tenter le tout pour le tout, quitte à craquer", choiceB: "Jouer la sécurité, viser un résultat solide" },
    { weight: 1, phase: "Descente technique après le sommet", tendency: "offensive", label: "L'art de Nibali",
      text: (raceName) => `Comme Nibali dans ses grands jours, une descente technique et sinueuse suit immédiatement le sommet sur ${raceName} — une occasion rare de créer l'écart sans jamais forcer sur les jambes.`,
      choiceA: "Prendre des trajectoires limites pour creuser l'écart", choiceB: "Descendre avec prudence, préserver le groupe" },
    { weight: 1, phase: "La flamme rouge du col", tendency: "neutral", label: "Le dernier kilomètre de Merckx",
      text: (raceName) => `Comme Merckx, qui ne relâchait jamais un effort avant la ligne, la flamme rouge du col décisif de ${raceName} ne signifie rien tant que le sommet n'est pas franchi.`,
      choiceA: "Pousser encore plus fort jusqu'au bout", choiceB: "Calculer précisément ton effort restant" },
  ],
  sprint: [
    { weight: 2, phase: "Mise en place du train", tendency: "neutral", label: "Bataille de position",
      text: (raceName) => `Comme au temps de Cipollini et de son train Saeco, les équipes de sprinteurs s'organisent à l'avant sur ${raceName}. Le sprint se prépare ici, pas seulement dans les 200 derniers mètres.`,
      choiceA: "Te battre pour rester dans les 10 premières roues", choiceB: "Rester au calme, économiser jusqu'au bout" },
    { weight: 2, phase: "Sprint à l'ancienne", tendency: "offensive", label: "Sprint pur",
      text: (raceName) => `Tout se joue dans le dernier kilomètre de ${raceName} — la roue qu'on prend, le moment où on la lâche, ça ne doit rien au hasard.`,
      choiceA: "Sauter tôt, prendre les devants de loin", choiceB: "Rester dans la roue, exploser au dernier moment" },
    { weight: 1, phase: "Bordures avant l'arrivée", tendency: "defensive", label: "Piège du vent",
      text: (raceName) => `Le vent de travers fragmente le peloton à quelques kilomètres de l'arrivée de ${raceName} — être du bon côté peut décider de tout avant même le sprint.`,
      choiceA: "Te battre pour la bonne bordure, quitte à t'épuiser", choiceB: "Rester groupé, tout garder pour le sprint" },
    { weight: 1, phase: "Sprint dans le chaos", tendency: "neutral", label: "Ligne droite étroite",
      text: (raceName) => `La ligne droite finale de ${raceName} est étroite et nerveuse — le genre d'arrivée où une seule erreur de trajectoire peut tout gâcher.`,
      choiceA: "Forcer un passage risqué pour ne rien perdre", choiceB: "Rester prudent, sacrifier un peu de position" },
    { weight: 1, phase: "Le dernier virage avant la ligne", tendency: "offensive", label: "La lecture de Cavendish",
      text: (raceName) => `Comme Cavendish, passé maître dans l'art de lire un peloton lancé, le dernier virage avant la ligne droite de ${raceName} décide déjà de beaucoup — la bonne trajectoire vaut parfois plus que les jambes.`,
      choiceA: "Prendre la corde, quitte à frôler la chute", choiceB: "Élargir prudemment, garder le contrôle" },
    { weight: 1, phase: "Photo-finish annoncée", tendency: "neutral", label: "À la roue près",
      text: (raceName) => `Le peloton reste compact jusqu'aux tout derniers mètres de ${raceName} — l'arrivée s'annonce si serrée qu'elle pourrait se jouer à la largeur d'un pneu.`,
      choiceA: "Lancer ton effort le plus tard possible, quitte à devoir tout donner d'un coup", choiceB: "Sécuriser ta position plus tôt, sans attendre l'ultime instant" },
  ],
  paves: [
    { weight: 2, phase: "Entrée dans le secteur pavé", tendency: "offensive", label: "La Trouée d'Arenberg",
      text: (raceName) => `Comme à la Trouée d'Arenberg, l'entrée dans le secteur pavé décide souvent de la course avant même que la bataille commence vraiment sur ${raceName}. Être en tête à l'abordage, c'est déjà avoir course gagnée à moitié.`,
      choiceA: "Te battre pour entrer en tête dans le secteur", choiceB: "Entrer prudemment, éviter la chute" },
    { weight: 2, phase: "Le pavé fait le tri", tendency: "neutral", label: "Loterie du pavé",
      text: (raceName) => `Les crevaisons et les chutes commencent à faire le tri dans le peloton de ${raceName} — chaque secteur pavé est une vraie loterie mécanique.`,
      choiceA: "Pousser fort sur les pavés pour créer la sélection", choiceB: "Rouler avec prudence, préserver matériel et forces" },
    { weight: 1, phase: "Dans la poussière du peloton", tendency: "defensive", label: "Poussière et gravillons",
      text: (raceName) => `La poussière soulevée par le peloton rend la visibilité difficile sur ${raceName} — impossible d'anticiper les pièges de la route à l'avance.`,
      choiceA: "Forcer l'allure pour sortir de cette zone dangereuse", choiceB: "Suivre patiemment, sans prendre de risque inutile" },
    { weight: 1, phase: "Sur le vélodrome", tendency: "neutral", label: "L'arrivée mythique",
      text: (raceName) => `Comme tant de légendes avant toi, l'arrivée de ${raceName} se joue au sprint sur les lattes de bois du vélodrome — un dernier tour de piste chargé d'histoire.`,
      choiceA: "Lancer le sprint de loin, quitte à s'épuiser", choiceB: "Rester à l'abri, jouer la roue jusqu'au bout" },
    { weight: 1, phase: "Positionnement avant le secteur clé", tendency: "offensive", label: "L'instinct de Boonen",
      text: (raceName) => `Comme Boonen, qui savait toujours où se trouver au bon moment, le secteur pavé classé le plus difficile de ${raceName} approche — la bataille pour y entrer en tête commence des kilomètres à l'avance.`,
      choiceA: "Te placer en tête du peloton dès maintenant, au prix de l'énergie", choiceB: "Économiser tes forces, tenter de te faufiler au dernier moment" },
    { weight: 1, phase: "Casse mécanique en plein effort", tendency: "defensive", label: "Le coup du sort",
      text: (raceName) => `Un bruit suspect vient de ta roue arrière sur les pavés de ${raceName} — rien de cassé pour l'instant, mais chaque secousse supplémentaire pourrait changer la donne.`,
      choiceA: "Pousser quand même à fond, tant que ça tient", choiceB: "Lever le pied, économiser le matériel jusqu'au prochain segment lisse" },
  ],
  chrono: [
    { weight: 2, phase: "Position aérodynamique", tendency: "offensive", label: "La révolution LeMond",
      text: (raceName) => `Comme LeMond en 1989, chaque détail compte contre le chrono sur ${raceName} — la position aérodynamique peut faire gagner plus que n'importe quel muscle.`,
      choiceA: "Partir à bloc dès le départ, quitte à exploser", choiceB: "Gérer ton effort sur toute la distance" },
    { weight: 2, phase: "Effort métronomique", tendency: "neutral", label: "Le métronome",
      text: (raceName) => `Comme Indurain à son sommet, la clé d'un bon chrono sur ${raceName} n'est pas l'explosivité, mais la régularité — un effort qui ne varie jamais, kilomètre après kilomètre.`,
      choiceA: "Pousser fort dès les premiers kilomètres pour prendre l'avantage psychologique", choiceB: "Rouler à un rythme parfaitement régulier, sans à-coups" },
    { weight: 1, phase: "Dernier repère chronométrique", tendency: "neutral", label: "La course contre la montre",
      text: (raceName) => `Le dernier pointage chronométrique de ${raceName} vient de tomber — tu sais maintenant exactement où tu en es face à tes rivaux directs.`,
      choiceA: "Puiser dans tes dernières réserves pour grappiller des secondes", choiceB: "Rester dans ta zone, éviter l'explosion dans les derniers kilomètres" },
    { weight: 1, phase: "Vent de face sur la ligne droite", tendency: "defensive", label: "La lutte de Cancellara",
      text: (raceName) => `Comme Cancellara affrontant les lignes droites les plus exposées, un vent de face constant ralentit chaque effort sur ${raceName} — la tentation de forcer est grande, mais le prix à payer aussi.`,
      choiceA: "Pousser un braquet plus lourd malgré le vent", choiceB: "Rester sur ton rythme habituel, laisser le vent faire son travail sur tout le monde" },
    { weight: 1, phase: "Choix de matériel avant le départ", tendency: "neutral", label: "Le pari technique",
      text: (raceName) => `Le profil de ${raceName} laisse une vraie marge d'interprétation sur les réglages — un choix de matériel plus agressif peut faire gagner de précieuses secondes, ou coûter cher si le vent tourne.`,
      choiceA: "Opter pour un réglage radical, pensé pour la vitesse pure", choiceB: "Rester sur un compromis prudent entre vitesse et contrôle" },
  ],
  vallonnee: [
    { weight: 2, phase: "Bosse après bosse", tendency: "offensive", label: "Usure des puncheurs",
      text: (raceName) => `Les relances courtes et sèches s'enchaînent sur ${raceName} — le genre de parcours où les purs grimpeurs souffrent autant que les sprinteurs, seuls les puncheurs s'y retrouvent vraiment.`,
      choiceA: "Placer une relance dans une bosse pour créer l'écart", choiceB: "Rester au contact, attendre une occasion plus nette" },
    { weight: 1, phase: "Sélection progressive", tendency: "neutral", label: "Le tri par l'usure",
      text: (raceName) => `Aucune difficulté majeure sur ${raceName}, mais l'accumulation de faux-plats et de relances fait le tri aussi sûrement qu'un vrai col.`,
      choiceA: "Monter le rythme pour accélérer la sélection", choiceB: "Laisser l'usure naturelle faire son travail" },
    { weight: 1, phase: "Le bon coup à prendre", tendency: "offensive", label: "Le sens du timing",
      text: (raceName) => `Sur un parcours vallonné comme ${raceName}, la victoire revient rarement au plus fort — plutôt à celui qui a su repérer LE bon coup, au bon moment.`,
      choiceA: "Tenter ta chance dans le mouvement qui se dessine", choiceB: "Attendre un mouvement plus prometteur, quitte à le rater" },
    { weight: 1, phase: "Attaque sur la côte courte", tendency: "offensive", label: "L'explosivité de Valverde",
      text: (raceName) => `Comme Valverde dans ses meilleures années, une côte courte et raide se présente sur ${raceName} — le genre de rampe où une pointe de vitesse pure peut suffire à faire toute la différence.`,
      choiceA: "Placer une attaque explosive dès le pied de la côte", choiceB: "Garder ton rythme, viser plutôt le sommet" },
    { weight: 1, phase: "Faux-plat interminable", tendency: "defensive", label: "L'usure silencieuse",
      text: (raceName) => `Rien d'assez raide pour vraiment justifier un effort sur ${raceName}, mais ce faux-plat qui n'en finit pas grignote les organismes bien plus qu'il n'y paraît.`,
      choiceA: "Forcer légèrement l'allure pour t'en débarrasser plus vite", choiceB: "Rester à ton rythme, laisser le temps faire son œuvre" },
  ],
  accidentee: [
    { weight: 2, phase: "Journée de montagnes russes", tendency: "neutral", label: "Usure progressive",
      text: (raceName) => `${raceName} enchaîne les difficultés sans jamais vraiment souffler — une de ces journées qui n'ont l'air de rien sur le papier, mais qui vident les organismes sans prévenir.`,
      choiceA: "Pousser fort dès maintenant, tant que tu te sens bien", choiceB: "Doser précieusement ton effort, la fin est encore loin" },
    { weight: 1, phase: "Échappée qui s'accroche", tendency: "offensive", label: "Le baroud qui dure",
      text: (raceName) => `Une échappée matinale résiste plus longtemps que prévu sur ${raceName} — le peloton hésite entre la laisser filer et se lancer dans une poursuite coûteuse.`,
      choiceA: "Te porter à l'avant pour relancer la poursuite", choiceB: "Laisser les autres équipes gérer, économiser tes forces" },
    { weight: 1, phase: "Terrain imprévisible", tendency: "neutral", label: "Rien n'est jamais acquis",
      text: (raceName) => `Le profil changeant de ${raceName} rend toute anticipation difficile — ce qui semblait joué peut basculer sur la moindre difficulté annexe.`,
      choiceA: "Rester offensif en permanence, quitte à t'épuiser", choiceB: "Garder la tête froide, réagir plutôt qu'anticiper" },
    { weight: 1, phase: "Descente technique et rapide", tendency: "offensive", label: "Le risque calculé",
      text: (raceName) => `Une descente sinueuse et rapide s'ouvre sur ${raceName} — l'occasion de reprendre du terrain sans forcer sur les jambes, à condition de ne pas se laisser surprendre par un virage serré.`,
      choiceA: "Prendre des trajectoires tendues pour gagner du temps", choiceB: "Descendre à un rythme plus mesuré, sans rien risquer" },
    { weight: 1, phase: "Changement météo soudain", tendency: "defensive", label: "L'imprévu du ciel",
      text: (raceName) => `Le ciel change brutalement au-dessus de ${raceName} — ce qui était une belle journée devient en quelques minutes bien plus incertain, sans que personne n'ait eu le temps de s'adapter.`,
      choiceA: "Profiter de la confusion générale pour attaquer", choiceB: "Rester prudent, laisser la situation se stabiliser" },
  ],
  classique: [
    { weight: 2, phase: "L'échappée du jour", tendency: "offensive", label: "Baroudeurs en tête",
      text: (raceName) => `Une échappée s'est formée tôt sur ${raceName}, comme dans tant de classiques avant elle — la question n'est jamais si elle sera reprise, mais quand, et par qui.`,
      choiceA: "Rejoindre le mouvement, tenter le baroud", choiceB: "Rester dans le peloton, attendre le final" },
    { weight: 2, phase: "Bataille tactique", tendency: "defensive", label: "Le jeu du chat et de la souris",
      text: (raceName) => `Personne ne veut prendre les relais dans le groupe de tête de ${raceName} — chacun surveille son voisin, dans ce jeu tactique typique des classiques.`,
      choiceA: "Prendre les relais toi-même pour faire avancer le groupe", choiceB: "Attendre que d'autres se dévoilent, économiser tes forces" },
    { weight: 1, phase: "Le final se dessine", tendency: "offensive", label: "Dernier acte",
      text: (raceName) => `Le final de ${raceName} approche, et avec lui le moment où les alliances de circonstance volent en éclats.`,
      choiceA: "Placer une attaque pour te débarrasser des poursuivants", choiceB: "Garder tes forces pour le sprint final du groupe" },
    { weight: 1, phase: "Le mur emblématique", tendency: "offensive", label: "La légende de Gilbert",
      text: (raceName) => `Comme Gilbert dans ses plus beaux jours, une côte courte et pentue, chargée d'histoire, se dresse dans le final de ${raceName} — celle où tant de classiques se sont jouées avant.`,
      choiceA: "Y placer ton attaque décisive, quitte à tout jouer là", choiceB: "La passer à ton rythme, garder une carte pour plus tard" },
    { weight: 1, phase: "Le poids d'un Monument", tendency: "neutral", label: "La pression de l'histoire",
      text: (raceName) => `Courir ${raceName}, c'est marcher dans les traces de tous ceux qui l'ont gagnée avant — une pression particulière plane sur le peloton, presque palpable.`,
      choiceA: "Transformer cette pression en énergie offensive", choiceB: "Rester détaché, courir sans penser à l'histoire" },
  ],
  tactique: [
    { weight: 2, phase: "Alliances de circonstance", tendency: "neutral", label: "Coopérer puis trahir", cooperation: true,
      text: (raceName) => `Sur ${raceName}, les intérêts nationaux et les rivalités de club s'entremêlent — coopérer aujourd'hui avec un adversaire de toujours n'a rien d'incohérent, tant que l'intérêt commun tient.`,
      choiceA: "Jouer collectif tant que ça sert tes intérêts", choiceB: "Rester prudent, ne rien devoir à personne" },
    { weight: 1, phase: "Le bluff du peloton", tendency: "neutral", label: "Qui craque le premier",
      text: (raceName) => `Personne ne veut se dévoiler en tête sur ${raceName} — le premier à attaquer prend le risque de tirer tout le monde, mais rester trop discret peut aussi coûter la victoire.`,
      choiceA: "Prendre le risque de te dévoiler en tête", choiceB: "Laisser les autres se découvrir en premier" },
    { weight: 1, phase: "Rivalité à fleur de peau", tendency: "offensive", label: "Compte à régler",
      text: (raceName) => `Ton rival est juste devant toi dans le peloton de ${raceName} — l'occasion est belle de lui compliquer sérieusement la tâche.`,
      choiceA: "Marquer ton rival de très près, quitte à t'épuiser", choiceB: "Ignorer la rivalité, courir ta propre course" },
    { weight: 1, phase: "Une feinte à décoder", tendency: "neutral", label: "Le jeu du poker",
      text: (raceName) => `Un mouvement suspect se dessine à l'avant du peloton de ${raceName} — vraie attaque, ou simple feinte pour provoquer une réaction coûteuse ? Difficile à dire avec certitude.`,
      choiceA: "Réagir immédiatement, au cas où ce serait sérieux", choiceB: "Attendre confirmation avant de bouger" },
    { weight: 1, phase: "La consigne radio contredit ton instinct", tendency: "neutral", label: "Le DS a-t-il raison ?",
      text: (raceName) => `Ta radio d'oreillette grésille : ton DS te demande de temporiser sur ${raceName}. Mais tes jambes, elles, te disent tout le contraire.`,
      choiceA: "Suivre ton instinct plutôt que la consigne", choiceB: "Faire confiance à la vision d'ensemble du DS" },
  ],
  pluie: [
    { weight: 2, phase: "Descente sous la pluie", tendency: "offensive", label: "Prendre des risques mouillés",
      text: (raceName) => `La route est trempée et la visibilité mauvaise sur ${raceName} — une descente sous la pluie n'a jamais pardonné aux imprudents, mais elle peut aussi offrir un boulevard aux plus audacieux.`,
      choiceA: "Prendre des risques dans la descente pour créer l'écart", choiceB: "Freiner large dans les virages, la prudence avant tout" },
    { weight: 1, phase: "Chutes en cascade", tendency: "defensive", label: "Le peloton se méfie",
      text: (raceName) => `Les chutes se multiplient dans le peloton détrempé de ${raceName} — chaque rond-point, chaque marquage au sol devient un piège.`,
      choiceA: "Forcer l'allure pour t'extraire de la zone de danger", choiceB: "Rouler loin des chutes, quitte à perdre des positions" },
    { weight: 1, phase: "Matériel qui trahit", tendency: "defensive", label: "Le pari du réglage",
      text: (raceName) => `Le choix des pneus et des réglages de freinage prend une importance inhabituelle sous cette pluie battante sur ${raceName}.`,
      choiceA: "Faire confiance à ton matériel et pousser fort quand même", choiceB: "Composer avec la prudence qu'impose la météo" },
    { weight: 1, phase: "Brouillard sur la route", tendency: "defensive", label: "Rouler à l'aveugle",
      text: (raceName) => `Une brume épaisse s'ajoute à la pluie sur ${raceName} — la visibilité tombe à quelques mètres à peine, rendant chaque virage un vrai pari.`,
      choiceA: "Maintenir l'allure malgré la visibilité réduite", choiceB: "Lever le pied nettement, la sécurité avant tout" },
    { weight: 1, phase: "Le froid s'installe", tendency: "neutral", label: "La lutte invisible",
      text: (raceName) => `Le froid mouillé de ${raceName} s'infiltre peu à peu — un combat silencieux contre l'engourdissement, qui ne se voit sur aucune image de course.`,
      choiceA: "Forcer l'allure pour te réchauffer et rester lucide", choiceB: "Te couvrir davantage, quitte à perdre un peu de rythme" },
  ],
  vent: [
    { weight: 2, phase: "Cassure dans les bordures", tendency: "offensive", label: "Le piège des échelons",
      text: (raceName) => `Le vent de côté fragmente le peloton en échelons sur ${raceName} — comme lors des grandes journées de bordures, être du bon côté de la route peut décider de la course entière, bien avant le final.`,
      choiceA: "Te battre pour entrer dans la bonne bordure, quel qu'en soit le prix", choiceB: "Rester groupé prudemment, accepter le risque de rester derrière" },
    { weight: 1, phase: "Coopération forcée", tendency: "neutral", label: "S'allier contre le vent", cooperation: true,
      text: (raceName) => `Dans le vent, personne ne s'en sort seul sur ${raceName} — même des rivaux directs doivent parfois s'allier temporairement pour ne pas se faire distancer.`,
      choiceA: "Prendre ta part de relais dans le groupe de tête", choiceB: "Te faire discret, économiser tes forces dans les roues" },
    { weight: 1, phase: "Rafales imprévisibles", tendency: "defensive", label: "Vent changeant",
      text: (raceName) => `Le vent change de direction sans prévenir sur ${raceName} — impossible d'anticiper où la prochaine bordure se formera.`,
      choiceA: "Rester vigilant à l'avant, prêt à réagir immédiatement", choiceB: "Te fier à tes équipiers pour te repositionner à temps" },
    { weight: 1, phase: "Vent favorable dans le dos", tendency: "offensive", label: "L'occasion à saisir",
      text: (raceName) => `Le vent tourne enfin dans le bon sens sur ${raceName} — une occasion rare de rouler vite sans en payer le prix habituel.`,
      choiceA: "Profiter de la poussée pour attaquer maintenant", choiceB: "Garder ce répit pour récupérer un peu avant le final" },
    { weight: 1, phase: "Seul face au vent de face", tendency: "defensive", label: "L'effort qui use",
      text: (raceName) => `Isolé en tête de ${raceName}, tu affrontes seul un vent de face implacable — chaque mètre gagné coûte bien plus cher qu'il n'y paraît.`,
      choiceA: "Continuer à forcer malgré tout, quitte à t'épuiser", choiceB: "Lever le pied, attendre un retour du groupe" },
  ],
};
// Distance totale estimée par archétype — sert uniquement à situer les moments de course sur la carte
// (kilomètres parcourus / restants affichés à chaque décision), pas une simulation physique réelle.
const ARCHETYPE_DISTANCE_KM = {
  montagne: 185, sprint: 175, paves: 245, chrono: 42, vallonnee: 195,
  accidentee: 190, classique: 205, tactique: 220, pluie: 195, vent: 195,
};
function estimateRaceDistanceKm(raceObj) {
  const arch = (raceObj.archetypes || [])[0];
  if (arch && ARCHETYPE_DISTANCE_KM[arch]) return ARCHETYPE_DISTANCE_KM[arch];
  return raceObj.isStageRace ? 175 : 200;
}
// Une scène individuelle de la séquence — le kilométrage parcouru ET restant est toujours affiché, pour
// que le joueur sente la vraie différence entre attaquer à 150 km de l'arrivée et attaquer à 20 km. Le 3e
// choix "Attaquer" est toujours disponible, avec un coût en fatigue qui augmente avec la distance restante
// à couvrir seul ou en petit groupe — un pari d'autant plus risqué qu'il est pris tôt.
// Contexte réactif — croise le profil de la scène avec l'état réel du joueur (réputation, fatigue,
// moral, équipiers, adéquation de la spécialité, matériel) pour donner une vraie raison narrative à des
// mécaniques qui restaient jusqu'ici de simples chiffres invisibles. Exemple concret : une scène de
// coopération devient "personne ne veut rouler avec toi" si ta réputation Peloton est basse — la
// mécanique sous-jacente ne change pas, seule l'histoire racontée s'adapte à qui tu es à ce moment-là.
function contextualReframe(situation, raceObj, game) {
  const p = game.player;
  const baseText = situation.text(raceObj.name);

  // La réputation Peloton peut carrément retourner une scène de coopération.
  if (situation.cooperation) {
    if (p.reputation.peloton < 25) return `${baseText} Mais ta réputation dans le peloton te précède : personne ne veut vraiment rouler avec toi aujourd'hui, il va falloir t'en sortir autrement.`;
    if (p.reputation.peloton > 75) return `${baseText} Ta bonne réputation dans le peloton facilite les choses : plusieurs coureurs sont prêts à te faire confiance.`;
  }
  // Sinon, une seule note contextuelle — la plus pertinente selon l'état réel du joueur, dans l'ordre.
  if (p.stats.fatigueChronique >= OVERTRAINING_THRESHOLD) return `${baseText} Le surmenage se fait sentir : tes jambes ne répondent plus tout à fait comme avant.`;
  if (specFit(p.specialtyPrimary, raceObj.specKey) < 0.3) return `${baseText} Ce terrain ne te correspond vraiment pas — tu le sens à chaque coup de pédale.`;
  if (p.stats.motivation < 30) return `${baseText} L'envie n'y est pas vraiment aujourd'hui, difficile de te motiver pleinement.`;
  if (p.stats.motivation > 85) return `${baseText} Tu sens que c'est un grand jour : la motivation est à son maximum.`;
  const teammates = game.teammates || [];
  if (teammates.length > 0) {
    const avgLevel = teammates.reduce((a, t) => a + t.level, 0) / teammates.length;
    if (avgLevel < 45) return `${baseText} Ton équipe peine à te soutenir aujourd'hui — tu es plutôt seul face à la course.`;
    if (avgLevel > 78) return `${baseText} Ton équipe est solide autour de toi, prête à te protéger si besoin.`;
  }
  if ((raceObj.archetypes || []).some((a) => a === "paves" || a === "pluie") && p.team) {
    if (p.team.equipmentQuality < 45) return `${baseText} Ton matériel n'est pas le plus fiable du peloton — un vrai souci sur ce genre de terrain.`;
    if (p.team.equipmentQuality > 82) return `${baseText} Ton équipe te fournit un matériel à la pointe, un vrai avantage sur ce genre de terrain.`;
  }
  return baseText;
}
function buildMomentStage(situation, raceObj, game, kmDone, kmRemaining) {
  // Coûts abaissés par rapport à l'ancienne étape tactique unique : avec 2-3 scènes désormais par course
  // au lieu d'une seule, garder les mêmes valeurs aurait gonflé le coût total de fatigue d'une course
  // entière. L'écart km-tôt vs km-tard reste intact (c'est lui qui compte), juste la base est plus légère.
  const attackFatigueCost = 2 + Math.round(kmRemaining / 45);
  return {
    phase: `KM ${kmDone} — ${situation.phase}`,
    text: `${contextualReframe(situation, raceObj, game)} (${kmRemaining} km à parcourir)`,
    choices: [
      { label: situation.choiceA, resolve: () => ({ text: "Tu places ton effort tôt, quitte à en payer le prix plus tard.", delta: { fatigue: 1, tacticalBonus: 7 } }) },
      { label: situation.choiceB, resolve: () => ({ text: "Tu restes patient, économe, prêt à frapper au bon moment.", delta: { fatigue: 0, tacticalBonus: 1 } }) },
      { label: "Attaquer, jouer le tout pour le tout", resolve: () => ({ text: `Tu places une attaque décisive à ${kmRemaining} km de l'arrivée — un vrai pari.`, delta: { fatigue: attackFatigueCost, tacticalBonus: 9 } }) },
    ],
  };
}
// La scène d'attaque du rival — ton système de rivalité s'invite directement dans le déroulé de la
// course, toujours dans le dernier tiers, là où une attaque compte vraiment.
// Pool de scènes de rivalité — 4 tensions distinctes plutôt qu'une seule scène fixe vue des dizaines de
// fois par carrière (46 fois mesuré sur une simulation de 15 saisons avant cette diversification). Un
// tirage aléatoire à chaque déclenchement, plutôt qu'une répétition mécanique du même échange.
const RIVAL_MOMENT_VARIANTS = [
  (rival, raceName, kmDone, kmRemaining) => {
    const attackFatigueCost = 2 + Math.round(kmRemaining / 45);
    return {
      phase: `KM ${kmDone} — ${rival.name} attaque`,
      text: `⚔️ ${rival.name} place une attaque à ${kmRemaining} km de l'arrivée sur ${raceName}. Le peloton se tend immédiatement. La suivre ?`,
      choices: [
        { label: "Répondre immédiatement, coller à sa roue", resolve: () => ({ text: `Tu réagis au quart de tour, dans la roue de ${rival.name}.`, delta: { fatigue: attackFatigueCost, tacticalBonus: 8, rival: { respect: 2 } } }) },
        { label: "Laisser filer, garder ton rythme", resolve: () => ({ text: `Tu laisses partir ${rival.name} sans réagir, fidèle à ton plan de course.`, delta: { fatigue: 1, rival: { haine: 1 } } }) },
        { label: "Contre-attaquer dans la foulée, prendre le dessus", resolve: () => ({ text: `Tu ne te contentes pas de suivre : tu contre-attaques directement dans la roue de ${rival.name}.`, delta: { fatigue: attackFatigueCost + 1, tacticalBonus: 10, rival: { haine: 3, respect: 1 } } }) },
      ],
    };
  },
  (rival, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — ${rival.name} te chambre`,
    text: `À hauteur de ${rival.name}, une pique fuse, clairement calculée pour te déstabiliser : « Alors, prêt à laisser passer ta chance encore une fois ? » (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Répondre par une accélération immédiate", resolve: () => ({ text: `Tu réponds par les jambes plutôt que par les mots — une relance sèche qui en dit long.`, delta: { fatigue: 4, tacticalBonus: 6, rival: { haine: 2 } } }) },
      { label: "Ignorer et garder ton calme", resolve: () => ({ text: `Tu ne mords pas à l'hameçon, concentré sur ta propre course.`, delta: { fatigue: 0 } }) },
      { label: "Répondre avec humour, désamorcer la tension", resolve: () => ({ text: `Ta répartie, presque amicale, détend l'atmosphère — inattendu, mais ça passe bien.`, delta: { rival: { respect: 3, haine: -2 } } }) },
    ],
  }),
  (rival, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — ${rival.name} refuse de collaborer`,
    text: `Dans le petit groupe qui s'est formé, ${rival.name} refuse net de prendre le moindre relais, cherchant clairement à t'épuiser avant la fin. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Forcer le rythme malgré tout, seul si besoin", resolve: () => ({ text: `Tu roules seul en tête, refusant de laisser le calcul de ${rival.name} payer.`, delta: { fatigue: 6, tacticalBonus: 5, rival: { haine: 2 } } }) },
      { label: "Jouer la même carte, ne rien faire non plus", resolve: () => ({ text: `Tu adoptes exactement la même posture — un bras de fer immobile qui profite surtout à ceux qui reviennent derrière.`, delta: { fatigue: 1, tacticalBonus: -3 } }) },
      { label: "Proposer une trêve tactique, intérêt commun avant tout", resolve: () => {
          const success = Math.random() < 0.5;
          return success
            ? { text: `${rival.name} accepte finalement de rouler avec toi — l'intérêt commun l'emporte, pour cette fois.`, delta: { fatigue: 2, tacticalBonus: 4, rival: { respect: 3 } } }
            : { text: `${rival.name} refuse net ta proposition — la rivalité l'emporte sur le calcul.`, delta: { fatigue: 1, rival: { haine: 1 } } };
        } },
    ],
  }),
  (rival, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — ${rival.name} semble en difficulté`,
    text: `Devant toi, ${rival.name} commence visiblement à perdre le rythme, à la limite de la rupture. L'occasion est réelle. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Enfoncer le clou immédiatement", resolve: () => ({ text: `Tu profites sans hésiter de la faiblesse de ${rival.name} pour creuser l'écart.`, delta: { fatigue: 3, tacticalBonus: 9, rival: { haine: 3, respect: -1 } } }) },
      { label: "Rester à son niveau, sans en rajouter", resolve: () => ({ text: `Tu restes à sa hauteur, sans profiter de la situation — un geste qui ne passe pas inaperçu.`, delta: { fatigue: 1, rival: { respect: 4 } } }) },
      { label: "Accélérer progressivement, tester sa vraie résistance", resolve: () => ({ text: `Tu montes le rythme par paliers, histoire de voir s'il peut vraiment répondre.`, delta: { fatigue: 2, tacticalBonus: 5 } }) },
    ],
  }),
];
function buildRivalMomentStage(game, raceName, kmDone, kmRemaining) {
  const rival = getRival(game);
  if (!rival) return null;
  return pick(RIVAL_MOMENT_VARIANTS)(rival, raceName, kmDone, kmRemaining);
}
// Pool de scènes d'aide d'équipier — 4 situations distinctes plutôt qu'une seule scène fixe vue des
// dizaines de fois par carrière (35 fois mesuré sur une simulation de 15 saisons avant cette
// diversification). Le mécanisme de fidélité (intensité de l'aide) reste identique sur les 4 variantes.
const TEAMMATE_ASSIST_VARIANTS = [
  (helper, raceName, kmDone, kmRemaining, loyaltyBonus) => ({
    phase: `KM ${kmDone} — ${helper.name} te rejoint`,
    text: `${helper.name} revient à ta hauteur : "Je peux te ramener dans le groupe. Mais je vais y laisser beaucoup d'énergie." (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Vas-y, ramène-moi", resolve: () => ({ text: `${helper.name} t'emmène dans une longue relance et te replace dans le groupe — au prix de ses forces.`, delta: { tacticalBonus: loyaltyBonus, teammateAssistDelta: { name: helper.name, fraicheurDelta: -20 } } }) },
      { label: "Garde tes forces", resolve: () => ({ text: `Tu remercies ${helper.name} d'un signe et gères la situation seul, pour qu'il reste disponible plus tard dans la course.`, delta: {} }) },
    ],
  }),
  (helper, raceName, kmDone, kmRemaining, loyaltyBonus) => ({
    phase: `KM ${kmDone} — ${helper.name} coupe le vent`,
    text: `Le vent forme des bordures redoutables. ${helper.name} se place devant toi : "Reste dans ma roue, je t'abrite le temps qu'il faut." (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Te mettre à l'abri dans sa roue", resolve: () => ({ text: `Tu t'abrites efficacement derrière ${helper.name}, qui absorbe l'essentiel de l'effort face au vent.`, delta: { tacticalBonus: loyaltyBonus, fatigue: -2, teammateAssistDelta: { name: helper.name, fraicheurDelta: -18 } } }) },
      { label: "Rester à ton propre rythme", resolve: () => ({ text: `Tu préfères gérer le vent à ta façon, sans solliciter ${helper.name}.`, delta: {} }) },
    ],
  }),
  (helper, raceName, kmDone, kmRemaining, loyaltyBonus) => ({
    phase: `KM ${kmDone} — ${helper.name} se prépare à te lancer`,
    text: `Le final approche. ${helper.name} remonte à l'avant : "Colle à ma roue, je t'emmène le plus loin possible." (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Te placer dans sa roue pour le lancement", resolve: () => ({ text: `${helper.name} t'emmène dans un train parfaitement mené, te déposant idéalement placé.`, delta: { tacticalBonus: loyaltyBonus + 1, teammateAssistDelta: { name: helper.name, fraicheurDelta: -22 } } }) },
      { label: "Décliner, te placer par toi-même", resolve: () => ({ text: `Tu préfères gérer ton placement seul, laissant ${helper.name} garder ses forces.`, delta: {} }) },
    ],
  }),
  (helper, raceName, kmDone, kmRemaining, loyaltyBonus) => ({
    phase: `KM ${kmDone} — ${helper.name} couvre un mouvement dangereux`,
    text: `Une attaque adverse se dessine à l'avant. ${helper.name} s'approche : "Je m'en occupe, reste concentré sur ta propre course." (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Le laisser gérer, économiser tes forces", resolve: () => ({ text: `${helper.name} neutralise la menace à ta place, te laissant gérer ton propre effort.`, delta: { tacticalBonus: loyaltyBonus - 1, fatigue: -3, teammateAssistDelta: { name: helper.name, fraicheurDelta: -16 } } }) },
      { label: "Réagir toi-même, par précaution", resolve: () => ({ text: `Tu préfères réagir personnellement, sans reposer sur ${helper.name} pour cette fois.`, delta: { fatigue: 2 } }) },
    ],
  }),
];
function buildTeammateAssistMomentStage(game, raceName, kmDone, kmRemaining) {
  const teammates = game.teammates || [];
  const available = teammates.filter((tm) => (tm.fraicheur ?? 100) >= 25);
  if (available.length === 0) return null;
  // Un équipier fidèle est plus enclin à se sacrifier même un peu usé — pas seulement le plus frais dans l'absolu.
  const helper = [...available].sort((a, b) => ((b.fraicheur ?? 100) + (b.loyaute ?? 70) * 0.6) - ((a.fraicheur ?? 100) + (a.loyaute ?? 70) * 0.6))[0];
  // L'intensité de l'aide reflète la fidélité réelle du coéquipier — entre 4 (fidélité faible) et 9 (fidélité maximale),
  // plutôt qu'un bonus fixe identique quel que soit qui vient t'aider.
  const loyaltyBonus = Math.round(4 + (helper.loyaute ?? 70) / 100 * 5);
  return pick(TEAMMATE_ASSIST_VARIANTS)(helper, raceName, kmDone, kmRemaining, loyaltyBonus);
}

// Scènes propres à la course au maillot vert (points) en Grand Tour — n'apparaissent que lorsque le
// classement par points est vraiment en jeu pour le joueur ce jour-là, jamais de façon generique.
const GREEN_JERSEY_MOMENTS = [
  (game, tourName) => ({
    phase: "Sprint intermédiaire",
    text: `Le sprint intermédiaire approche sur ${tourName} — tes adversaires directs pour le maillot vert sont tous regroupés dans ton groupe, personne ne veut laisser filer de points gratuitement.`,
    choices: [
      { label: "Prendre des risques pour passer en tête", resolve: () => ({ text: "Tu te bats crânement pour la première place au sprint intermédiaire, quitte à frôler la chute.", delta: { fatigue: 4, tacticalBonus: 3, gtUpdate: { pointsPoints: 6 } } }) },
      { label: "Jouer la sécurité, viser une place modeste", resolve: () => ({ text: "Tu te contentes d'une place raisonnable, sans t'exposer inutilement.", delta: { fatigue: 1, gtUpdate: { pointsPoints: 2 } } }) },
    ],
  }),
  (game, tourName) => ({
    phase: "Consigne du DS",
    text: `Ta radio d'oreillette grésille : ton DS te demande explicitement de disputer le sprint intermédiaire sur ${tourName} — l'équipe a besoin de ces points pour ton classement par points.`,
    choices: [
      { label: "Obéir et te positionner pour le sprint", resolve: () => ({ text: "Tu suis la consigne à la lettre, mobilisant de l'énergie pour ce sprint intermédiaire.", delta: { fatigue: 5, gtUpdate: { pointsPoints: 5 } } }) },
      { label: "Ignorer, économiser tes forces pour plus tard", resolve: () => ({ text: "Tu choisis de garder tes jambes, au risque de décevoir ton DS.", delta: { fatigue: 0, relationEquipe: -2 } }) },
    ],
  }),
  (game, tourName) => {
    const rival = getClassificationRival(game, ["sprinteur", "puncheur"]);
    const isTrackedRival = rival && game.rivalId === rival.id;
    const rivalName = rival ? rival.name : "un adversaire direct";
    return {
      phase: "Attaque avant le sprint intermédiaire",
      text: `${rivalName} place une accélération inattendue juste avant le sprint intermédiaire de ${tourName} — le laisser partir coûterait cher au classement par points.`,
      choices: [
        { label: "Le poursuivre immédiatement", resolve: () => ({ text: `Tu recolles à ${rivalName} au prix d'un effort payant, mais coûteux.`, delta: { fatigue: 5, tacticalBonus: 2, gtUpdate: { pointsPoints: 4 }, ...(isTrackedRival ? { rival: { haine: 1 } } : {}) } }) },
        { label: "Le laisser partir, économiser tes forces", resolve: () => ({ text: `Tu laisses filer ${rivalName}, préférant préserver tes jambes pour la suite de l'étape.`, delta: { fatigue: 0 } }) },
      ],
    };
  },
];
// Scènes propres à la course au classement général (maillot jaune) en Grand Tour — rival direct, gestion
// d'écart, pression d'un favori qui attaque, jamais de façon generique non plus.
const YELLOW_JERSEY_MOMENTS = [
  (game, tourName) => {
    const rival = getClassificationRival(game, ["grimpeur", "rouleur", "polyvalent", "puncheur"]);
    const rivalName = rival ? rival.name : "ton rival direct au classement";
    return {
      phase: "Duel pour le général",
      text: `Dans le groupe des favoris de ${tourName}, ${rivalName} — ton adversaire direct au classement général — teste le rythme, cherchant la moindre faille.`,
      choices: [
        { label: "Répondre immédiatement, ne rien céder", resolve: () => ({ text: `Tu réponds coup pour coup à ${rivalName}, refusant de perdre le moindre instant.`, delta: { fatigue: 5, gtUpdate: { gcPoints: 3 } } }) },
        { label: "Gérer prudemment, limiter la casse", resolve: () => ({ text: `Tu géres ton effort, quitte à céder quelques secondes plutôt que de tout risquer.`, delta: { fatigue: 2, gtUpdate: { gcPoints: -1 } } }) },
      ],
    };
  },
  (game, tourName) => ({
    phase: "Un favori attaque",
    text: `Un favori du classement général place une attaque loin de l'arrivée sur ${tourName} — toute l'équipe se tourne vers toi, la pression médiatique de cette étape retombe directement sur tes épaules.`,
    choices: [
      { label: "Organiser la poursuite avec l'équipe", resolve: (g) => ({ text: "Tu mobilises tes équipiers pour contrôler l'écart, une vraie démonstration de force collective.", delta: { fatigue: 3, tacticalBonus: 3 + Math.round(SkillEngine.teammatesBonus(g.player) / 20), gtUpdate: { gcPoints: 2 } } }) },
      { label: "Laisser une autre équipe prendre ses responsabilités", resolve: () => ({ text: "Tu restes en retrait, espérant qu'une autre équipe menacée réagisse à ta place.", delta: { fatigue: 0, gtUpdate: { gcPoints: -2 } } }) },
    ],
  }),
  (game, tourName) => ({
    phase: "Défendre le maillot",
    text: `Une bordure se forme dans le vent de travers sur ${tourName} — une occasion réelle de gagner du temps sur tes rivaux directs au classement, ou de s'en faire prendre si tu n'es pas assez attentif.`,
    choices: [
      { label: "Te battre pour entrer dans la bonne bordure", resolve: () => ({ text: "Tu te bats farouchement pour rester devant la cassure — un effort payant.", delta: { fatigue: 6, gtUpdate: { gcPoints: 4 } } }) },
      { label: "Rester groupé, prudent", resolve: () => ({ text: "Tu restes prudent, préférant ne pas t'exposer à une chute dans la bataille de position.", delta: { fatigue: 2 } }) },
    ],
  }),
  (game, tourName) => ({
    phase: "Consigne du DS — stratégie d'équipe",
    text: `Ta radio d'oreillette grésille : ton DS a une idée précise de la stratégie à suivre aujourd'hui sur ${tourName} pour protéger ta position au classement général — reste-t-il à toi de la valider ou de faire confiance à ton propre ressenti en course ?`,
    choices: [
      { label: "Suivre la stratégie du DS à la lettre", resolve: () => ({ text: "Tu appliques scrupuleusement le plan annoncé par ton DS — la cohésion d'équipe en sort renforcée.", delta: { fatigue: 3, relationEquipe: 3, gtUpdate: { gcPoints: 2 } } }) },
      { label: "Faire confiance à ton propre ressenti en course", resolve: () => ({ text: "Tu t'écartes du plan initial, faisant confiance à ta lecture de la course — un pari qui n'engage que toi.", delta: { fatigue: 2, relationEquipe: -1, gtUpdate: { gcPoints: 1 } } }) },
    ],
  }),
];
// Décide quel maillot mettre en scène aujourd'hui. Priorité à l'objectif explicitement déclaré au grand
// départ (65% du temps, jamais 100% — sinon "j'ai choisi le vert" devient mécaniquement "8 scènes de
// sprint d'affilée", perdant tout son impact). Le reste du temps (dont chaque fois que l'objectif est
// général/montagne/jeunes, qui n'ont pas de pool dédié ici), repli sur ce qui est VRAIMENT en jeu pour ce
// joueur — jamais de façon générique : sans enjeu réel, aucune scène ne s'insère.
function buildGTJerseyMoment(game, tourName) {
  const gt = game.currentGT;
  if (!gt) return null;
  if (gt.objective === "points" && Math.random() < 0.65) return pick(GREEN_JERSEY_MOMENTS)(game, tourName);
  if (gt.objective === "general" && Math.random() < 0.65) return pick(YELLOW_JERSEY_MOMENTS)(game, tourName);
  const candidates = [];
  if (gt.pointsScore >= 20) candidates.push("green");
  if (gt.gcScore >= 65) candidates.push("yellow");
  if (candidates.length === 0) return null;
  const focus = pick(candidates);
  const pool = focus === "green" ? GREEN_JERSEY_MOMENTS : YELLOW_JERSEY_MOMENTS;
  return pick(pool)(game, tourName);
}
// Moments de compétence débloquée — remplacent les anciens choix passifs (juste une ligne de plus dans
// une liste de 4-5 options, sans jamais se distinguer). Chaque compétence débloquée donne désormais accès
// à une vraie scène dédiée, avec un texte qui explique la situation et l'opportunité précisément liée à
// cette compétence — le même effet mécanique qu'avant, mais un cadre narratif qui la rend enfin lisible.
const SKILL_MOMENT_BUILDERS = {
  contre_attaquer: (game, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — Une brèche s'ouvre`,
    text: `Ta lecture de course t'alerte : une faille vient de s'ouvrir dans le peloton sur ${raceName}. C'est le genre d'occasion qui ne se représente pas deux fois. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Contre-attaquer immédiatement", resolve: () => ({ text: "Tu lis la course et places une contre-attaque immédiate.", delta: { fatigue: 5, tacticalBonus: 6 } }) },
      { label: "Laisser passer, ce n'est pas le bon moment", resolve: () => ({ text: "Tu juges le risque trop grand pour l'opportunité, et restes dans le peloton.", delta: {} }) },
    ],
  }),
  suivre_rival: (game, raceName, kmDone, kmRemaining) => {
    const rival = getRival(game);
    const rivalName = rival ? rival.name : "ton rival";
    return {
      phase: `KM ${kmDone} — Ne plus lâcher ${rivalName}`,
      text: `Tu repères ${rivalName} qui se prépare visiblement à un mouvement sur ${raceName}. Coller à sa roue, coûte que coûte, pourrait être la clé de la course. (${kmRemaining} km à parcourir)`,
      choices: [
        { label: "Suivre uniquement le rival, sans te préoccuper du reste", resolve: () => ({ text: `Tu colles à la roue de ${rivalName}, sans te préoccuper du reste.`, delta: { fatigue: 2, tacticalBonus: 4, rival: { haine: 4 } } }) },
        { label: "Rester concentré sur ta propre course", resolve: () => ({ text: "Tu préfères ne pas te focaliser sur un seul adversaire.", delta: {} }) },
      ],
    };
  },
  demander_relais: (game, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — Solliciter un équipier`,
    text: `Le vent te fatigue plus que prévu sur ${raceName}. Un équipier reste à portée de voix — tu sais exactement comment lui demander un relais efficace. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Demander un relais à un équipier", resolve: () => ({ text: "Un équipier vient te protéger du vent et t'économise un maximum d'énergie.", delta: { fatigue: -6, tacticalBonus: 2, teammatesDelta: { moral: 2 } } }) },
      { label: "Gérer seul, ne pas solliciter l'équipe", resolve: () => ({ text: "Tu préfères ne pas mobiliser un équipier pour si peu.", delta: {} }) },
    ],
  }),
  attendre_dernier_col: (game, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — Garder ses forces pour la fin`,
    text: `Le dernier col approche sur ${raceName}. Tu sais que c'est là, et nulle part ailleurs, que la course se jouera vraiment. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Attendre le dernier col, économiser tes forces", resolve: () => ({ text: "Tu te contiens, économe, en réservant tes forces pour l'ascension finale.", delta: { fatigue: -3, tacticalBonus: 2, flags: { savedForFinalClimb: true } } }) },
      { label: "Rester dans le rythme actuel", resolve: () => ({ text: "Tu ne changes rien à ton approche, quitte à arriver un peu moins frais au pied du col décisif.", delta: {} }) },
    ],
  }),
  attaque_tardive: (game, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — Le moment de frapper`,
    text: `Le final de ${raceName} approche. Ton explosivité pourrait faire toute la différence, à l'endroit et au moment parfaits. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Placer une attaque tardive et décisive", resolve: () => {
          const success = Math.random() < 0.55;
          return success
            ? { text: "Ton explosivité fait la différence, à l'endroit et au moment parfaits — personne n'a pu répondre.", delta: { fatigue: 7, tacticalBonus: 12 } }
            : { text: "L'attaque ne prend pas : le peloton, vigilant, n'a rien laissé filer aussi facilement.", delta: { fatigue: 9, tacticalBonus: -3 } };
        } },
      { label: "Rester prudent, ne pas tenter le pari", resolve: () => ({ text: "Tu préfères ne pas prendre le risque, quitte à le regretter plus tard.", delta: {} }) },
    ],
  }),
  tout_pour_le_tout: (game, raceName, kmDone, kmRemaining) => ({
    phase: `KM ${kmDone} — Tout jouer sur un coup`,
    text: `Les derniers hectomètres de ${raceName} approchent. C'est le genre de moment où un pari audacieux peut tout changer — ou tout gâcher. (${kmRemaining} km à parcourir)`,
    choices: [
      { label: "Jouer le tout pour le tout", resolve: () => {
          const success = Math.random() < 0.5;
          return success
            ? { text: "Le pari est payant : ton explosivité surprend tout le monde !", delta: { fatigue: 6, tacticalBonus: 14 } }
            : { text: "Le pari échoue : tu as grillé tes cartouches trop tôt.", delta: { fatigue: 8, tacticalBonus: -6 } };
        } },
      { label: "Jouer la sécurité", resolve: () => ({ text: "Tu préfères ne pas tout risquer sur un seul coup.", delta: {} }) },
    ],
  }),
};
// Choisit laquelle des scènes de compétence proposer, parmi celles que le joueur a réellement débloquées
// et qui restent pertinentes dans ce contexte précis (un rival établi pour "suivre_rival", un profil de
// course montagneux pour "attendre_dernier_col", jamais deux fois le même dernier col sur une course).
function buildSkillMomentStage(game, raceObj, kmDone, kmRemaining) {
  const player = game.player;
  const archetypes = raceObj.archetypes || [];
  const isNationalChamps = raceObj.raceTier === "National";
  const candidates = Object.keys(SKILL_MOMENT_BUILDERS).filter((key) => {
    if (!SkillEngine.hasUnlockedChoice(player, key)) return false;
    // Le Championnat national se dispute entre compatriotes — un équipier de club (n'importe quelle
    // nationalité) n'a logiquement rien à faire ici, pas plus qu'un rival d'une autre nation.
    if (key === "demander_relais" && isNationalChamps) return false;
    if (key === "suivre_rival" && (!getRival(game) || (isNationalChamps && getRival(game).nation !== player.nation?.code))) return false;
    if (key === "attendre_dernier_col" && (player.flags?.savedForFinalClimb || !archetypes.includes("montagne"))) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  const chosenKey = pick(candidates);
  return SKILL_MOMENT_BUILDERS[chosenKey](game, raceObj.name, kmDone, kmRemaining);
}
// Construit la séquence complète de moments de course — 2 à 3 scènes situées dans la course, piochées
// selon l'archétype de la course (et la météo du jour, qui peut prendre le pas dessus). Une place est
// réservée à une scène spéciale — attaque du rival OU coup de main d'un équipier, mutuellement exclusifs
// pour ne pas allonger excessivement chaque course — le reste vient du vocabulaire propre à l'archétype.
// Pondère le pool de situations selon la stratégie choisie au plan de course avant le départ — une
// stratégie Offensive favorise nettement les situations taguées "offensive" (attaque, échappée,
// contre-attaque), une stratégie Prudente favorise les situations "defensive" (placement, gestion,
// protection). Équilibrée ne change rien : le tirage reste celui d'origine.
function applyStrategyWeights(pool, strategy) {
  if (!strategy || strategy === "equilibree") return pool;
  const multipliers = { offensive: { offensive: 2.5, neutral: 1, defensive: 0.4 }, prudente: { offensive: 0.4, neutral: 1, defensive: 2.5 } }[strategy];
  if (!multipliers) return pool;
  return pool.map((s) => ({ ...s, weight: (s.weight || 1) * (multipliers[s.tendency || "neutral"] || 1) }));
}
// ============================================================================
// ÉVÉNEMENTS RARES — probabilités absolues et indépendantes (pas une pioche pondérée relative comme
// INCIDENT_POOL) : chacun a SA chance propre, volontairement basse, pour rester mémorable plutôt que de
// devenir un bruit de fond attendu à chaque course. Séparé du système d'imprévus existant.
// ============================================================================
// ============================================================================
// ARRIVÉES DIFFÉRENCIÉES PAR ARCHÉTYPE — jusqu'ici, une arrivée pavée et une arrivée en montagne
// utilisaient exactement le même habillage générique ("Ligne d'arrivée" / texte neutre). Le mécanisme
// de résolution (finishChoices, déjà bien testé) reste strictement inchangé — seuls le nom de la phase
// et le texte d'intro varient, piochés selon l'archétype de la course.
// ============================================================================
const FINISH_TYPES = {
  montagne: [
    { phase: "Arrivée au sommet", text: (raceName) => `Les derniers hectomètres grimpent encore, jambes en feu, avant la ligne d'arrivée de ${raceName}.` },
    { phase: "Dernier kilomètre en danseuse", text: (raceName) => `Plus un souffle en réserve : les tout derniers mètres de ${raceName} se courent en danseuse, au bord de la rupture.` },
  ],
  sprint: [
    { phase: "Sprint massif", text: (raceName) => `Le peloton se referme dans les derniers hectomètres de ${raceName} — un sprint massif s'annonce, disputé jusqu'à la ligne.` },
    { phase: "Dernière ligne droite", text: (raceName) => `La ligne droite finale de ${raceName} s'ouvre enfin, à pleine vitesse, dans un vacarme de dérailleurs.` },
  ],
  paves: [
    { phase: "Derniers secteurs pavés", text: (raceName) => `Les tout derniers secteurs pavés de ${raceName} achèvent de faire le tri avant la ligne d'arrivée.` },
    { phase: "Vers le vélodrome", text: (raceName) => `Les derniers kilomètres de ${raceName} filent vers l'arrivée, jambes en compote après tant de kilomètres de pavés.` },
  ],
  chrono: [
    { phase: "Derniers relevés chronométriques", text: (raceName) => `Le dernier repère chronométrique de ${raceName} vient de tomber — il ne reste que quelques minutes d'effort solitaire.` },
  ],
  vallonnee: [
    { phase: "Dernière bosse avant l'arrivée", text: (raceName) => `Une ultime relance avant la ligne de ${raceName} — le genre de détail qui décide tout sur ce type de parcours.` },
  ],
  accidentee: [
    { phase: "Dernier kilomètre incertain", text: (raceName) => `Après tant de kilomètres d'usure sur ${raceName}, personne ne sait vraiment qui a encore des jambes pour ce final.` },
  ],
  classique: [
    { phase: "Le final se joue", text: (raceName) => `Le groupe de tête de ${raceName} aborde les derniers kilomètres, chacun jaugeant les autres avant le coup décisif.` },
  ],
  tactique: [
    { phase: "Dernières manœuvres", text: (raceName) => `Dans les derniers kilomètres de ${raceName}, chaque position, chaque regard, chaque hésitation peut encore tout changer.` },
  ],
  pluie: [
    { phase: "Arrivée sous la pluie", text: (raceName) => `La ligne d'arrivée de ${raceName} approche, toujours détrempée — un sprint ou une attaque sur cette chaussée reste un vrai pari.` },
  ],
  vent: [
    { phase: "Dernières bordures", text: (raceName) => `Le vent souffle encore sur les derniers kilomètres de ${raceName} — la position dans la route compte autant que les jambes.` },
  ],
};
// Remplace le phase/texte générique de l'arrivée par une variante piochée selon l'archétype — les choix
// eux-mêmes (finishChoices, déjà éprouvé) restent strictement identiques, seul l'habillage change.
// keepOwnFinish : une course peut porter un archétype (pour bénéficier de la variété des moments en
// milieu de course) tout en gardant son texte d'arrivée sur mesure — comme Flèche Wallonne et son Mur
// de Huy, déjà spécifique et bien écrit, qui n'a pas besoin d'être remplacé par un habillage générique.
function applyFinishFlavor(finalStage, raceObj) {
  if (raceObj.keepOwnFinish) return finalStage;
  const archetypes = (raceObj.archetypes || []).filter((a) => FINISH_TYPES[a]);
  if (archetypes.length === 0) return finalStage;
  const pool = FINISH_TYPES[pick(archetypes)];
  const variant = pick(pool);
  return { ...finalStage, phase: variant.phase, text: variant.text(raceObj.name) };
}

const RARE_EVENTS = [
  { id: "accident_devant", chance: 0.05,
    build: (game, raceName, kmDone, kmRemaining) => ({
      phase: `KM ${kmDone} — ⚠️ Accident devant toi`,
      text: `Une chute se produit brutalement à quelques mètres devant toi — la route se bloque en un instant, il faut réagir tout de suite. (${kmRemaining} km à parcourir)`,
      choices: [
        { label: "Freiner fort, quitte à perdre du terrain", resolve: () => ({ text: "Tu freines à temps et évites le pire, mais tu perds quelques précieuses secondes.", delta: { forme: -1, tacticalBonus: -3 } }) },
        { label: "Prendre le risque de passer par le bas-côté", resolve: () => {
            const success = Math.random() < 0.7;
            return success
              ? { text: "Un pari payant : tu te faufiles au prix d'une bonne frayeur, mais tu restes dans le bon wagon.", delta: { reputation: 2, fatigue: 3, tacticalBonus: 5 } }
              : { text: "Le pari ne paie pas : tu touches un vélo et chutes légèrement, perdant du temps et de l'énergie.", delta: { forme: -4, fatigue: 6, tacticalBonus: -5 } };
          } },
      ],
    }) },
  { id: "crevaison", chance: 0.03,
    build: (game, raceName, kmDone, kmRemaining, raceObj) => {
      // Un coéquipier de trade-team n'a logiquement rien à faire au Championnat national, disputé entre
      // compatriotes — la course continue, mais sans lui.
      const teammate = raceObj?.raceTier === "National" ? null : (game.teammates || [])[0];
      return {
        phase: `KM ${kmDone} — 🔧 Crevaison`,
        text: `Ta roue se dérobe soudainement — crevaison, au pire moment. Le peloton continue sans toi pendant que la voiture technique approche. (${kmRemaining} km à parcourir)`,
        choices: [
          { label: "Changer de roue au plus vite et repartir seul", resolve: () => ({ text: "Tu repars vite, mais l'écart est fait — il va falloir revenir seul.", delta: { fatigue: 5, tacticalBonus: -6 } }) },
          ...(teammate ? [{ label: `Attendre ${teammate.name}, qui t'attend pour te ramener`, resolve: () => ({ text: `${teammate.name} t'attend et te ramène dans le peloton, à l'abri du vent.`, delta: { fatigue: 3, tacticalBonus: -1, teammateAssistDelta: { name: teammate.name, fraicheurDelta: -12 } } }) }] : []),
        ],
      };
    } },
  { id: "mecanique_rare", chance: 0.02,
    build: (game, raceName, kmDone, kmRemaining) => ({
      phase: `KM ${kmDone} — ⚙️ Problème mécanique`,
      text: `Ta chaîne déraille dans un passage technique — quelques secondes précieuses perdues, le temps de remettre le pied à terre. (${kmRemaining} km à parcourir)`,
      choices: [
        { label: "Réparer toi-même, au plus vite", resolve: () => ({ text: "Tu répares en quelques secondes, sans perdre trop de temps.", delta: { fatigue: 2, tacticalBonus: -3 } }) },
        { label: "Attendre le changement de vélo complet", resolve: () => ({ text: "Le changement de vélo prend plus de temps, mais tu repars dans de bonnes conditions.", delta: { fatigue: 1, tacticalBonus: -7 } }) },
      ],
    }) },
  { id: "rival_chute", chance: 0.05, condition: (game) => !!getRival(game),
    build: (game, raceName, kmDone, kmRemaining) => {
      const rival = getRival(game);
      return {
        phase: `KM ${kmDone} — ${rival.name} chute`,
        text: `💥 ${rival.name} chute lourdement dans un virage devant toi — une occasion inattendue se présente. (${kmRemaining} km à parcourir)`,
        choices: [
          { label: "Profiter de l'occasion pour accélérer", resolve: () => ({ text: `Tu profites sans hésiter de la chute de ${rival.name} pour creuser l'écart.`, delta: { fatigue: 4, tacticalBonus: 7, rival: { haine: 2 }, historyNote: `profite sans hésiter d'une chute de ${rival.name} en pleine course pour creuser l'écart.` } }) },
          { label: "Attendre qu'il reparte, par fair-play", resolve: () => ({ text: `Tu lèves le pied par respect, le temps que ${rival.name} reparte — un geste qui ne passe pas inaperçu.`, delta: { reputation: 4, rival: { respect: 6, haine: -3 }, historyNote: `attend ${rival.name}, tombé en course, par fair-play — un geste remarqué dans tout le peloton.` } }) },
        ],
      };
    } },
  { id: "meteo_changeante", chance: 0.02,
    build: (game, raceName, kmDone, kmRemaining) => ({
      phase: `KM ${kmDone} — 🌦️ Météo changeante`,
      text: `Le ciel change brutalement de visage — une averse s'abat sans prévenir sur la course, rebattant les cartes en un instant. (${kmRemaining} km à parcourir)`,
      choices: [
        { label: "S'adapter tout de suite, prendre des risques", resolve: () => ({ text: "Tu t'adaptes vite aux nouvelles conditions et en profites pour te montrer.", delta: { fatigue: 4, tacticalBonus: 6 } }) },
        { label: "Rester prudent, laisser la course se calmer", resolve: () => ({ text: "Tu restes prudent, laissant les autres prendre les risques dans ces nouvelles conditions.", delta: { fatigue: 1, tacticalBonus: -1 } }) },
      ],
    }) },
  { id: "equipier_exceptionnel", chance: 0.03, condition: (game, raceObj) => (game.teammates || []).length > 0 && raceObj?.raceTier !== "National",
    build: (game, raceName, kmDone, kmRemaining) => {
      const helper = [...(game.teammates || [])].sort((a, b) => b.level - a.level)[0];
      return {
        phase: `KM ${kmDone} — ${helper.name} est exceptionnel aujourd'hui`,
        text: `💪 ${helper.name} traverse une forme exceptionnelle aujourd'hui — un jour comme il en arrive rarement, où tout semble facile pour lui. (${kmRemaining} km à parcourir)`,
        choices: [
          { label: "Te mettre pleinement dans sa roue", resolve: () => ({ text: `Tu profites à plein de la forme éclatante de ${helper.name}, qui t'emmène vers l'avant sans effort apparent.`, delta: { fatigue: -4, tacticalBonus: 10, teammatesDelta: { moral: 3 } } }) },
          { label: "Le laisser jouer sa propre carte aujourd'hui", resolve: () => ({ text: `Tu laisses ${helper.name} profiter de sa journée pour lui-même — un beau geste, remarqué dans le vestiaire.`, delta: { relationEquipe: 6, teammatesDelta: { moral: 5 }, historyNote: `laisse ${helper.name} jouer sa propre carte un jour de grande forme, plutôt que d'en profiter — un geste remarqué dans le vestiaire.` } }) },
        ],
      };
    } },
  { id: "echappee_historique", chance: 0.01,
    build: (game, raceName, kmDone, kmRemaining) => ({
      phase: `KM ${kmDone} — 🏆 Échappée historique`,
      text: `Une échappée hors normes se dessine sur ${raceName} — le genre de mouvement qui, une fois par génération, résiste jusqu'au bout et entre dans l'histoire de la course. Tu es dedans. (${kmRemaining} km à parcourir)`,
      choices: [
        { label: "Y croire à fond, tout donner pour cette échappée", resolve: () => ({ text: "Tu t'engages corps et âme dans cette échappée hors du commun — quoi qu'il arrive, ce jour restera gravé.", delta: { fatigue: 10, tacticalBonus: 12, reputation: 5, historyNote: `s'engage à fond dans une échappée historique sur ${raceName} — un jour qui restera gravé, quoi qu'il arrive.` } }) },
        { label: "Rester prudent, ça ne tiendra probablement pas", resolve: () => ({ text: "Tu restes sceptique et gères ton effort — l'échappée, elle, entrera quand même dans les livres sans toi.", delta: { fatigue: 1, tacticalBonus: -2, historyNote: `regarde une échappée entrer dans l'histoire de ${raceName} sans y avoir cru — une occasion manquée.` } }) },
      ],
    }) },
];
// Modificateurs de probabilité par archétype — un problème mécanique ou une crevaison sont logiquement
// plus probables sur pavés que sur un sprint plat, une échappée historique bien plus probable dans une
// classique tactique que sur un chrono où l'on roule seul. Multiplie la chance de base ; 1 = inchangé.
const RARE_EVENT_ARCHETYPE_MODIFIER = {
  accident_devant: { paves: 1.4, pluie: 1.3, vent: 1.2, chrono: 0.4 },
  crevaison: { paves: 2.5, accidentee: 1.3, chrono: 0.5 },
  mecanique_rare: { paves: 2.2, accidentee: 1.2 },
  rival_chute: { paves: 1.3, pluie: 1.4, vent: 1.2, chrono: 0.3 },
  meteo_changeante: { chrono: 0.3, montagne: 1.2 },
  equipier_exceptionnel: { tactique: 1.3, classique: 1.2, chrono: 0.4 },
  echappee_historique: { classique: 2.2, accidentee: 1.4, chrono: 0.1, sprint: 0.3 },
};
function archetypeModifierFor(eventId, archetypes) {
  const table = RARE_EVENT_ARCHETYPE_MODIFIER[eventId];
  if (!table) return 1;
  const matches = (archetypes || []).map((a) => table[a]).filter((v) => v !== undefined);
  if (matches.length === 0) return 1;
  // Plusieurs archétypes sur une même course : on retient le modificateur le plus marqué (dans un sens
  // ou l'autre par rapport à 1) plutôt qu'une moyenne qui gommerait l'intention de chacun.
  return matches.reduce((best, m) => (Math.abs(m - 1) > Math.abs(best - 1) ? m : best), 1);
}
// Un seul événement rare par course maximum, tiré indépendamment de tout le reste — l'ordre de test est
// mélangé à chaque tirage pour qu'aucun événement n'ait de priorité structurelle sur un autre.
function rollRareEvent(game, raceObj) {
  const archetypes = raceObj?.archetypes || [];
  const shuffled = [...RARE_EVENTS].sort(() => Math.random() - 0.5);
  for (const ev of shuffled) {
    if (ev.condition && !ev.condition(game, raceObj)) continue;
    const effectiveChance = clamp01(ev.chance * archetypeModifierFor(ev.id, archetypes), 0, 1);
    if (Math.random() < effectiveChance) return ev;
  }
  return null;
}

// Probabilité que la météo du jour prenne le pas sur l'identité de terrain habituelle de la course —
// varie par archétype : un effort solitaire contre la montre se prête mal à une scène de "bordures" ou
// de "coopération forcée" pensée pour un peloton groupé, quand les pavés ou le sprint massif y sont au
// contraire particulièrement sensibles.
const WEATHER_TAKEOVER_CHANCE = {
  [WEATHER.PLUIE]: { default: 0.6, chrono: 0.25, montagne: 0.5 },
  [WEATHER.VENT]: { default: 0.6, chrono: 0.2, paves: 0.75, sprint: 0.7 },
};
function weatherTakeoverChance(weather, archetypes) {
  const table = WEATHER_TAKEOVER_CHANCE[weather];
  if (!table) return 0;
  const specific = (archetypes || []).map((a) => table[a]).filter((v) => v !== undefined);
  return specific.length > 0 ? Math.max(...specific) : table.default;
}
// Nombre de moments de course selon l'importance réelle de la course — une petite course d'ouverture de
// saison n'a pas à peser aussi lourd qu'un Monument. Une fourchette, pas un chiffre fixe, pour varier
// légèrement d'une édition à l'autre de la même course.
function momentCountFor(raceObj) {
  if (MAJOR_RACE_NAMES.has(raceObj.name)) return rand(4, 5);
  if (raceObj.raceTier === "WT") return rand(3, 4);
  if (raceObj.raceTier === "Pro") return rand(2, 3);
  return 2;
}
// Étape calme — le peloton reste groupé, rien de notable ne se joue, juste une vraie respiration dans le
// récit. Un simple "Continuer", sans coût ni bonus. Plus fréquente sur les petites courses (souvent
// vraiment tranquilles avant le final) et pour un profil déjà bien adapté à une course de sprint — un
// sprinteur sur une étape de plaine n'a pas à revivre le même enchaînement de choix qu'un baroudeur.
function calmPassageChance(raceObj, game) {
  let chance = 0.12;
  if (!MAJOR_RACE_NAMES.has(raceObj.name) && raceObj.raceTier !== "WT") chance += 0.22;
  if ((raceObj.archetypes || []).includes("sprint") && specFit(game.player.specialtyPrimary, raceObj.specKey) >= 0.8) chance += 0.25;
  return clamp01(chance, 0, 0.55);
}
const CALM_PASSAGE_TEXTS = [
  (raceName) => `Le peloton reste groupé sur cette portion de ${raceName} — rien ne bouge, chacun économise ses forces.`,
  (raceName) => `Ton équipe contrôle sereinement le rythme de la course sur ${raceName} — une étape sans histoire, pour l'instant.`,
  (raceName) => `La route défile sans accroc sur ${raceName}. Aucune équipe ne prend l'initiative de rendre la course difficile.`,
];
function buildCalmPassageStage(raceObj, kmDone, kmRemaining) {
  return {
    phase: `KM ${kmDone} — Course tranquille`,
    text: `${pick(CALM_PASSAGE_TEXTS)(raceObj.name)} (${kmRemaining} km à parcourir)`,
    choices: [{ label: "Continuer", resolve: () => ({ text: "Tu roules tranquillement dans le peloton, en attendant que ça bouge.", delta: {} }) }],
  };
}
// Répartit N moments sur la course, jamais collés au départ ni à l'arrivée — fonctionne pour n'importe
// quel nombre de moments (2 à 5), contrairement aux fractions fixes d'avant qui ne géraient que 2 ou 3.
function evenlySpreadFractions(n) {
  if (n <= 1) return [0.5];
  const start = 0.2, end = 0.85;
  const step = (end - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => start + step * i);
}
function buildRaceMomentsSequence(raceObj, game, weather) {
  const archetypes = raceObj.archetypes || [];
  const validArchetypes = archetypes.filter((a) => ARCHETYPE_SITUATIONS[a]);
  let pool = null;
  if (weather === WEATHER.PLUIE && Math.random() < weatherTakeoverChance(weather, archetypes)) pool = ARCHETYPE_SITUATIONS.pluie;
  else if (weather === WEATHER.VENT && Math.random() < weatherTakeoverChance(weather, archetypes)) pool = ARCHETYPE_SITUATIONS.vent;
  else if (validArchetypes.length > 0) pool = ARCHETYPE_SITUATIONS[pick(validArchetypes)];
  if (!pool) return null;
  pool = applyStrategyWeights(pool, game.raceState?.strategy);

  const totalKm = estimateRaceDistanceKm(raceObj);
  // Le Championnat national se dispute entre compatriotes — les coéquipiers de club (qui peuvent être de
  // n'importe quelle nationalité) et un rival d'une autre nation n'ont logiquement rien à faire ici.
  const isNationalChamps = raceObj.raceTier === "National";
  const rival = isNationalChamps ? (getRival(game)?.nation === game.player.nation?.code ? getRival(game) : null) : getRival(game);
  const hasFreshHelper = !isNationalChamps && (game.teammates || []).some((tm) => (tm.fraicheur ?? 100) >= 25);
  // Au plus une scène spéciale par course — rivalité, équipier et compétence débloquée ne se cumulent
  // jamais dans le même moment.
  // Le moment de compétence est un vrai "joker" — il ne se présente que si le joueur entre dans cette
  // course en position défavorable (fatigue élevée, méforme, ou déjà un mauvais départ tactique sur le
  // plan de course), jamais de façon systématique. Sans ce contexte, la compétence reste acquise mais
  // n'a simplement rien à offrir aujourd'hui — cohérent avec l'idée d'un réflexe qui aide à se relancer,
  // pas d'un bonus régulier garanti.
  const strugglingContext = (game.player.stats.forme || 50) < 45 || (game.player.stats.fatigue || 0) > 55 || (game.player.stats.fatigueChronique || 0) > 35 || (game.tacticalBonus || 0) < -2;
  const specialRoll = Math.random();
  let specialType = null;
  if (rival && specialRoll < 0.30) specialType = "rival";
  else if (hasFreshHelper && specialRoll < 0.55) specialType = "teammate";
  else if (strugglingContext && specialRoll < 0.70) specialType = "skill";

  const baseCount = momentCountFor(raceObj);
  const situationCount = Math.max(1, specialType ? baseCount - 1 : baseCount);
  const situations = weightedPickMultiple(pool, Math.min(situationCount, pool.length));
  const fractions = evenlySpreadFractions(situationCount);
  const calmChance = calmPassageChance(raceObj, game);

  const stages = situations.map((situation, i) => {
    const kmDone = Math.round(totalKm * fractions[i]);
    const kmRemaining = totalKm - kmDone;
    // Une partie des moments (jamais garantis, ni tous) deviennent des passages calmes — pour que les
    // vrais moments de bascule d'une course ressortent par contraste, plutôt que chaque étape ressemble
    // au même enchaînement mécanique de choix.
    if (Math.random() < calmChance) return buildCalmPassageStage(raceObj, kmDone, kmRemaining);
    return buildMomentStage(situation, raceObj, game, kmDone, kmRemaining);
  });
  if (specialType === "rival") {
    const kmDone = Math.round(totalKm * 0.85);
    stages.push(buildRivalMomentStage(game, raceObj.name, kmDone, totalKm - kmDone));
  } else if (specialType === "teammate") {
    const kmDone = Math.round(totalKm * 0.85);
    stages.push(buildTeammateAssistMomentStage(game, raceObj.name, kmDone, totalKm - kmDone));
  } else if (specialType === "skill") {
    const kmDone = Math.round(totalKm * 0.85);
    const skillMoment = buildSkillMomentStage(game, raceObj, kmDone, totalKm - kmDone);
    if (skillMoment) stages.push(skillMoment);
  }

  // Événement rare — indépendant de tout le reste de la séquence, à un point aléatoire de la course.
  const rareEvent = rollRareEvent(game, raceObj);
  if (rareEvent) {
    const kmDone = Math.round(totalKm * (0.15 + Math.random() * 0.6));
    stages.push(rareEvent.build(game, raceObj.name, kmDone, totalKm - kmDone, raceObj));
  }
  // Les scènes ont pu être ajoutées dans un ordre différent de leur position réelle sur la course
  // (spéciale toujours en dernier, rare à un point aléatoire) — un tri final garantit un kilométrage
  // toujours croissant à l'écran, quel que soit l'ordre dans lequel elles ont été construites.
  stages.sort((a, b) => parseInt(a.phase.match(/KM (\d+)/)[1], 10) - parseInt(b.phase.match(/KM (\d+)/)[1], 10));
  return stages;
}

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

  // Relation équipe : une bonne relation avec l'encadrement pèse réellement dans la balance face à un
  // équipier concurrent (le DS te fait davantage confiance) ; une relation dégradée te fragilise — enfin
  // cohérent avec ce que le glossaire promet depuis le début.
  const playerStanding = player.reputation.peloton + (fits ? 15 : -10) + (player.stats.forme - 50) * 0.3 - player.stats.fatigueChronique * 0.15 + (player.stats.relationEquipe - 50) * 0.25 + (player.flags?.leadershipGuarantee ? 25 : 0);

  // Vraie concurrence interne : un équipier en forme, mieux adapté à la course, peut faire hésiter le DS —
  // même si ta propre réputation suffirait normalement pour être leader. Sauf au Championnat national,
  // disputé entre compatriotes : la hiérarchie de l'équipe de club n'y a logiquement aucun sens.
  const challenger = (player.flags?.leadershipGuarantee || raceObj.raceTier === "National") ? null : bestChallenger(game, philosophy);
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
// Objectif d'équipe pour cette course précise — dérivé du rapport entre la réputation de l'équipe et le
// prestige réel de la course (déjà suivi via CALENDAR_META), pas une nouvelle donnée à maintenir à la main.
function teamObjectiveFor(game, raceObj) {
  const meta = CALENDAR_META[raceObj.name] || {};
  const prestige = meta.prestige !== undefined ? meta.prestige : (raceObj.raceTier === "WT" ? 65 : raceObj.raceTier === "Pro" ? 45 : 30);
  const teamRep = game.player.team?.reputation || 40;
  // Un DS offensif ose viser plus haut à moyens égaux ("attaque dès que possible") ; un DS conservateur
  // préfère un objectif plus sûr ("ne gaspille pas ton énergie") — objectifs réellement plus prudents.
  const teamStyle = game.player.team ? TEAM_PHILOSOPHIES[game.player.team.philosophy]?.style : null;
  const styleShift = teamStyle === "offensif" ? 8 : teamStyle === "conservateur" ? -8 : 0;
  const diff = teamRep - prestige + styleShift;
  if (diff >= 10) return "Viser la victoire";
  if (diff >= -15) return "Viser le podium";
  if (diff >= -35) return "Viser le top 10";
  return "Terminer la course, engranger de l'expérience";
}
// Les 3 stratégies de course, choisies avant le départ — influencent ensuite quelles situations de la
// séquence de moments de course ont le plus de chances d'apparaître (voir buildRaceMomentsSequence).
const RACE_STRATEGIES = [
  { id: "offensive", icon: "🔥", label: "Offensive", desc: "Provoquer la course : attaques, échappées, contre-attaques." },
  { id: "equilibree", icon: "⚖️", label: "Équilibrée", desc: "S'adapter au fil de la course, sans parti pris." },
  { id: "prudente", icon: "🛡️", label: "Prudente", desc: "Jouer la sécurité : placement, gestion, protection." },
];
// L'écran de plan de course — affiche l'objectif d'équipe, le rôle du jour et l'objectif personnel déjà
// calculés ailleurs, et demande la stratégie du jour. Volontairement une étape à part de buildBriefingStage
// (qui gère déjà la négociation de rôle avec ses propres branches) plutôt que d'aller la complexifier.
function buildRacePlanStage(game, raceObj, role, presumedLeaderName) {
  const teamObjective = teamObjectiveFor(game, raceObj);
  const personalObjective = raceObjectiveFor(game, raceObj, role, presumedLeaderName);
  return {
    phase: "🎯 Plan de course",
    isPlanDeCourse: true,
    teamObjective, role, personalObjective,
    text: `Objectif de l'équipe : ${teamObjective}. Ton rôle : ${role}. Ton objectif personnel : ${personalObjective} Choisis ta stratégie pour la journée — elle influencera les occasions qui se présenteront à toi sur la route.`,
    choices: RACE_STRATEGIES.map((strat) => ({
      label: `${strat.icon} ${strat.label} — ${strat.desc}`,
      resolve: () => ({ text: `Tu abordes cette course avec une stratégie ${strat.label.toLowerCase()}.`, delta: { raceStrategy: strat.id } }),
    })),
  };
}
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
  const presumedLeader = (role === RACE_ROLES.DOMESTIQUE || role === RACE_ROLES.CARTE || role === RACE_ROLES.COLEADER) && raceObj.raceTier !== "National" ? (challenger || bestChallenger(game, philosophy)) : null;
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
        { label: "Accepter le rôle et te mettre au service de l'équipe", resolve: () => ({ text: `Tu rentres dans le rang sans faire d'histoires. ${director} apprécie ton professionnalisme.`, delta: { relationEquipe: 5, raceLeaderInfo: { role, leaderName: challenger.name, leaderLevel: challenger.level } } }) },
        { label: "Réclamer ta chance auprès du DS", resolve: (g) => {
            const won = g.player.reputation.peloton >= (challenger.standing - 20);
            return won
              ? { text: `${director} accepte de te laisser une carte à jouer, à condition de ne pas nuire à ${challenger.name}.`, delta: { relationEquipe: -2, tacticalBonus: 3, raceLeaderInfo: { role: RACE_ROLES.CARTE, leaderName: challenger.name, leaderLevel: challenger.level } } }
              : { text: `${director} refuse net : "${challenger.name} a fait ses preuves, pas toi. Encore."`, delta: { relationEquipe: -5, raceLeaderInfo: { role, leaderName: challenger.name, leaderLevel: challenger.level } } };
          } },
        { label: "Te mettre pleinement au service de " + challenger.name, resolve: () => ({ text: `Tu t'engages sans réserve derrière ${challenger.name} — ce genre de loyauté ne s'oublie pas dans un vestiaire.`, delta: { relationEquipe: 8, teammatesDelta: { moral: 4 }, raceLeaderInfo: { role: RACE_ROLES.DOMESTIQUE, leaderName: challenger.name, leaderLevel: challenger.level } } }) },
      ],
      role, presumedLeaderName: challenger.name,
    };
  }

  // Le DS hésite vraiment entre toi et un équipier — le statut de leader reste à conquérir en course.
  if (challenger && hesitation) {
    return {
      phase: "Briefing du DS",
      text: `${director} hésite encore entre toi et ${challenger.name} pour le leadership aujourd'hui — vos formes sont trop proches pour trancher à l'avance. La course décidera.`,
      choices: [{ label: "Compris, à toi de le prouver sur la route", resolve: () => ({ text: "Tu prends le départ sachant que rien n'est acquis.", delta: { raceLeaderInfo: { role, leaderName: challenger.name, leaderLevel: challenger.level } } }) }],
      role, presumedLeaderName: challenger.name,
    };
  }

  return {
    phase: "Briefing du DS",
    text: baseText,
    choices: [{ label: "Compris", resolve: () => ({ text: "Tu prends ta place dans le peloton, rôle en tête.", delta: { raceLeaderInfo: { role, leaderName: presumedLeader?.name, leaderLevel: presumedLeader?.level } } }) }],
    role, presumedLeaderName: presumedLeader?.name,
  };
}

function injectDynamicIncidents(raceObj, game) {
  // Un Grand Tour a déjà sa propre structure interne complète (habillage, étapes actives, arrivée finale)
  // — pas besoin (et pas de sens) d'y plaquer par-dessus le traitement météo/briefing/imprévus générique
  // conçu pour une course d'un jour. On calcule quand même le rôle, dont dépendent certains choix tactiques.
  if (raceObj.isGrandTour) {
    const { role } = computeRaceRole(game, raceObj);
    return { ...raceObj, role };
  }
  const meta = CALENDAR_META[raceObj.name] || {};
  const weather = rollWeather(meta);
  // Le briefing (et donc le rôle du jour) est calculé en premier, pour que les imprévus puissent
  // réagir à la situation du joueur dans la hiérarchie de l'équipe sur CETTE course précise.
  const briefingStage = buildBriefingStage(game, raceObj);
  const ctx = { game, raceObj, weather, meta, role: briefingStage.role };
  // Le plan de course — objectif d'équipe, rôle, objectif personnel déjà connus, plus le choix de
  // stratégie du jour, qui biaisera ensuite les situations tirées dans la séquence de moments de course.
  const planStage = buildRacePlanStage(game, raceObj, briefingStage.role, briefingStage.presumedLeaderName);

  const weatherStage = {
    phase: "Conditions du jour",
    text: WEATHER_FLAVOR[weather](raceObj.name),
    choices: [{ label: "C'est parti !", resolve: () => ({ text: "Le peloton s'élance sous ces conditions.", delta: WEATHER_START_DELTA[weather] }) }],
  };

  const eligible = INCIDENT_POOL.filter((inc) => { try { return inc.condition(ctx); } catch { return false; } });
  // Réduit à 0-1 (au lieu de 1-2) : la séquence de moments de course, plus riche, absorbe une bonne
  // part de ce que les imprévus apportaient avant — pour ne pas allonger excessivement chaque course.
  const chosen = weightedPickMultiple(eligible, rand(0, 1));
  const incidentStages = chosen.map((inc) => ({
    phase: inc.phaseLabel,
    text: (g) => inc.text({ ...ctx, game: g }),
    choices: inc.choices(ctx),
  }));

  const originalStages = raceObj.stages;
  const finalStage = applyFinishFlavor(originalStages[originalStages.length - 1], raceObj);
  const hasArchetypes = (raceObj.archetypes || []).length > 0;
  // Si la course porte des archétypes, les moments de course ne sont PAS construits ici — ils dépendent
  // de la stratégie choisie au plan de course, qui n'est pas encore connue à ce stade (le joueur n'a
  // même pas encore vu cet écran). Ils sont insérés dynamiquement dans le tableau d'étapes une fois ce
  // choix fait, voir handleRaceChoice. Sans ça, la stratégie n'aurait jamais aucun effet réel.
  const leadingStages = hasArchetypes ? [] : originalStages.slice(0, -1);
  return { ...raceObj, stages: [briefingStage, weatherStage, planStage, ...leadingStages, ...incidentStages, finalStage], weather, role: briefingStage.role, needsMomentsSequence: hasArchetypes };
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
  if (level === TEAM_LEVELS.WT) return true; // accès total, y compris ProSeries/Continental pour les néo-pros de l'effectif
  if (level === TEAM_LEVELS.PT) return raceTier === "WT" ? player.reputation.peloton >= 35 : true;
  // Continentale
  if (raceTier === "WT") return player.reputation.peloton >= 55;
  if (raceTier === "Pro") return player.reputation.peloton >= 25;
  return true; // Continental toujours accessible, c'est le terrain de jeu naturel d'une Continentale
}

// Éligibilité d'une course pour le profil ET le niveau d'équipe du joueur (planification de calendrier).
function eligibleFor(pool, player) {
  return pool.filter((r) => r.fit.includes(player.specialtyPrimary) && teamTierAllowsRace(player, r.raceTier));
}
// Pour l'AFFICHAGE uniquement (jamais pour les préréglages du DS, qui ne doivent proposer que des courses
// vraiment accessibles) : garde toutes les courses correspondant au profil, même celles hors de portée du
// niveau d'équipe actuel, avec une raison de verrouillage précise plutôt qu'une disparition silencieuse —
// c'est exactement ce genre de filtrage muet qui rendait les objectifs de saison peu clairs pour le joueur.
function lockReasonFor(player, raceTier) {
  const level = player.team?.level;
  const rep = player.reputation.peloton;
  if (level === TEAM_LEVELS.PT && raceTier === "WT") return `Réputation peloton insuffisante (${rep}/35 requis)`;
  if (level === TEAM_LEVELS.CT) {
    if (raceTier === "WT") return `Réputation peloton insuffisante (${rep}/55 requis)`;
    if (raceTier === "Pro") return `Réputation peloton insuffisante (${rep}/25 requis)`;
  }
  return "Hors de portée du niveau de ton équipe actuelle";
}
function eligibleForDisplay(pool, player) {
  return pool
    .filter((r) => r.fit.includes(player.specialtyPrimary))
    .map((r) => {
      const unlocked = teamTierAllowsRace(player, r.raceTier);
      return unlocked ? r : { ...r, locked: true, lockReason: lockReasonFor(player, r.raceTier) };
    })
    .sort((a, b) => getRaceWeek(a) - getRaceWeek(b));
}

// Construit la saison pro à partir des choix de calendrier faits par le joueur (early/classics/prep/grandTour).
function buildProSeasonQueue(game, selections) {
  const player = game.player;
  const used = new Set();

  // Rassembler TOUTES les courses sélectionnées, peu importe leur pool d'origine, chacune avec son
  // vrai mois — pour les trier chronologiquement plutôt que par catégorie. Avant ce correctif, un Giro
  // (mai) pouvait se retrouver après une préparation de juin, et une course d'août avant le Tour de
  // France : l'ordre suivait les catégories du formulaire, jamais le calendrier réel.
  const raceEntries = [];
  if (selections.early) raceEntries.push(selections.early);
  selections.classics.forEach((race) => raceEntries.push(race));
  if (selections.prep) raceEntries.push(selections.prep);
  raceEntries.push(buildNationalChampionship(player));

  let grandTourRace = null;
  if (selections.grandTour) {
    const kind = grandTourKindFor(player.specialtyPrimary);
    grandTourRace = buildGrandTourRace(selections.grandTour, kind, player.age);
    grandTourRace.month = GRAND_TOUR_MONTH[selections.grandTour];
    grandTourRace.week = GRAND_TOUR_WEEK[selections.grandTour];
    grandTourRace.weekSpan = 3;
    raceEntries.push(grandTourRace);
  }
  if (player.reputation.peloton >= 45) raceEntries.push(buildWorldsRace(player));
  if (selections.autumn) raceEntries.push(selections.autumn);

  // Un mois manquant (ne devrait jamais arriver) atterrit en fin de saison plutôt que de casser le tri.
  raceEntries.sort((a, b) => getRaceWeek(a) - getRaceWeek(b));

  const queue = [];
  // Événements d'hiver : avant la toute première course de la saison.
  pickEventsForBlock("hiver", game, used, 1).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });

  let classicsEventInserted = false, coeurEventInserted = false;
  raceEntries.forEach((race, idx) => {
    // Événement "cœur de saison" juste avant le Grand Tour, où qu'il tombe désormais dans l'ordre.
    if (grandTourRace && race === grandTourRace && !coeurEventInserted) {
      pickEventsForBlock("coeur", game, used, 1).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });
      coeurEventInserted = true;
    }
    queue.push({ type: "race", data: race });
    // Événement de connexion "classiques" juste après la dernière classique du printemps, quel que
    // soit le nombre choisi ou leur mois exact — on regarde simplement si la suivante en est encore une.
    if (!classicsEventInserted && selections.classics.includes(race) && (idx === raceEntries.length - 1 || !selections.classics.includes(raceEntries[idx + 1]))) {
      pickEventsForBlock("classiques", game, used, 1).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });
      classicsEventInserted = true;
    }
  });

  // Événements de fin : après la toute dernière course de la saison.
  pickEventsForBlock("fin", game, used, 2).forEach((e) => { queue.push({ type: "event", data: e }); used.add(e.id); });

  return queue;
}

/* ============================== INIT ============================== */
function initialPlayer(form) {
  const baseSpec = { montagne: 25, sprint: 25, clm: 25, pave: 25, puncheur: 25 };
  const specMap = { grimpeur: "montagne", sprinteur: "sprint", rouleur: "clm", puncheur: "puncheur", polyvalent: null };
  const boostKey = specMap[form.specialtyPrimary];
  if (boostKey) baseSpec[boostKey] += 30; else Object.keys(baseSpec).forEach((k) => (baseSpec[k] += 12));

  const lifestyleStats = {
    rigoureux: { fatigue: 10, ethique: 70, rep: 20 },
    equilibre: { fatigue: 20, ethique: 60, rep: 25 },
    festif: { fatigue: 30, ethique: 50, rep: 35 },
  }[form.lifestyle];

  // L'origine a un vrai impact mécanique, mais SANS faire de la réputation le facteur dominant — sinon
  // "Académie" deviendrait mathématiquement la meilleure origine, "Autodidacte" la pire, ce qui tuerait
  // l'intérêt du choix. L'écart de réputation reste donc volontairement modeste ; l'essentiel de la
  // différenciation passe par d'autres leviers, chacun avec sa propre logique thématique :
  // - Club rural : peu vu au départ, mais une vraie résilience — encaisse mieux les coups durs.
  // - Académie : un peu plus vu, un encadrement technique précoce, une relation DS facilitée — mais
  //   des attentes plus élevées : la pression est plus forte, et les échecs coûtent un peu plus cher.
  // - Autodidacte : "Talent brut" — un profil de spécialité déséquilibré mais prometteur (fort d'un
  //   côté, plus faible ailleurs), le moins de soutien initial, une progression qui dépend surtout
  //   de ses propres choix (les gains de spécialité en cours de carrière y sont amplifiés).
  const originStats = {
    rural: { repMod: -3, ethiqueMod: 8, relMod: 0 },
    academie: { repMod: 4, ethiqueMod: 0, relMod: 8 },
    autodidacte: { repMod: -5, ethiqueMod: 3, relMod: -5 },
  }[form.origin] || { repMod: 0, ethiqueMod: 0, relMod: 0 };
  const baseRep = Math.max(5, lifestyleStats.rep + originStats.repMod);

  if (form.origin === "academie" && boostKey) baseSpec[boostKey] += 8;
  const originFlags = {};
  if (form.origin === "rural") originFlags.originRural = true;
  if (form.origin === "academie") originFlags.originAcademie = true;
  if (form.origin === "autodidacte") {
    // Talent brut : un profil taillé pour sa spécialité, mais moins complet ailleurs — la nature même
    // d'un talent formé seul, sans le socle généraliste d'un encadrement structuré.
    originFlags.originAutodidacte = true;
    if (boostKey) baseSpec[boostKey] += 8;
    const otherKeys = Object.keys(baseSpec).filter((k) => k !== boostKey);
    const weakKey = pick(otherKeys);
    baseSpec[weakKey] = clamp(baseSpec[weakKey] - 4);
  }

  return {
    name: form.name, nation: form.nation, origin: form.origin, specialtyPrimary: form.specialtyPrimary, lifestyle: form.lifestyle,
    age: 16, seasonNumber: 1, phase: "formation",
    team: null, role: "espoir", money: 0, skillPoints: 0, unlockedSkills: [], uciPoints: 0,
    stats: { forme: 55, fatigue: lifestyleStats.fatigue, fatigueChronique: 12, motivation: 75, relationEquipe: clamp(50 + originStats.relMod), ethique: clamp(lifestyleStats.ethique + originStats.ethiqueMod) },
    reputation: { fans: Math.round(baseRep * 0.7), peloton: baseRep, sponsors: Math.round(baseRep * 0.5), medias: Math.round(baseRep * 0.8) },
    startReputation: baseRep, leaderWinsContributed: 0,
    specializationHistory: [], reconversionTransition: null,
    specialties: baseSpec, specialtyPeaks: { ...baseSpec },
    palmares: [], history: [`16 ans — débute le cyclisme en ${ORIGINS.find((o) => o.id === form.origin)?.label.toLowerCase()}.`],
    flags: originFlags, retired: false,
  };
}

function promoteToPro(game, team) {
  const player = { ...game.player, team, phase: "pro", role: "équipier", money: 12000, skillPoints: 2, currentYear: new Date().getFullYear(), teamsHistory: [{ name: team.name, level: team.level, fromAge: game.player.age }], missedObjectivesStreak: 0, contract: null };
  const peloton = generatePeloton();
  // Le rival de formation, s'il existe, poursuit sa carrière en même temps que toi — la rivalité qui a
  // commencé en junior continue dans le peloton professionnel, plutôt que de repartir de zéro avec un
  // inconnu tiré au hasard. On l'insère dans le nouveau peloton, avec un niveau et une équipe adaptés au
  // monde professionnel, en conservant la relation (haine/respect) déjà construite.
  const juniorRival = (game.peloton || []).find((r) => r.id === game.rivalId);
  let rivalId, rivalRelation;
  if (juniorRival) {
    const proLevel = rand(55, 90);
    peloton[0] = { ...juniorRival, level: proLevel, team: pick(teamPoolForLevel(proLevel)) };
    rivalId = juniorRival.id;
    rivalRelation = game.rivalRelation || { haine: 25, respect: 30 };
  } else {
    rivalId = pickNewRivalId(peloton, player);
    rivalRelation = { haine: 25, respect: 30 };
  }
  return {
    ...game, player,
    justSignedPro: true,
    peloton,
    rivalId,
    rivalRelation,
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

// ============================================================================
// PRESTIGE PONDÉRÉ — toutes les victoires n'ont pas le même poids narratif. Une victoire d'étape et une
// victoire sur Monument ne doivent pas compter pareil pour le verdict de fin de carrière. Remplace le
// seuil brut de "6 victoires" pour "Légende du peloton", devenu trop permissif sur une carrière de
// ~200+ courses (n'importe quel build compétent finissait par l'atteindre, spécialisé ou non).
// ============================================================================
const PRESTIGE_VALUES = { secondaire: 1, etape: 2, classique_importante: 3, monument: 6, grand_tour: 8, mondial: 7 };
// Le niveau (WT/Pro/Europe/National) d'une course n'est pas stocké sur l'entrée de palmarès elle-même
// (seulement son nom) — on le retrouve ici en cherchant dans les pools de courses connues, sans avoir à
// toucher aux nombreux endroits où le palmarès est construit.
function raceTierByName(raceName) {
  if (MAJOR_RACE_NAMES.has(raceName)) return "WT";
  const found = [...CLASSICS, ...EARLY_SEASON_RACES, ...SUMMER_PREP_RACES, ...AUTUMN_CLASSICS, LOMBARDIA].find((r) => r.name === raceName);
  if (found) return found.raceTier;
  if (raceName.startsWith("Championnat de")) return "National";
  return "Pro";
}
function raceSpecKeyByName(raceName) {
  const found = [...CLASSICS, ...EARLY_SEASON_RACES, ...SUMMER_PREP_RACES, ...AUTUMN_CLASSICS, LOMBARDIA].find((r) => r.name === raceName);
  return found ? found.specKey : null;
}
// Profil de terrain pondéré, optionnel — quand une course en porte un, sa VRAIE identité est un mélange
// de plusieurs qualités (ex : Flèche Wallonne = surtout puncheur, un peu montagne, un peu sprint) plutôt
// qu'une seule catégorie discrète. Absent par défaut : la grande majorité des courses gardent leur
// comportement historique (un seul specKey dominant), sans qu'aucune modification ne leur soit nécessaire.
function raceTerrainProfileByName(raceName) {
  const found = [...CLASSICS, ...EARLY_SEASON_RACES, ...SUMMER_PREP_RACES, ...AUTUMN_CLASSICS, LOMBARDIA].find((r) => r.name === raceName);
  return found?.terrainProfile || null;
}
function raceArchetypesByName(raceName) {
  const found = [...CLASSICS, ...EARLY_SEASON_RACES, ...SUMMER_PREP_RACES, ...AUTUMN_CLASSICS, LOMBARDIA].find((r) => r.name === raceName);
  return found?.archetypes || [];
}
// Diversité des victoires personnelles — sur combien de profils de terrain DIFFÉRENTS (montagne, sprint,
// pavés, chrono, Grand Tour, Mondiaux) le joueur a-t-il déjà gagné ? Un spécialiste gagne toujours sur le
// même terrain ; un vrai polyvalent gagne un peu partout — c'est cette diversité qui le distingue, pas
// le volume brut de victoires.
function winCategoryDiversity(player) {
  const categories = new Set();
  player.palmares.forEach((entry) => {
    if (entry.resultType !== "victoire" && entry.resultType !== "victoire_etape") return;
    if (entry.isGrandTour) { categories.add("grand_tour"); return; }
    if (entry.isWorlds) { categories.add("mondial"); return; }
    const specKey = raceSpecKeyByName(entry.raceName);
    if (specKey) categories.add(specKey);
  });
  return categories.size;
}
function prestigeValueFor(entry) {
  if (entry.resultType === "victoire_etape") return PRESTIGE_VALUES.etape;
  if (entry.resultType !== "victoire") return 0;
  if (entry.isGrandTour) return PRESTIGE_VALUES.grand_tour;
  if (entry.isWorlds) return PRESTIGE_VALUES.mondial;
  if (entry.isMonument) return PRESTIGE_VALUES.monument;
  return raceTierByName(entry.raceName) === "WT" ? PRESTIGE_VALUES.classique_importante : PRESTIGE_VALUES.secondaire;
}
function prestigeScore(player) {
  return player.palmares.reduce((sum, entry) => sum + prestigeValueFor(entry), 0);
}

// Extrait les vrais jalons narratifs de player.history pour un best-of de fin de carrière — exclut les
// entrées routinières (déjà affichées séparément dans le palmarès, ou mécaniques et répétitives comme les
// primes de contrat ou le décompte annuel de points de compétence), qui noieraient sinon les moments qui
// comptent vraiment (rivalité, réputation, reconversion) sous des dizaines de lignes sans relief.
const HISTORY_ROUTINE_PATTERNS = [
  /prime de victoire contractuelle/,
  /point de compétence bonus/,
  /termine .* du classement UCI/,
  /objectifs de saison (atteints|manqués)/,
  /gagne \d+ points? de compétence pour cette saison/,
  /effectue un stage en altitude/,
  /^\d+ ans — signe pour /,
];
function careerHighlights(player, max = 7) {
  const palmaresLabels = new Set((player.palmares || []).map((p) => p.label));
  const seenText = new Set();
  const candidates = (player.history || []).filter((entry) => {
    const afterAge = entry.replace(/^\d+ ans — /, "");
    if (palmaresLabels.has(afterAge)) return false; // déjà affiché dans le palmarès, pas la peine de le redire
    if (HISTORY_ROUTINE_PATTERNS.some((re) => re.test(entry))) return false;
    if (seenText.has(afterAge)) return false; // jamais deux fois le même moment mot pour mot dans un best-of
    seenText.add(afterAge);
    return true;
  });
  // Les plus récents d'abord — la fin de carrière laisse généralement les souvenirs les plus marquants,
  // et ça évite de saturer l'écran avec des débuts de carrière depuis longtemps dépassés.
  return candidates.slice(-max).reverse();
}

function verdictFor(player) {
  if (player.flags?.careerEndingInjury) return "Carrière brisée avant d'avoir commencé";
  const prestige = prestigeScore(player);
  const podiums = player.palmares.filter((p) => p.resultType === "podium").length;

  // Identités de carrière fondées sur les maillots — un sprinteur qui n'a jamais gagné de Grand Tour
  // mais qui a dominé les étapes et le maillot vert ne raconte pas la même histoire qu'un pur classement
  // au prestige, tout comme un grimpeur collectionneur de maillots à pois ou un leader qui a répété les
  // performances sur plusieurs Grands Tours. Vérifiées avant le reste : ce sont des identités précises,
  // méritées par un vrai chemin, pas de simples paliers de prestige.
  const stageWins = player.palmares.filter((p) => p.resultType === "victoire_etape").length;
  const greenJerseys = player.palmares.filter((p) => p.kind === "maillot_points").length;
  const mountainJerseys = player.palmares.filter((p) => p.kind === "maillot_pois").length;
  const gtOverallWins = player.palmares.filter((p) => p.kind === "victoire_gc").length;
  const gtPodiums = player.palmares.filter((p) => p.isGrandTour && p.resultType === "podium").length;
  if (gtOverallWins >= 2 || (gtOverallWins >= 1 && gtPodiums >= 2)) return "Légende des Grands Tours";
  if (mountainJerseys >= 2 && (gtOverallWins >= 1 || stageWins >= 4)) return "Roi de la montagne";
  if (stageWins >= 6 && greenJerseys >= 1 && gtOverallWins === 0) return "Grand sprinteur";

  // Chemins de réussite alternatifs — un équipier n'est pas évalué avec la même grille qu'un champion
  // individuel, un autodidacte sur sa progression plutôt que son volume de victoires, un polyvalent sur
  // sa diversité plutôt que sa domination. Réservés à ceux qui n'ont PAS AUSSI décroché une reconnaissance
  // personnelle déjà forte (prestige < 8, sous le seuil de "Grand nom du cyclisme") : dans ce cas, le
  // titre de champion prend logiquement le dessus, quel qu'ait été le chemin parcouru pour l'atteindre.
  if (prestige < 8) {
    const leaderWins = player.leaderWinsContributed || 0;
    if (leaderWins >= 8) return "Faiseur de champions";
    const repProgress = (player.reputation?.peloton || 0) - (player.startReputation ?? 50);
    if (player.origin === "autodidacte" && repProgress >= 40 && prestige >= 3) return "Tu n'étais pas censé arriver jusque-là";
    if (winCategoryDiversity(player) >= 4) return "Jamais le meilleur, toujours excellent";
  }

  // Plusieurs chemins vers "Légende" : un spécialiste des classiques avec deux-trois Monuments, un
  // grimpeur avec un Grand Tour, un sprinteur avec un énorme palmarès d'étapes — tous atteignent le
  // même seuil de prestige, mais jamais par accumulation de petites victoires seules.
  // Au sommet aussi, le CHEMIN parcouru mérite d'être reconnu, pas seulement le prestige atteint — une
  // légende qui s'est réinventée en cours de route, ou qui a porté d'autres vers la victoire tout en
  // brillant elle-même, ne raconte pas la même histoire qu'une pure domination individuelle.
  if (prestige >= 14) {
    if ((player.specializationHistory || []).length > 0) return "Légende par la réinvention";
    if ((player.leaderWinsContributed || 0) >= 5) return "Légende généreuse";
    if (winCategoryDiversity(player) >= 4) return "Légende complète, sans domaine réservé";
    return "Légende du peloton";
  }
  if (prestige >= 8) return "Grand nom du cyclisme";
  if (prestige >= 1 || podiums >= 3) return "Coureur pro accompli";
  if (podiums >= 1) return "Solide professionnel";
  return "Carrière discrète, mais vécue à fond";
}

// Note générale de carrière — un score /100 dérivé du palmarès, de la réputation finale et de la
// longévité, aucune nouvelle statistique stockée. Pas de note pour une carrière interrompue avant le début.
function computeCareerScore(player) {
  if (player.flags?.careerEndingInjury) return null;
  const podiums = player.palmares.filter((p) => p.resultType === "podium").length;
  const jerseys = player.palmares.filter((p) => p.resultType === "maillot").length;
  // Réutilise le même prestige pondéré que verdictFor — plus deux pondérations différentes du poids
  // d'une victoire qui pourraient se contredire (un beau score de carrière sans jamais atteindre "Légende").
  let score = prestigeScore(player) * 1.4 + podiums * 2 + jerseys * 3;
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
  // Qualité physique dominante — mesurée sur la spécialité qui correspond à l'identité RÉELLEMENT
  // construite par le joueur (arbre de spécialisation le plus investi, via dominantSpecialisation, déjà
  // utilisé pour raconter la reconversion), pas simplement la meilleure des 5 stats prise au hasard. Un
  // profil hybride avec un pic isolé et non représentatif de son identité (90 sprint, 50 partout ailleurs,
  // alors que le joueur s'est réellement construit comme grimpeur) ne doit plus paraître aussi fort qu'un
  // vrai spécialiste. Un polyvalent, qui n'a justement pas de spécialité dominante, est mesuré sur la
  // moyenne de ses 5 qualités plutôt que sur un pic isolé — cohérent avec son identité de généraliste.
  const identity = SkillEngine.dominantSpecialisation(player);
  const specKey = IDENTITY_TO_SPECIALTY[identity];
  const relevantSpecialty = specKey
    ? player.specialties[specKey]
    : Object.values(player.specialties).reduce((a, b) => a + b, 0) / 5;
  // Les spécialités peuvent dépasser 100 avec les compétences — on ramène une valeur réaliste ~130 vers
  // 100 pour rester lisible.
  const physicalScore = clamp(relevantSpecialty / 1.3);
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
// Résumé de conséquence, discret — le texte narratif reste l'information principale, ceci n'est qu'une
// ligne secondaire en petit sous le texte, jamais l'inverse. Au plus 3 éléments, les plus parlants
// seulement, pour ne jamais tourner à la liste comptable façon menu de jeu de rôle.
function deltaSummary(delta) {
  if (!delta) return null;
  const parts = [];
  if (delta.tacticalBonus >= 4) parts.push("📍 position gagnée");
  else if (delta.tacticalBonus <= -4) parts.push("📍 position perdue");
  if (delta.fatigue) parts.push(delta.fatigue > 0 ? `⚡ -${delta.fatigue} énergie` : `⚡ +${Math.abs(delta.fatigue)} énergie`);
  if (delta.forme) parts.push(`${delta.forme > 0 ? "+" : ""}${delta.forme} forme`);
  if (delta.reputation) parts.push(`${delta.reputation > 0 ? "+" : ""}${delta.reputation} réputation`);
  if (delta.reputationDimDelta) {
    const dimLabels = { peloton: "peloton", fans: "fans", medias: "médias", sponsors: "sponsors" };
    const { dim, amount } = delta.reputationDimDelta;
    parts.push(`${amount > 0 ? "+" : ""}${amount} réputation ${dimLabels[dim] || dim}`);
  }
  if (delta.extraRepDims) {
    const dimLabels = { peloton: "peloton", fans: "fans", medias: "médias", sponsors: "sponsors" };
    const summary = Object.entries(delta.extraRepDims).map(([dim, amount]) => `${dimLabels[dim] || dim} ${amount > 0 ? "+" : ""}${amount}`).join(", ");
    if (summary) parts.push(`🎗️ ${summary}`);
  }
  if (delta.money) parts.push(`${delta.money > 0 ? "+" : ""}${delta.money.toLocaleString("fr-FR")} €`);
  if (delta.rival?.haine) parts.push(`⚔️ ${delta.rival.haine > 0 ? "+" : ""}${delta.rival.haine} tension`);
  if (delta.rival?.respect) parts.push(`🤝 ${delta.rival.respect > 0 ? "+" : ""}${delta.rival.respect} respect`);
  return parts.length > 0 ? parts.slice(0, 3).join(" · ") : null;
}
const Bar = ({ label, value, color, term }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.inkMuted, marginBottom: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
      <span>{label}{term && <InfoTip term={term} />}</span><span>{value}</span>
    </div>
    <div style={{ height: 6, background: T.line, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${clamp(value)}%`, height: "100%", background: color, transition: "width .4s ease" }} />
    </div>
  </div>
);
const Card = ({ children, style }) => (<div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: 16, ...style }}>{children}</div>);

// Glossaire centralisé — un seul endroit à mettre à jour si un terme doit être reformulé, plutôt que
// des explications éparpillées dans toute l'interface.
const GLOSSARY = {
  forme: { title: "Forme", text: "Ton niveau de fraîcheur physique du moment. Plus elle est haute, plus tu performes en course. Elle baisse avec l'effort et remonte avec le repos et l'intersaison." },
  fatigue: { title: "Fatigue récente", text: "L'usure accumulée depuis tes dernières courses. Une fatigue élevée pénalise directement ta performance. Elle redescend entre deux activités — mais mal gérée, elle laisse des traces durables (fatigue chronique)." },
  fatigueChronique: { title: "Fatigue chronique / surmenage", text: "Contrairement à la fatigue récente, celle-ci ne part pas vite. Elle s'accumule quand tu ne récupères jamais assez entre les efforts. Au-delà d'un certain seuil, tu es en surmenage : tes performances chutent nettement, et le risque de blessure grave augmente. Un calendrier plus léger et l'intersaison la font redescendre." },
  motivation: { title: "Motivation", text: "Ton état d'esprit du moment. Une motivation basse peut peser sur tes performances et tes décisions. Les bons résultats, les objectifs atteints et un bon relationnel avec ton équipe la font remonter." },
  relationEquipe: { title: "Relation équipe", text: "La confiance entre toi et ton encadrement (DS, staff, équipiers). Une bonne relation t'ouvre des rôles de leader et de meilleures conditions ; une relation dégradée peut te coûter ta place dans la hiérarchie de l'équipe." },
  ethique: { title: "Éthique", text: "Ton intégrité sportive. Des choix douteux peuvent te faire progresser plus vite à court terme, mais une éthique durablement basse t'expose à un vrai risque de scandale médiatique." },
  reputationPeloton: { title: "Réputation — Peloton", text: "Ce que les autres coureurs pensent de toi. Bien vu, tu bénéficies d'alliances plus faciles et d'échappées qui roulent mieux ensemble. Mal vu, certains coureurs refusent de collaborer avec toi en course." },
  reputationFans: { title: "Réputation — Fans", text: "Ta popularité auprès du public. Elle influence les sponsors et peut se retourner contre toi (chahut sur le bord des routes) si elle chute trop bas." },
  reputationMedias: { title: "Réputation — Médias", text: "Ta visibilité et ton statut auprès de la presse spécialisée. Elle influence la pression que tu ressens dans les grandes courses (plus on attend de toi, plus la pression monte)." },
  reputationSponsors: { title: "Réputation — Sponsors", text: "La confiance de tes partenaires financiers. Elle influence la qualité des primes et objectifs qu'ils te fixent." },
  fraicheur: { title: "Fraîcheur", text: "Une lecture combinée de ta fatigue récente ET chronique — l'indicateur le plus simple pour savoir si tu es prêt(e) à enchaîner ou s'il vaut mieux lever le pied." },
  currentRating: { title: "Niveau actuel", text: "Une note sur 100 qui résume ta force du moment (physique + forme + réputation + résultats récents) — façon jeu de sport. Elle évolue en permanence, contrairement à la note de fin de carrière qui, elle, mesure ton héritage cumulé." },
  specialty: { title: "Spécialités", text: "Tes aptitudes dans chaque type de terrain : montagne, sprint, contre-la-montre (CLM), pavés. Elles déterminent sur quel genre de course tu es le plus dangereux — et évoluent avec l'entraînement, les compétences et certains événements de carrière." },
  skillPoints: { title: "Points de compétence", text: "La monnaie qui te permet de débloquer des compétences dans l'arbre. Tu en gagnes 2 par saison, plus quelques bonus rares en cours de saison pour de très bonnes performances." },
  raceGroup: { title: "Groupe de course", text: "Ta position dans la course à un instant donné (tête de course, peloton principal, groupe des poursuivants, décroché). C'est un vrai plafond : un coureur décroché ne peut jamais dépasser un coureur en tête, quel que soit son niveau — il faut d'abord remonter." },
  raceEnergy: { title: "Énergie", text: "Ta réserve d'effort pour la course en cours. Chaque décision tactique en consomme. À sec, tu ne peux plus tenter de monter en groupe et risques même de décrocher." },
  pressure: { title: "Pression", text: "L'enjeu ressenti sur une course précise (médiatisation, statut de favori, attentes de ton équipe...). Une pression forte pénalise ta performance, sauf si ton mental (compétences dédiées) l'atténue." },
  gcVirtuel: { title: "Général virtuel", text: "Ton classement général provisoire pendant un Grand Tour, construit jour après jour. Rien n'est joué avant l'arrivée finale — un coup dur en 3e semaine peut encore tout changer." },
  role: { title: "Pourquoi ce rôle et pas un autre ?", text: "Ton rôle du jour dépend de ta réputation et de ton niveau face aux autres favoris de la course. Leader : l'équipe roule pour toi, la victoire est visée. Co-leader : une carte de réserve, prêt à saisir ta chance si le leader officiel faiblit. Équipier : tu roules d'abord pour un autre leader — pas de résultat personnel visé aujourd'hui, mais ton travail compte (voir Impact collectif). Carte libre : une occasion à prendre si elle se présente, sans pression particulière." },
  seasonObjectives: { title: "Pourquoi choisir des objectifs de saison ?", text: "Chaque objectif atteint en fin de saison te rapporte un vrai bonus (argent, réputation, parfois une progression physique). Un objectif manqué ne coûte rien, mais n'en rapporte pas non plus — vise juste par rapport à ton niveau actuel plutôt que de systématiquement viser le plus prestigieux." },
  contractClauses: { title: "Pourquoi ces clauses comptent", text: "Le nombre de saisons restantes détermine quand tu devras renégocier — et donc quand tu redeviens libre de changer d'équipe. Une prime de victoire renforcée augmente concrètement tes gains à chaque succès. Une clause de sortie facilitée te permet de partir plus vite vers une meilleure offre si elle se présente, souvent au prix d'un contrat un peu moins généreux au départ." },
};

// Guide "Comment jouer" — volontairement très court par rubrique (pas un manuel), toujours structuré
// en 3 questions : c'est quoi, à quoi ça sert, qu'est-ce que je dois faire.
const GUIDE_SECTIONS = [
  { icon: "🚴", title: "Comment fonctionne une course ?",
    what: "Chaque course se déroule en plusieurs étapes : un briefing (ton rôle du jour), parfois la météo ou un imprévu, puis des choix tactiques, et enfin l'arrivée.",
    why: "Tes choix pendant la course déterminent ton groupe (tête de course, peloton, décroché) — et ce groupe est un vrai plafond : impossible de gagner si tu es décroché, même avec un excellent niveau.",
    do: "Regarde ton énergie avant d'attaquer : une action tactique en consomme. Économise-la pour le bon moment plutôt que de tout donner dès le départ." },
  { icon: "⚡", title: "Fatigue & forme",
    what: "La Forme, c'est ta fraîcheur du moment. La Fatigue récente s'accumule course après course. La Fatigue chronique, elle, ne part pas vite — c'est l'usure de fond.",
    why: "Une fatigue élevée te fait moins bien performer. Une fatigue chronique trop haute mène au surmenage : grosse perte de performance, et un vrai risque de blessure.",
    do: "N'enchaîne pas les courses difficiles sans respirer. Un calendrier plus léger de temps en temps permet de tout faire redescendre." },
  { icon: "🌳", title: "Compétences",
    what: "Un arbre de compétences en plusieurs branches (Physique, Mental, Tactique, Carrière, Spécialisation...) que tu débloques avec des points gagnés chaque saison.",
    why: "Chaque branche joue un rôle différent : la Tactique aide à monter en tête de course, le Physique renforce tes spécialités, le Mental t'aide sous pression.",
    do: "Ne mise pas tout sur une seule branche. Un peu de Tactique change vraiment la donne, même pour un profil orienté pur physique." },
  { icon: "👥", title: "Équipe & équipiers",
    what: "Tu appartiens à une équipe (Continentale, ProTeam ou WorldTour) avec un DS et des équipiers ayant chacun leur niveau, leur ambition et leur moral.",
    why: "Ton rôle du jour (Leader, Équipier, Carte secondaire...) dépend de ta réputation face à tes coéquipiers. Un équipier plus fort que toi peut te passer devant dans la hiérarchie.",
    do: "En rôle Équipier, utilise les choix dédiés (ravitaillement, emmener ton leader) — ça construit ta relation avec l'équipe, même sans résultat personnel." },
  { icon: "⭐", title: "Réputation",
    what: "Quatre dimensions séparées : Peloton (les autres coureurs), Fans (le public), Médias, Sponsors.",
    why: "Une bonne réputation Peloton facilite les alliances en course. Une mauvaise réputation peut te faire chahuter, ou pousser des coureurs à refuser de collaborer avec toi.",
    do: "Le fair-play et les bons résultats la font monter. Attention : elle s'estompe aussi avec le temps si tu n'entretiens pas tes bons résultats." },
  { icon: "💼", title: "Contrats & carrière",
    what: "Chaque fin de saison (ou fin de contrat), tu négocies avec des équipes : rôle garanti, prime de victoire, durée, clause de sortie.",
    why: "Un contrat long te met à l'abri du mercato pendant plusieurs saisons, mais t'engage. Un contrat court laisse plus de liberté mais moins de sécurité.",
    do: "Un début de carrière modeste ? Vise le rôle garanti pour construire ton palmarès. Déjà confirmé ? La prime de victoire peut rapporter gros." },
  { icon: "📅", title: "Calendrier",
    what: "En début de saison, tu construis ton calendrier : classiques, courses de préparation, Grand Tour (optionnel !), championnats.",
    why: "Chaque course a un profil de terrain différent (montagne, sprint, pavés...) qui favorise certains profils. Un Grand Tour est optionnel — une carrière 100% classiques est un choix valable.",
    do: "Regarde le profil de terrain affiché sous chaque course avant de la choisir — il te dit directement si elle te correspond." },
  { icon: "⚔️", title: "Rivalités",
    what: "Un rival t'accompagne tout au long de ta carrière, avec une relation Haine/Respect qui évolue selon vos confrontations.",
    why: "C'est purement narratif au départ, mais ça colore vraiment ta carrière — victoires, défaites et transferts marquent votre histoire commune.",
    do: "Rien à faire de spécial — profite juste de l'histoire qui se construit au fil des saisons." },
];
// Bulle d'aide au tap — fonctionne au clic comme au toucher (pas de survol souris nécessaire),
// essentiel sur mobile où le hover n'existe pas.
const InfoTip = ({ term }) => {
  const [open, setOpen] = useState(false);
  const g = GLOSSARY[term];
  if (!g) return null;
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 4 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${T.inkMuted}`, background: "transparent", color: T.inkMuted, fontSize: 10, lineHeight: 1, cursor: "pointer", padding: 0, verticalAlign: "middle" }}
        aria-label={`Explication : ${g.title}`}
      >?</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "absolute", zIndex: 41, top: "120%", left: 0, width: 220, background: T.panel, border: `1px solid ${T.accent}`, borderRadius: 8, padding: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, color: T.accent, marginBottom: 4 }}>{g.title}</div>
            <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.4 }}>{g.text}</div>
          </div>
        </>
      )}
    </span>
  );
};
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
            Le jeu a rencontré une erreur inattendue. Ta carrière est sauvegardée automatiquement — recharge la page pour reprendre ta carrière. La course en cours sera annulée si elle n'était pas terminée.
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
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ game, savedAt: Date.now() })); return true; } catch (e) { return false; }
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

// Succès méta — persistent d'une carrière à l'autre, stockage SÉPARÉ de la sauvegarde de partie
// (jamais effacé par "Recommencer une carrière"). Chaque check() n'utilise que des données déjà
// présentes sur le joueur en fin de carrière, aucune nouvelle mécanique de jeu.
const ACHIEVEMENTS_KEY = "pro_cycling_life_achievements_v1";
const ACHIEVEMENTS = [
  { id: "monument", icon: "🏆", label: "Vainqueur d'un Monument", desc: "Gagner l'une des 5 classiques Monuments.",
    check: (p) => p.palmares.some((pm) => pm.resultType === "victoire" && pm.isMonument) },
  { id: "worlds", icon: "🌈", label: "Champion du monde", desc: "Remporter les Championnats du Monde.",
    check: (p) => p.palmares.some((pm) => pm.isWorlds && pm.resultType === "victoire") },
  { id: "gt_winner", icon: "👑", label: "Vainqueur d'un Grand Tour", desc: "Remporter le classement général du Tour de France, du Giro ou de la Vuelta.",
    check: (p) => p.palmares.some((pm) => pm.resultType === "victoire" && pm.isGrandTour) },
  { id: "jersey", icon: "🎽", label: "Collectionneur de maillots", desc: "Remporter un maillot secondaire (points, montagne ou jeune) sur une course à étapes.",
    check: (p) => p.palmares.some((pm) => pm.resultType === "maillot") },
  { id: "no_gt_career", icon: "🚵", label: "Une carrière sans Grand Tour", desc: "Terminer une carrière avec au moins une victoire, sans jamais avoir couru le moindre Grand Tour.",
    check: (p) => p.palmares.length > 0 && !p.palmares.some((pm) => pm.isGrandTour) },
  { id: "longevity", icon: "⭐", label: "Longévité", desc: "Jouer au moins 15 saisons professionnelles.",
    check: (p) => (p.seasonNumber || 0) >= 15 },
  { id: "elite", icon: "🎖️", label: "Élite mondiale", desc: "Terminer ta carrière avec un niveau actuel de 85 ou plus.",
    check: (p) => computeCurrentRating(p) >= 85 },
  { id: "respected", icon: "🤝", label: "Capitaine respecté", desc: "Terminer avec une réputation dans le peloton de 85 ou plus.",
    check: (p) => p.reputation.peloton >= 85 },
  { id: "fortune", icon: "💰", label: "Fortune faite", desc: "Accumuler 55 000 € ou plus au cours de ta carrière.",
    check: (p) => (p.money || 0) >= 55000 },
  { id: "fairplay", icon: "🎗️", label: "Fair-play exemplaire", desc: "Terminer ta carrière avec une éthique de 90 ou plus.",
    check: (p) => p.stats.ethique >= 90 },
  { id: "faiseur_champions", icon: "🛠️", label: "Dans l'ombre des vainqueurs", desc: "Avoir contribué à au moins 5 victoires de ton leader en jouant un rôle d'équipier.",
    check: (p) => (p.leaderWinsContributed || 0) >= 5 },
  { id: "parti_de_rien", icon: "🌱", label: "Parti de rien", desc: "Autodidacte, avoir fait progresser ta réputation dans le peloton d'au moins 30 points depuis tes débuts.",
    check: (p) => p.origin === "autodidacte" && ((p.reputation?.peloton || 0) - (p.startReputation ?? 50)) >= 30 },
  { id: "jamais_meilleur_partout_bon", icon: "🧭", label: "Bon partout, jamais dominant", desc: "Avoir gagné sur au moins 3 profils de terrain différents (montagne, sprint, pavés, chrono, Grand Tour, Mondiaux).",
    check: (p) => winCategoryDiversity(p) >= 3 },
  // hadMajorInjury est un marqueur PERMANENT d'historique de carrière (posé une fois par les incidents
  // de chute grave, jamais réinitialisé ensuite) — volontairement, pour que ce succès reste accessible
  // même après une longue et belle fin de carrière, des saisons après la blessure elle-même.
  { id: "comeback", icon: "🩹", label: "Renaissance", desc: "Revenir d'une blessure grave en carrière pro et tout de même construire une belle carrière.",
    check: (p) => p.flags?.hadMajorInjury && (computeCareerScore(p) || 0) >= 40 },
];
function loadAchievements() {
  try { const raw = localStorage.getItem(ACHIEVEMENTS_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
}
function saveAchievements(unlocked) {
  try { localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked)); } catch (e) { /* ignore */ }
}
// Évalue les succès à la fin d'une carrière et fusionne les nouveaux avec ceux déjà débloqués
// (un succès débloqué une fois reste acquis pour toujours, quelle que soit la carrière suivante).
function evaluateAchievements(player) {
  const current = loadAchievements();
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!current[a.id] && a.check(player)) { current[a.id] = { unlockedAt: Date.now(), by: player.name }; newlyUnlocked.push(a); }
  });
  if (newlyUnlocked.length > 0) saveAchievements(current);
  return newlyUnlocked;
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
  const [saveStatus, setSaveStatus] = useState(null); // 'ok' | 'error' | null (pas encore de sauvegarde tentée)
  const [epilogueChoice, setEpilogueChoice] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [achievementsEvaluated, setAchievementsEvaluated] = useState(false);

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
  // Le résultat réel est suivi (saveStatus), pour ne jamais laisser croire à une sauvegarde réussie
  // quand localStorage est plein ou indisponible (navigation privée, quota dépassé...).
  useEffect(() => {
    if (game) setSaveStatus(saveGameToStorage(game) ? "ok" : "error");
  }, [game]);

  // Succès méta : évalués une seule fois à l'arrivée sur l'écran de fin, jamais pour une carrière
  // interrompue avant même la signature pro (pas assez de contenu à évaluer dans ce cas).
  useEffect(() => {
    if (screen === "end" && game?.player && !game.player.flags?.careerEndingInjury && !achievementsEvaluated) {
      setNewAchievements(evaluateAchievements(game.player));
      setAchievementsEvaluated(true);
    }
    if (screen !== "end") setAchievementsEvaluated(false);
  }, [screen, game]);

  function startCareer(formOverride) {
    const player = initialPlayer(formOverride || form);
    // Un petit peloton junior, avec un vrai rival nommé — pas encore le monde professionnel, mais une
    // vraie rivalité qui peut déjà commencer à se construire, saison après saison de formation.
    const juniorPeloton = generatePeloton(12);
    const juniorRivalId = pickNewRivalId(juniorPeloton, player);
    const g = { player, peloton: juniorPeloton, rivalId: juniorRivalId, rivalRelation: { haine: 15, respect: 20 }, teammates: null, sponsor: null, usedJuniorEventIds: [] };
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
      // Récupération de fraîcheur des équipiers entre deux activités — sans ça, solliciter un équipier
      // en course serait un drain définitif plutôt qu'une vraie ressource à gérer sur la saison.
      if (g.teammates) {
        g = { ...g, teammates: g.teammates.map((tm) => ({ ...tm, fraicheur: clamp((tm.fraicheur ?? 100) + 12) })) };
      }
      // Le bonus tactique accumulé (choix débloqués par l'arbre Tactique) et la charge d'Attaque surprise
      // ne valent que pour une course à la fois — on les réinitialise en entrant dans une nouvelle course.
      if (queue.length > 0 && queue[0].type === "race") {
        // DS offensif : "attaque dès que possible" se traduit concrètement par plus d'énergie de départ —
        // une vraie liberté tactique, plus d'actions possibles en course avant d'être à sec.
        const teamStyle = g.player.team ? TEAM_PHILOSOPHIES[g.player.team.philosophy]?.style : null;
        const startEnergy = teamStyle === "offensif" ? 115 : 100;
        g = { ...g, tacticalBonus: 0, raceState: { ...initRaceState(), energy: startEnergy }, player: { ...g.player, flags: { ...g.player.flags, savedForFinalClimb: false } }, talentCharges: { ...(g.talentCharges || {}), attaquant_surprise: SkillEngine.hasSkill(g.player, "talent_attaquant") } };
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
      // La saison de transition suivant une reconversion touche à sa fin — nouvelles compétences pas
      // encore pleinement maîtrisées, un temps d'adaptation avant de retrouver sa pleine efficacité.
      if (player.reconversionTransition?.seasonsRemaining > 0) {
        const remaining = player.reconversionTransition.seasonsRemaining - 1;
        player.reconversionTransition = remaining > 0 ? { ...player.reconversionTransition, seasonsRemaining: remaining } : null;
      }
      player.currentYear = (player.currentYear || new Date().getFullYear()) + 1;
      // Le contrat négocié au mercato court d'une saison sur l'autre.
      if (player.contract && player.contract.yearsRemaining > 0) {
        player.contract = { ...player.contract, yearsRemaining: player.contract.yearsRemaining - 1 };
      }
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
      // Club rural : une résilience qui se voit surtout dans les coups durs — un vrai rebond
      // supplémentaire à l'intersaison, mais seulement si la saison a été difficile (forme basse).
      const ruralResilienceBonus = (g.player.flags?.originRural && g.player.stats.forme < 45) ? 7 : 0;
      const formeBoost = Math.max(8, Math.round((75 - g.player.stats.forme) * 0.35)) + trainingQualityBonus + skillRecovery + ruralResilienceBonus;
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
      // Nouvelles entrées de palmarès depuis le début de saison — sert à la fois aux objectifs personnels
      // choisis par le joueur (si applicable) et au calcul des points de compétence de fin de saison
      // (toujours applicable, indépendamment des objectifs choisis).
      const newPalmares = g.player.palmares.slice(g.seasonStartPalmaresCount || 0);
      let objectivesMetCount = 0;
      // Objectifs de saison personnels choisis par le joueur : évalués à partir de ce qui vient de se
      // passer (nouvelles entrées de palmarès, points UCI accumulés). Un vrai bonus aléatoire si atteints,
      // et le DS qui commence à s'agacer après plusieurs saisons consécutives d'échec total.
      if (g.seasonObjectives && g.seasonObjectives.length > 0) {
        const ctx = { newPalmares, uciPointsThisSeason: g.player.uciPoints || 0, player: g.player, wasWTAtSeasonStart: g.wasWTAtSeasonStart };
        const met = g.seasonObjectives.filter((id) => evaluateSeasonObjective(id, ctx));
        const missed = g.seasonObjectives.filter((id) => !met.includes(id));
        objectivesMetCount = met.length;
        if (met.length > 0) {
          const labels = met.map((id) => SEASON_OBJECTIVES.find((o) => o.id === id)?.label).filter(Boolean);
          // Bonus tiré au sort — la récompense d'une bonne saison n'est jamais tout à fait la même.
          const bonusRoll = pick(["reputation", "specialty", "money", "relation"]);
          let bonusDelta = {}, bonusText = "";
          if (bonusRoll === "reputation") { bonusDelta = { reputation: met.length * 4 }; bonusText = "un vrai coup de projecteur médiatique"; }
          else if (bonusRoll === "specialty") { const dim = pick(["montagne", "sprint", "clm", "pave", "puncheur"]); bonusDelta = { specialtyDeltas: { [dim]: met.length * 2 } }; bonusText = "une vraie progression physique, saluée par le staff"; }
          else if (bonusRoll === "money") { bonusDelta = { money: met.length * 5000 }; bonusText = "une prime exceptionnelle du sponsor"; }
          else { bonusDelta = { relationEquipe: met.length * 5 }; bonusText = "la confiance renforcée de ton encadrement"; }
          g = applyDelta(g, { reputation: met.length * 2, relationEquipe: met.length * 1, ...bonusDelta });
          g = { ...g, player: { ...g.player, missedObjectivesStreak: 0, history: [...g.player.history, `${g.player.age} ans — objectifs de saison atteints : ${labels.join(", ")} (${bonusText}).`] } };
        }
        if (missed.length > 0) {
          const labels = missed.map((id) => SEASON_OBJECTIVES.find((o) => o.id === id)?.label).filter(Boolean);
          g = { ...g, player: { ...g.player, history: [...g.player.history, `${g.player.age} ans — objectifs de saison manqués : ${labels.join(", ")}.`] } };
        }
        // Échec total de la saison (aucun objectif atteint) : le compteur d'agacement du DS avance.
        if (met.length === 0) {
          const streak = (g.player.missedObjectivesStreak || 0) + 1;
          if (streak >= 3) {
            g = applyDelta(g, { relationEquipe: -10 });
            g = { ...g, player: { ...g.player, missedObjectivesStreak: 0, history: [...g.player.history, `${g.player.age} ans — ${g.player.team?.director || "le DS"} commence sérieusement à s'agacer après plusieurs saisons sans le moindre objectif atteint.`] } };
          } else {
            g = { ...g, player: { ...g.player, missedObjectivesStreak: streak } };
          }
        }
      }
      // Points de compétence de fin de saison — basés sur la performance réelle (victoires, podiums,
      // objectifs personnels atteints) et sur l'âge, pas un montant fixe identique chaque année.
      const wins = newPalmares.filter((p) => p.resultType === "victoire" || p.resultType === "victoire_etape").length;
      const podiums = newPalmares.filter((p) => p.resultType === "podium").length;
      const earnedPoints = seasonSkillPointsAward(g.player, { wins, podiums, objectivesMet: objectivesMetCount });
      g = { ...g, player: { ...g.player, skillPoints: g.player.skillPoints + earnedPoints, history: [...g.player.history, `${g.player.age} ans — gagne ${earnedPoints} point${earnedPoints > 1 ? "s" : ""} de compétence pour cette saison.`] } };
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
    const currentStage = current.data.stages[stageIndex];
    const isLast = stageIndex === current.data.stages.length - 1;
    setRaceLogs((logs) => [...logs, { text: res.text, delta: res.delta }]);
    // Une fois la stratégie choisie au plan de course, on construit enfin la séquence de moments de
    // course et on l'insère dans le déroulé — jusque-là reportée pour qu'elle puisse vraiment refléter
    // ce choix (voir injectDynamicIncidents : sans ce report, la stratégie n'avait aucun effet réel,
    // les scènes étant déjà tirées avant même que le joueur ait vu l'écran de plan de course).
    if (currentStage?.isPlanDeCourse && current.data.needsMomentsSequence) {
      const moments = buildRaceMomentsSequence(current.data, newGame, current.data.weather) || [];
      const before = current.data.stages.slice(0, stageIndex + 1);
      const after = current.data.stages.slice(stageIndex + 1);
      setCurrent({ ...current, data: { ...current.data, stages: [...before, ...moments, ...after], needsMomentsSequence: false } });
    }
    // Grand Tour : une fois l'étape d'approche résolue, on regarde si le maillot vert ou jaune est
    // vraiment en jeu pour CE joueur aujourd'hui (via newGame.currentGT, à jour du dernier choix) — et
    // seulement alors, on insère une scène dédiée avant l'arrivée. Jamais de façon générique : sans enjeu
    // réel, buildGTJerseyMoment renvoie null et rien ne s'insère.
    if (currentStage?.isGTApproachStage && currentStage?.needsJerseyMoment) {
      const jerseyMoment = buildGTJerseyMoment(newGame, newGame.currentGT?.tourName || current.data.name);
      const clearedStage = { ...currentStage, needsJerseyMoment: false };
      const stagesWithClearedFlag = [...current.data.stages.slice(0, stageIndex), clearedStage, ...current.data.stages.slice(stageIndex + 1)];
      if (jerseyMoment) {
        const before = stagesWithClearedFlag.slice(0, stageIndex + 1);
        const after = stagesWithClearedFlag.slice(stageIndex + 1);
        setCurrent({ ...current, data: { ...current.data, stages: [...before, jerseyMoment, ...after] } });
      } else {
        setCurrent({ ...current, data: { ...current.data, stages: stagesWithClearedFlag } });
      }
    }
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
    let celebrationSkill = skill;
    setGame((prev) => {
      const result = SkillEngine.unlock(prev, skillId);
      if (result.respecInfo) {
        // Reconversion : le texte de célébration et la biographie mentionnent l'identité réellement
        // quittée par CE joueur (pas un texte générique) — "après plusieurs saisons consacrées au
        // sprint, tu repars de zéro pour te réorienter", exactement l'histoire de carrière recherchée.
        const fadingLabel = SPECIALTIES.find((s) => s.id === result.respecInfo.fadingSpecialty)?.label || result.respecInfo.fadingSpecialty;
        const narrative = `Après plusieurs saisons consacrées au profil ${fadingLabel.toLowerCase()}, tu repars de zéro pour te réorienter — une saison de transition t'attend, le temps de t'adapter à ce nouveau chapitre.`;
        celebrationSkill = { ...skill, narrative };
        const player = { ...result.player, history: [...result.player.history, `${result.player.age} ans — reconversion : quitte le profil ${fadingLabel.toLowerCase()} pour se réorienter.`] };
        return { ...result, player };
      }
      // Les talents et philosophies, prestigieux, laissent une trace dans la biographie de carrière.
      if (skill.category === "talent" || SKILL_TREE_CONFIG.philosophies.some((p) => p.id === skillId)) {
        const player = { ...result.player, history: [...result.player.history, `${result.player.age} ans — débloque « ${skill.label} ».`] };
        return { ...result, player };
      }
      return result;
    });
    setUnlockCelebration({ skill: celebrationSkill });
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
          <div style={{ marginTop: 10 }}>
            <ChoiceButton onClick={() => setScreen("achievements")}>
              🏅 Succès ({Object.keys(loadAchievements()).length}/{ACHIEVEMENTS.length})
            </ChoiceButton>
          </div>
          <div style={{ marginTop: 10 }}>
            <ChoiceButton onClick={() => setScreen("guide")}>❓ Guide — Comment jouer</ChoiceButton>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- SUCCÈS ---------------- */
  if (screen === "achievements") {
    const unlocked = loadAchievements();
    return (
      <div style={{ background: T.bg, minHeight: 520, color: T.ink, fontFamily: "Inter, sans-serif", padding: 24, borderRadius: 12 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 3, color: T.accent, textTransform: "uppercase", marginBottom: 4 }}>Palmarès du joueur</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 26, margin: "0 0 4px 0" }}>Succès</h1>
        <p style={{ color: T.inkMuted, fontSize: 13, marginBottom: 16 }}>
          {Object.keys(unlocked).length}/{ACHIEVEMENTS.length} débloqués — conservés d'une carrière à l'autre, quoi qu'il arrive à ton coureur actuel.
        </p>
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked[a.id];
          return (
            <Card key={a.id} style={{ marginBottom: 8, opacity: done ? 1 : 0.5, borderColor: done ? T.accent2 : T.line }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{done ? a.icon : "🔒"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: T.inkMuted }}>{a.desc}</div>
                  {done && <div style={{ fontSize: 11, color: T.accent2, marginTop: 2 }}>Débloqué par {done.by}</div>}
                </div>
              </div>
            </Card>
          );
        })}
        <div style={{ marginTop: 16 }}>
          <ChoiceButton primary onClick={() => setScreen("home")}>← Retour à l'accueil</ChoiceButton>
        </div>
      </div>
    );
  }

  /* ---------------- GUIDE ---------------- */
  if (screen === "guide") {
    return (
      <div style={{ background: T.bg, minHeight: 520, color: T.ink, fontFamily: "Inter, sans-serif", padding: 24, borderRadius: 12 }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 13, letterSpacing: 3, color: T.accent, textTransform: "uppercase", marginBottom: 4 }}>Aide</div>
        <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 26, margin: "0 0 4px 0" }}>Comment jouer</h1>
        <p style={{ color: T.inkMuted, fontSize: 13, marginBottom: 16 }}>
          Les bases, en quelques lignes par sujet. Tu trouveras aussi des <b>?</b> cliquables un peu partout dans le jeu pour des explications ponctuelles.
        </p>
        {GUIDE_SECTIONS.map((s) => (
          <Card key={s.title} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>{s.title}
            </div>
            <div style={{ fontSize: 12, marginBottom: 6 }}><b style={{ color: T.accent }}>C'est quoi ?</b> <span style={{ color: T.inkMuted }}>{s.what}</span></div>
            <div style={{ fontSize: 12, marginBottom: 6 }}><b style={{ color: T.accent }}>À quoi ça sert ?</b> <span style={{ color: T.inkMuted }}>{s.why}</span></div>
            <div style={{ fontSize: 12 }}><b style={{ color: T.accent }}>Qu'est-ce que je dois faire ?</b> <span style={{ color: T.inkMuted }}>{s.do}</span></div>
          </Card>
        ))}
        <div style={{ marginTop: 16 }}>
          <ChoiceButton primary onClick={() => setScreen(game ? "play" : "home")}>← Retour</ChoiceButton>
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
              {NATIONS.map((n) => (<ChoiceButton key={n.code} primary={form.nation?.code === n.code} onClick={() => { setForm((f) => ({ ...f, nation: n })); setStep(1); }}>{n.flag} {n.label}</ChoiceButton>))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <ChoiceButton onClick={() => setStep(0)}>← Retour</ChoiceButton>
            <p style={{ color: T.inkMuted, margin: "10px 0" }}>Comment s'appelle ton coureur {form.nation?.flag} ?</p>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom du coureur"
              style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${T.line}`, background: T.panel, color: T.ink, marginBottom: 10, boxSizing: "border-box" }} />
            <ChoiceButton onClick={() => setForm((f) => ({ ...f, name: randomNameForNation(f.nation?.code) }))}>🎲 Nom aléatoire ({form.nation?.label})</ChoiceButton>
            <ChoiceButton primary onClick={() => form.name && setStep(2)}>Continuer</ChoiceButton>
          </div>
        )}
        {step === 2 && (
          <div>
            <ChoiceButton onClick={() => setStep(1)}>← Retour</ChoiceButton>
            <p style={{ color: T.inkMuted, margin: "10px 0" }}>Origine</p>
            {ORIGINS.map((o) => (
              <ChoiceButton key={o.id} primary={form.origin === o.id} onClick={() => { setForm((f) => ({ ...f, origin: o.id })); setStep(3); }}>
                <div style={{ fontWeight: 700 }}>{o.label}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{o.desc}</div>
              </ChoiceButton>
            ))}
          </div>
        )}
        {step === 3 && (
          <div>
            <ChoiceButton onClick={() => setStep(2)}>← Retour</ChoiceButton>
            <p style={{ color: T.inkMuted, margin: "10px 0" }}>Spécialité de départ</p>
            {SPECIALTIES.map((s) => (
              <ChoiceButton key={s.id} primary={form.specialtyPrimary === s.id} onClick={() => { setForm((f) => ({ ...f, specialtyPrimary: s.id })); setStep(4); }}>
                <div style={{ fontWeight: 700 }}>{s.label}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{s.desc}</div>
              </ChoiceButton>
            ))}
          </div>
        )}
        {step === 4 && (
          <div>
            <ChoiceButton onClick={() => setStep(3)}>← Retour</ChoiceButton>
            <p style={{ color: T.inkMuted, margin: "10px 0" }}>Mode de vie</p>
            {LIFESTYLES.map((l) => (
              <ChoiceButton key={l.id} primary={form.lifestyle === l.id} onClick={() => { const updated = { ...form, lifestyle: l.id }; setForm(updated); startCareer(updated); }}>
                <div style={{ fontWeight: 700 }}>{l.label}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{l.desc}</div>
              </ChoiceButton>
            ))}
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
    const earlyPool = eligibleForDisplay(EARLY_SEASON_RACES, player);
    const classicsPool = eligibleForDisplay(CLASSICS, player);
    const prepPool = eligibleForDisplay(SUMMER_PREP_RACES, player);
    const autumnPool = eligibleForDisplay(AUTUMN_CLASSICS, player);
    const grandTours = ["Tour de France", "Giro d'Italia", "Vuelta a España"];
    // 7 permet d'enchaîner l'intégralité des flandriennes (Omloop, San Remo, Flandres, Roubaix) ET des
    // ardennaises (Amstel, Flèche, Liège) dans la même saison — une vraie campagne de classicman, comme
    // dans la réalité. La fatigue, moins punitive depuis les derniers ajustements (récupération nocturne,
    // seuils recalibrés), supporte largement ce volume.
    const MAX_CLASSICS = 7;

    // Le DS explique la stratégie de saison selon ton profil — chaque profil a des alternatives crédibles,
    // même quand certaines courses (pavés, classiques ardennaises...) ne lui sont pas adaptées.
    const DS_ADVICE = {
      grimpeur: "Les pavés, ce n'est pas pour toi — on va plutôt construire ta saison autour des courses par étapes vallonnées et des classiques ardennaises, avant de te lâcher sur le général du grand tour.",
      puncheur: "Ton profil est le plus polyvalent de l'équipe : pavés, classiques ardennaises, courses par étapes... presque tout peut te convenir. À toi de choisir tes batailles.",
      sprinteur: "On va miser sur les classiques roulantes et les sprints massifs. Les ardennaises, laisse ça aux grimpeurs — mais les pavés peuvent très bien te réussir.",
      rouleur: "Tu es taillé pour rouler fort et longtemps : les pavés et les courses par étapes te vont bien. Les ardennaises les plus sélectives, en revanche, ce sera compliqué.",
      polyvalent: "Tu n'as pas de faiblesse marquée, mais pas non plus de terrain où tu domines vraiment — tu resteras dans le coup presque partout, rarement injouable pour les autres. C'est une vraie force, différente de celle d'un pur spécialiste, pas une absence de limite.",
    };

    function toggleEarly(race) { if (race.locked) return; setPlanning((p) => ({ ...p, early: p.early?.id === race.id ? null : race })); }
    function togglePrep(race) { if (race.locked) return; setPlanning((p) => ({ ...p, prep: p.prep?.id === race.id ? null : race })); }
    function toggleAutumn(race) { if (race.locked) return; setPlanning((p) => ({ ...p, autumn: p.autumn?.id === race.id ? null : race })); }
    function toggleClassic(race) {
      if (race.locked) return;
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

    // Préréglages du DS — pour les joueurs qui ne savent pas par où commencer, le DS propose directement
    // un calendrier cohérent avec un objectif de saison. Pioche exclusivement dans les pools déjà filtrés
    // par éligibilité (earlyPool/classicsPool/prepPool/autumnPool) : jamais une course hors de portée du
    // profil du joueur. Le joueur reste libre d'ajuster ensuite — un point de départ, pas une contrainte.
    function findRace(pool, name) { return pool.find((r) => r.name === name && !r.locked) || null; }
    const DS_PRESETS = [
      { id: "paves", icon: "🪨", label: "Courir les classiques pavées",
        build: () => ({ early: null, classics: ["Omloop Het Nieuwsblad", "Milan-San Remo", "Tour des Flandres", "Paris-Roubaix"].map((n) => findRace(classicsPool, n)).filter(Boolean), prep: null, autumn: null, grandTour: null, objectives: ["monument"] }) },
      { id: "ardennaises", icon: "⛰️", label: "Courir les classiques ardennaises",
        build: () => ({ early: null, classics: ["Amstel Gold Race", "Flèche Wallonne", "Liège-Bastogne-Liège"].map((n) => findRace(classicsPool, n)).filter(Boolean), prep: null, autumn: null, grandTour: null, objectives: ["monument"] }) },
      { id: "sprint", icon: "💨", label: "Enchaîner les sprints massifs",
        build: () => ({ early: findRace(earlyPool, "Tour Down Under") || findRace(earlyPool, "UAE Tour"), classics: ["Scheldeprijs", "Danilith Nokere Koerse", "Grand Prix de Denain"].map((n) => findRace(classicsPool, n)).filter(Boolean), prep: null, autumn: findRace(autumnPool, "Paris-Tours"), grandTour: null, objectives: ["anywin"] }) },
      { id: "tdf", icon: "🏆", label: "Viser le Tour de France",
        build: () => ({ early: null, classics: [], prep: findRace(prepPool, "Critérium du Dauphiné") || findRace(prepPool, "Tour de Suisse"), autumn: null, grandTour: "Tour de France", objectives: ["gc"] }) },
      { id: "giro", icon: "🇮🇹", label: "Viser le Giro d'Italia",
        build: () => ({ early: findRace(earlyPool, "UAE Tour"), classics: [findRace(classicsPool, "Tirreno-Adriatico") || findRace(classicsPool, "Paris-Nice")].filter(Boolean), prep: null, autumn: null, grandTour: "Giro d'Italia", objectives: ["gc"] }) },
      { id: "vuelta", icon: "🇪🇸", label: "Viser la Vuelta a España",
        build: () => ({ early: null, classics: [], prep: findRace(prepPool, "Tour de Suisse") || findRace(prepPool, "Critérium du Dauphiné"), autumn: null, grandTour: "Vuelta a España", objectives: ["gc"] }) },
      { id: "leger", icon: "🌱", label: "Une première saison en douceur",
        build: () => ({ early: null, classics: classicsPool.slice(0, 2), prep: null, autumn: null, grandTour: null, objectives: [] }) },
    ];
    function applyPreset(preset) {
      setPlanning((p) => ({ ...p, ...preset.build() }));
    }
    const TIER_BADGE = { WT: { label: "WorldTour", color: T.accent }, Pro: { label: "ProSeries", color: T.info }, Continental: { label: "Continental", color: T.inkMuted } };
    const TierTag = ({ tier }) => { const t = TIER_BADGE[tier]; return t ? <span style={{ fontSize: 10, color: t.color, border: `1px solid ${t.color}`, borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>{t.label}</span> : null; };
    // Ligne d'adéquation profil/course : dérivée à la volée depuis le profil terrain réel de la course.
    // Fiche de course complète : durée, type, enjeu, profil terrain sur 6 dimensions, objectifs possibles.
    // Montagne/Sprint/Pavés viennent des vraies données (CALENDAR_META quand elle existe) ; Vallonné/Plat/CLM
    // sont dérivés de ces mêmes valeurs (pas de nouveau système de données parallèle).
    function fullTerrainProfile(race) {
      const p = terrainProfileFor(race);
      const clmEstimate = race.specKey === "clm" ? 75 : race.isStageRace && race.raceTier === "WT" ? 20 : 0;
      const plat = clamp(100 - p.mountains - p.cobbles * 0.4 - clmEstimate * 0.3 - p.punch * 0.2);
      const vallonne = clamp(100 - Math.abs(p.mountains - 45) * 1.5);
      return { montagne: p.mountains, puncheur: p.punch, vallonne, plat, sprint: p.sprint, clm: clmEstimate, paves: p.cobbles };
    }
    const PROFILE_DIMS = [
      { key: "montagne", icon: "🏔️", label: "Montagne" },
      { key: "puncheur", icon: "🎯", label: "Puncheur" },
      { key: "vallonne", icon: "⛰️", label: "Vallonné" },
      { key: "plat", icon: "🚴", label: "Plat" },
      { key: "sprint", icon: "💨", label: "Sprint" },
      { key: "clm", icon: "⏱️", label: "CLM" },
      { key: "paves", icon: "🪨", label: "Pavés" },
    ];
    const RaceInsightLine = ({ race }) => {
      const insights = raceInsights(player, race);
      const toneColor = { positive: T.accent2, warning: T.danger, info: T.info, neutral: T.inkMuted };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4, marginBottom: 2 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ fontSize: 12, color: toneColor[ins.tone] || T.inkMuted, display: "flex", alignItems: "center", gap: 5 }}>
              <span>{ins.icon}</span><span>{ins.text}</span>
            </div>
          ))}
        </div>
      );
    };
    const FitLine = ({ race }) => {
      const profile = fullTerrainProfile(race);
      const stars = enjeuStars(race);
      return (
        <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 4, marginBottom: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>{estimateDuration(race)} · {race.isStageRace ? "Course à étapes" : "Course d'un jour"}</span>
            <span>Enjeu : {"⭐".repeat(stars)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 6 }}>
            {PROFILE_DIMS.map((d) => (
              <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, textAlign: "center" }}>{d.icon}</span>
                <span style={{ width: 62, flexShrink: 0 }}>{d.label}</span>
                <div style={{ flex: 1, height: 5, background: T.line, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round(profile[d.key] / 10) * 10}%`, height: "100%", background: T.accent }} />
                </div>
                <span style={{ width: 24, textAlign: "right", opacity: 0.7 }}>{Math.round(profile[d.key] / 10)}/10</span>
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

        <>
        <Card style={{ marginBottom: 16, borderColor: T.accent }}>
          <div style={{ fontSize: 11, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{player.team?.director} — Directeur sportif</div>
          <p style={{ margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>« {DS_ADVICE[player.specialtyPrimary]} »</p>
          {player.team && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}`, fontSize: 12, color: T.inkMuted }}>
              Équipe {TEAM_PHILOSOPHIES[player.team.philosophy]?.label.toLowerCase()} — {TEAM_PHILOSOPHIES[player.team.philosophy]?.desc}
              {TEAM_PHILOSOPHIES[player.team.philosophy]?.motto && <div style={{ marginTop: 6, fontStyle: "italic", color: T.accent }}>« {TEAM_PHILOSOPHIES[player.team.philosophy].motto} »</div>}
              {game.teamSeasonGoal && <> Objectif de la saison : <b style={{ color: T.ink }}>{game.teamSeasonGoal} points UCI</b> pour l'équipe.</>}
            </div>
          )}
          {player.team?.level !== TEAM_LEVELS.WT && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}`, fontSize: 12, color: T.inkMuted }}>
              {teamTierAllowsRace(player, "WT")
                ? "Ta réputation te vaut quelques invitations sur le calendrier WorldTour cette saison."
                : `En ${player.team.level}, ton calendrier reste principalement ProSeries et Continental — une meilleure réputation dans le peloton t'ouvrira les portes du WorldTour.`}
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

        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 4 }}>🧭 Pas sûr par où commencer ?</div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 10 }}>
            Dis au DS ce que tu veux viser cette saison — il propose un calendrier cohérent, que tu pourras ensuite ajuster librement à l'étape suivante.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {DS_PRESETS.map((preset) => (
              <ChoiceButton key={preset.id} onClick={() => applyPreset(preset)}>{preset.icon} {preset.label}</ChoiceButton>
            ))}
          </div>
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
            🎯 Objectifs de la saison<InfoTip term="seasonObjectives" /> <span style={{ color: T.inkMuted, fontSize: 12 }}>— {planning.objectives.length}/5 sélectionnés</span>
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
              <RaceInsightLine race={{ name: planning.grandTour, isStageRace: true, raceTier: "WT" }} />
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

        {(() => {
          // Détection de vrais conflits de calendrier — fondée sur les vraies semaines UCI, pas juste le
          // mois. Chaque entrée reçoit un span réaliste : une course d'un jour n'occupe qu'une fraction de
          // semaine (deux classiques d'un jour, même très proches comme Flèche Wallonne et Liège, ne se
          // gênent jamais dans le vrai calendrier), une course à étapes environ 1,3 semaine, et un Grand
          // Tour bloque 3 semaines pleines — impossible de courir autre chose pendant que tu es dessus.
          const spanFor = (race) => (race?.isStageRace ? 1.3 : 0.15);
          const entries = [];
          if (planning.early) entries.push({ name: planning.early.name, week: getRaceWeek(planning.early), span: spanFor(planning.early) });
          planning.classics.forEach((r) => entries.push({ name: r.name, week: getRaceWeek(r), span: spanFor(r) }));
          if (planning.prep) entries.push({ name: planning.prep.name, week: getRaceWeek(planning.prep), span: spanFor(planning.prep) });
          if (planning.autumn) entries.push({ name: planning.autumn.name, week: getRaceWeek(planning.autumn), span: spanFor(planning.autumn) });
          if (planning.grandTour) entries.push({ name: planning.grandTour, week: GRAND_TOUR_WEEK[planning.grandTour], span: 3 });
          const conflicts = [];
          for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
              const a = entries[i], b = entries[j];
              if (a.week <= b.week + b.span - 1 && b.week <= a.week + a.span - 1) conflicts.push(`${a.name} et ${b.name}`);
            }
          }
          if (conflicts.length === 0) return null;
          return (
            <Card style={{ marginBottom: 16, borderColor: T.danger }}>
              <div style={{ fontSize: 13, color: T.danger, fontWeight: 700, marginBottom: 4 }}>⚠️ Conflit de calendrier</div>
              <div style={{ fontSize: 12, color: T.inkMuted }}>
                {conflicts.map((c, i) => <div key={i}>{c} tombent la même semaine — impossible de courir les deux dans la vraie vie.</div>)}
                Ajuste ta sélection pour lever le conflit.
              </div>
            </Card>
          );
        })()}

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🌞 Ouverture de saison (janvier-février)</div>
          {earlyPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS préfère te ménager en tout début de saison — rien de prévu ici cette année.</div>}
          {earlyPool.map((race) => (
            <div key={race.id}>
              <ChoiceButton primary={planning.early?.id === race.id} onClick={() => toggleEarly(race)}>
                <span style={{ opacity: race.locked ? 0.4 : 1 }}>{race.locked && "🔒 "}{race.name} <TierTag tier={race.raceTier} /> <span style={{ opacity: 0.7, fontSize: 12 }}>({race.month})</span></span>
              </ChoiceButton>
              {race.locked ? (
                <div style={{ fontSize: 12, color: T.inkMuted, padding: "2px 4px" }}>🔒 {race.lockReason}</div>
              ) : (
                <>
                  <RaceInsightLine race={race} />
                  <FitLine race={race} />
                </>
              )}
            </div>
          ))}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>
            🚵 Classiques & courses d'un jour <span style={{ color: T.inkMuted, fontSize: 12 }}>— {planning.classics.length}/{MAX_CLASSICS} sélectionnées</span>
          </div>
          {classicsPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS ne te positionnera pas ici cette saison — pas ton terrain de jeu.</div>}
          {classicsPool.map((race) => {
            const selected = planning.classics.some((r) => r.id === race.id);
            const disabled = race.locked || (!selected && planning.classics.length >= MAX_CLASSICS);
            return (
              <div key={race.id}>
                <ChoiceButton primary={selected} onClick={() => !disabled && toggleClassic(race)}>
                  <span style={{ opacity: disabled ? 0.4 : 1 }}>{race.locked && "🔒 "}{race.name} <TierTag tier={race.raceTier} /> <span style={{ opacity: 0.7, fontSize: 12 }}>({race.month})</span></span>
                </ChoiceButton>
                {race.locked ? (
                  <div style={{ fontSize: 12, color: T.inkMuted, padding: "2px 4px" }}>🔒 {race.lockReason}</div>
                ) : (
                  <>
                    <RaceInsightLine race={race} />
                    <FitLine race={race} />
                  </>
                )}
              </div>
            );
          })}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>⛰️ Préparation estivale (juin)</div>
          {prepPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS ne prévoit rien ici pour toi cette saison.</div>}
          {prepPool.map((race) => (
            <div key={race.id}>
              <ChoiceButton primary={planning.prep?.id === race.id} onClick={() => togglePrep(race)}>
                <span style={{ opacity: race.locked ? 0.4 : 1 }}>{race.locked && "🔒 "}{race.name} <TierTag tier={race.raceTier} /></span>
              </ChoiceButton>
              {race.locked ? (
                <div style={{ fontSize: 12, color: T.inkMuted, padding: "2px 4px" }}>🔒 {race.lockReason}</div>
              ) : (
                <>
                  <RaceInsightLine race={race} />
                  <FitLine race={race} />
                </>
              )}
            </div>
          ))}
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8 }}>🍂 Classiques d'automne (octobre)</div>
          {autumnPool.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted }}>Le DS ne prévoit rien ici pour toi cette saison.</div>}
          {autumnPool.map((race) => (
            <div key={race.id}>
              <ChoiceButton primary={planning.autumn?.id === race.id} onClick={() => toggleAutumn(race)}>
                <span style={{ opacity: race.locked ? 0.4 : 1 }}>{race.locked && "🔒 "}{race.name} <TierTag tier={race.raceTier} /></span>
              </ChoiceButton>
              {race.locked ? (
                <div style={{ fontSize: 12, color: T.inkMuted, padding: "2px 4px" }}>🔒 {race.lockReason}</div>
              ) : (
                <>
                  <RaceInsightLine race={race} />
                  <FitLine race={race} />
                </>
              )}
            </div>
          ))}
        </Card>

        <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 14 }}>
          Le Championnat national (toujours disputé) et les Championnats du Monde (si ta réputation le permet)
          seront ajoutés automatiquement à ton calendrier.
        </div>

        <ChoiceButton primary={true} onClick={() => confirmPlanning()}>
          ✅ Valider le calendrier{!planning.grandTour ? " (sans Grand Tour)" : ""}
        </ChoiceButton>
        </>
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

        {newAchievements.length > 0 && (
          <Card style={{ marginBottom: 16, borderColor: T.accent2 }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 2, color: T.accent2 }}>🏅 Nouveaux succès débloqués</div>
            <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 8 }}>Acquis pour toujours — ils resteront, quelle que soit la prochaine carrière que tu commenceras.</div>
            {newAchievements.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: T.inkMuted }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </Card>
        )}

        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Verdict de cette carrière — {player.name}</div>
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

        {(player.leaderWinsContributed || 0) >= 3 && (
          <Card style={{ marginBottom: 16, borderColor: T.info }}>
            <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 14, marginBottom: 6, color: T.info }}>🤝 Une carrière au service des autres</div>
            <div style={{ fontSize: 13, color: T.inkMuted, fontStyle: "italic" }}>
              {player.leaderWinsContributed >= 8
                ? `« Sans lui, je n'aurais jamais gagné. » Voilà ce que disent de toi les leaders que tu as portés vers la victoire, saison après saison — ${player.leaderWinsContributed} victoires construites dans l'ombre, la tienne autant que la leur.`
                : `Tu as passé une bonne partie de ta carrière au service des autres. Mais ${player.leaderWinsContributed} victoires ne se seraient jamais produites sans le travail que personne ne voit jamais sur la ligne d'arrivée.`}
            </div>
          </Card>
        )}

        {(() => {
          const highlights = careerHighlights(player);
          if (highlights.length === 0) return null;
          return (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>📖 Les moments qui ont marqué ta carrière</div>
              {highlights.map((h, i) => {
                const m = h.match(/^(\d+) ans — (.*)$/);
                return (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: i < highlights.length - 1 ? `1px solid ${T.line}` : "none" }}>
                    <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, minWidth: 44, flexShrink: 0 }}>{m ? `${m[1]} ans` : ""}</div>
                    <div style={{ fontSize: 13, color: T.inkMuted, lineHeight: 1.4 }}>{m ? m[2] : h}</div>
                  </div>
                );
              })}
            </Card>
          );
        })()}

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

        <ChoiceButton primary onClick={() => { clearSavedGame(); setForm({ name: "", nation: null, origin: null, specialtyPrimary: null, lifestyle: null }); setStep(0); setGame(null); setEpilogueChoice(null); setNewAchievements([]); setScreen("intro"); }}>
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
          <Bar label="Forme" value={player.stats.forme} color={T.accent2} term="forme" />
          <Bar label="Fatigue" value={player.stats.fatigue} color={T.danger} term="fatigue" />
          <Bar label="Réputation peloton" value={player.reputation.peloton} color={T.accent} term="reputationPeloton" />
          <Bar label="Réputation fans" value={player.reputation.fans} color={T.purple} term="reputationFans" />
          <Bar label="Réputation médias" value={player.reputation.medias} color={T.info} term="reputationMedias" />
          <Bar label="Réputation sponsors" value={player.reputation.sponsors} color={T.accent2} term="reputationSponsors" />
          <Bar label="Relation équipe" value={player.stats.relationEquipe} color={T.info} term="relationEquipe" />
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
        case "respec": return "Rembourse tous les points investis dans tes autres compétences";
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

      {saveStatus && (
        <div style={{ textAlign: "right", fontSize: 10, color: saveStatus === "ok" ? T.inkMuted : T.danger, marginBottom: 4 }}>
          {saveStatus === "ok" ? "💾 Sauvegarde OK" : "⚠️ Sauvegarde indisponible — ta progression ne sera pas conservée si tu quittes"}
        </div>
      )}

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
              <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 8 }}>
                <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 24, color: T.accent, lineHeight: 1 }}>{rating}</div>
                <div style={{ fontSize: 9, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 0.5, maxWidth: 70 }}>{ratingTier(rating)}<InfoTip term="currentRating" /></div>
              </div>
            ); })()}
          </div>
        </Card>
        {player.phase === "pro" && (
          <>
            <Card>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>Gestion de saison</div>
              <div style={{ fontSize: 13, margin: "4px 0" }}>Fraîcheur<InfoTip term="fraicheur" /> : <span style={{ color: T.accent2 }}>{computeFraicheur(player)}%</span></div>
              <div style={{ fontSize: 13, color: T.danger }}>Fatigue récente<InfoTip term="fatigue" /> : {player.stats.fatigue}%</div>
              <div style={{ fontSize: 13, color: isOvertrained(player) ? T.danger : T.inkMuted }}>
                Fatigue chronique<InfoTip term="fatigueChronique" /> : {player.stats.fatigueChronique}% {isOvertrained(player) && "⚠️ surentraînement"}
              </div>
              <div style={{ fontSize: 13, color: T.inkMuted }}>Motivation<InfoTip term="motivation" /> : {player.stats.motivation}%</div>
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
          <TabButton active={view === "palmares"} onClick={() => setView("palmares")}>🏛️ Palmarès du monde</TabButton>
          <TabButton active={view === "myPalmares"} onClick={() => setView("myPalmares")}>🏅 Mon palmarès</TabButton>
          <TabButton active={view === "history"} onClick={() => setView("history")}>📜 Journal</TabButton>
          <TabButton active={view === "guide"} onClick={() => setView("guide")}>❓ Guide</TabButton>
        </div>
      )}

      {/* GUIDE VIEW */}
      {view === "guide" && player.phase === "pro" && (
        <div>
          <p style={{ color: T.inkMuted, fontSize: 13, marginBottom: 12 }}>
            Les bases, en quelques lignes par sujet. Tu trouveras aussi des <b>?</b> cliquables un peu partout dans le jeu pour des explications ponctuelles.
          </p>
          {GUIDE_SECTIONS.map((s) => (
            <Card key={s.title} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>{s.title}
              </div>
              <div style={{ fontSize: 12, marginBottom: 6 }}><b style={{ color: T.accent }}>C'est quoi ?</b> <span style={{ color: T.inkMuted }}>{s.what}</span></div>
              <div style={{ fontSize: 12, marginBottom: 6 }}><b style={{ color: T.accent }}>À quoi ça sert ?</b> <span style={{ color: T.inkMuted }}>{s.why}</span></div>
              <div style={{ fontSize: 12 }}><b style={{ color: T.accent }}>Qu'est-ce que je dois faire ?</b> <span style={{ color: T.inkMuted }}>{s.do}</span></div>
            </Card>
          ))}
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
        // Chaque compétence doit porter category/treeId pour que SkillEngine.baseSkillsProgress puisse
        // déterminer si elle est verrouillée par le palier — exactement ce que fait déjà SkillEngine.catalog()
        // en interne. Sans ce tag, les compétences avancées (tier 2) ne s'affichaient jamais grisées.
        if (skillSubTab === "specialisation") { list = (SKILL_TREE_CONFIG.specialisation[player.specialtyPrimary] || []).map((s) => ({ ...s, category: "specialisation", treeId: player.specialtyPrimary })); listDesc = "Propre à ton profil de départ — inaccessible aux autres spécialités."; treeIdForMastery = player.specialtyPrimary; }
        else if (skillSubTab === "talents") { list = [...SKILL_TREE_CONFIG.talents, ...SKILL_TREE_CONFIG.transversal]; listDesc = "Pas de simple bonus de stat : un vrai effet de gameplay, limité ou contextuel."; }
        else if (skillSubTab === "philosophies") { list = SKILL_TREE_CONFIG.philosophies; listDesc = "Embranchements exclusifs : débloquer l'un ferme définitivement l'autre de la même paire."; }
        else { list = (SKILL_TREE_CONFIG.trees[skillSubTab]?.skills || []).map((s) => ({ ...s, category: "tree", treeId: skillSubTab })); listDesc = SKILL_TREE_CONFIG.trees[skillSubTab]?.desc || ""; treeIdForMastery = skillSubTab; }

        const mastery = treeIdForMastery ? SkillEngine.getMasteryLevel(player, treeIdForMastery) : null;
        // Regroupement visuel par palier : les compétences avancées (tier 2) au-dessus, reliées
        // visuellement aux compétences de base (tier 1) — une vraie hiérarchie plutôt qu'une liste plate.
        const tier2 = list.filter((s) => s.tier === 2);
        const tier1 = list.filter((s) => s.tier !== 2);

        const SkillNode = (skill) => {
          const isReconversion = skill.id === "talent_reconversion";
          const displayCost = isReconversion ? SkillEngine.reconversionCost(player) : skill.cost;
          const unlocked = !isReconversion && SkillEngine.hasSkill(player, skill.id);
          const exclusiveLocked = !unlocked && SkillEngine.isExclusiveLocked(player, skill.id);
          const progress = SkillEngine.baseSkillsProgress(player, skill);
          const tierLocked = !unlocked && progress && !progress.met;
          const locked = exclusiveLocked || tierLocked;
          const affordable = player.skillPoints >= displayCost;
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
                  {isReconversion && (player.specializationHistory || []).length > 0 && <span style={{ fontSize: 9, color: T.inkMuted, border: `1px solid ${T.line}`, borderRadius: 4, padding: "1px 5px" }}>{player.specializationHistory.length}x déjà utilisée</span>}
                </div>
                <div style={{ fontSize: 12, color: T.inkMuted }}>{skill.desc}</div>
                {exclusiveLocked && <div style={{ fontSize: 11, color: T.danger, marginTop: 2 }}>Verrouillée par un autre choix exclusif</div>}
                {tierLocked && <div style={{ fontSize: 11, color: T.danger, marginTop: 2 }}>Débloque d'abord plus de la moitié des compétences de base ({progress.unlockedCount}/{progress.total})</div>}
              </div>
              <button onClick={() => unlockSkill(skill.id)} disabled={unlocked || locked || !affordable}
                style={{ background: unlocked ? T.accent2 : T.accent, color: unlocked ? "#fff" : "#171614", border: "none", padding: "8px 14px", borderRadius: 6, cursor: unlocked || locked ? "default" : "pointer", fontWeight: 600, fontSize: 12, opacity: (!unlocked && (!affordable || locked)) ? 0.5 : 1, whiteSpace: "nowrap", marginLeft: 12 }}>
                {unlocked ? "Débloqué" : isReconversion ? `Se reconvertir (${displayCost} pt)` : `Débloquer (${displayCost} pt)`}
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

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🧬 Profil physique — ce que ton corps permet<InfoTip term="specialty" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                {[["Montagne", player.specialties.montagne], ["Sprint", player.specialties.sprint], ["Puncheur", player.specialties.puncheur], ["CLM", player.specialties.clm], ["Pavés", player.specialties.pave]].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, width: 60, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 5, background: T.line, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${clamp(val)}%`, height: "100%", background: T.accent }} />
                    </div>
                    <span style={{ fontSize: 11, color: T.inkMuted, width: 24, textAlign: "right" }}>{Math.round(val)}</span>
                  </div>
                ))}
              </div>
              {[["Montagne", player.specialties.montagne], ["Sprint", player.specialties.sprint], ["Puncheur", player.specialties.puncheur]].map(([label, val]) => {
                const note = specializationNote(val);
                return note ? <div key={label} style={{ fontSize: 11, color: T.accent, marginTop: 8 }}>{label} — {note}</div> : null;
              })}
              {["montagne", "sprint", "clm", "puncheur"].map((specKey) => {
                const note = specialtyDeclineNote(player, specKey);
                return note ? <div key={specKey} style={{ fontSize: 11, color: T.inkMuted, fontStyle: "italic", marginTop: 8 }}>{note}</div> : null;
              })}
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🌳 Compétences — ce que tu as appris à exploiter</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                {[["Montagne", SkillEngine.competenceScore(player, "montagne")], ["Sprint", SkillEngine.competenceScore(player, "sprint")], ["Puncheur", SkillEngine.competenceScore(player, "puncheur")], ["CLM", SkillEngine.competenceScore(player, "clm")]].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, width: 60, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 5, background: T.line, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${clamp(val)}%`, height: "100%", background: T.accent2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: T.inkMuted, width: 24, textAlign: "right" }}>{Math.round(val)}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 8 }}>
                Un écart marqué avec le profil physique raconte quelque chose : naturellement doué mais pas encore développé, ou au contraire construit par le travail plus que par la nature.
              </div>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>📊 Performance aujourd'hui — pourquoi je suis comme ça</div>
              {performanceBreakdownTiers(player).map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
                  <span style={{ color: T.inkMuted }}>{row.label}</span>
                  <span>{row.icon} {row.text}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 8 }}>
                La pression, elle, dépend de la course du jour — elle s'affiche en direct pendant la course elle-même (🔥 Pression), pas ici.
              </div>
            </Card>

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
              <div style={{ fontSize: 14, marginBottom: 8 }}>{(() => { const l = teamLeader(game, player.team); return l ? `${flagFor(l.nation)} ${l.name} (niv. ${l.level})` : "Aucune figure de proue identifiée"; })()}</div>
              {player.contract && (
                <>
                  <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>Contrat en cours<InfoTip term="contractClauses" /></div>
                  <div style={{ fontSize: 13 }}>
                    {player.contract.yearsRemaining > 0 ? `Encore ${player.contract.yearsRemaining} saison${player.contract.yearsRemaining > 1 ? "s" : ""}` : "Dernière année de contrat"}
                    {player.contract.winBonusMultiplier > 1 && " · prime de victoire renforcée"}
                    {player.contract.exitClauseFlexible && " · clause de sortie facilitée"}
                  </div>
                </>
              )}
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
                <Bar label="Fraîcheur" value={tm.fraicheur ?? 100} color={T.accent2} />
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

      {/* MY PALMARES VIEW */}
      {view === "myPalmares" && player.phase === "pro" && (
        <Card>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 16, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Trophy size={16} color={T.accent} /> Mon palmarès</div>
          <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 14 }}>
            Toutes tes victoires, podiums et maillots, du plus récent au plus ancien — petites courses comme grands rendez-vous.
          </div>
          {player.palmares.length === 0 && <div style={{ fontSize: 13, color: T.inkMuted, padding: "16px 0" }}>Rien encore au palmarès — la première victoire n'est jamais loin.</div>}
          {[...player.palmares].reverse().map((p, i) => (
            <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between" }}>
              <span>{p.label}</span><span style={{ color: T.inkMuted }}>{p.age} ans</span>
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
                  <p style={{ margin: "0 0 16px 0", lineHeight: 1.5 }}>{typeof current.data.text === "function" ? current.data.text(game) : current.data.text}</p>
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
              {current.data.isGrandTour && game.currentGT && (
                <div style={{ background: "rgba(198,93,59,0.12)", border: `1px solid ${T.accent}`, borderRadius: 6, padding: "8px 10px", marginBottom: 8, fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: T.accent, marginBottom: 4 }}>🏆 {game.currentGT.tourName}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    {(() => {
                      const gc = gtJerseyRankEstimate(game.currentGT.gcScore, { victoire: 150, podium: 95, top10: 45 });
                      return <span>🟡 Général<InfoTip term="gcVirtuel" /> : <b style={{ color: T.ink }}>{gc.label}</b>{gc.close && " (tout proche !)"}</span>;
                    })()}
                    {(() => {
                      const pts = gtJerseyRankEstimate(game.currentGT.pointsScore, { victoire: 45, podium: 25, top10: 10 });
                      return <span>🟢 Points : <b style={{ color: T.ink }}>{pts.label}</b>{pts.close && " (tout proche !)"}</span>;
                    })()}
                    {(() => {
                      const kom = gtJerseyRankEstimate(game.currentGT.komScore, { victoire: 45, podium: 25, top10: 10 });
                      return <span>🔴 Montagne : <b style={{ color: T.ink }}>{kom.label}</b>{kom.close && " (tout proche !)"}</span>;
                    })()}
                    {player.age < YOUTH_AGE_LIMIT && (() => {
                      const gc = gtJerseyRankEstimate(game.currentGT.gcScore, { victoire: 150, podium: 95, top10: 45 });
                      return <span>⚪ Jeune : <b style={{ color: T.ink }}>{gc.label === "Hors du top 10" ? "à confirmer" : gc.label}</b></span>;
                    })()}
                  </div>
                </div>
              )}
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 18, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {current.data.name}
                {current.data.weather && <span style={{ fontSize: 11, color: T.inkMuted, border: `1px solid ${T.line}`, borderRadius: 4, padding: "2px 6px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{current.data.weather}</span>}
                {game.raceState && (
                  <span style={{ fontSize: 11, color: game.raceState.group === RACE_GROUPS.FRONT ? T.accent : game.raceState.group === RACE_GROUPS.DROPPED ? T.danger : T.info, border: `1px solid currentColor`, borderRadius: 4, padding: "2px 6px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                    📍 {game.raceState.group}<InfoTip term="raceGroup" /> · ⚡ {game.raceState.energy}%<InfoTip term="raceEnergy" />
                  </span>
                )}
                {(() => {
                  const p = computePressure(game, current.data.name);
                  if (p < 55) return null;
                  return <span style={{ fontSize: 11, color: T.danger, border: `1px solid ${T.danger}`, borderRadius: 4, padding: "2px 6px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>🔥 Pression {pressureTier(p)}<InfoTip term="pressure" /></span>;
                })()}
              </div>
              {!pendingResult ? (
                <>
                  <div style={{ fontSize: 12, color: T.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{current.data.stages[stageIndex].phase}</div>
                  {current.data.stages[stageIndex].isPlanDeCourse ? (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, padding: "4px 0" }}>🎯 Objectif de l'équipe : <b>{current.data.stages[stageIndex].teamObjective}</b></div>
                      <div style={{ fontSize: 13, padding: "4px 0" }}>🚴 Ton rôle : <b>{current.data.stages[stageIndex].role}</b><InfoTip term="role" /></div>
                      <div style={{ fontSize: 13, padding: "4px 0" }}>📋 Ton objectif personnel : <b>{current.data.stages[stageIndex].personalObjective}</b></div>
                      <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 8 }}>Choisis ta stratégie pour la journée — elle influencera les occasions qui se présenteront à toi sur la route.</div>
                    </div>
                  ) : (
                    <p style={{ margin: "0 0 16px 0", lineHeight: 1.5 }}>{typeof current.data.stages[stageIndex].text === "function" ? current.data.stages[stageIndex].text(game) : current.data.stages[stageIndex].text}</p>
                  )}
                  {current.data.stages[stageIndex].choices.map((c, i) => (<ChoiceButton key={i} onClick={() => handleRaceChoice(c)}>{c.label}</ChoiceButton>))}
                  {stageIndex < current.data.stages.length - 1 && SkillEngine.getExtraTacticalChoices(game, current.data.role).map((c, i) => (
                    <ChoiceButton key={`skill-${i}`} onClick={() => handleRaceChoice(c)}>{c.label}</ChoiceButton>
                  ))}
                </>
              ) : (
                <>
                  {pendingResult.playerPosition === 1 && (
                    <div style={{ textAlign: "center", padding: "16px 12px", marginBottom: 14, background: "rgba(244,196,48,0.12)", border: `2px solid ${T.accent}`, borderRadius: 8 }}>
                      <div style={{ fontSize: 28 }}>🏆</div>
                      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 20, color: T.accent, letterSpacing: 1, textTransform: "uppercase" }}>
                        {current.data.isGrandTour ? "Victoire d'étape !" : "Victoire !"}
                      </div>
                      <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>{current.data.name}{current.data.isGrandTour ? ` — ${current.data.stages[stageIndex].phase.replace(/^Étape \d+\s*—?\s*/, "").trim() || `Étape`}` : ""}</div>
                    </div>
                  )}
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
                  <Card style={{ marginBottom: 16, background: T.panelAlt }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: T.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>Pourquoi ce résultat ?</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>Performance : {performanceSummaryScore(player)}/100</div>
                    </div>
                    {performanceBreakdownTiers(player).map((row) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 12 }}>
                        <span style={{ color: T.inkMuted }}>{row.label}</span>
                        <span>{row.icon} {row.text}</span>
                      </div>
                    ))}
                  </Card>
                  <ChoiceButton primary onClick={goToNextQueueItem}>Continuer</ChoiceButton>
                </>
              )}
              {raceLogs.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 12, color: T.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Déroulement</div>
                  {raceLogs.map((log, idx) => {
                    const summary = deltaSummary(log.delta);
                    return (
                      <div key={idx} style={{ padding: "4px 0" }}>
                        <div style={{ fontSize: 13 }}>• {log.text}</div>
                        {summary && <div style={{ fontSize: 11, color: T.inkMuted, marginLeft: 12 }}>{summary}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
