import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const ADMIN_ROLES = ['EDITOR', 'ADMIN', 'SUPERADMIN'];
    if (!session?.user || !ADMIN_ROLES.includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { id } = await params;

    await db.attachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { error: 'Errore nella cancellazione dell\'allegato' },
      { status: 500 }
    );
  }
}
