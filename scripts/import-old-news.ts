import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Default author ID (Admin Cestari)
const DEFAULT_AUTHOR_ID = 'cmj8qq06i0000l8j3wpp0msap';
// Default category ID (eventi)
const DEFAULT_CATEGORY_ID = 'cmjabsk310008l8mexu8qebum';

interface WPPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

async function fetchAllPosts(): Promise<WPPost[]> {
  const allPosts: WPPost[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    const response = await fetch(
      `https://gruppocestari.com/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed`
    );

    if (!response.ok) {
      hasMore = false;
      break;
    }

    const posts: WPPost[] = await response.json();
    if (posts.length === 0) {
      hasMore = false;
    } else {
      allPosts.push(...posts);
      page++;
    }
  }

  return allPosts;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHtmlContent(html: string): string {
  return html
    .replace(/\r\n/g, '\n')
    .replace(/<!--.*?-->/gs, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '')
    .replace(/data-[a-z-]+="[^"]*"/gi, '')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<figure[^>]*>/gi, '')
    .replace(/<\/figure>/gi, '')
    .replace(/<figcaption[^>]*>.*?<\/figcaption>/gis, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `cm${timestamp}${random}`;
}

async function importNews() {
  console.log('Fetching posts from WordPress API...');
  const posts = await fetchAllPosts();
  console.log(`Found ${posts.length} posts on old site`);

  // Get existing slugs
  const existingResult = await pool.query('SELECT slug FROM news');
  const existingSlugs = new Set(existingResult.rows.map(r => r.slug));
  console.log(`Existing news in DB: ${existingSlugs.size}`);

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const post of posts) {
    if (existingSlugs.has(post.slug)) {
      console.log(`⏭️  Skipping (exists): ${post.slug}`);
      skipped++;
      continue;
    }

    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const title = stripHtml(post.title.rendered);
    const excerpt = stripHtml(post.excerpt.rendered).substring(0, 500);
    const content = cleanHtmlContent(post.content.rendered);
    const publishDate = new Date(post.date);
    const newsId = generateCuid();
    const translationId = generateCuid();

    try {
      // Insert news
      await pool.query(`
        INSERT INTO news (id, slug, author_id, category_id, featured_image, is_published, is_featured, published_at, view_count, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, false, $6, 0, $6, $6)
      `, [newsId, post.slug, DEFAULT_AUTHOR_ID, DEFAULT_CATEGORY_ID, featuredImage, publishDate]);

      // Insert Italian translation
      await pool.query(`
        INSERT INTO news_translations (id, news_id, locale, title, excerpt, content)
        VALUES ($1, $2, 'it', $3, $4, $5)
      `, [translationId, newsId, title, excerpt, content]);

      console.log(`✅ Imported: ${post.slug}`);
      imported++;
    } catch (error) {
      const msg = `Error importing ${post.slug}: ${error}`;
      console.error(`❌ ${msg}`);
      errors.push(msg);
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 IMPORT COMPLETE`);
  console.log(`========================================`);
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped (existing): ${skipped}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`📰 Total in WordPress: ${posts.length}`);
  console.log(`========================================\n`);

  if (errors.length > 0) {
    console.log('First 5 errors:');
    errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
  }
}

importNews()
  .catch(console.error)
  .finally(() => pool.end());
