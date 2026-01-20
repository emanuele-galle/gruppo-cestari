import 'dotenv/config';
import { PrismaClient, BandoType, ProjectSector } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Inserendo bando MASE 2025...');

  const bando = await prisma.bando.upsert({
    where: { code: 'MASE-FER-2025' },
    update: {
      type: BandoType.NATIONAL,
      sector: ProjectSector.RENEWABLE_ENERGY,
      fundingAmount: 262000000,
      openDate: new Date('2025-12-03'),
      closeDate: new Date('2026-03-03'),
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      attachments: ['/documents/bandi/mase-2025-fotovoltaico.pdf'],
    },
    create: {
      code: 'MASE-FER-2025',
      type: BandoType.NATIONAL,
      sector: ProjectSector.RENEWABLE_ENERGY,
      fundingAmount: 262000000,
      openDate: new Date('2025-12-03'),
      closeDate: new Date('2026-03-03'),
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      attachments: ['/documents/bandi/mase-2025-fotovoltaico.pdf'],
      translations: {
        create: [
          {
            locale: 'it',
            title: 'MASE 2025 - Impianti Fotovoltaici e Termo-Fotovoltaici',
            summary: 'Bando da 262 milioni di euro per impianti fotovoltaici e termo-fotovoltaici da fonti rinnovabili. Contributi fino al 63% per imprese del Sud Italia.',
            description: `Il Ministero dell'Ambiente e della Sicurezza Energetica (MASE) finanzia le imprese con un bando da 262 milioni di euro per l'autoproduzione di energia da fonti rinnovabili (FER) tramite impianti fotovoltaici o termo-fotovoltaici.

**Beneficiari:**
- Imprese di qualsiasi dimensione, incluse reti di imprese
- Stabilimenti produttivi in aree industriali, produttive o artigianali di comuni con oltre 5.000 abitanti
- Progetti nelle Regioni: Basilicata, Calabria, Campania, Molise, Puglia, Sardegna, Sicilia

**Agevolazioni:**
- Fotovoltaico: fino al 58% per piccole imprese
- Termo-fotovoltaico: fino al 63% per piccole imprese
- Sistemi di stoccaggio: fino al 48% per PMI
- Bonus: +5 p.p. per moduli fotovoltaici di categoria speciale; +2 p.p. per imprese con sistema ISO 50001

**Interventi ammessi:**
- Acquisto, trasporto e installazione di impianti fotovoltaici/termofotovoltaici
- Sistemi di stoccaggio elettrochimico "behind-the-meter"
- Opere civili e connessione alla rete elettrica nazionale
- Costi di messa in esercizio e collaudo

**Scadenza:** Domande dal 3 dicembre 2025 al 3 marzo 2026 tramite piattaforma GSE.`,
            requirements: `- Imprese regolarmente costituite e iscritte al Registro delle Imprese
- Stabilimenti produttivi ubicati nelle Regioni meno sviluppate (Sud Italia)
- Potenza nominale dell'impianto tra 10 kW e 1.000 kW
- Impianti installati su edifici esistenti o strutture pertinenti (no suolo a terra)`,
            eligibility: `Imprese di tutte le dimensioni con stabilimenti produttivi in: Basilicata, Calabria, Campania, Molise, Puglia, Sardegna, Sicilia. Escluso settore agricoltura (codice ATECO 01).`,
          },
          {
            locale: 'en',
            title: 'MASE 2025 - Photovoltaic and Thermo-Photovoltaic Systems',
            summary: '262 million euro grant for photovoltaic and thermo-photovoltaic systems from renewable sources. Contributions up to 63% for Southern Italy businesses.',
            description: `The Ministry of Environment and Energy Security (MASE) is funding businesses with a 262 million euro grant for self-production of energy from renewable sources (FER) through photovoltaic or thermo-photovoltaic systems.

**Beneficiaries:**
- Companies of any size, including business networks
- Production facilities in industrial, productive or artisanal areas of municipalities with over 5,000 inhabitants
- Projects in the Regions: Basilicata, Calabria, Campania, Molise, Puglia, Sardinia, Sicily

**Grants:**
- Photovoltaic: up to 58% for small businesses
- Thermo-photovoltaic: up to 63% for small businesses
- Storage systems: up to 48% for SMEs
- Bonus: +5 p.p. for special category photovoltaic modules; +2 p.p. for companies with ISO 50001

**Eligible interventions:**
- Purchase, transport and installation of photovoltaic/thermo-photovoltaic systems
- "Behind-the-meter" electrochemical storage systems
- Civil works and connection to the national electricity grid
- Commissioning and testing costs

**Deadline:** Applications from December 3, 2025 to March 3, 2026 via GSE platform.`,
            requirements: `- Regularly established companies registered in the Business Register
- Production facilities located in less developed Regions (Southern Italy)
- Nominal power of the system between 10 kW and 1,000 kW
- Systems installed on existing buildings or related structures (no ground-mounted)`,
            eligibility: `Companies of all sizes with production facilities in: Basilicata, Calabria, Campania, Molise, Puglia, Sardinia, Sicily. Agriculture sector excluded (ATECO code 01).`,
          },
        ],
      },
    },
  });

  console.log('Bando inserito con successo:', bando.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
