import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const ADMIN_ROLES = ['EDITOR', 'ADMIN', 'SUPERADMIN'];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !ADMIN_ROLES.includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId, attachments } = body;

    // Valida entityType
    if (!['project', 'news', 'bando'].includes(entityType)) {
      return NextResponse.json({ error: 'Entity type non valido' }, { status: 400 });
    }

    // Delete existing attachments for entity
    await db.attachment.deleteMany({
      where: { [`${entityType}Id`]: entityId },
    });

    // Create new attachments with sortOrder
    if (attachments && attachments.length > 0) {
      // Remove id field if present (createMany doesn't accept it)
      const attachmentsData = attachments.map((att: Record<string, unknown>, idx: number) => {
        const data: Record<string, unknown> = {
          url: att.url,
          fileName: att.fileName,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
          caption: att.caption || null,
          captionEn: att.captionEn || null,
          captionFr: att.captionFr || null,
          sortOrder: idx,
        };

        // Set the correct foreign key
        if (entityType === 'project') data.projectId = entityId;
        if (entityType === 'news') data.newsId = entityId;
        if (entityType === 'bando') data.bandoId = entityId;

        return data;
      });

      await db.attachment.createMany({
        data: attachmentsData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving attachments:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio degli allegati' },
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

    const attachments = await db.attachment.findMany({
      where: { [`${entityType}Id`]: entityId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli allegati' },
      { status: 500 }
    );
  }
}
