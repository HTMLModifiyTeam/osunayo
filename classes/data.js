export const TX = {
  again: 'Play Again', top: 'Back to Title', fightButton: 'FIGHT', fightAngry: 'I\'M DONE!',
  tTitle: 'Read the Room<small>“Don\'t push me… seriously, DON\'T”</small>', hud: 'Read the Room', how: 'A bare back in front of you. Boiling water beyond.<br>He says “Don\'t push me.” What do you do?', start: 'Start', skip: 'Skip ▶▶', push: 'PUSH', no: 'DON\'T',
  LC: ['', 'Please don\'t push me…', 'Really, please don\'t…', 'Please, stop!', 'I\'m begging you…', 'I really can\'t handle heat…', '…You won\'t push, right?', 'Um, can I get down now…', 'Please…', 'I\'m scared…', 'This is the last one, right…?'],
  L: ['', 'Don\'t push me', 'Don\'t push me!', 'Do NOT push me!', 'Don\'t push me', 'Don\'t push me…?', 'Don\'t push me! (peek)', '…Don\'t push me', 'I said don\'t…', 'Hey… don\'t push me?', 'Don\'t push me… (last chance)'],
  pushy1: 'PUSH ME ALREADY!!', pushy2: '…Push me next time, OK?', early: 'I SAID DON\'T PUSH!', late: 'Not NOW!', clear: 'You get it!', both: 'Why are YOU in here too?!', dive: 'YOU jumped in?!', dive2: '…You\'re a genius', bored: '…You\'re no fun.',
  hot: ['HOT!', 'HOT! HOT!', 'OW OW OW!'], meHot: ['HOT!', 'OUCH!'], bigClear: 'Bravo!', bigBoth: 'Not bad!', bigDive: 'LEGEND!',
  cnt: '“Don\'t push” x{n}',
  line_push: 'Pushed at “Don\'t push” #{n}',
  tel_push: 'HE PUSHED!!', tel_hot: 'INTO THE HOT BATH!!', tel_clear: 'Classic gag, nailed!', tel_early: 'Way too early…', tel_late: 'Way too late…', tel_both1: 'Dragging him along!?', tel_both2: 'Both in the bath!', tel_dive1: 'Wait…', tel_dive2: 'HE JUMPED IN HIMSELF!!', tel_bored1: '*silence*', tel_bored2: 'Dead air', tel_pushy: 'You DIDN\'T push!?',
  tn: {
    fight: 'Press Conference Brawler',
    all: 'Comedy God',
    dive: 'Comedy Legend',
    kuuki: 'Room Reader',
    both: 'Decent Comedian',
    clear: 'Comedian',
    yari: 'Overkill Comedian',
    fui: 'Sneak Attacker',
    gaya: 'Traitor',
    fly: 'False Start',
    ky: 'Can\'t Read the Room',
    enjo: 'Cancelled'
  },
  kanpe: {
    def: 'READ THE ROOM',
    lol: 'LOL',
    wrap: 'WRAP IT UP!',
    clear: 'AMAZING!',
    dive: 'EPIC!',
    both: 'NICE!',
    early: 'TOO EARLY!',
    late: 'TOO LATE!',
    bored: 'DEAD AIR',
    gachi: 'FOR REAL',
    mada: 'NOT YET!',
    yari: 'TOO MUCH!',
    fui: 'SNEAKY!',
    gaya: 'HIM?!',
    all: 'EVERYONE?!',
    seikai: 'CORRECT',
    enjo: 'NOT OK'
  },
  gaya: {
    early: ['Too early!', 'Not yet!'],
    late: ['Not now!', 'Too late!'],
    clear: ['Yeah!', 'Nice one!'],
    both: ['You too?!', 'Both of them!'],
    dive: ['YOU went in?!', 'No way!'],
    bored: ['What are you doing…'],
    pushy: ['Hahaha!', 'Push him!'],
    fly: ['Too soon!', 'We haven\'t started!'],
    yari: ['He flew!', 'Too much!'],
    fui: ['Right now?!', 'That\'s dirty!'],
    gaya: ['Hahaha! Glad it\'s not me!'],
    all: ['Me too!', 'Wheee!'],
    enjo: ['Hey…', 'Not cool…'],
    kuuki: ['Good call!', 'You get it!']
  },

  line_fight: 'One furious press conference, two fists flying.',
  line_fly: 'Pushed before he even said “Don\'t push”', line_enjo: 'Pushed a regular person at “Please don\'t push” #{n}', line_enjo0: 'Pushed a regular person before they said a word',
  cntC: '“Please don\'t push” x{n}',
  fly: 'WE HAVEN\'T EVEN STARTED!', fui: 'NOT WHILE I\'M LOOKING!', yari: 'THAT\'S TOO MUCH!', gayaM: 'HIM?!', gayaV: 'WHY ME?!', allM1: 'EVERYONE\'S IN?!', allM2: 'Fine, me too!', civHot: 'OW!! IT\'S REALLY HOT!!', civThanks: 'Thank you so much…!', eh: 'Huh?',
  bigAll: 'LEGENDARY!', bigKuuki: 'CORRECT!', bigYari: 'OVERKILL!', bigFui: 'SNEAKY!', bigGaya: 'BETRAYAL!', bigFly: 'FALSE START!',
  tel_fight: 'The press conference explodes!', tel_fly1: 'HE PUSHED…?!', tel_fly2: 'He hasn\'t said anything yet!', tel_fly: 'False start', tel_yari1: 'WAY TOO HARD!!', tel_yari: 'All the way into the audience', tel_fui1: 'SNEAK ATTACK!!', tel_fui: 'The moment he looked back…', tel_gaya1: 'Wait…', tel_gaya2: 'THE SIDEKICK FELL IN!!', tel_gaya: 'Wrong guy', tel_all1: 'Wait, EVERYONE?!', tel_all2: 'THE WHOLE STUDIO DIVES IN!!', tel_all: 'A legendary episode', tel_enjo1: 'THAT\'S A REGULAR PERSON!!', tel_enjo2: 'We cannot air this', tel_enjo: 'We sincerely apologize', tel_kuuki: 'Perfect response',
  gayaBtn: 'Push sidekick', pressSign: 'PRESS CONFERENCE'
};

