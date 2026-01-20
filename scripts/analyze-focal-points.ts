/**
 * Script per analizzare automaticamente le immagini delle news
 * e determinare il punto focale ottimale usando Gemini Vision AI
 *
 * Uso: npx tsx scripts/analyze-focal-points.ts
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Gemini API key - prendi da eccellenze-italiane o configura in .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA0T8Cxn4vtbbEtKDuADZZTo9AZ0fQdtuk';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface AnalysisResult {
  focalPoint: string;
  confidence: number;
  reason: string;
}

/**
 * Analizza un'immagine con Gemini Vision e determina il punto focale
 */
async function analyzeImageWithGemini(imageUrl: string): Promise<AnalysisResult> {
  const prompt = `Analizza questa immagine e determina il punto focale ottimale per il ritaglio.

IMPORTANTE: Concentrati su dove si trovano i VOLTI delle persone o i soggetti principali.

Rispondi SOLO con un JSON valido nel seguente formato:
{
  "focalPoint": "top" | "center" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
  "confidence": 0.0-1.0,
  "reason": "breve spiegazione"
}

Regole per determinare il punto focale:
- Se ci sono volti nella parte superiore dell'immagine → "top"
- Se i volti sono al centro → "center"
- Se i volti sono in basso → "bottom"
- Se i volti sono a sinistra → "left" o "top-left" o "bottom-left"
- Se i volti sono a destra → "right" o "top-right" o "bottom-right"
- Se non ci sono volti, usa il soggetto principale dell'immagine

Rispondi SOLO con il JSON, nessun altro testo.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: await fetchImageAsBase64(imageUrl),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON dalla risposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`  ⚠️ Risposta non valida, usando default "top"`);
      return { focalPoint: 'top', confidence: 0.5, reason: 'Parsing failed' };
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
    return result;
  } catch (error) {
    console.error(`  ❌ Errore analisi:`, error);
    return { focalPoint: 'top', confidence: 0, reason: 'Error occurred' };
  }
}

/**
 * Scarica un'immagine e la converte in base64
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Analisi Focal Point con Gemini Vision AI\n');
  console.log('='.repeat(50));

  // Recupera tutte le news con immagini che hanno focalPoint = 'top' (default)
  const news = await prisma.news.findMany({
    where: {
      featuredImage: { not: null },
      focalPoint: 'top', // Solo quelle non ancora analizzate
    },
    select: {
      id: true,
      slug: true,
      featuredImage: true,
      focalPoint: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📰 Trovate ${news.length} news da analizzare\n`);

  if (news.length === 0) {
    console.log('✅ Tutte le news sono già state analizzate!');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of news) {
    console.log(`\n📸 Analizzando: ${item.slug}`);
    console.log(`   URL: ${item.featuredImage}`);

    try {
      const result = await analyzeImageWithGemini(item.featuredImage!);

      console.log(`   🎯 Punto focale: ${result.focalPoint} (${Math.round(result.confidence * 100)}%)`);
      console.log(`   📝 Motivo: ${result.reason}`);

      // Aggiorna solo se confidence > 0.5 e diverso da 'top'
      if (result.confidence >= 0.5) {
        await prisma.news.update({
          where: { id: item.id },
          data: { focalPoint: result.focalPoint },
        });
        console.log(`   ✅ Aggiornato nel database`);
        updated++;
      } else {
        console.log(`   ⏭️ Skippato (confidence troppo bassa)`);
        skipped++;
      }

      // Rate limiting - aspetta 1 secondo tra le richieste
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ Errore:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Riepilogo:');
  console.log(`   ✅ Aggiornate: ${updated}`);
  console.log(`   ⏭️ Skippate: ${skipped}`);
  console.log(`   ❌ Errori: ${errors}`);
  console.log(`   📰 Totale: ${news.length}`);
}

main()
  .catch((error) => {
    console.error('Errore fatale:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
