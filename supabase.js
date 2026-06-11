import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zysubsntsalfbcorqzce.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_fNXvTY6TIcKruP4V9juMbA_Rg-TjniT'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
