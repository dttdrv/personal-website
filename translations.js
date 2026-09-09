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
      opensource: 'Open Source',
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
      inProgress: 'In Progress',
      statusResearch: 'Research',
      statusActive: 'Active',
      statusShipped: 'Shipped'
    },
    about: {
      role: 'Founder of Misul • Systems & Neural Architectures',
      statement: 'I believe in doing a job 100% or not doing it at all.'
    },
    misul: {
      heading: 'Misul',
      role: 'Founder & Lead Researcher',
      intro: 'I am the founder and lead researcher at Misul, an independent AI research lab in Sofia, Bulgaria. We build machine intelligence based on brain principles. At Misul I am currently working on the following projects:',
      laplace: {
        title: 'Laplace',
        brief: 'Apple Silicon inference compiler over Metal',
        desc: 'A Metal-native inference compiler for Apple Silicon. Compatible dense models compile from declared operations and tensor storage into a persistent GPU session. Recurrent and routed expert execution is still being built.'
      },
      interlace: {
        title: 'Interlace',
        brief: 'Shared architecture for language and iterative computation',
        desc: 'A neural backbone that reuses its layers across computation steps, combining content-selected attention and gated delta memory.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Content-routed sparse attention sequence mixer',
        desc: 'An open-source attention mechanism that selects only relevant tokens during processing, reducing memory usage while keeping strong recall capabilities.'
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
    opensource: {
      heading: 'Open Source Contributions',
      intro: 'Contributor to Khronos MoltenVK, the Vulkan implementation on Apple platforms:',
      moltenvk: {
        title: 'MoltenVK',
        brief: 'Porting Vulkan ray tracing to macOS',
        desc: 'Contributor to Khronos MoltenVK. The in-review patch ports Vulkan ray tracing to macOS by mapping ray query, acceleration structures, and ray tracing pipelines onto Metal.',
        pr2771: '#2771 Ray tracing',
        pr2776: '#2776 Sampler min/max',
        pr2788: '#2788 Indexed indirect',
        pr2790: '#2790 Non-indexed indirect'
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
      opensource: 'Отворен код',
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
      inProgress: 'В процес',
      statusResearch: 'Изследване',
      statusActive: 'Активен',
      statusShipped: 'Издаден'
    },
    about: {
      role: 'Основател на Misul • Системен софтуер и невронни архитектури',
      statement: 'Вярвам в това да свърша работата на 100% или да не я правя изобщо.'
    },
    misul: {
      heading: 'Misul',
      role: 'Основател и главен изследовател',
      intro: 'Аз съм основател и водещ изследовател в Misul – независима лаборатория за изкуствен интелект в София, изграждаща машинен интелект въз основа на принципите на мозъка. В Misul в момента разработвам следните проекти:',
      laplace: {
        title: 'Laplace',
        brief: 'Компилатор за инференс върху Apple Silicon чрез Metal',
        desc: 'Metal-нативен компилатор за инференс върху Apple Silicon. Съвместими плътни модели се компилират от обявени операции и тензорно съхранение в постоянна GPU сесия. Рекурентното и routed expert изпълнение все още се изгражда.'
      },
      interlace: {
        title: 'Interlace',
        brief: 'Споделена архитектура за език и итеративни изчисления',
        desc: 'Невронна основа, която преизползва слоевете си през стъпки на изчисление, съчетавайки селективно внимание и gated delta памет.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Селективно разредено внимание с маршрутизиране по съдържание',
        desc: 'Отворен механизъм за внимание, който избира само най-важните токени при обработка, намалявайки използваната памет и изчислителните ресурси.'
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
    opensource: {
      heading: 'Приноси с отворен код',
      intro: 'Принос към Khronos MoltenVK, реализацията на Vulkan върху платформите на Apple:',
      moltenvk: {
        title: 'MoltenVK',
        brief: 'Портиране на Vulkan ray tracing към macOS',
        desc: 'Принос към Khronos MoltenVK. Заявката в преглед портира Vulkan ray tracing към macOS, като пренася ray query, acceleration structures и ray tracing pipelines върху Metal.',
        pr2771: '#2771 Ray tracing',
        pr2776: '#2776 Sampler min/max',
        pr2788: '#2788 Indexed indirect',
        pr2790: '#2790 Non-indexed indirect'
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
      opensource: 'Open source',
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
      inProgress: 'En cours',
      statusResearch: 'Recherche',
      statusActive: 'Actif',
      statusShipped: 'Publié'
    },
    about: {
      role: 'Fondateur de Misul • Systèmes & Architectures Neurales',
      statement: 'Je crois qu’il faut faire un travail à 100% ou ne pas le faire du tout.'
    },
    misul: {
      heading: 'Misul',
      role: 'Fondateur & Chercheur Principal',
      intro: 'Fondateur et chercheur principal chez Misul, laboratoire indépendant de recherche en IA.',
      laplace: {
        title: 'Laplace',
        brief: 'Compilateur d’inférence Apple Silicon sur Metal',
        desc: 'Compilateur d’inférence natif Metal pour Apple Silicon. Les modèles dense compatibles compilent les opérations déclarées et le stockage des tenseurs en une session GPU persistante. L’exécution récurrente et routed expert est encore en cours.'
      },
      interlace: {
        title: 'Interlace',
        brief: 'Architecture partagée pour le langage et le calcul itératif',
        desc: 'Backbone neuronal qui réutilise ses couches à chaque étape, combinant attention sélectionnée par contenu et mémoire delta à portes.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Mélangeur d’attention clairsemée',
        desc: 'Mécanisme d’attention clairsemée routé par contenu.'
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
    opensource: {
      heading: 'Contributions open source',
      intro: 'Contributeur à Khronos MoltenVK, l’implémentation Vulkan sur les plateformes Apple :',
      moltenvk: {
        title: 'MoltenVK',
        brief: 'Portage de Vulkan ray tracing vers macOS',
        desc: 'Contributeur à Khronos MoltenVK. Le correctif en revue porte Vulkan ray tracing vers macOS en projetant ray query, acceleration structures et pipelines de ray tracing sur Metal.',
        pr2771: '#2771 Ray tracing',
        pr2776: '#2776 Sampler min/max',
        pr2788: '#2788 Indexed indirect',
        pr2790: '#2790 Non-indexed indirect'
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
      opensource: 'Open source',
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
      inProgress: 'In corso',
      statusResearch: 'Ricerca',
      statusActive: 'Attivo',
      statusShipped: 'Rilasciato'
    },
    about: {
      role: 'Fondatore di Misul • Sistemi & Architetture Neurali',
      statement: 'Credo nel fare un lavoro al 100% o nel non farlo affatto.'
    },
    misul: {
      heading: 'Misul',
      role: 'Fondatore & Ricercatore Principale',
      intro: 'Fondatore e ricercatore principale di Misul.',
      laplace: {
        title: 'Laplace',
        brief: 'Compilatore di inferenza Apple Silicon su Metal',
        desc: 'Compilatore di inferenza nativo Metal per Apple Silicon. I modelli dense compatibili compilano operazioni dichiarate e storage dei tensori in una sessione GPU persistente. L’esecuzione ricorrente e routed expert è ancora in costruzione.'
      },
      interlace: {
        title: 'Interlace',
        brief: 'Architettura condivisa per linguaggio e calcolo iterativo',
        desc: 'Backbone neurale che riutilizza i propri strati a ogni passo, combinando attenzione selezionata per contenuto e memoria delta a gate.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Attenzione sparsa per sequenze',
        desc: 'Meccanismo open source per attenzione selettiva.'
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
    opensource: {
      heading: 'Contributi open source',
      intro: 'Contributore a Khronos MoltenVK, l’implementazione Vulkan sulle piattaforme Apple:',
      moltenvk: {
        title: 'MoltenVK',
        brief: 'Porting di Vulkan ray tracing su macOS',
        desc: 'Contributore a Khronos MoltenVK. La patch in revisione porta Vulkan ray tracing su macOS mappando ray query, acceleration structures e pipeline di ray tracing su Metal.',
        pr2771: '#2771 Ray tracing',
        pr2776: '#2776 Sampler min/max',
        pr2788: '#2788 Indexed indirect',
        pr2790: '#2790 Non-indexed indirect'
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
      opensource: 'Open Source',
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
      inProgress: 'In Arbeit',
      statusResearch: 'Forschung',
      statusActive: 'Aktiv',
      statusShipped: 'Veröffentlicht'
    },
    about: {
      role: 'Gründer von Misul • Systeme & Neurale Architekturen',
      statement: 'Ich glaube daran, eine Aufgabe zu 100% zu erledigen oder gar nicht.'
    },
    misul: {
      heading: 'Misul',
      role: 'Gründer & Leitender Forscher',
      intro: 'Gründer und leitender Forscher bei Misul.',
      laplace: {
        title: 'Laplace',
        brief: 'Apple-Silicon-Inferenzcompiler über Metal',
        desc: 'Metal-nativer Inferenzcompiler für Apple Silicon. Kompatible dichte Modelle kompilieren deklarierte Operationen und Tensor-Speicher in eine persistente GPU-Session. Rekurrente und Routed-Expert-Ausführung wird noch gebaut.'
      },
      interlace: {
        title: 'Interlace',
        brief: 'Gemeinsame Architektur für Sprache und iterative Berechnung',
        desc: 'Neuronales Rückgrat, das seine Schichten über Berechnungsschritte wiederverwendet und inhaltsselektierte Aufmerksamkeit mit gated-delta Speicher verbindet.'
      },
      monodratic: {
        title: 'Monodratic',
        brief: 'Sparse-Attention-Sequenzmischer',
        desc: 'Open-Source-Aufmerksamkeitsmechanismus mit gezieltem Routing.'
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
    opensource: {
      heading: 'Open-Source-Beiträge',
      intro: 'Beiträge zu Khronos MoltenVK, der Vulkan-Implementierung auf Apple-Plattformen:',
      moltenvk: {
        title: 'MoltenVK',
        brief: 'Portierung von Vulkan-Raytracing auf macOS',
        desc: 'Beiträge zu Khronos MoltenVK. Der Patch in Review portiert Vulkan-Raytracing auf macOS, indem Ray Query, Acceleration Structures und Raytracing-Pipelines auf Metal abgebildet werden.',
        pr2771: '#2771 Ray tracing',
        pr2776: '#2776 Sampler min/max',
        pr2788: '#2788 Indexed indirect',
        pr2790: '#2790 Non-indexed indirect'
      }
    },
    sections: {
      work: 'Arbeiten',
      contact: 'Kontakt'
    }
  }
};
