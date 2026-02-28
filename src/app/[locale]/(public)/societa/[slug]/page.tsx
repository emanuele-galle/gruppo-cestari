'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Building2,
  Briefcase,
  Leaf,
  Cpu,
  ExternalLink,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  ArrowRight,
  Users,
  Target,
  Sparkles,
  Calendar,
  Shield,
  Play,
  Tv,
  Video
} from 'lucide-react';
import { notFound } from 'next/navigation';

// Certification type
type Certification = {
  name: string;
  number?: string;
  date?: string;
  description?: string;
  document?: string;
};

// Sector colors mapping
const sectorColors: Record<string, { gradient: string; bg: string; text: string; lightBg: string; border: string }> = {
  'energy': { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200' },
  'consulting': { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200' },
  'international': { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500', text: 'text-violet-600', lightBg: 'bg-violet-50', border: 'border-violet-200' },
};

// Company data with detailed information
const companiesData: Record<string, {
  name: string;
  logo: string;
  sector: string;
  sectorKey: string;
  icon: typeof Briefcase;
  description: string;
  longDescription: string;
  services: string[];
  location?: string;
  founded?: string;
  website?: string;
  email?: string;
  phone?: string;
  certifications?: Certification[];
}> = {
  'strategic-energy': {
    name: 'Strategic Energy Resources',
    logo: '/images/companies/strategic-energy.webp',
    sector: 'ESCo / Energie Rinnovabili',
    sectorKey: 'energy',
    icon: Leaf,
    description: 'ESCo specializzata nella produzione elettrica da fonti rinnovabili e progetti di efficienza energetica secondo il Protocollo di Kyoto.',
    longDescription: `Strategic Energy Resources (S.E.R.) è una società afferente al Gruppo Cestari che opera nel settore delle ESCo (Energy Service Company) e in quello della produzione elettrica da fonti rinnovabili attraverso l'adozione di tecnologie all'avanguardia che assicurano alta efficienza a fronte di ridotti impatti ambientali.

Nata all'inizio del 2005 allo scopo di regolare i consumi energetici attraverso l'efficienza, la società soddisfa i requisiti che devono possedere le aziende che forniscono servizi energetici incluso il finanziamento dell'intervento.

S.E.R. sviluppa e realizza progetti di efficienza energetica nei settori immobiliare, industriale, terziario, sia nel pubblico che nel privato, con percorsi volti a monitorare, gestire ed ottimizzare i consumi energetici di qualsiasi utenza in modo semplice, intuitivo e flessibile.

È in grado di fornire assistenza nella fase progettuale e gestionale a tutti coloro che, a vario titolo, hanno interesse a realizzare progetti Joint Implementation (JI) e Clean Development Mechanism (CDM).

S.E.R. concentra la propria attività nella individuazione e realizzazione dei progetti che fanno uso dei meccanismi flessibili introdotti dal Protocollo di Kyoto per la riduzione delle emissioni dei gas ritenuti responsabili dell'effetto serra e dei conseguenti cambiamenti climatici.

La società ha stipulato convenzioni per la concessione di terreni e diritti per la realizzazione di impianti eolici e minieolici in Basilicata, Campania, Molise, Calabria e Puglia, e collabora con ENEL-SI, ENERCON, Edison Energie Speciali e MEG SUD.`,
    services: [
      'Sistema di monitoraggio per impianti fotovoltaici ed eolici',
      'Progettazione impianti idroelettrici',
      'Impianti a biomasse',
      'Impianti fotovoltaici',
      'Mini eolico chiavi in mano',
      'Progettazione internazionale',
      'Impianti geotermoelettrici',
      'Impianti a biogas',
      'Studi anemologici',
      'Impianti ibridi stand alone',
      'Progetti di efficienza energetica',
      'Assistenza progetti JI e CDM'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    founded: '2005',
    website: 'http://www.sergruppocestari.com',
    phone: '+39 089 952889',
    certifications: [
      {
        name: 'Certificazione ESCo',
        number: '720-IT',
        date: 'Scadenza: 20/09/2026',
        description: 'Secondo la Norma UNI CEI 11352:2014 per erogazione servizi energetici',
        document: '/documents/certificazioni/strategic-energy-esco.pdf'
      },
      {
        name: 'ISO 9001',
        number: '3288 Rev. 0 R1',
        date: 'Valido fino: 29/07/2026',
        description: 'Standard internazionale per la gestione della Qualità',
        document: '/documents/certificazioni/strategic-energy-iso-9001.pdf'
      },
      {
        name: 'EGE - Esperto Gestione Energia',
        number: 'EGE2784',
        date: '2025-2030',
        description: 'Settore civile: impianti, sistemi, infrastrutture, logistica nelle applicazioni civili ed edilizia pubblica/privata',
        document: '/documents/certificazioni/strategic-energy-ege.pdf'
      },
      {
        name: 'SOA',
        number: '34296/11/00',
        date: 'Rilasciato: 10/07/2025',
        description: 'Categoria OG1 CLASS. III - Categoria OG9 CLASS. III Bis',
        document: '/documents/certificazioni/strategic-energy-soa.pdf'
      },
      {
        name: 'Certificazione Parità di Genere',
        number: '1047-IT',
        date: 'Scadenza: 19/10/2028',
        description: 'Certificazione UNI/PdR 125:2022 per la parità di genere',
        document: '/documents/certificazioni/strategic-energy-parita-genere.pdf'
      },
      {
        name: 'Politica Parità di Genere',
        description: 'Documento di politica aziendale per la parità di genere',
        document: '/documents/certificazioni/strategic-energy-politica-parita.pdf'
      }
    ]
  },
  'cestari-brasil': {
    name: 'Cestari Brasil',
    logo: '/images/companies/cestari-brasil.webp',
    sector: 'Ingegneria e Telecomunicazioni',
    sectorKey: 'international',
    icon: Globe,
    description: 'Progettazione e realizzazione di opere di ingegneria civile, telecomunicazioni ed energie rinnovabili in Brasile.',
    longDescription: `Cestari Brasil LTDA, appartenente al Gruppo Cestari (con sedi in Italia, Belgio, Africa e Brasile), è specializzata nella progettazione e realizzazione di opere di ingegneria civile e telecomunicazioni, oltre che in amministrazione di beni.

Con i nostri servizi e i nostri consulenti professionali assistiamo le aziende, coprendo con il nostro portafoglio tutta la gamma di possibili esigenze.

Cestari Brasil aiuta il cliente nella ricerca del tipo di energia più adatta (eolica, fotovoltaica, idrica, biomassa, biogas) in base alle proprie esigenze, fornendo sempre diverse soluzioni e risparmio sul costo finale.

La società si occupa anche dell'esecuzione delle opere per la realizzazione delle Stazioni Radio Base. È in grado di provvedere a tutte le fasi relative all'implementazione delle Stazioni Radio Base, dalla stipula dei contratti immobiliari alla redazione della documentazione per ottenere le necessarie autorizzazioni (progetti, simulazioni, misure di campo elettromagnetico, ecc.) fino alla costruzione e collaudo delle strutture realizzate.

Il Gruppo Cestari ha la possibilità di fornire Stazioni Radio Base anche secondo la formula "chiavi in mano".

Cestari Brasil è organizzata nei seguenti settori: Settore Tecnico e di Coordinamento, Settore Comunicazione, Settore Commerciale e Amministrazione, e Ufficio Legale.`,
    services: [
      'Progettazione e realizzazione opere di ingegneria civile',
      'Stazioni Radio Base "chiavi in mano"',
      'Telecomunicazioni',
      'Energia eolica',
      'Energia fotovoltaica',
      'Energia idrica',
      'Energia da biomassa e biogas',
      'Amministrazione di beni',
      'Costruzioni civili',
      'Consulenza energetica'
    ],
    location: 'Rio de Janeiro / Cuiabá (Mato Grosso), Brasile',
  },
  'newser1': {
    name: 'Newser1',
    logo: '/images/companies/newser1.webp',
    sector: 'Energie Rinnovabili',
    sectorKey: 'energy',
    icon: Leaf,
    description: 'Produzione elettrica da fonti rinnovabili con tecnologie all\'avanguardia, proprietaria di impianto eolico da 4.0 MW.',
    longDescription: `Newser1 è una società che opera nel settore della produzione elettrica da fonti rinnovabili attraverso l'adozione di tecnologie all'avanguardia che assicurano alta efficienza a fronte di ridotti impatti ambientali.

Essa sviluppa e realizza progetti di efficienza energetica nei settori immobiliare, industriale, terziario, sia nel pubblico che nel privato, con percorsi volti a monitorare, gestire e ottimizzare i consumi energetici di qualsiasi utenza in modo semplice, intuitivo e flessibile.

È in grado di fornire assistenza nella fase progettuale e gestionale a tutti coloro che, a vario titolo, hanno interesse a realizzare progetti Joint Implementation (JI) e Clean Development Mechanism (CDM).

Proprietaria di un impianto eolico da 4.0 MW costituito da due aerogeneratori Vestas modello V80, dalla potenza nominale di 2000 kW cadauno, Newser1 concentra la propria attività nell'individuazione e realizzazione dei progetti che fanno uso dei meccanismi flessibili introdotti dal Protocollo di Kyoto per la riduzione delle emissioni dei gas ritenuti responsabili dell'effetto serra e dei conseguenti cambiamenti climatici.`,
    services: [
      'Produzione energia da fonti rinnovabili',
      'Progettazione impianti eolici',
      'Realizzazione opere civili',
      'Fornitura impianti ad isola',
      'Sviluppo progetti energetici',
      'Impianti "chiavi in mano"',
      'Assistenza progetti JI e CDM',
      'Efficienza energetica'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
    certifications: [
      {
        name: 'Licenza di Vettore Aereo',
        number: 'DD 505UE',
        date: '22.06.2012',
        description: 'Rilasciata da ENAC'
      },
      {
        name: 'ISO 9001:2008',
        number: 'IT246570',
        date: '30.11.2012',
        description: 'Attestato di Certificazione secondo la Normativa UNI EN ISO 9001:2008'
      },
      {
        name: 'Certificato di Operatore Aereo (COA)',
        number: 'I-156',
        date: '21.06.2012',
        description: 'Rilasciato da ENAC'
      },
      {
        name: 'Certificato di Approvazione Part 145',
        number: 'IT.145.369',
        date: '15.10.2013',
        description: 'Emesso da ENAC'
      }
    ]
  },
  'futuro-programmazione': {
    name: 'Futuro & Programmazione',
    logo: '/images/companies/futuro-programmazione.webp',
    sector: 'Efficientamento Energetico / Costruzioni',
    sectorKey: 'energy',
    icon: Briefcase,
    description: 'Società ESCo del Gruppo Cestari specializzata nell\'efficientamento energetico e nelle costruzioni.',
    longDescription: `Futuro & Programmazione è una società del Gruppo Cestari che opera nel settore dell'efficientamento energetico attraverso l'adozione di tecnologie all'avanguardia che assicurano alta efficienza a fronte di ridotti impatti ambientali ed economici.

F&P ha lo scopo di intervenire e regolare i consumi energetici attraverso l'efficienza energetica. La società sviluppa e realizza progetti di efficienza energetica nei settori immobiliare, industriale, terziario, sia nel pubblico che nel privato, con percorsi volti a monitorare, gestire ed ottimizzare i consumi energetici di qualsiasi utenza in modo semplice, intuitivo e flessibile.

Essa soddisfa i requisiti che devono possedere le società che forniscono servizi energetici, incluso il finanziamento dell'intervento.

Il Team della Futuro & Programmazione è in grado di realizzare studi di fattibilità, rilievi topografici, progetti architettonici, progettazione energetica, computi metrici fino ad occuparsi della direzione lavori con conseguente consegna lavoro a regola d'arte.

La società opera nella costruzione di edifici residenziali, case monofamiliari e plurifamiliari, e tutti i tipi di edifici non residenziali come fabbricati ad uso industriale (fabbriche, officine, capannoni), ospedali, scuole, fabbricati per uffici, alberghi, negozi, centri commerciali, ristoranti, aeroporti, impianti sportivi, parcheggi, magazzini, edifici religiosi. Si occupa anche di assemblaggio e montaggio di strutture prefabbricate, ricostruzione e ristrutturazione di strutture residenziali, incluso il restauro di edifici storici e monumentali.

Opera da General Contractor per interventi di efficientamento energetico e miglioramento sismico previsti dall'articolo 119 della Legge 77/2020 (Superbonus), con più di 100 progetti in corso con enti pubblici e più di 150 progetti privati di riqualificazione edilizia.

La Futuro & Programmazione, essendo partner di altre imprese del gruppo Cestari, opera in qualità di ESCo ed è in grado di offrire contratti a garanzia di risultato ai propri clienti.`,
    services: [
      'Studi di fattibilità',
      'Rilievi topografici',
      'Progetti architettonici',
      'Progettazione energetica',
      'Computi metrici',
      'Direzione lavori',
      'Costruzioni residenziali e non residenziali',
      'Ristrutturazioni e restauro edifici storici',
      'Efficientamento energetico',
      'Miglioramento sismico',
      'General Contractor Superbonus (art. 119 L. 77/2020)',
      'Contratti EPC a garanzia di risultato'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
    certifications: [
      {
        name: 'ISO 9001',
        number: '3652 Rev. 0 R0',
        date: 'Valido fino: 06/03/2027',
        description: 'Certificazione Sistema di Gestione Qualità',
        document: '/documents/certificazioni/futuro-programmazione-iso.pdf'
      },
      {
        name: 'SOA',
        number: '33906/11/00',
        date: 'Rilasciato: 19/05/2025',
        description: 'Attestazione per partecipazione appalti pubblici - Categoria OG1 CLASS. III-BIS - Categoria OG9 CLASS. I',
        document: '/documents/certificazioni/futuro-programmazione-soa.pdf'
      },
      {
        name: 'Certificazione ESCo',
        number: '663-IT',
        date: 'Scadenza: 23/04/2028',
        description: 'Energy Service Company - Società di Servizi Energetici secondo Norma UNI CEI 11352:2014',
        document: '/documents/certificazioni/futuro-programmazione-esco.pdf'
      },
      {
        name: 'Certificazione Parità di Genere',
        number: '442/125/2025',
        date: '2025',
        description: 'Certificazione UNI/PdR 125:2022 per la parità di genere',
        document: '/documents/certificazioni/futuro-programmazione-parita-genere.pdf'
      }
    ]
  },
  'sakti': {
    name: 'SAKTI',
    logo: '/images/companies/sakti.webp',
    sector: 'Energie Rinnovabili',
    sectorKey: 'energy',
    icon: Leaf,
    description: 'Leader nel settore delle energie rinnovabili con tecnologie all\'avanguardia per la conversione efficiente in elettricità.',
    longDescription: `Sakti è una società leader nel settore delle energie rinnovabili, che si distingue per l'uso di tecnologie all'avanguardia per la conversione efficiente delle energie rinnovabili in elettricità.

La nostra missione è quella di promuovere un futuro sostenibile attraverso soluzioni energetiche innovative e responsabili.

Con un forte impegno per la tutela dell'ambiente, Sakti lavora incessantemente per ridurre l'impatto ambientale e favorire l'adozione di pratiche ecologiche.

Siamo orgogliosi di contribuire a un pianeta più pulito e verde, investendo continuamente in ricerca e sviluppo per migliorare le nostre tecnologie e offrire soluzioni energetiche sostenibili che soddisfano le esigenze del presente e del futuro.`,
    services: [
      'Tecnologie all\'avanguardia per energie rinnovabili',
      'Conversione efficiente in elettricità',
      'Soluzioni energetiche innovative',
      'Ricerca e sviluppo tecnologie sostenibili',
      'Riduzione impatto ambientale',
      'Consulenza per transizione energetica'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
  },
  'wiremena': {
    name: 'Wiremena',
    logo: '/images/companies/wiremena.webp',
    sector: 'Energie Rinnovabili',
    sectorKey: 'energy',
    icon: Leaf,
    description: 'Società specializzata nel settore delle energie rinnovabili con servizi full-cycle dalla progettazione alla gestione impianti.',
    longDescription: `Wiremena, parte integrante del prestigioso Gruppo Cestari, è una società all'avanguardia specializzata nel settore delle Energie Rinnovabili.

Con un impegno costante verso l'innovazione e la sostenibilità, Wiremena opera in diversi ambiti per sviluppare soluzioni energetiche che non solo migliorano l'efficienza ma anche riducono l'impatto ambientale.

Grazie a una combinazione di tecnologie avanzate e competenze di alto livello, la società è in grado di affrontare le sfide energetiche moderne, offrendo prodotti e servizi che favoriscono una transizione energetica responsabile e sostenibile.

Wiremena si distingue per la sua capacità di integrare risorse rinnovabili in modo efficiente e per il suo contributo significativo al futuro energetico globale, lavorando incessantemente per un mondo più verde e pulito.`,
    services: [
      'Progettazione impianti energie rinnovabili',
      'Installazione impianti',
      'Sviluppo progetti energetici',
      'Manutenzione impianti',
      'Costruzione infrastrutture',
      'Importazione tecnologie',
      'Commercializzazione soluzioni',
      'Gestione impianti'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
  },
  'italafrica': {
    name: 'ItalAfrica Centrale',
    logo: '/images/companies/italafrica.webp',
    sector: 'Camera di Commercio',
    sectorKey: 'international',
    icon: Globe,
    description: 'Camera di Commercio ItalAfrica Centrale - ponte strategico tra Italia e 19 Paesi dell\'Africa Centrale.',
    longDescription: `La Camera di Commercio ItalAfrica Centrale è una Camera di Commercio Estera riconosciuta in Italia ai sensi della Legge 580/93 e D.M. 96/00, iscritta al n. 37 dell'Albo delle Camere di Commercio Italo-Estere presso il Ministero degli Affari Esteri.

Fondata nel 2004 e presieduta dall'Ing. Alfredo Carmine Cestari (Console Onorario della Repubblica Democratica del Congo dal 2002 e Commissario Generale del Burundi per Expo 2015), la Camera coinvolge 19 Paesi dell'Africa Centrale: Angola, Benin, Burundi, Camerun, Repubblica Centrafricana, Repubblica del Congo, Repubblica Democratica del Congo, Gabon, Guinea Equatoriale, Kenya, Malawi, Mozambico, Namibia, Ruanda, São Tomé e Príncipe, Senegal, Sierra Leone, Tanzania e Uganda.

La Camera promuove e sviluppa le relazioni economiche e commerciali tra l'Italia e i paesi dell'Africa Centrale, supportando le imprese italiane nel processo di internazionalizzazione.

Con 9 sedi su tre continenti (Italia: Napoli, Milano, Roma, Salerno, Potenza; Europa: Bruxelles; Africa: Kinshasa, Pointe-Noire, Kigali), rappresenta un ponte strategico per oltre 250 milioni di abitanti nell'area di competenza.

La Camera è attivamente impegnata in progetti come Sud Polo Magnetico per il rilancio del Mezzogiorno, Sinergie per lo Sviluppo per supportare il continente africano, e supporta il Piano Mattei con accordi attivi in Tanzania, Zanzibar, Senegal, Mozambico, Angola, Sierra Leone e Congo.`,
    services: [
      'Ricerca partner commerciali affidabili',
      'Analisi di mercato e opportunità di investimento',
      'Assistenza finanziaria in Italia e Africa',
      'Costituzione società di diritto locale in Africa Centrale',
      'Organizzazione missioni commerciali e fiere internazionali',
      'Formazione e seminari tecnici',
      'Reperimento sedi commerciali e produttive',
      'Verifica idoneità partner (produttori, esportatori, importatori)',
      'Marketplace B2B per connessione aziende Italia-Africa'
    ],
    location: 'Napoli / Milano / Roma / Salerno / Potenza / Bruxelles / Kinshasa / Pointe-Noire / Kigali',
    founded: '2004',
    website: 'https://italafricacentrale.com',
    email: 'napoli@italafricacentrale.com',
    phone: '+39 081 787 5642',
  },
  'midday-sun': {
    name: 'Midday Sun',
    logo: '/images/companies/midday-sun.webp',
    sector: 'Energie Rinnovabili',
    sectorKey: 'energy',
    icon: Leaf,
    description: 'Leader nel settore delle energie rinnovabili con servizi completi dal progetto alla commercializzazione di energia pulita.',
    longDescription: `Midday Sun è una società leader nel settore delle energie rinnovabili, che si distingue per la sua vasta gamma di servizi che coprono l'intero ciclo di vita degli impianti di energia rinnovabile.

L'azienda si occupa di progettazione, costruzione, installazione, manutenzione e gestione di impianti destinati alla produzione di energia elettrica da fonti rinnovabili, garantendo soluzioni efficienti e sostenibili.

Grazie all'impiego di tecnologie avanzate e a un team di esperti altamente qualificati, Midday Sun è in grado di realizzare impianti che massimizzano la produzione di energia pulita.

Oltre a questo, la società è attiva nella commercializzazione di energia elettrica pulita e rinnovabile, contribuendo a ridurre l'impronta ecologica e a promuovere un futuro energetico più sostenibile.

L'impegno di Midday Sun per l'innovazione e la tutela dell'ambiente rappresenta il cuore pulsante della sua missione, rendendola un partner affidabile e responsabile nel panorama delle energie rinnovabili.`,
    services: [
      'Progettazione impianti energie rinnovabili',
      'Costruzione impianti',
      'Installazione impianti',
      'Manutenzione impianti',
      'Gestione operativa impianti',
      'Commercializzazione energia elettrica pulita',
      'Consulenza per transizione energetica',
      'Soluzioni per riduzione impronta ecologica'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
  },
  'ristruttura': {
    name: 'Ristruttura SMC Newco',
    logo: '/images/companies/ristruttura.webp',
    sector: 'Edilizia e Impiantistica',
    sectorKey: 'consulting',
    icon: Building2,
    description: 'Realtà specializzata nel settore dell\'edilizia civile, industriale e dell\'impiantistica, con soluzioni integrate per infrastrutture moderne e sostenibili.',
    longDescription: `Ristruttura SMC Newco opera come realtà specializzata nel settore dell'edilizia civile, industriale e dell'impiantistica, offrendo soluzioni integrate per la realizzazione e la riqualificazione di infrastrutture moderne e sostenibili.

L'azienda si occupa della progettazione, costruzione, manutenzione e ristrutturazione di edifici residenziali e non residenziali, fornendo competenze tecniche avanzate per trasformare progetti complessi in opere compiute a regola d'arte.

Sfruttando tecnologie costruttive all'avanguardia e la sinergia con i professionisti del Gruppo Cestari, Ristruttura SMC Newco sviluppa interventi volti all'efficienza strutturale e all'innovazione tecnologica, garantendo affidabilità e durata nel tempo per ogni tipologia di fabbricato.

L'azienda gestisce con estrema precisione ogni fase del cantiere, dalla pianificazione iniziale fino al collaudo finale, ottimizzando tempi e risorse per soddisfare le esigenze di un mercato in continua evoluzione.

L'orientamento all'eccellenza, la solidità operativa e la capacità di integrare soluzioni edilizie intelligenti costituiscono i pilastri di Ristruttura SMC Newco, che si propone come partner competente e affidabile per la costruzione di un futuro infrastrutturale più solido, funzionale e allineato ai più alti standard di settore.`,
    services: [
      'Progettazione edilizia civile e industriale',
      'Costruzione edifici residenziali e non residenziali',
      'Ristrutturazione e riqualificazione',
      'Impiantistica integrata',
      'Manutenzione fabbricati',
      'Direzione lavori e collaudo',
      'Efficienza strutturale',
      'Innovazione tecnologica nelle costruzioni'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
  },
  'cestari-france': {
    name: 'Cestari Group France',
    logo: '/images/companies/cestari-france.webp',
    sector: 'Immobiliare e Costruzioni',
    sectorKey: 'international',
    icon: Globe,
    description: 'Realtà specializzata nel mercato immobiliare e delle costruzioni in Francia, con soluzioni integrate per acquisizione, valorizzazione e gestione di patrimoni immobiliari.',
    longDescription: `Cestari Group France S.a.s. opera come realtà specializzata nel mercato immobiliare e delle costruzioni, offrendo soluzioni integrate per l'acquisizione, la valorizzazione e la gestione di patrimoni immobiliari sul territorio francese.

L'azienda si occupa della compravendita, della costruzione, del restauro e dell'amministrazione di edifici di ogni tipologia, fornendo competenze tecniche e gestionali avanzate per trasformare investimenti complessi in asset immobiliari di valore.

Sfruttando l'esperienza internazionale e la stretta sinergia con i professionisti del Gruppo Cestari, Cestari Group France sviluppa interventi volti all'eccellenza strutturale e funzionale, garantendo affidabilità e visione strategica in ogni progetto.

L'azienda gestisce con estrema precisione ogni fase del ciclo di vita immobiliare, dalla pianificazione finanziaria iniziale fino alla locazione e manutenzione finale, ottimizzando risorse e rendimenti per soddisfare le esigenze di un mercato globale in continua evoluzione.

L'orientamento all'eccellenza, la solidità operativa e la capacità di integrare soluzioni immobiliari intelligenti costituiscono i pilastri di Cestari Group France, che si propone come partner competente e affidabile per lo sviluppo di un futuro immobiliare solido, funzionale e allineato ai più alti standard internazionali.`,
    services: [
      'Compravendita immobiliare',
      'Costruzione e restauro edifici',
      'Amministrazione patrimoni immobiliari',
      'Valorizzazione asset immobiliari',
      'Pianificazione finanziaria immobiliare',
      'Gestione locazioni',
      'Manutenzione immobili',
      'Consulenza investimenti immobiliari in Francia'
    ],
    location: 'Francia',
  },
  'flywin': {
    name: 'Flywin S.p.A.',
    logo: '/images/companies/flywin.webp',
    sector: 'Ingegneria e Consulenza',
    sectorKey: 'consulting',
    icon: Briefcase,
    description: 'Società innovativa specializzata in progettazione ingegneristica e supporto per finanziamenti europei ed extraeuropei.',
    longDescription: `FLYWIN S.p.A. è una società innovativa e all'avanguardia, specializzata nella progettazione e negli studi di ingegneria, offrendo soluzioni tecnologiche avanzate e personalizzate per rispondere alle esigenze specifiche di ogni cliente.

Con un forte orientamento all'innovazione e alla qualità, Flywin si avvale di un team di esperti altamente qualificati che lavorano per sviluppare progetti tecnici e ingegneristici di elevata complessità.

La società fornisce inoltre supporto completo nella gestione e nell'ottenimento di finanziamenti sia europei che extraeuropei, contribuendo in modo significativo alla realizzazione di progetti ambiziosi e innovativi.

Grazie alla sua profonda conoscenza delle normative e delle opportunità di finanziamento, Flywin facilita l'accesso a fondi necessari per lo sviluppo di nuove tecnologie e infrastrutture, sostenendo imprese e istituzioni nel raggiungimento dei loro obiettivi strategici.

La dedizione di Flywin nel campo dell'ingegneria e del finanziamento rappresenta un pilastro fondamentale per la crescita e il successo dei progetti intrapresi, rendendo la società un partner di fiducia per chiunque voglia trasformare le proprie idee in realtà concrete e sostenibili.`,
    services: [
      'Progettazione ingegneristica avanzata',
      'Studi di ingegneria',
      'Soluzioni tecnologiche personalizzate',
      'Progetti tecnici di elevata complessità',
      'Gestione finanziamenti europei',
      'Ottenimento finanziamenti extraeuropei',
      'Consulenza normativa e opportunità di finanziamento',
      'Supporto sviluppo nuove tecnologie e infrastrutture'
    ],
    location: 'Fisciano (SA) / Milano / Napoli / Roma / Moliterno (PZ) / Bruxelles',
    phone: '+39 089 952889',
  },
};

// Video data for ItalAfrica
const italafricaVideos = [
  {
    id: 'SVqfwx3uxZU',
    title: 'Incontro con l\'Ambasciatore del Mozambico',
    description: 'Intervista con Piero Muscari - Dialogo sulla cooperazione Italia-Mozambico',
    duration: '20 min',
    featured: true,
  },
  {
    id: '8f1ybnAvu_M',
    title: 'Sud Polo Magnetico - Camera di Commercio di Crotone',
    description: 'ItalAfrica e lo sviluppo del Mezzogiorno',
    duration: '5 min',
    featured: false,
  },
];

const italafricaConvegnoLink = {
  id: 'EQrsrjb9Jho',
  title: 'Convegno Sud Polo Magnetico - Camera dei Deputati',
  description: 'Convegno completo sulla cooperazione Italia-Africa',
  duration: '3 ore',
};

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export default function CompanyDetailPage({ params }: Props) {
  const t = useTranslations('companies');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Unwrap params using React.use() pattern for App Router
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- React.use pattern for App Router
  const { slug } = require('react').use(params);

  const company = companiesData[slug];
  const isItalAfrica = slug === 'italafrica';

  if (!company) {
    notFound();
  }

  const Icon = company.icon;
  const colors = sectorColors[company.sectorKey] || sectorColors['energy'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero with gradient */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-95`} />

        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-black/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/societa"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Torna alle società</span>
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-36 h-36 lg:w-48 lg:h-48 relative bg-white rounded-2xl p-6 shadow-2xl shrink-0"
            >
              <Image
                src={company.logo}
                alt={company.name}
                fill
                className="object-contain p-2"
              />
            </motion.div>

            {/* Header Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex-1"
            >
              {/* Sector badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-4">
                <Icon className="w-4 h-4" />
                <span>{company.sector}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {company.name}
              </h1>

              <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
                {company.description}
              </p>

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-3">
                {company.location && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{company.location.split(' / ').slice(0, 3).join(' / ')}{company.location.split(' / ').length > 3 ? '...' : ''}</span>
                  </div>
                )}
                {company.founded && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-white">
                    <Calendar className="w-4 h-4" />
                    <span>Dal {company.founded}</span>
                  </div>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Sito web</span>
                  </a>
                )}
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 hover:bg-white/90 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{company.phone}</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${colors.lightBg} rounded-xl flex items-center justify-center`}>
                    <Users className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Chi siamo
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none">
                  {company.longDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-slate-600 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${colors.lightBg} rounded-xl flex items-center justify-center`}>
                    <Target className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      I nostri servizi
                    </h2>
                    <p className="text-sm text-slate-500">{company.services.length} servizi offerti</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {company.services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-3 p-4 rounded-xl ${colors.lightBg} ${colors.border} border transition-all hover:shadow-md`}
                    >
                      <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 shrink-0`} />
                      <span className="text-sm text-slate-700 font-medium">{service}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Certifications */}
              {company.certifications && company.certifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-8 shadow-lg relative overflow-hidden`}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Certificazioni
                        </h2>
                        <p className="text-sm text-white/70">{company.certifications.length} certificazioni attive</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {company.certifications.map((cert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-colors group relative"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-white text-lg">
                                {cert.name}
                              </h3>
                              {(cert.number || cert.date) && (
                                <p className="text-sm text-white/70 mt-1">
                                  {cert.number && <span className="font-mono">N. {cert.number}</span>}
                                  {cert.number && cert.date && <span className="mx-2">•</span>}
                                  {cert.date && <span>{cert.date}</span>}
                                </p>
                              )}
                              {cert.description && (
                                <p className="text-sm text-white/80 mt-2">
                                  {cert.description}
                                </p>
                              )}
                            </div>
                            {cert.document && (
                              <a
                                href={cert.document}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center"
                                title="Scarica certificato PDF"
                              >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Locations */}
              {company.location && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 ${colors.lightBg} rounded-xl flex items-center justify-center`}>
                      <MapPin className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Sedi operative
                      </h2>
                      <p className="text-sm text-slate-500">Presenza in {company.location.split(' / ').length} località</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {company.location.split(' / ').map((loc, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${colors.lightBg} ${colors.text} ${colors.border} border`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {loc}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 shadow-lg relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Contattaci
                  </h3>
                  <p className="text-sm text-white/80 mb-6">
                    Per maggiori informazioni sui servizi di {company.name}, contatta il nostro team.
                  </p>
                  <Link
                    href="/contatti"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-800 font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg group"
                  >
                    Richiedi informazioni
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              {/* Phone Card */}
              {company.phone && (
                <motion.a
                  href={`tel:${company.phone}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${colors.lightBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Phone className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Chiamaci</p>
                      <p className={`text-lg font-bold ${colors.text}`}>{company.phone}</p>
                    </div>
                  </div>
                </motion.a>
              )}

              {/* Group Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-medium text-white/70">Parte del Gruppo</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Gruppo Cestari
                  </h3>
                  <p className="text-sm text-white/70 mb-5">
                    Holding multisettoriale attiva dal 1980 nei settori della finanza agevolata, energie rinnovabili e cooperazione internazionale.
                  </p>
                  <Link
                    href="/chi-siamo"
                    className="inline-flex items-center gap-2 text-sm text-secondary font-semibold hover:gap-3 transition-all"
                  >
                    Scopri il Gruppo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ItalAfrica Media Section */}
      {isItalAfrica && (
        <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-4">
                <Video className="w-4 h-4" />
                Media & Interviste
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                La nostra attività nei{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">Media</span>
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Interviste, convegni e approfondimenti sulla cooperazione Italia-Africa
              </p>
            </motion.div>

            {/* Video Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-10">
              {italafricaVideos.map((video, index) => {
                const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                const isPlaying = playingVideoId === video.id;

                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className={`${video.featured ? 'md:col-span-2' : ''}`}
                  >
                    <div className="relative">
                      {/* Glow effect for featured */}
                      {video.featured && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl blur-xl opacity-20" />
                      )}

                      <div className={`relative bg-white rounded-2xl overflow-hidden shadow-lg border ${video.featured ? 'border-violet-200' : 'border-slate-200'} group`}>
                        {/* Video container */}
                        <div className={`relative ${video.featured ? 'aspect-video' : 'aspect-video'} bg-slate-900`}>
                          <AnimatePresence mode="wait">
                            {!isPlaying ? (
                              <motion.div
                                key="thumbnail"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 cursor-pointer"
                                onClick={() => setPlayingVideoId(video.id)}
                              >
                                {/* Thumbnail */}
                                <Image
                                  src={thumbnailUrl}
                                  alt={video.title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:via-black/20 transition-all duration-500" />

                                {/* Duration badge */}
                                <div className="absolute top-4 right-4">
                                  <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                    {video.duration}
                                  </span>
                                </div>

                                {/* Featured badge */}
                                {video.featured && (
                                  <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                                      <Tv className="w-3.5 h-3.5" />
                                      In Evidenza
                                    </span>
                                  </div>
                                )}

                                {/* Play button */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative"
                                  >
                                    {video.featured && (
                                      <>
                                        <motion.div
                                          className="absolute inset-0 rounded-full bg-white/30"
                                          animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <motion.div
                                          className="absolute inset-0 rounded-full bg-white/20"
                                          animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        />
                                      </>
                                    )}
                                    <div className={`relative ${video.featured ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:bg-white transition-colors`}>
                                      <Play className={`${video.featured ? 'w-8 h-8' : 'w-6 h-6'} text-violet-600 ml-1 group-hover:scale-110 transition-transform`} fill="currentColor" />
                                    </div>
                                  </motion.div>
                                </div>

                                {/* Bottom info */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                                  <h3 className={`${video.featured ? 'text-xl lg:text-2xl' : 'text-lg'} font-bold text-white mb-1`}>
                                    {video.title}
                                  </h3>
                                  <p className="text-white/70 text-sm">
                                    {video.description}
                                  </p>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0"
                              >
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                                  title={video.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  className="absolute inset-0 w-full h-full"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* External Link to 3h Convegno */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-7 h-7 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 mb-1">
                      {italafricaConvegnoLink.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {italafricaConvegnoLink.description} • {italafricaConvegnoLink.duration}
                    </p>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${italafricaConvegnoLink.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all group whitespace-nowrap"
                  >
                    <span>Guarda su YouTube</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Other Companies CTA */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
              <Building2 className="w-4 h-4" />
              Esplora il network
            </span>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Scopri tutte le società del gruppo
            </h2>
            <p className="text-slate-600 mb-8">
              Il Gruppo Cestari opera attraverso 11 società specializzate in diversi settori strategici.
            </p>
            <Link
              href="/societa"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r ${colors.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group`}
            >
              Esplora tutte le società
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
