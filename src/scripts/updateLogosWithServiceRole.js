// src/scripts/updateLogosWithServiceRole.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { teamSlugMap, leagueMap } from '../utils/logoHelper.js';

dotenv.config();

// Función para obtener URL de logo
function getTeamLogoUrl(supabase, leagueSlug, teamSlug) {
  const path = `leagues/${leagueSlug}/${teamSlug}.png`;
  const { data } = supabase.storage
    .from('team-logos')
    .getPublicUrl(path);
  return data.publicUrl;
}

function getLogoUrlByTeamName(supabase, teamName, leagueName) {
  const teamSlug = teamSlugMap[teamName];
  const leagueSlug = leagueMap[leagueName];
  
  if (!teamSlug || !leagueSlug) {
    return null;
  }
  
  return getTeamLogoUrl(supabase, leagueSlug, teamSlug);
}

async function updateAllLogos() {
  console.log('🚀 Actualizando logos con Service Role Key...\n');
  
  // Verificar que existe la service_role key
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Falta SUPABASE_SERVICE_ROLE_KEY en .env\n');
    console.log('📝 Para obtenerla:');
    console.log('   1. Ve a tu proyecto en Supabase');
    console.log('   2. Settings → API');
    console.log('   3. Copia la "service_role" key (secret)');
    console.log('   4. Agrégala a tu archivo .env:\n');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key\n');
    return;
  }
  
  // Crear cliente con service_role (evita RLS)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  console.log('✅ Cliente creado con service_role key\n');
  console.log('═'.repeat(60));
  
  // Obtener TODOS los partidos (sin RLS)
  console.log('📊 Obteniendo partidos...');
  const { data: matches, error, count } = await supabase
    .from('matches')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (!matches || matches.length === 0) {
    console.log('⚠️  No se encontraron partidos\n');
    console.log('🔍 Posibles causas:');
    console.log('   • La tabla se llama diferente (no "matches")');
    console.log('   • Los partidos están en otra base de datos');
    console.log('   • La URL de Supabase es incorrecta\n');
    return;
  }
  
  console.log(`✅ Se encontraron ${matches.length} partidos\n`);
  console.log('═'.repeat(60));
  console.log('');
  
  // Procesar cada partido
  let updated = 0;
  let skipped = 0;
  let alreadyHas = 0;
  const missingMappings = new Set();
  
  for (const match of matches) {
    // Si ya tiene logos, saltar
    if (match.home_team_logo_url && match.away_team_logo_url) {
      console.log(`⏭️  Ya tiene logos: ${match.home_team} vs ${match.away_team}`);
      alreadyHas++;
      continue;
    }
    
    // Generar URLs
    const homeUrl = getLogoUrlByTeamName(supabase, match.home_team, match.league);
    const awayUrl = getLogoUrlByTeamName(supabase, match.away_team, match.league);
    
    // Verificar si faltan mapeos
    if (!homeUrl) {
      missingMappings.add(`${match.home_team} (${match.league})`);
    }
    if (!awayUrl) {
      missingMappings.add(`${match.away_team} (${match.league})`);
    }
    
    if (!homeUrl || !awayUrl) {
      console.log(`⚠️  Falta mapeo: ${match.home_team} vs ${match.away_team}`);
      skipped++;
      continue;
    }
    
    // Actualizar
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_team_logo_url: homeUrl,
        away_team_logo_url: awayUrl
      })
      .eq('id', match.id);
    
    if (updateError) {
      console.error(`❌ Error: ${match.home_team} vs ${match.away_team}`);
      console.error(`   ${updateError.message}`);
      skipped++;
    } else {
      console.log(`✅ ${match.home_team} vs ${match.away_team}`);
      updated++;
    }
  }
  
  // Resumen
  console.log('');
  console.log('═'.repeat(60));
  console.log('📈 RESUMEN');
  console.log('═'.repeat(60));
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`⏭️  Ya tenían logos: ${alreadyHas}`);
  console.log(`⚠️  Omitidos: ${skipped}`);
  console.log(`📊 Total: ${matches.length}`);
  console.log('═'.repeat(60));
  
  // Mostrar mapeos faltantes
  if (missingMappings.size > 0) {
    console.log('');
    console.log('⚠️  EQUIPOS SIN MAPEO:');
    console.log('═'.repeat(60));
    console.log('Agrega estos a src/utils/logoHelper.js:\n');
    
    missingMappings.forEach(team => {
      const [teamName, league] = team.split(' (');
      const slug = teamName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\./g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      console.log(`  '${teamName}': '${slug}',`);
    });
    console.log('');
    console.log('═'.repeat(60));
  }
  
  console.log('\n✨ Proceso completado!\n');
}

updateAllLogos().catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});