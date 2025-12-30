import { NextResponse } from 'next/server';
import { SUBGROUPS } from '@/lib/config';

export async function GET() {
  try {
    if (SUBGROUPS.length === 0) {
      return NextResponse.json(
        { error: 'No valid subgroups configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ subgroups: SUBGROUPS });
  } catch (error) {
    console.error('Error loading subgroups:', error);
    return NextResponse.json(
      { error: 'Failed to load subgroups' },
      { status: 500 }
    );
  }
}
