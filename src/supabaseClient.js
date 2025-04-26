// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmjaustucfmvcwmyovtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamF1c3R1Y2ZtdmN3bXlvdnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjk4ODIsImV4cCI6MjA2MDg0NTg4Mn0.G-_4iZBXVz3A4YDNsr07Mbx93ClSt2dxuYLmPpENcvk'; // <- tavs anon public key

export const supabase = createClient(supabaseUrl, supabaseKey);
