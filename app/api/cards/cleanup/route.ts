import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase';

/**
 * Manual cleanup endpoint for expired pending cards
 * POST /api/cards/cleanup
 */
export async function POST() {
  try {
    // Verify admin authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();

    // Call cleanup function
    const { data, error } = await adminSupabase.rpc('cleanup_expired_cards');

    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json(
        { error: 'Cleanup failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: data || 0
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
