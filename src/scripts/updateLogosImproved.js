import { supabase } from '../utils/supabaseClientNode.js';
import { getLogoUrlByTeamName, teamSlugMap, leagueMap } from '../utils/logoHelper.js';

async function updateAllLogoUrls() {
  console.log('🚀 Iniciando actualización de logos...\n');
  
  // 1. Verificar conexión a la base de datos
  console.log('📡 Verificando conexión a Supabase...');
  const { data: testData, error: testError } = await supabase
    .from('matches')
    .select('count')
    .limit(1);
  
  if (testError) {
    console.error('❌ Error de conexión:', testError.message);
    console.log('\n💡 Verifica que:');
    console.log('   1. El archivo .env tiene las credenciales correctas');
    console.log('   2. Las políticas RLS permiten lectura/escritura');
    return;
  }
  
  console.log('✅ Conexión exitosa\n');
  
  // 2. Obtener todos los partidos
  console.log('📊 Obteniendo partidos de la base de datos...');
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team, league, home_team_logo_url, away_team_logo_url');
  
  if (error) {
    console.error('❌ Error obteniendo partidos:', error.message);
    return;
  }
  
  if (!matches || matches.length === 0) {
    console.log('⚠️  No hay partidos en la base de datos\n');
    return;
  }
  
  console.log(`✅ Se encontraron ${matches.length} partidos\n`);
  console.log('═'.repeat(60));
  
  // 3. Analizar y actualizar
  let updated = 0;
  let skipped = 0;
  let alreadyHasLogo = 0;
  const missingMapping = new Set();
  const errors = [];
  
  for (const match of matches) {
    // Verificar si ya tiene logos
    if (match.home_team_logo_url && match.away_team_logo_url) {
      console.log(`⏭️  Ya tiene logos: ${match.home_team} vs ${match.away_team}`);
      alreadyHasLogo++;
      continue;
    }
    
    // Verificar si existen los mapeos
    const homeSlug = teamSlugMap[match.home_team];
    const awaySlug = teamSlugMap[match.away_team];
    const leagueSlug = leagueMap[match.league];
    
    if (!homeSlug) {
      missingMapping.add(`Equipo: "${match.home_team}" (Liga: ${match.league})`);
    }
    if (!awaySlug) {
      missingMapping.add(`Equipo: "${match.away_team}" (Liga: ${match.league})`);
    }
    if (!leagueSlug) {
      missingMapping.add(`Liga: "${match.league}"`);
    }
    
    // Si falta algún mapeo, saltar
    if (!homeSlug || !awaySlug || !leagueSlug) {
      console.log(`⚠️  Mapeo faltante: ${match.home_team} vs ${match.away_team} (${match.league})`);
      skipped++;
      continue;
    }
    
    // Generar URLs
    const homeLogoUrl = getLogoUrlByTeamName(supabase, match.home_team, match.league);
    const awayLogoUrl = getLogoUrlByTeamName(supabase, match.away_team, match.league);
    
    // Actualizar en la base de datos
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_team_logo_url: homeLogoUrl,
        away_team_logo_url: awayLogoUrl
      })
      .eq('id', match.id);
    
    if (updateError) {
      console.error(`❌ Error actualizando: ${match.home_team} vs ${match.away_team}`);
      console.error(`   ${updateError.message}`);
      errors.push({ match, error: updateError.message });
      skipped++;
    } else {
      console.log(`✅ Actualizado: ${match.home_team} vs ${match.away_team}`);
      console.log(`   Home: ${homeLogoUrl}`);
      console.log(`   Away: ${awayLogoUrl}`);
      updated++;
    }
  }
  
  // 4. Resumen final
  console.log('\n' + '═'.repeat(60));
  console.log('📈 RESUMEN DE ACTUALIZACIÓN');
  console.log('═'.repeat(60));
  console.log(`✅ Actualizados exitosamente: ${updated}`);
  console.log(`⏭️  Ya tenían logos: ${alreadyHasLogo}`);
  console.log(`⚠️  Omitidos (falta mapeo): ${skipped}`);
  console.log(`❌ Errores: ${errors.length}`);
  console.log(`📊 Total procesados: ${matches.length}`);
  console.log('═'.repeat(60));
  
  // 5. Mostrar mapeos faltantes
  if (missingMapping.size > 0) {
    console.log('\n⚠️  MAPEOS FALTANTES:');
    console.log('═'.repeat(60));
    console.log('Agrega estos valores a src/utils/logoHelper.js:\n');
    
    missingMapping.forEach(item => {
      if (item.startsWith('Equipo:')) {
        const teamName = item.split('"')[1];
        const slug = teamName.toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          .replace(/\./g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        console.log(`  '${teamName}': '${slug}',`);
      } else if (item.startsWith('Liga:')) {
        const leagueName = item.split('"')[1];
        const slug = leagueName.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        console.log(`  '${leagueName}': '${slug}',`);
      }
    });
    console.log('═'.repeat(60));
  }
  
  // 6. Mostrar errores detallados
  if (errors.length > 0) {
    console.log('\n❌ ERRORES DETALLADOS:');
    console.log('═'.repeat(60));
    errors.forEach((e, idx) => {
      console.log(`${idx + 1}. ${e.match.home_team} vs ${e.match.away_team}`);
      console.log(`   Error: ${e.error}\n`);
    });
    console.log('═'.repeat(60));
  }
  
  console.log('\n✨ Proceso completado!\n');
}

// Ejecutar
updateAllLogoUrls().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});