import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lwhbdnicvmnmiyrjcwgd.supabase.co'

const supabaseKey =
  'sb_publishable_Tm7o7daF9Dw-56qV4r_YqQ_NVpWciOW'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)
