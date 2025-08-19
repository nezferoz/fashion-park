import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { pathname } = new URL(req.url)
    
    // Health check endpoint
    if (pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'Fashion Park API - Supabase Edge Function',
          version: '1.0.0'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // API routes
    if (pathname.startsWith('/api/')) {
      const endpoint = pathname.replace('/api/', '')
      
      switch (endpoint) {
        case 'products':
          // Get products from Supabase
          const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(10)
          
          if (error) throw error
          
          return new Response(
            JSON.stringify({ products }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        
        default:
          return new Response(
            JSON.stringify({ message: 'Endpoint not found' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            }
          )
      }
    }

    // Default response
    return new Response(
      JSON.stringify({ 
        message: 'Fashion Park API - Supabase Edge Function',
        endpoints: ['/health', '/api/products']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
