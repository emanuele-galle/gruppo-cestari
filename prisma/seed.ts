import { PrismaClient, ProjectSector, BandoType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' },
  });

  if (!admin) {
    console.error('No admin user found. Please create an admin first.');
    process.exit(1);
  }

  console.log('Using admin:', admin.email);

  // ============================================
  // NEWS CATEGORIES
  // ============================================
  console.log('Creating news categories...');

  const categories = await Promise.all([
    prisma.newsCategory.upsert({
      where: { slug: 'energia' },
      update: {},
      create: {
        slug: 'energia',
        translations: {
          create: [
            { locale: 'it', name: 'Energia', description: 'Notizie su energie rinnovabili e sostenibilità' },
            { locale: 'en', name: 'Energy', description: 'News on renewable energy and sustainability' },
            { locale: 'fr', name: 'Énergie', description: 'Actualités sur les énergies renouvelables' },
          ],
        },
      },
    }),
    prisma.newsCategory.upsert({
      where: { slug: 'cooperazione' },
      update: {},
      create: {
        slug: 'cooperazione',
        translations: {
          create: [
            { locale: 'it', name: 'Cooperazione', description: 'Progetti di cooperazione internazionale' },
            { locale: 'en', name: 'Cooperation', description: 'International cooperation projects' },
            { locale: 'fr', name: 'Coopération', description: 'Projets de coopération internationale' },
          ],
        },
      },
    }),
    prisma.newsCategory.upsert({
      where: { slug: 'finanza' },
      update: {},
      create: {
        slug: 'finanza',
        translations: {
          create: [
            { locale: 'it', name: 'Finanza', description: 'Bandi, finanziamenti e opportunità' },
            { locale: 'en', name: 'Finance', description: 'Grants, funding and opportunities' },
            { locale: 'fr', name: 'Finance', description: 'Appels d\'offres et financements' },
          ],
        },
      },
    }),
    prisma.newsCategory.upsert({
      where: { slug: 'eventi' },
      update: {},
      create: {
        slug: 'eventi',
        translations: {
          create: [
            { locale: 'it', name: 'Eventi', description: 'Eventi, conferenze e fiere' },
            { locale: 'en', name: 'Events', description: 'Events, conferences and fairs' },
            { locale: 'fr', name: 'Événements', description: 'Événements, conférences et salons' },
          ],
        },
      },
    }),
  ]);

  const [catEnergia, catCooperazione, catFinanza] = categories;

  // ============================================
  // NEWS - Match homepage hardcoded links
  // ============================================
  console.log('Creating news...');

  // ============================================
  // NEWS REALI - Gruppo Cestari
  // ============================================

  // 1. CER "Energia Dal Sole" Moliterno
  await prisma.news.upsert({
    where: { slug: 'cer-moliterno-energia-dal-sole' },
    update: {},
    create: {
      slug: 'cer-moliterno-energia-dal-sole',
      authorId: admin.id,
      categoryId: catEnergia.id,
      featuredImage: '/images/photos/services-energy.jpg',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date('2025-10-15'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'CER "Energia Dal Sole" di Moliterno: un modello per la Basilicata',
            excerpt: 'La Comunità Energetica Rinnovabile di Moliterno rappresenta un esempio virtuoso di transizione energetica. Marisol Cestari nominata referente territoriale.',
            content: `
<p>La Comunità Energetica Rinnovabile (CER) "Energia Dal Sole" di <strong>Moliterno</strong> sta diventando un modello di riferimento per l'intera Basilicata. Il Gruppo Cestari, attraverso la società <strong>Strategic Energy Resources (SER)</strong>, è stato protagonista nella costituzione e nell'avvio operativo di questa iniziativa che coinvolge cittadini, imprese e amministrazione locale.</p>

<h2>Un progetto che parte dal territorio</h2>
<p>La CER di Moliterno nasce dalla volontà di creare un sistema energetico distribuito che permetta ai membri della comunità di produrre, consumare e condividere energia da fonti rinnovabili. Con un impianto fotovoltaico iniziale di <strong>200 kW</strong>, la comunità punta a raggiungere l'autosufficienza energetica per oltre 150 famiglie.</p>

<h2>Marisol Cestari referente territoriale</h2>
<p>La dott.ssa <strong>Marisol Cestari</strong>, figlia del fondatore Alfredo C. Cestari, è stata nominata referente territoriale per le CER in Basilicata. "Le comunità energetiche rappresentano una rivoluzione nel modo di intendere l'energia - spiega Marisol Cestari - non più solo un bene di consumo ma uno strumento di coesione sociale e sviluppo territoriale".</p>

<h2>Benefici per i membri</h2>
<p>I membri della CER beneficiano di:</p>
<ul>
<li>Risparmio medio in bolletta del <strong>25-30%</strong></li>
<li>Incentivi GSE sulla quota di energia condivisa (circa 110€/MWh)</li>
<li>Contributi PNRR fino al 40% per nuovi impianti</li>
<li>Partecipazione attiva alla transizione energetica</li>
</ul>

<h2>Espansione prevista</h2>
<p>Entro il 2026, la CER di Moliterno prevede di installare ulteriori <strong>500 kW</strong> di potenza fotovoltaica, coinvolgendo anche le imprese agricole del territorio e creando un modello replicabile in altri comuni della Basilicata.</p>

<p><strong>Vuoi sapere come creare una CER nel tuo comune?</strong> Contatta il nostro team specializzato.</p>
            `,
          },
          {
            locale: 'en',
            title: 'Moliterno "Energia Dal Sole" REC: a model for Basilicata',
            excerpt: 'The Renewable Energy Community of Moliterno represents a virtuous example of energy transition. Marisol Cestari appointed as territorial representative.',
            content: `
<p>The Renewable Energy Community (REC) "Energia Dal Sole" in <strong>Moliterno</strong> is becoming a reference model for the entire Basilicata region.</p>

<h2>A project born from the territory</h2>
<p>The Moliterno REC was born from the desire to create a distributed energy system. With an initial 200 kW photovoltaic system, the community aims to achieve energy self-sufficiency for over 150 families.</p>

<h2>Marisol Cestari as territorial representative</h2>
<p>Dr. Marisol Cestari, daughter of founder Alfredo C. Cestari, has been appointed as territorial representative for RECs in Basilicata.</p>
            `,
          },
          {
            locale: 'fr',
            title: 'CER "Energia Dal Sole" de Moliterno: un modèle pour la Basilicate',
            excerpt: 'La Communauté d\'Énergie Renouvelable de Moliterno représente un exemple vertueux de transition énergétique.',
            content: `
<p>La Communauté d'Énergie Renouvelable (CER) "Energia Dal Sole" de <strong>Moliterno</strong> devient un modèle de référence pour toute la région de Basilicate.</p>

<h2>Un projet né du territoire</h2>
<p>La CER de Moliterno est née de la volonté de créer un système énergétique distribué permettant aux membres de produire et partager l'énergie renouvelable.</p>
            `,
          },
        ],
      },
    },
  });

  // 2. Missione in Congo RDC - Giovanni Cestari Console Onorario
  await prisma.news.upsert({
    where: { slug: 'missione-congo-rdc-cooperazione' },
    update: {},
    create: {
      slug: 'missione-congo-rdc-cooperazione',
      authorId: admin.id,
      categoryId: catCooperazione.id,
      featuredImage: '/images/photos/cooperation-africa.jpg',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date('2025-09-20'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Missione in Congo RDC: rafforzata la cooperazione Italia-Africa',
            excerpt: 'Giovanni Cestari, Console Onorario della RDC in Italia, guida una delegazione per nuovi progetti di sviluppo sostenibile.',
            content: `
<p>Una importante missione istituzionale in <strong>Repubblica Democratica del Congo</strong> ha visto protagonista il <strong>dott. Giovanni Cestari</strong>, Console Onorario della RDC per il Sud Italia, accompagnato da una delegazione di imprenditori e rappresentanti istituzionali italiani.</p>

<h2>Obiettivi della missione</h2>
<p>La missione, organizzata in collaborazione con il Ministero degli Esteri congolese e l'Ambasciata d'Italia a Kinshasa, ha avuto come obiettivi principali:</p>
<ul>
<li>Rafforzare i rapporti economici bilaterali Italia-RDC</li>
<li>Presentare progetti di sviluppo nel settore energetico</li>
<li>Avviare collaborazioni nel settore agricolo e agroalimentare</li>
<li>Promuovere il trasferimento tecnologico e la formazione professionale</li>
</ul>

<h2>Il ruolo del Gruppo Cestari</h2>
<p>Il Gruppo Cestari, attraverso le società <strong>ItalAfrica</strong> e <strong>SAKTI</strong>, ha presentato un piano integrato di interventi che comprende:</p>
<ul>
<li>Realizzazione di impianti fotovoltaici off-grid per comunità rurali</li>
<li>Programmi di formazione per tecnici locali nel settore delle energie rinnovabili</li>
<li>Progetti di agricoltura sostenibile con sistemi di irrigazione a energia solare</li>
</ul>

<h2>Accordi firmati</h2>
<p>Durante la missione sono stati siglati protocolli d'intesa con:</p>
<ul>
<li>Governo provinciale del Nord Kivu</li>
<li>Camera di Commercio di Kinshasa</li>
<li>Università di Lubumbashi (collaborazione sulla formazione)</li>
</ul>

<h2>Prossimi passi</h2>
<p>Nei prossimi mesi è previsto l'avvio dei primi progetti pilota, con un investimento iniziale di <strong>2 milioni di euro</strong> cofinanziato dall'AICS e da partner privati italiani.</p>

<p>"L'Africa rappresenta il futuro - dichiara Giovanni Cestari - e l'Italia ha le competenze e la sensibilità per essere un partner privilegiato nello sviluppo sostenibile del continente."</p>
            `,
          },
          {
            locale: 'en',
            title: 'Mission to DRC Congo: Italy-Africa cooperation strengthened',
            excerpt: 'Giovanni Cestari, Honorary Consul of DRC in Italy, leads a delegation for new sustainable development projects.',
            content: `
<p>An important institutional mission to the <strong>Democratic Republic of Congo</strong> saw <strong>Dr. Giovanni Cestari</strong>, Honorary Consul of the DRC for Southern Italy, accompanied by a delegation of Italian entrepreneurs and institutional representatives.</p>

<h2>Mission objectives</h2>
<p>The mission aimed to strengthen bilateral Italy-DRC economic relations, present energy sector development projects, and promote technology transfer.</p>

<h2>The role of Gruppo Cestari</h2>
<p>Through ItalAfrica and SAKTI, the group presented an integrated intervention plan including off-grid solar systems for rural communities and professional training programs.</p>
            `,
          },
          {
            locale: 'fr',
            title: 'Mission en RDC Congo: coopération Italie-Afrique renforcée',
            excerpt: 'Giovanni Cestari, Consul Honoraire de la RDC en Italie, dirige une délégation pour de nouveaux projets de développement durable.',
            content: `
<p>Une importante mission institutionnelle en <strong>République Démocratique du Congo</strong> a vu la participation du <strong>Dr. Giovanni Cestari</strong>, Consul Honoraire de la RDC pour le Sud de l'Italie.</p>

<h2>Objectifs de la mission</h2>
<p>La mission visait à renforcer les relations économiques bilatérales Italie-RDC et à présenter des projets de développement dans le secteur énergétique.</p>
            `,
          },
        ],
      },
    },
  });

  // 3. CER Albano di Lucania
  await prisma.news.upsert({
    where: { slug: 'cer-albano-lucania-costituzione' },
    update: {},
    create: {
      slug: 'cer-albano-lucania-costituzione',
      authorId: admin.id,
      categoryId: catEnergia.id,
      featuredImage: '/images/photos/services-energy.jpg',
      isPublished: true,
      publishedAt: new Date('2025-10-05'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Nasce la CER di Albano di Lucania: energia pulita per 200 famiglie',
            excerpt: 'Costituita ufficialmente la Comunità Energetica Rinnovabile che porterà benefici concreti ai cittadini del comune lucano.',
            content: `
<p>È stata ufficialmente costituita la <strong>Comunità Energetica Rinnovabile di Albano di Lucania</strong>, un piccolo comune della Basilicata che diventa protagonista della transizione energetica. Il Gruppo Cestari ha curato l'intero processo di costituzione e accompagnerà la comunità nella fase operativa.</p>

<h2>Un comune che guarda al futuro</h2>
<p>Con poco più di 1.300 abitanti, Albano di Lucania rappresenta l'esempio perfetto di come anche i piccoli comuni possano beneficiare delle opportunità offerte dalle CER. Il progetto prevede:</p>
<ul>
<li>Impianto fotovoltaico da <strong>150 kW</strong> su edifici comunali</li>
<li>Sistema di accumulo da <strong>100 kWh</strong></li>
<li>Coinvolgimento di circa <strong>200 famiglie</strong> come prosumer</li>
</ul>

<h2>Finanziamenti ottenuti</h2>
<p>Grazie al supporto del team di europrogettazione del Gruppo Cestari, la CER ha ottenuto:</p>
<ul>
<li>Contributo PNRR pari al <strong>40%</strong> del costo dell'impianto</li>
<li>Finanziamento regionale integrativo del <strong>15%</strong></li>
<li>Accesso alla tariffa incentivante GSE</li>
</ul>

<h2>Benefici per la comunità</h2>
<p>I membri della CER potranno beneficiare di un risparmio stimato di <strong>300-400 euro annui</strong> sulla bolletta elettrica, oltre a contribuire attivamente alla riduzione delle emissioni di CO2 del territorio.</p>

<p>Il Sindaco di Albano di Lucania ha dichiarato: "Questa CER è un esempio concreto di come la collaborazione tra pubblico e privato possa generare benefici reali per i cittadini."</p>
            `,
          },
          {
            locale: 'en',
            title: 'Albano di Lucania REC established: clean energy for 200 families',
            excerpt: 'The Renewable Energy Community that will bring concrete benefits to citizens has been officially established.',
            content: `
<p>The <strong>Renewable Energy Community of Albano di Lucania</strong> has been officially established. Gruppo Cestari managed the entire constitution process.</p>

<h2>A forward-looking municipality</h2>
<p>With just over 1,300 inhabitants, Albano di Lucania represents the perfect example of how small municipalities can benefit from REC opportunities.</p>
            `,
          },
        ],
      },
    },
  });

  // 4. CALB Hub Batterie Basilicata
  await prisma.news.upsert({
    where: { slug: 'calb-hub-batterie-basilicata' },
    update: {},
    create: {
      slug: 'calb-hub-batterie-basilicata',
      authorId: admin.id,
      categoryId: catEnergia.id,
      featuredImage: '/images/photos/services-industry.jpg',
      isPublished: true,
      publishedAt: new Date('2025-05-10'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'CALB: il gruppo cinese delle batterie punta sulla Basilicata',
            excerpt: 'Accordo strategico per la realizzazione di un hub produttivo nel Sud Italia. Il Gruppo Cestari tra i facilitatori dell\'operazione.',
            content: `
<p>Il colosso cinese <strong>CALB (China Aviation Lithium Battery)</strong>, uno dei maggiori produttori mondiali di batterie al litio per veicoli elettrici, ha annunciato l'interesse a realizzare un importante hub produttivo in <strong>Basilicata</strong>. Il Gruppo Cestari, attraverso le proprie relazioni istituzionali e la conoscenza del territorio, ha svolto un ruolo di facilitazione nei contatti preliminari.</p>

<h2>Un investimento strategico</h2>
<p>L'investimento previsto supera i <strong>2 miliardi di euro</strong> e potrebbe generare:</p>
<ul>
<li>Oltre <strong>3.000 posti di lavoro</strong> diretti</li>
<li>Indotto economico significativo per l'intera regione</li>
<li>Trasferimento tecnologico nel settore della mobilità elettrica</li>
<li>Posizionamento della Basilicata come hub europeo delle batterie</li>
</ul>

<h2>Perché la Basilicata</h2>
<p>La scelta della Basilicata come possibile sede dell'investimento è legata a diversi fattori:</p>
<ul>
<li>Disponibilità di aree industriali</li>
<li>Costi energetici competitivi grazie alle rinnovabili</li>
<li>Posizione strategica nel Mediterraneo</li>
<li>Incentivi regionali e nazionali</li>
<li>Presenza di competenze nel settore automotive (vicinanza allo stabilimento Stellantis di Melfi)</li>
</ul>

<h2>Il ruolo del Gruppo Cestari</h2>
<p>Il nostro gruppo ha messo a disposizione la propria rete di contatti e la conoscenza approfondita del territorio per facilitare i primi incontri tra la delegazione cinese e le istituzioni locali e nazionali.</p>

<p>"Questo potenziale investimento conferma l'attrattività del Sud Italia per i grandi player internazionali - commenta Alfredo C. Cestari - La Basilicata ha tutte le carte in regola per diventare un polo d'eccellenza nella filiera delle batterie."</p>
            `,
          },
          {
            locale: 'en',
            title: 'CALB: Chinese battery giant targets Basilicata',
            excerpt: 'Strategic agreement for the creation of a production hub in Southern Italy. Gruppo Cestari among the facilitators.',
            content: `
<p><strong>CALB (China Aviation Lithium Battery)</strong>, one of the world's largest lithium battery manufacturers, has announced interest in establishing a major production hub in <strong>Basilicata</strong>.</p>

<h2>A strategic investment</h2>
<p>The planned investment exceeds 2 billion euros and could generate over 3,000 direct jobs.</p>
            `,
          },
        ],
      },
    },
  });

  // 5. Italy Africa Business Week
  await prisma.news.upsert({
    where: { slug: 'italy-africa-business-week-2025' },
    update: {},
    create: {
      slug: 'italy-africa-business-week-2025',
      authorId: admin.id,
      categoryId: catCooperazione.id,
      featuredImage: '/images/photos/cooperation-africa.jpg',
      isPublished: true,
      publishedAt: new Date('2025-04-15'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Italy Africa Business Week: il Gruppo Cestari protagonista',
            excerpt: 'Partecipazione attiva all\'evento che ha riunito oltre 500 imprenditori italiani e africani per nuove opportunità di business.',
            content: `
<p>Il Gruppo Cestari ha partecipato da protagonista alla <strong>Italy Africa Business Week (IABW)</strong>, l'evento di riferimento per le relazioni economiche tra Italia e Africa che quest'anno ha riunito oltre <strong>500 imprenditori</strong> da entrambi i continenti.</p>

<h2>Il nostro contributo</h2>
<p>Durante l'evento, il Gruppo Cestari ha:</p>
<ul>
<li>Presentato i progetti di cooperazione in corso in Senegal, Congo e Zanzibar</li>
<li>Organizzato incontri B2B tra imprese italiane e delegazioni africane</li>
<li>Partecipato ai panel su energie rinnovabili e sviluppo sostenibile</li>
<li>Siglato nuove lettere d'intenti per progetti in Kenya e Costa d'Avorio</li>
</ul>

<h2>ItalAfrica: il ponte tra due continenti</h2>
<p>La società <strong>ItalAfrica</strong> del Gruppo Cestari si conferma un punto di riferimento per le imprese italiane che vogliono operare nel continente africano, offrendo:</p>
<ul>
<li>Scouting di opportunità di business</li>
<li>Supporto nella costituzione di joint venture</li>
<li>Assistenza nell'accesso a finanziamenti internazionali</li>
<li>Accompagnamento nelle missioni commerciali</li>
</ul>

<h2>Il Piano Mattei</h2>
<p>L'evento si è inserito nel contesto del <strong>Piano Mattei</strong>, la strategia del Governo italiano per rafforzare la partnership con l'Africa. Il Gruppo Cestari è già attivo su diversi filoni del Piano, in particolare nelle aree energia, formazione e sviluppo agricolo.</p>

<p>"L'Africa non è più un continente da aiutare ma un partner con cui crescere insieme" - ha dichiarato Giovanni Cestari durante il suo intervento.</p>
            `,
          },
          {
            locale: 'en',
            title: 'Italy Africa Business Week: Gruppo Cestari as protagonist',
            excerpt: 'Active participation in the event that brought together over 500 Italian and African entrepreneurs.',
            content: `
<p>Gruppo Cestari played a leading role at the <strong>Italy Africa Business Week (IABW)</strong>, the reference event for Italy-Africa economic relations that this year brought together over 500 entrepreneurs.</p>

<h2>ItalAfrica: bridging two continents</h2>
<p>The ItalAfrica company confirms its role as a reference point for Italian companies wanting to operate in Africa.</p>
            `,
          },
        ],
      },
    },
  });

  // 6. Accordo Zanzibar Energia
  await prisma.news.upsert({
    where: { slug: 'accordo-zanzibar-energia-rinnovabile' },
    update: {},
    create: {
      slug: 'accordo-zanzibar-energia-rinnovabile',
      authorId: admin.id,
      categoryId: catCooperazione.id,
      featuredImage: '/images/photos/cooperation-africa.jpg',
      isPublished: true,
      publishedAt: new Date('2025-03-20'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Zanzibar: firmato accordo per lo sviluppo delle energie rinnovabili',
            excerpt: 'Intesa storica tra il Gruppo Cestari e il Governo di Zanzibar per la realizzazione di impianti fotovoltaici e la formazione di tecnici locali.',
            content: `
<p>È stato firmato un importante accordo di cooperazione tra il <strong>Gruppo Cestari</strong> e il <strong>Governo di Zanzibar</strong> per lo sviluppo delle energie rinnovabili nell'arcipelago tanzaniano. L'intesa prevede la realizzazione di impianti fotovoltaici e un ampio programma di formazione per tecnici locali.</p>

<h2>I termini dell'accordo</h2>
<p>L'accordo, della durata di <strong>10 anni</strong>, prevede:</p>
<ul>
<li>Installazione di <strong>50 MW</strong> di potenza fotovoltaica entro il 2030</li>
<li>Realizzazione di mini-grid solari per le isole minori</li>
<li>Formazione di <strong>200 tecnici locali</strong> nel settore delle rinnovabili</li>
<li>Creazione di un centro di ricerca sull'energia solare</li>
</ul>

<h2>Un modello di cooperazione Sud-Sud</h2>
<p>Il progetto si distingue per il suo approccio innovativo che combina:</p>
<ul>
<li>Trasferimento tecnologico dall'Italia</li>
<li>Coinvolgimento di partner locali nella gestione</li>
<li>Creazione di filiere produttive locali</li>
<li>Formazione professionale continua</li>
</ul>

<h2>Impatto ambientale</h2>
<p>A regime, il progetto permetterà di:</p>
<ul>
<li>Ridurre del <strong>40%</strong> la dipendenza da combustibili fossili</li>
<li>Evitare l'emissione di <strong>60.000 tonnellate</strong> di CO2 all'anno</li>
<li>Garantire energia pulita a oltre <strong>100.000 abitanti</strong></li>
</ul>

<p>Il Ministro dell'Energia di Zanzibar ha dichiarato: "Questo accordo rappresenta un passo fondamentale verso la nostra indipendenza energetica e la tutela del nostro patrimonio naturale."</p>
            `,
          },
          {
            locale: 'en',
            title: 'Zanzibar: agreement signed for renewable energy development',
            excerpt: 'Historic agreement between Gruppo Cestari and the Zanzibar Government for solar installations and local technician training.',
            content: `
<p>An important cooperation agreement has been signed between <strong>Gruppo Cestari</strong> and the <strong>Government of Zanzibar</strong> for renewable energy development in the Tanzanian archipelago.</p>

<h2>Terms of the agreement</h2>
<p>The 10-year agreement includes installation of 50 MW of photovoltaic power by 2030 and training of 200 local technicians.</p>
            `,
          },
        ],
      },
    },
  });

  // 7. Cooperazione Senegal
  await prisma.news.upsert({
    where: { slug: 'cooperazione-senegal-sviluppo-agricolo' },
    update: {},
    create: {
      slug: 'cooperazione-senegal-sviluppo-agricolo',
      authorId: admin.id,
      categoryId: catCooperazione.id,
      featuredImage: '/images/photos/cooperation-africa.jpg',
      isPublished: true,
      publishedAt: new Date('2025-02-10'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Senegal: avviato il programma di sviluppo agricolo sostenibile',
            excerpt: 'Il progetto triennale finanziato dall\'UE coinvolgerà 2.000 famiglie nelle regioni di Thiès e Diourbel.',
            content: `
<p>È ufficialmente partito il programma di <strong>sviluppo agricolo sostenibile in Senegal</strong>, realizzato dal Gruppo Cestari attraverso la controllata SAKTI in collaborazione con l'AICS (Agenzia Italiana per la Cooperazione allo Sviluppo) e il Ministero dell'Agricoltura senegalese.</p>

<h2>Obiettivi del programma</h2>
<p>Il progetto, della durata di <strong>36 mesi</strong> e con un budget di <strong>3,5 milioni di euro</strong>, mira a:</p>
<ul>
<li>Migliorare le tecniche di coltivazione sostenibile</li>
<li>Introdurre sistemi di irrigazione a basso consumo idrico alimentati da energia solare</li>
<li>Formare <strong>500 agricoltori</strong> locali</li>
<li>Creare filiere corte per la commercializzazione dei prodotti</li>
<li>Rafforzare le cooperative agricole femminili</li>
</ul>

<h2>Area di intervento</h2>
<p>Il programma si concentra sulle regioni di <strong>Thiès e Diourbel</strong>, zone ad alta vocazione agricola ma afflitte da problemi di desertificazione e scarsità idrica. Sono previsti:</p>
<ul>
<li>20 pozzi solari per l'irrigazione</li>
<li>5 centri di formazione agricola</li>
<li>10 magazzini per lo stoccaggio dei prodotti</li>
<li>1 centro di trasformazione agroalimentare</li>
</ul>

<h2>Impatto previsto</h2>
<p>Il progetto coinvolgerà direttamente <strong>2.000 famiglie</strong> con un impatto indiretto su oltre <strong>10.000 persone</strong>. Gli obiettivi misurabili includono:</p>
<ul>
<li>Aumento del <strong>40%</strong> della produttività agricola</li>
<li>Riduzione del <strong>30%</strong> del consumo di acqua</li>
<li>Incremento del <strong>25%</strong> del reddito delle famiglie beneficiarie</li>
</ul>

<p>"Questo progetto dimostra come la cooperazione italiana possa generare impatti concreti e duraturi - afferma il responsabile SAKTI - Il nostro approccio mette al centro le comunità locali e la sostenibilità ambientale."</p>
            `,
          },
          {
            locale: 'en',
            title: 'Senegal: sustainable agricultural development program launched',
            excerpt: 'The three-year EU-funded project will involve 2,000 families in Thiès and Diourbel regions.',
            content: `
<p>The <strong>sustainable agricultural development program in Senegal</strong> has officially started, implemented by Gruppo Cestari through SAKTI in collaboration with AICS.</p>

<h2>Program objectives</h2>
<p>The 36-month project with a budget of 3.5 million euros aims to improve sustainable farming techniques and train 500 local farmers.</p>
            `,
          },
          {
            locale: 'fr',
            title: 'Sénégal: lancement du programme de développement agricole durable',
            excerpt: 'Le projet triennal financé par l\'UE impliquera 2 000 familles dans les régions de Thiès et Diourbel.',
            content: `
<p>Le programme de <strong>développement agricole durable au Sénégal</strong> a officiellement démarré, réalisé par le Groupe Cestari à travers sa filiale SAKTI en collaboration avec l'AICS.</p>

<h2>Objectifs du programme</h2>
<p>Le projet de 36 mois avec un budget de 3,5 millions d'euros vise à améliorer les techniques agricoles durables et former 500 agriculteurs locaux.</p>
            `,
          },
        ],
      },
    },
  });

  // 8. CER contro caro energia
  await prisma.news.upsert({
    where: { slug: 'cer-arma-contro-caro-energia' },
    update: {},
    create: {
      slug: 'cer-arma-contro-caro-energia',
      authorId: admin.id,
      categoryId: catEnergia.id,
      featuredImage: '/images/photos/services-energy.jpg',
      isPublished: true,
      publishedAt: new Date('2025-01-15'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Le CER come arma contro il caro energia: l\'esperienza del Gruppo Cestari',
            excerpt: 'Come le Comunità Energetiche Rinnovabili stanno aiutando famiglie e imprese a ridurre le bollette fino al 30%.',
            content: `
<p>In un contesto di prezzi energetici ancora elevati, le <strong>Comunità Energetiche Rinnovabili (CER)</strong> si confermano uno strumento efficace per contenere i costi. L'esperienza del Gruppo Cestari in Basilicata, Campania e Puglia dimostra come sia possibile ottenere risparmi significativi.</p>

<h2>I numeri delle CER Cestari</h2>
<p>Ad oggi, il Gruppo Cestari ha costituito o sta accompagnando <strong>12 Comunità Energetiche</strong> nel Sud Italia, con:</p>
<ul>
<li><strong>3.500 membri</strong> tra cittadini e imprese</li>
<li><strong>8 MW</strong> di potenza fotovoltaica installata o in via di installazione</li>
<li>Risparmio medio in bolletta del <strong>25-30%</strong></li>
<li><strong>15.000 tonnellate</strong> di CO2 evitate all'anno</li>
</ul>

<h2>Come funziona il risparmio</h2>
<p>I membri delle CER beneficiano di un duplice vantaggio:</p>
<ul>
<li><strong>Autoconsumo</strong>: l'energia prodotta e consumata sul posto riduce direttamente il prelievo dalla rete</li>
<li><strong>Incentivi GSE</strong>: per ogni kWh di energia condivisa virtualmente, i membri ricevono circa 110€/MWh</li>
</ul>

<h2>Opportunità PNRR ancora disponibili</h2>
<p>Per i comuni sotto i 5.000 abitanti, sono ancora disponibili i contributi PNRR fino al <strong>40%</strong> del costo degli impianti. Il termine per la presentazione delle domande è stato prorogato a <strong>giugno 2025</strong>.</p>

<h2>Come aderire</h2>
<p>Il Gruppo Cestari offre un servizio completo per la costituzione delle CER:</p>
<ul>
<li>Analisi di fattibilità gratuita</li>
<li>Costituzione dell'ente giuridico</li>
<li>Progettazione e realizzazione degli impianti</li>
<li>Accesso ai finanziamenti</li>
<li>Gestione operativa e rendicontazione</li>
</ul>

<p><strong>Contattaci</strong> per scoprire se nel tuo comune è possibile costituire una CER e quali benefici puoi ottenere.</p>
            `,
          },
          {
            locale: 'en',
            title: 'RECs as a weapon against high energy costs: Gruppo Cestari experience',
            excerpt: 'How Renewable Energy Communities are helping families and businesses reduce bills by up to 30%.',
            content: `
<p>In a context of still high energy prices, <strong>Renewable Energy Communities (RECs)</strong> are proving to be an effective tool to contain costs. Gruppo Cestari's experience in Southern Italy shows significant savings are possible.</p>

<h2>Cestari REC numbers</h2>
<p>To date, Gruppo Cestari has established or is supporting 12 Energy Communities in Southern Italy, with 3,500 members and average bill savings of 25-30%.</p>
            `,
          },
        ],
      },
    },
  });

  // 9. Premio Gran Croce Accademico
  await prisma.news.upsert({
    where: { slug: 'alfredo-cestari-gran-croce-accademico' },
    update: {},
    create: {
      slug: 'alfredo-cestari-gran-croce-accademico',
      authorId: admin.id,
      categoryId: catFinanza.id,
      featuredImage: '/images/photos/chi-siamo-bg.jpg',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date('2025-11-20'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Alfredo Cestari insignito della Gran Croce Accademica',
            excerpt: 'Riconoscimento prestigioso per il fondatore del Gruppo Cestari, premiato per il contributo allo sviluppo economico e alla cooperazione internazionale.',
            content: `
<p>L'<strong>Ing. Alfredo C. Cestari</strong>, fondatore e presidente del Gruppo Cestari, è stato insignito della <strong>Gran Croce Accademica</strong>, uno dei più prestigiosi riconoscimenti nel campo dell'imprenditoria e della cooperazione internazionale.</p>

<h2>La motivazione del premio</h2>
<p>Il riconoscimento è stato conferito per:</p>
<ul>
<li>Oltre <strong>40 anni</strong> di attività imprenditoriale al servizio dello sviluppo territoriale</li>
<li>Il contributo pionieristico nel campo delle <strong>energie rinnovabili</strong> nel Sud Italia</li>
<li>L'impegno costante nella <strong>cooperazione Italia-Africa</strong></li>
<li>La promozione di modelli di <strong>sviluppo sostenibile</strong></li>
<li>La creazione di opportunità lavorative in aree economicamente svantaggiate</li>
</ul>

<h2>La cerimonia</h2>
<p>La cerimonia di conferimento si è tenuta a Roma presso Palazzo Montecitorio, alla presenza di rappresentanti istituzionali, ambasciatori di paesi africani e personalità del mondo imprenditoriale italiano.</p>

<h2>Il messaggio di Alfredo Cestari</h2>
<p>Nel suo discorso di ringraziamento, l'Ing. Cestari ha dichiarato: "Questo riconoscimento è un onore che condivido con tutto il team del Gruppo Cestari e con le comunità che abbiamo avuto il privilegio di accompagnare nel loro percorso di crescita. Il nostro impegno per uno sviluppo sostenibile e inclusivo continuerà con ancora maggiore determinazione."</p>

<h2>La storia del Gruppo Cestari</h2>
<p>Fondato nel 1980 a Salerno, il Gruppo Cestari è cresciuto fino a diventare una holding multisettoriale con:</p>
<ul>
<li><strong>10 società</strong> operative</li>
<li><strong>15 sedi</strong> nel mondo</li>
<li>Oltre <strong>500 progetti</strong> realizzati</li>
<li>Presenza in <strong>20+ paesi</strong></li>
</ul>

<p>Il gruppo continua a essere guidato dalla famiglia Cestari, con la seconda generazione - Giovanni, Marisol e Angela - sempre più attiva nelle attività operative.</p>
            `,
          },
          {
            locale: 'en',
            title: 'Alfredo Cestari awarded the Academic Grand Cross',
            excerpt: 'Prestigious recognition for the founder of Gruppo Cestari, honored for his contribution to economic development and international cooperation.',
            content: `
<p><strong>Eng. Alfredo C. Cestari</strong>, founder and president of Gruppo Cestari, has been awarded the <strong>Academic Grand Cross</strong>, one of the most prestigious recognitions in the field of entrepreneurship and international cooperation.</p>

<h2>Award motivation</h2>
<p>The recognition was conferred for over 40 years of entrepreneurial activity, pioneering contribution to renewable energy, and commitment to Italy-Africa cooperation.</p>
            `,
          },
        ],
      },
    },
  });

  // 10. Guida bandi europei 2025
  await prisma.news.upsert({
    where: { slug: 'guida-bandi-europei-2025' },
    update: {},
    create: {
      slug: 'guida-bandi-europei-2025',
      authorId: admin.id,
      categoryId: catFinanza.id,
      featuredImage: '/images/photos/services-global.jpg',
      isPublished: true,
      publishedAt: new Date('2025-01-05'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Guida ai bandi europei 2025: tutte le opportunità',
            excerpt: 'Una panoramica completa delle opportunità di finanziamento europee per imprese, enti pubblici e organizzazioni.',
            content: `
<p>Il 2025 offre numerose opportunità di finanziamento europeo per imprese, enti pubblici e organizzazioni. Ecco una guida alle principali linee di finanziamento.</p>

<h2>Horizon Europe</h2>
<p>Il programma quadro per la ricerca e l'innovazione con un budget 2025 di oltre <strong>12 miliardi di euro</strong>. Focus su:</p>
<ul>
<li>Clima ed Energia</li>
<li>Salute</li>
<li>Digitale e Industria</li>
<li>Sicurezza civile</li>
</ul>

<h2>LIFE Programme</h2>
<p>Finanziamenti per progetti ambientali: economia circolare, biodiversità, adattamento climatico. Budget 2025: <strong>1,8 miliardi</strong>.</p>

<h2>NDICI-Global Europe</h2>
<p>Opportunità per cooperazione internazionale con Africa, Medio Oriente, America Latina. Focus su sviluppo sostenibile e transizione energetica.</p>

<h2>Digital Europe</h2>
<p>Supporto per intelligenza artificiale, cybersecurity, competenze digitali. Budget: <strong>600 milioni</strong>.</p>

<h2>Il nostro supporto</h2>
<p>Il team europrogettazione del Gruppo Cestari offre:</p>
<ul>
<li>Scouting opportunità</li>
<li>Sviluppo proposte progettuali</li>
<li>Ricerca partner internazionali</li>
<li>Gestione e rendicontazione</li>
</ul>

<p><strong>Contattaci</strong> per una consulenza gratuita.</p>
            `,
          },
          {
            locale: 'en',
            title: 'Guide to European grants 2025: all opportunities',
            excerpt: 'A comprehensive overview of European funding opportunities for businesses, public entities and organizations.',
            content: `
<p>2025 offers numerous European funding opportunities. Here is a guide to the main funding lines.</p>

<h2>Horizon Europe</h2>
<p>The framework programme for research and innovation with a 2025 budget of over 12 billion euros.</p>
            `,
          },
        ],
      },
    },
  });

  // ============================================
  // PROJECTS
  // ============================================
  console.log('Creating projects...');

  await prisma.project.upsert({
    where: { slug: 'comunita-energetica-basilicata' },
    update: {},
    create: {
      slug: 'comunita-energetica-basilicata',
      sector: ProjectSector.RENEWABLE_ENERGY,
      country: 'IT',
      featuredImage: '/images/photos/solar-panels.jpg',
      isPublished: true,
      isFeatured: true,
      startDate: new Date('2024-01-15'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Comunità Energetica della Basilicata',
            subtitle: 'Prima CER regionale del Sud Italia',
            description: 'Realizzazione della prima Comunità Energetica Rinnovabile su scala regionale nel Sud Italia, coinvolgendo 15 comuni della Basilicata.',
            challenge: 'Coordinare 15 amministrazioni comunali con esigenze diverse e creare un modello replicabile.',
            solution: 'Sviluppo di una governance condivisa e piattaforma digitale per la gestione dell\'energia.',
            results: '1.5 MW di potenza installata, 2.000 famiglie coinvolte, -40% emissioni CO2.',
            client: 'Regione Basilicata',
          },
          {
            locale: 'en',
            title: 'Basilicata Energy Community',
            subtitle: 'First regional REC in Southern Italy',
            description: 'Implementation of the first regional-scale Renewable Energy Community in Southern Italy, involving 15 municipalities.',
            client: 'Basilicata Region',
          },
        ],
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: 'agricoltura-sostenibile-senegal' },
    update: {},
    create: {
      slug: 'agricoltura-sostenibile-senegal',
      sector: ProjectSector.COOPERATION,
      country: 'SN',
      featuredImage: '/images/photos/cooperation-africa.jpg',
      isPublished: true,
      isFeatured: true,
      startDate: new Date('2023-06-01'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Agricoltura Sostenibile in Senegal',
            subtitle: 'Programma di sviluppo rurale',
            description: 'Progetto triennale per il miglioramento delle pratiche agricole sostenibili nelle regioni di Thiès e Diourbel.',
            challenge: 'Combattere la desertificazione e migliorare la sicurezza alimentare.',
            solution: 'Formazione agricoltori, sistemi irrigazione efficienti, filiera corta.',
            results: '500 agricoltori formati, +40% produttività, -30% consumo acqua.',
            client: 'AICS - Ministero Agricoltura Senegal',
          },
        ],
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: 'finanza-agevolata-pmi-campania' },
    update: {},
    create: {
      slug: 'finanza-agevolata-pmi-campania',
      sector: ProjectSector.FINANCE,
      country: 'IT',
      featuredImage: '/images/photos/business-meeting.jpg',
      isPublished: true,
      startDate: new Date('2022-03-01'),
      endDate: new Date('2024-12-31'),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Piano Finanza Agevolata PMI Campania',
            subtitle: 'Accesso ai finanziamenti per 50 imprese',
            description: 'Supporto a 50 PMI campane nell\'accesso a finanziamenti agevolati regionali e nazionali per investimenti in innovazione.',
            challenge: 'PMI con scarsa conoscenza degli strumenti finanziari disponibili.',
            solution: 'Sportello dedicato, business planning, assistenza pratica completa.',
            results: '€15M di finanziamenti ottenuti, 200 posti di lavoro creati.',
            client: 'Confindustria Campania',
          },
        ],
      },
    },
  });

  // ============================================
  // BANDI
  // ============================================
  console.log('Creating bandi...');

  await prisma.bando.upsert({
    where: { code: 'PNRR-CER-2025' },
    update: {},
    create: {
      code: 'PNRR-CER-2025',
      type: BandoType.NATIONAL,
      sector: ProjectSector.RENEWABLE_ENERGY,
      fundingAmount: 2200000000,
      openDate: new Date('2024-11-01'),
      closeDate: new Date('2025-06-30'),
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      externalUrl: 'https://www.gse.it/servizi-per-te/autoconsumo/comunita-di-energia-rinnovabile',
      translations: {
        create: [
          {
            locale: 'it',
            title: 'PNRR - Comunità Energetiche Rinnovabili',
            summary: 'Contributi a fondo perduto fino al 40% per la realizzazione di CER nei comuni sotto i 5.000 abitanti.',
            description: `
Il bando finanzia la realizzazione di Comunità Energetiche Rinnovabili nei comuni con popolazione inferiore a 5.000 abitanti.

**Beneficiari**: Comuni, unioni di comuni, comunità montane, enti pubblici, cooperative, imprese.

**Agevolazione**: Contributo a fondo perduto fino al 40% dei costi ammissibili.

**Spese ammissibili**:
- Impianti fotovoltaici
- Sistemi di accumulo
- Infrastrutture di rete
- Spese tecniche e progettuali

**Dotazione**: 2,2 miliardi di euro
            `,
            requirements: 'Sede operativa in comune < 5.000 abitanti. Costituzione CER ai sensi D.Lgs. 199/2021.',
            eligibility: 'PMI, Enti pubblici, Cooperative, Associazioni',
          },
          {
            locale: 'en',
            title: 'NRRP - Renewable Energy Communities',
            summary: 'Non-repayable grants up to 40% for the creation of RECs in municipalities under 5,000 inhabitants.',
            description: 'The call finances the creation of Renewable Energy Communities.',
            requirements: 'Operational headquarters in municipality < 5,000 inhabitants.',
            eligibility: 'SMEs, Public entities, Cooperatives, Associations',
          },
        ],
      },
    },
  });

  await prisma.bando.upsert({
    where: { code: 'HE-CLIMATE-2025' },
    update: {},
    create: {
      code: 'HE-CLIMATE-2025',
      type: BandoType.EUROPEAN,
      sector: ProjectSector.RENEWABLE_ENERGY,
      fundingAmount: 50000000,
      openDate: new Date('2025-01-15'),
      closeDate: new Date('2025-04-15'),
      isPublished: true,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            locale: 'it',
            title: 'Horizon Europe - Climate Action',
            summary: 'Finanziamenti per progetti di ricerca e innovazione sull\'azione climatica.',
            description: `
Bando Horizon Europe per progetti di ricerca e innovazione nel cluster "Clima, Energia e Mobilità".

**Temi prioritari**:
- Decarbonizzazione industria
- Soluzioni per città climate-neutral
- Adattamento climatico
- Economia circolare

**Tipo di azione**: Research and Innovation Action (RIA)
**Tasso di finanziamento**: 100%
**Budget**: 50 milioni di euro
            `,
            requirements: 'Consorzio minimo 3 partner di 3 Stati membri diversi.',
            eligibility: 'Università, Centri di ricerca, PMI innovative, Grandi imprese',
          },
        ],
      },
    },
  });

  // ============================================
  // SUBSIDIARIES
  // ============================================
  console.log('Creating subsidiaries...');

  const subsidiaries = [
    {
      slug: 'winfly',
      sector: ProjectSector.FINANCE,
      translations: [
        { locale: 'it', name: 'Winfly', description: 'Consulenza strategica e sviluppo aziendale' },
        { locale: 'en', name: 'Winfly', description: 'Strategic consulting and business development' },
      ],
    },
    {
      slug: 'strategic-energy-resources',
      sector: ProjectSector.RENEWABLE_ENERGY,
      translations: [
        { locale: 'it', name: 'Strategic Energy Resources', description: 'Energie rinnovabili e efficientamento energetico' },
        { locale: 'en', name: 'Strategic Energy Resources', description: 'Renewable energy and energy efficiency' },
      ],
    },
    {
      slug: 'ied',
      sector: ProjectSector.OTHER,
      translations: [
        { locale: 'it', name: 'I.E.D.', description: 'Istituto Europeo di Design e formazione' },
        { locale: 'en', name: 'I.E.D.', description: 'European Institute of Design and training' },
      ],
    },
    {
      slug: 'cestari-brasil',
      sector: ProjectSector.COOPERATION,
      translations: [
        { locale: 'it', name: 'Cestari Brasil', description: 'Consulenza e sviluppo progetti in Brasile' },
        { locale: 'en', name: 'Cestari Brasil', description: 'Consulting and project development in Brazil' },
      ],
    },
    {
      slug: 'newser1',
      sector: ProjectSector.OTHER,
      translations: [
        { locale: 'it', name: 'Newser1', description: 'Servizi digitali e innovazione tecnologica' },
        { locale: 'en', name: 'Newser1', description: 'Digital services and technological innovation' },
      ],
    },
    {
      slug: 'futuro-programmazione',
      sector: ProjectSector.DEVELOPMENT,
      translations: [
        { locale: 'it', name: 'Futuro & Programmazione', description: 'Pianificazione strategica e sviluppo territoriale' },
        { locale: 'en', name: 'Future & Planning', description: 'Strategic planning and territorial development' },
      ],
    },
    {
      slug: 'sakti',
      sector: ProjectSector.COOPERATION,
      translations: [
        { locale: 'it', name: 'SAKTI', description: 'Cooperazione internazionale e sviluppo' },
        { locale: 'en', name: 'SAKTI', description: 'International cooperation and development' },
      ],
    },
    {
      slug: 'wiremena',
      sector: ProjectSector.OTHER,
      translations: [
        { locale: 'it', name: 'Wiremena', description: 'Infrastrutture e reti tecnologiche' },
        { locale: 'en', name: 'Wiremena', description: 'Infrastructure and technology networks' },
      ],
    },
    {
      slug: 'italafrica',
      sector: ProjectSector.COOPERATION,
      translations: [
        { locale: 'it', name: 'ItalAfrica', description: 'Partnership Italia-Africa per lo sviluppo' },
        { locale: 'en', name: 'ItalAfrica', description: 'Italy-Africa partnership for development' },
      ],
    },
    {
      slug: 'midday-sun',
      sector: ProjectSector.RENEWABLE_ENERGY,
      translations: [
        { locale: 'it', name: 'Midday Sun', description: 'Energie solari e progetti fotovoltaici in Africa' },
        { locale: 'en', name: 'Midday Sun', description: 'Solar energy and photovoltaic projects in Africa' },
      ],
    },
    {
      slug: 'flywin',
      sector: ProjectSector.OTHER,
      translations: [
        { locale: 'it', name: 'Flywin', description: 'Servizi aeroportuali e logistica' },
        { locale: 'en', name: 'Flywin', description: 'Airport services and logistics' },
      ],
    },
  ];

  for (const sub of subsidiaries) {
    await prisma.subsidiary.upsert({
      where: { slug: sub.slug },
      update: {},
      create: {
        slug: sub.slug,
        sector: sub.sector,
        isActive: true,
        translations: {
          create: sub.translations,
        },
      },
    });
  }

  // ============================================
  // OFFICES
  // ============================================
  console.log('Creating offices...');

  await prisma.office.upsert({
    where: { slug: 'salerno-hq' },
    update: {},
    create: {
      slug: 'salerno-hq',
      isHeadquarters: true,
      address: 'Via Roma, 123',
      city: 'Salerno',
      country: 'IT',
      zipCode: '84121',
      phone: '+39 089 952889',
      email: 'info@gruppocestari.com',
      latitude: 40.6824,
      longitude: 14.7681,
      isActive: true,
      sortOrder: 1,
      translations: {
        create: [
          { locale: 'it', name: 'Sede Centrale - Salerno' },
          { locale: 'en', name: 'Headquarters - Salerno' },
          { locale: 'fr', name: 'Siège Social - Salerno' },
        ],
      },
    },
  });

  await prisma.office.upsert({
    where: { slug: 'roma' },
    update: {},
    create: {
      slug: 'roma',
      isHeadquarters: false,
      address: 'Via del Corso, 456',
      city: 'Roma',
      country: 'IT',
      zipCode: '00186',
      phone: '+39 06 123 4567',
      email: 'roma@gruppocestari.com',
      isActive: true,
      sortOrder: 2,
      translations: {
        create: [
          { locale: 'it', name: 'Ufficio Roma' },
          { locale: 'en', name: 'Rome Office' },
          { locale: 'fr', name: 'Bureau de Rome' },
        ],
      },
    },
  });

  await prisma.office.upsert({
    where: { slug: 'bruxelles' },
    update: {},
    create: {
      slug: 'bruxelles',
      isHeadquarters: false,
      address: 'Rue de la Loi, 200',
      city: 'Bruxelles',
      country: 'BE',
      zipCode: '1000',
      email: 'eu@gruppocestari.com',
      isActive: true,
      sortOrder: 3,
      translations: {
        create: [
          { locale: 'it', name: 'Ufficio Bruxelles' },
          { locale: 'en', name: 'Brussels Office' },
          { locale: 'fr', name: 'Bureau de Bruxelles' },
        ],
      },
    },
  });

  await prisma.office.upsert({
    where: { slug: 'dakar' },
    update: {},
    create: {
      slug: 'dakar',
      isHeadquarters: false,
      address: 'Avenue Cheikh Anta Diop',
      city: 'Dakar',
      country: 'SN',
      email: 'africa@gruppocestari.com',
      isActive: true,
      sortOrder: 4,
      translations: {
        create: [
          { locale: 'it', name: 'Ufficio Dakar' },
          { locale: 'en', name: 'Dakar Office' },
          { locale: 'fr', name: 'Bureau de Dakar' },
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
