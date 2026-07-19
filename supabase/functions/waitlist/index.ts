import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('CLIENT_URL') ?? 'https://placeholder.supabase.co',
  Deno.env.get('CLIENT_KEY') ?? 'placeholder-key'
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, action } = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'subscribe') {
      const token = crypto.randomUUID()
      const { data, error } = await supabase.from('waitlist').insert({
        email,
        confirmation_token: token,
      }).select().single()

      if (error) {
        if (error.message.includes('duplicate')) {
          return new Response(JSON.stringify({ error: 'Already subscribed' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        throw error
      }

      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'confirm') {
      const { error } = await supabase.from('waitlist')
        .update({ confirmed: true })
        .eq('confirmation_token', email)
      
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'notify') {
      const { error } = await supabase.from('waitlist')
        .update({ notified: true })
        .eq('email', email)
        .eq('confirmed', true)
      
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})