export const KT = {
  fight: 'fight',
  all: 'all',
  dive: 'dive',
  kuuki: 'kuuki',
  both: 'both',
  clear: 'clear',
  yari: 'yari',
  fui: 'fui',
  gaya: 'gaya',
  fly: 'fly',
  early: 'ky',
  late: 'ky',
  bored: 'ky',
  enjo: 'enjo'
};
export const TIER = {
  fight: 2,
  all: 0,
  dive: 0,
  kuuki: 1,
  both: 1,
  clear: 1,
  yari: 2,
  fui: 2,
  gaya: 2,
  fly: 2,
  ky: 3,
  enjo: 4
};

export const D = {
  fight: 7,
  intro: 3.4,
  line: 1.15,
  pushy: 2.8,
  early: 5.6,
  clear: 5.8,
  late: 5.6,
  both: 6,
  dive: 6.4,
  bored: 4.3,
  fly: 5.6,
  fui: 5.8,
  yari: 6.4,
  gaya: 6.2,
  all: 9.0,
  enjo: 7.4,
  kuuki: 5.4
};

export const DEC = {
  laugh: .42,
  clap: .36,
  cheer: .45,
  shock: .9,
  sad: .2,
  ooh: .7,
  flash: .55
};

export const TUB = {
  x0: -1.45,
  x1: 1.45,
  z0: -2.75,
  z1: -.1,
  top: .95,
  water: .78
};

// PERSON DATA
export const SHIRT = [0xe8352a, 0x2a6ad8, 0xffd23a, 0x1aa34a, 0xff7ad8, 0xffffff, 0x7a3ad8, 0xff8a3a, 0x3ad0e0, 0x222222, 0xf2f2a0, 0x8a5a3a];
export const SKIN = [0xf2d3b8, 0xe6c09c, 0xd8a882, 0xf6dcc8];
export const HAIR = [0x1a1410, 0x2a1a10, 0x4a2a18, 0x6a4a2a, 0x8a6a40, 0x111111, 0xc89a5a];
export const PANTS = [0x2a2a3a, 0x3a3a5a, 0x1f2a44, 0x555555, 0x6a4a2a];