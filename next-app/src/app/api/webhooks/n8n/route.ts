import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const { action, data } = payload
    const supabase = await createClient()

    if (action === 'sync_user') {
      // Example n8n automated sync
      const { data: user, error } = await supabase
        .from('UserSync')
        .insert({ data })
        
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
