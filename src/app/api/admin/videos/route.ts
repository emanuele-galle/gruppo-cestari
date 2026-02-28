import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId, videos } = body;

    console.log('=== VIDEO API DEBUG ===');
    console.log('EntityType:', entityType);
    console.log('EntityId:', entityId);
    console.log('Videos count:', videos?.length || 0);
    console.log('Videos data:', JSON.stringify(videos, null, 2));

    if (!['project', 'news', 'bando'].includes(entityType)) {
      return NextResponse.json({ error: 'Entity type non valido' }, { status: 400 });
    }

    // Delete existing videos for entity
    await db.videoAttachment.deleteMany({
      where: { [`${entityType}Id`]: entityId },
    });

    // Create new videos with sortOrder
    if (videos && videos.length > 0) {
      // Clean and prepare data for createMany
      const videosData = videos.map((vid: Record<string, unknown>, idx: number) => {
        // Set the correct foreign key based on entityType
        const foreignKeys: Record<string, unknown> = {
          projectId: null,
          articleId: null,
          eventId: null,
        };

        if (entityType === 'project') foreignKeys.projectId = entityId;
        if (entityType === 'article') foreignKeys.articleId = entityId;
        if (entityType === 'event') foreignKeys.eventId = entityId;

        return {
          url: vid.url,
          type: vid.type || 'upload', // 'youtube' | 'vimeo' | 'upload'
          fileName: vid.fileName || null,
          fileSize: vid.fileSize || null,
          thumbnail: vid.thumbnail || null,
          duration: vid.duration || null,
          title: vid.title || null,
          titleEn: vid.titleEn || null,
          titleFr: vid.titleFr || null,
          caption: vid.caption || null,
          captionEn: vid.captionEn || null,
          captionFr: vid.captionFr || null,
          sortOrder: idx,
          ...foreignKeys,
        };
      });

      console.log('Prepared data for createMany:', JSON.stringify(videosData, null, 2));

      await db.videoAttachment.createMany({
        data: videosData,
      });

      console.log('✅ Videos saved successfully');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving videos:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio dei video' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const videos = await db.videoAttachment.findMany({
      where: { [`${entityType}Id`]: entityId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei video' },
      { status: 500 }
    );
  }
}
