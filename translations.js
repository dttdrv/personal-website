// Multi-language translation dictionary for Deyan Todorov portfolio
// Language code follows ISO 639-1 (en, bg, fr, it, de)

const TRANSLATIONS = {
  // English (Default)
  en: {
    name: {
      firstName: 'DEYAN',
      lastName: 'TODOROV'
    },
    nav: {
      top: 'Top',
      about: 'About',
      misul: 'Misul Lab',
      projects: 'Projects',
      contact: 'Contact'
    },
    ui: {
      scroll: 'Scroll',
      explore: 'Explore',
      close: 'Close',
      expand: 'Expand details',
      collapse: 'Collapse details',
      viewCode: 'View Code',
      viewPaper: 'Research Paper',
      viewReport: 'View Report',
      viewPackage: 'View Package',
      viewSite: 'Visit Site',
      statusResearch: 'Research',
      statusActive: 'Active',
      statusShipped: 'Shipped'
    },
    about: {
      role: 'Founder of Misul Computing • Systems & Neural Architectures',
      statement: 'I believe in doing a job 100% or not doing it at all.'
    },
    misul: {
      heading: 'Misul Computing',
      role: 'Founder & Lead Researcher',
      intro: 'I am the founder and lead researcher at Misul Computing, an independent AI research lab in Sofia, Bulgaria. We build machine intelligence based on brain principles. At Misul I am currently working on the following projects:',
      laplace: {
        title: 'Laplace',
        brief: 'Apple Silicon inference engine with high speed and low power draw',
        desc: 'An inference engine built from scratch for Apple Silicon. Runs large language models directly on Mac hardware using custom SIMD kernels, Metal acceleration, and smart memory streaming to maximize speed and efficiency.'
      },
      agent: {
        title: 'Misul Agent',
        brief: 'Zig and Cordis based terminal agent harness',
        desc: 'A fast terminal coding harness and agent engine built in Zig and Cordis, featuring dynamic runtime hooks, lightweight tool routing, and direct system execution.'
      },
      todorov: {
        title: 'Todorov',
        brief: 'Unified neural architecture for language, state tracking, and action',
        desc: 'A research project to build one neural model that handles language understanding, world state tracking, and physical actions in a single shared representation.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Content-routed sparse attention sequence mixer',
        desc: 'An open-source attention mechanism that selects only relevant tokens during processing, reducing memory usage while keeping strong recall capabilities.'
      },
      transformerov: {
        title: 'Transformerov',
        brief: 'Hybrid sequence model combining local attention and recurrent memory',
        desc: 'A hybrid model implemented in Apple MLX that merges windowed attention for local detail with recurrent state for long-term memory.'
      }
    },
    projects: {
      heading: 'Independent Projects',
      intro: 'Selected standalone applications, native systems software, and digital infrastructure projects:',
      phonecode: {
        title: 'PhoneCode',
        brief: 'On-device AI coding agent for Android',
        desc: 'A native Android app that lets you edit and manage code repositories directly on your phone, with support for local and cloud models and zero telemetry.'
      },
      optisys: {
        title: 'optiSYS',
        brief: 'Native Windows system optimizer and latency tuner',
        desc: 'A lightweight Windows utility that tunes system responsiveness, network buffers, and background scheduling without bloat or telemetry.'
      },
      dzipobel: {
        title: 'dzipobel.wiki',
        brief: 'Open digital library for Bulgarian literature and grammar',
        desc: 'A fast open educational archive providing curated analyses, grammar guides, and reference material for Bulgarian state matriculation exams.'
      },
      schoolmap: {
        title: 'SchoolMap',
        brief: 'Interactive mapping tool for classroom projection',
        desc: 'A fast geospatial mapping tool designed for classroom geography lessons and interactive educational exercises.'
      }
    },
    sections: {
      work: 'Work',
      contact: 'Contact'
    }
  },

  // Bulgarian (Cyrillic)
  bg: {
    name: {
      firstName: 'ДЕЯН',
      lastName: 'ТОДОРОВ'
    },
    nav: {
      top: 'Начало',
      about: 'За мен',
      misul: 'Misul Лаборатория',
      projects: 'Проекти',
      contact: 'Контакт'
    },
    ui: {
      scroll: 'Превъртане',
      explore: 'Разгледай',
      close: 'Затвори',
      expand: 'Разгъни детайли',
      collapse: 'Свий детайли',
      viewCode: 'Преглед на код',
      viewPaper: 'Научна публикация',
      viewReport: 'Преглед на доклад',
      viewPackage: 'Преглед на пакет',
      viewSite: 'Посети сайта',
      statusResearch: 'Изследване',
      statusActive: 'Активен',
      statusShipped: 'Издаден'
    },
    about: {
      role: 'Основател на Misul Computing • Системен софтуер и невронни архитектури',
      statement: 'Вярвам в това да свърша работата на 100% или да не я правя изобщо.'
    },
    misul: {
      heading: 'Misul Computing',
      role: 'Основател и главен изследовател',
      intro: 'Аз съм основател и водещ изследовател в Misul Computing – независима лаборатория за изкуствен интелект в София, изграждаща машинен интелект въз основа на принципите на мозъка. В Misul в момента разработвам следните проекти:',
      laplace: {
        title: 'Laplace',
        brief: 'Двигател за невронни изчисления върху Apple Silicon с висока скорост и ниска консумация',
        desc: 'Двигател за изкуствен интелект, изграден от нулата за Apple Silicon. Стартира големи езикови модели директно на Mac с персонализирани SIMD ядра, Metal ускорение и оптимизирано управление на паметта.'
      },
      agent: {
        title: 'Misul Agent',
        brief: 'Терминален агент за програмиране, изграден със Zig и Cordis',
        desc: 'Бърза терминална работна среда и агент за програмиране, разработен на Zig и Cordis, с динамични куки и директна системна интеграция.'
      },
      todorov: {
        title: 'Todorov',
        brief: 'Единна невронна архитектура за език, състояние и действие',
        desc: 'Изследователски проект за невронна система, която съчетава езиково разбиране, проследяване на състоянието на света и действия в един споделен модел.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Селективно разредено внимание с маршрутизиране по съдържание',
        desc: 'Отворен механизъм за внимание, който избира само най-важните токени при обработка, намалявайки използваната памет и изчислителните ресурси.'
      },
      transformerov: {
        title: 'Transformerov',
        brief: 'Хибриден модел за Apple Silicon с локално внимание и рекурентна памет',
        desc: 'Хибриден модел, разработен в Apple MLX, който съчетава прозоречно локално внимание с рекурентно състояние за дългосрочна памет.'
      }
    },
    projects: {
      heading: 'Самостоятелни проекти',
      intro: 'Подбрани самостоятелни приложения, нативен системен софтуер и дигитална инфраструктура:',
      phonecode: {
        title: 'PhoneCode',
        brief: 'AI асистент за програмиране директно на Android устройство',
        desc: 'Нативно Android приложение за писане и управление на софтуерни проекти на телефона, с поддръжка на локални и облачни модели и без събиране на данни.'
      },
      optisys: {
        title: 'optiSYS',
        brief: 'Нативен системен оптимизатор за Windows и мрежов тунинг',
        desc: 'Лека нативна програма за Windows, която подобрява бързината на системата, мрежовите буфери и фоновите процеси без излишен софтуер.'
      },
      dzipobel: {
        title: 'dzipobel.wiki',
        brief: 'Дигитална библиотека по литература и граматика за матура по БЕЛ',
        desc: 'Бърза образователна платформа с литературни анализи и езикови правила в помощ на зрелостниците в България.'
      },
      schoolmap: {
        title: 'SchoolMap',
        brief: 'Интерактивно картографско приложение за учебни зали',
        desc: 'Бърз географски инструмент, предназначен за интерактивни уроци и картографски упражнения в училище.'
      }
    },
    sections: {
      work: 'Работа',
      contact: 'Контакт'
    }
  },

  // French
  fr: {
    name: {
      firstName: 'DEYAN',
      lastName: 'TODOROV'
    },
    nav: {
      top: 'Haut',
      about: 'À propos',
      misul: 'Labo Misul',
      projects: 'Projets',
      contact: 'Contact'
    },
    ui: {
      scroll: 'Défiler',
      explore: 'Explorer',
      close: 'Fermer',
      expand: 'Développer',
      collapse: 'Réduire',
      viewCode: 'Code source',
      viewPaper: 'Article de recherche',
      viewReport: 'Voir rapport',
      viewPackage: 'Voir package',
      viewSite: 'Visiter le site',
      statusResearch: 'Recherche',
      statusActive: 'Actif',
      statusShipped: 'Publié'
    },
    about: {
      role: 'Fondateur de Misul Computing • Systèmes & Architectures Neurales',
      statement: 'Je crois qu’il faut faire un travail à 100% ou ne pas le faire du tout.'
    },
    misul: {
      heading: 'Misul Computing',
      role: 'Fondateur & Chercheur Principal',
      intro: 'Fondateur et chercheur principal chez Misul Computing, laboratoire indépendant de recherche en IA.',
      laplace: {
        title: 'Laplace',
        brief: 'Moteur d’inférence pour Apple Silicon',
        desc: 'Moteur d’inférence LLM optimisé pour Apple Silicon.'
      },
      agent: {
        title: 'Misul Agent',
        brief: 'Harnais d’agent de terminal en Zig et Cordis',
        desc: 'Harnais de codage en terminal rapide conçu en Zig et Cordis avec intégration système directe.'
      },
      todorov: {
        title: 'Todorov',
        brief: 'Architecture neurale unifiée',
        desc: 'Programme de recherche pour un modèle unifié.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Mélangeur d’attention clairsemée',
        desc: 'Mécanisme d’attention clairsemée routé par contenu.'
      },
      transformerov: {
        title: 'Transformerov',
        brief: 'Modèle hybride MLX',
        desc: 'Modèle de séquence hybride combinant attention locale et récurrence.'
      }
    },
    projects: {
      heading: 'Projets Indépendants',
      intro: 'Sélection d’applications autonomes et logiciels systèmes:',
      phonecode: {
        title: 'PhoneCode',
        brief: 'Agent de code IA sur l’appareil pour Android',
        desc: 'Application Android native pour exécuter des modèles de code localement.'
      },
      optisys: {
        title: 'optiSYS',
        brief: 'Optimiseur système natif Windows',
        desc: 'Utilitaire Windows léger pour optimiser les performances.'
      },
      dzipobel: {
        title: 'dzipobel.wiki',
        brief: 'Bibliothèque littéraire pour la matura bulgare',
        desc: 'Répertoire éducatif ouvert pour les examens d’État bulgares.'
      },
      schoolmap: {
        title: 'SchoolMap',
        brief: 'Outil de cartographie pour salles de classe',
        desc: 'Application cartographique pour la projection en classe.'
      }
    },
    sections: {
      work: 'Travaux',
      contact: 'Contact'
    }
  },

  // Italian
  it: {
    name: {
      firstName: 'DEYAN',
      lastName: 'TODOROV'
    },
    nav: {
      top: 'Inizio',
      about: 'Chi sono',
      misul: 'Misul Lab',
      projects: 'Progetti',
      contact: 'Contatto'
    },
    ui: {
      scroll: 'Scorri',
      explore: 'Esplora',
      close: 'Chiudi',
      expand: 'Espandi dettagli',
      collapse: 'Riduci dettagli',
      viewCode: 'Vedi codice',
      viewPaper: 'Articolo di ricerca',
      viewReport: 'Vedi report',
      viewPackage: 'Vedi pacchetto',
      viewSite: 'Visita sito',
      statusResearch: 'Ricerca',
      statusActive: 'Attivo',
      statusShipped: 'Rilasciato'
    },
    about: {
      role: 'Fondatore di Misul Computing • Sistemi & Architetture Neurali',
      statement: 'Credo nel fare un lavoro al 100% o nel non farlo affatto.'
    },
    misul: {
      heading: 'Misul Computing',
      role: 'Fondatore & Ricercatore Principale',
      intro: 'Fondatore e ricercatore principale di Misul Computing.',
      laplace: {
        title: 'Laplace',
        brief: 'Motore di inferenza per Apple Silicon',
        desc: 'Motore di inferenza per modelli linguistici su Apple Silicon.'
      },
      agent: {
        title: 'Misul Agent',
        brief: 'Harness per agente da terminale in Zig e Cordis',
        desc: 'Harness di programmazione da terminale scritto in Zig e Cordis ad alte prestazioni.'
      },
      todorov: {
        title: 'Todorov',
        brief: 'Architettura neurale unificata',
        desc: 'Programma di ricerca per un modello condiviso.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Attenzione sparsa per sequenze',
        desc: 'Meccanismo open source per attenzione selettiva.'
      },
      transformerov: {
        title: 'Transformerov',
        brief: 'Modello sequenziale ibrido MLX',
        desc: 'Modello ibrido con attenzione locale e memoria ricorrente.'
      }
    },
    projects: {
      heading: 'Progetti Indipendenti',
      intro: 'Applicazioni e sistemi software selezionati:',
      phonecode: {
        title: 'PhoneCode',
        brief: 'Agente IA su dispositivo per Android',
        desc: 'App nativa Android per eseguire modelli di programmazione in locale.'
      },
      optisys: {
        title: 'optiSYS',
        brief: 'Ottimizzatore di sistema per Windows',
        desc: 'Utility leggera per ottimizzare le prestazioni su Windows.'
      },
      dzipobel: {
        title: 'dzipobel.wiki',
        brief: 'Biblioteca digitale per la maturità bulgara',
        desc: 'Piattaforma educativa aperta per esami di maturità.'
      },
      schoolmap: {
        title: 'SchoolMap',
        brief: 'Mappatura interattiva per aule',
        desc: 'Strumento geografico per lezioni scolastiche.'
      }
    },
    sections: {
      work: 'Lavori',
      contact: 'Contatto'
    }
  },

  // German
  de: {
    name: {
      firstName: 'DEYAN',
      lastName: 'TODOROV'
    },
    nav: {
      top: 'Start',
      about: 'Über mich',
      misul: 'Misul Lab',
      projects: 'Projekte',
      contact: 'Kontakt'
    },
    ui: {
      scroll: 'Scrollen',
      explore: 'Erkunden',
      close: 'Schließen',
      expand: 'Details anzeigen',
      collapse: 'Details ausblenden',
      viewCode: 'Code ansehen',
      viewPaper: 'Forschungsarbeit',
      viewReport: 'Bericht ansehen',
      viewPackage: 'Paket ansehen',
      viewSite: 'Website besuchen',
      statusResearch: 'Forschung',
      statusActive: 'Aktiv',
      statusShipped: 'Veröffentlicht'
    },
    about: {
      role: 'Gründer von Misul Computing • Systeme & Neurale Architekturen',
      statement: 'Ich glaube daran, eine Aufgabe zu 100% zu erledigen oder gar nicht.'
    },
    misul: {
      heading: 'Misul Computing',
      role: 'Gründer & Leitender Forscher',
      intro: 'Gründer und leitender Forscher bei Misul Computing.',
      laplace: {
        title: 'Laplace',
        brief: 'Inferenz-Engine für Apple Silicon',
        desc: 'Inferenz-Engine für LLMs direkt auf Apple Silicon.'
      },
      agent: {
        title: 'Misul Agent',
        brief: 'Terminal-Agent-Harness auf Basis von Zig und Cordis',
        desc: 'Schneller Terminal-Coding-Harness und Agenten-Engine in Zig und Cordis mit dynamischen Hooks.'
      },
      todorov: {
        title: 'Todorov',
        brief: 'Einheitliche neuronale Architektur',
        desc: 'Forschungsprogramm für ein vereinheitlichtes Modell.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Sparse-Attention-Sequenzmischer',
        desc: 'Open-Source-Aufmerksamkeitsmechanismus mit gezieltem Routing.'
      },
      transformerov: {
        title: 'Transformerov',
        brief: 'Hybrides MLX-Sequenzmodell',
        desc: 'Hybrides Sequenzmodell mit lokaler Aufmerksamkeit und rekurrentem Speicher.'
      }
    },
    projects: {
      heading: 'Unabhängige Projekte',
      intro: 'Ausgewählte Anwendungen und native Systemsoftware:',
      phonecode: {
        title: 'PhoneCode',
        brief: 'On-Device KI-Coding-Agent für Android',
        desc: 'Native Android-App zum Ausführen lokaler Code-Modelle direkt auf dem Smartphone.'
      },
      optisys: {
        title: 'optiSYS',
        brief: 'Nativer Windows-Systemoptimierer',
        desc: 'Schlankes Windows-Dienstprogramm zur Systemoptimierung.'
      },
      dzipobel: {
        title: 'dzipobel.wiki',
        brief: 'Digitale Bibliothek für das bulgarische Abitur',
        desc: 'Offenes Bildungsarchiv für bulgarische Reifeprüfungen.'
      },
      schoolmap: {
        title: 'SchoolMap',
        brief: 'Interaktives Kartenwerkzeug für den Unterricht',
        desc: 'Geografische Web-App für den Unterricht an Schulen.'
      }
    },
    sections: {
      work: 'Arbeiten',
      contact: 'Kontakt'
    }
  }
};
