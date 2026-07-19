const SUPABASE_URL = 'https://qayjcfmostrcdbccfvqn.supabase.co'
const SUPABASE_SERVICE_KEY = Deno.env.get('SERVICE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'SERVICE_KEY not configured in function secrets' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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
      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({
          email,
          confirmation_token: token,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        try {
          const error = JSON.parse(text)
          if (res.status === 409 || error.message?.includes('duplicate')) {
            return new Response(JSON.stringify({ error: 'Already subscribed' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
          return new Response(JSON.stringify({ error: error.message || 'Insert failed', status: res.status }), {
            status: res.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Insert failed', status: res.status }), {
            status: res.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      return new Response(JSON.stringify({ success: true, id: data[0]?.id || token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'confirm') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?confirmation_token=eq.${email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({ confirmed: true }),
      })
      
      if (!res.ok) {
        const text = await res.text()
        const error = JSON.parse(text).catch(() => ({}))
        throw new Error(error.message || 'Update failed')
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'notify') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}&confirmed=eq.true`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({ notified: true }),
      })
      
      if (!res.ok) {
        const text = await res.text()
        const error = JSON.parse(text).catch(() => ({}))
        throw new Error(error.message || 'Update failed')
      }

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