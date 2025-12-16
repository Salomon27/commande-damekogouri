const SUPABASE_URL = 'https://tcetlbseqkdobiwpuqnf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zcHg13Ry6En7tGR0NrXJEQ_CJBNFdYC';

const supabase = (function() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK non chargé');
        return null;
    }
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
})();

