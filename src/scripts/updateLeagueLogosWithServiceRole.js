// src/scripts/updateLeagueLogosWithServiceRole.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getLogoUrlByLeagueName } from '../utils/logoHelper.js';

dotenv.config();

async function updateAllLeagueLogos() {
  console.log('🏆 Actualizando logos de ligas (con Service Role)...\n');
  console.log('═'.repeat(60));
  
  // Verificar service_role key
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
  
  // Obtener todas las ligas
  console.log('\n📊 Obteniendo ligas...');
  const { data: leagues, error, count } = await supabase
    .from('leagues')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔍 Posibles causas:');
    console.log('   • La tabla se llama diferente (no "leagues")');
    console.log('   • Las ligas están en otra base de datos');
    console.log('   • La URL de Supabase es incorrecta\n');
    return;
  }
  
  if (!leagues || leagues.length === 0) {
    console.log('⚠️  No se encontraron ligas\n');
    return;
  }
  
  console.log(`✅ Se encontraron ${leagues.length} ligas\n`);
  console.log('═'.repeat(60));
  console.log('');
  
  // Procesar cada liga
  let updated = 0;
  let skipped = 0;
  let alreadyHas = 0;
  const missingMappings = new Set();
  
  for (const league of leagues) {
    // Mostrar progreso
    console.log(`\n📋 Procesando: ${league.name} (${league.season})`);
    
    // Si ya tiene logo_url, mostrar pero continuar (puedes descomentar el continue para saltarlas)
    if (league.logo_url) {
      console.log(`   ℹ️  Ya tiene logo: ${league.logo_url}`);
      // alreadyHas++;
      // continue;
    }
    
    // Generar URL del logo
    const logoUrl = getLogoUrlByLeagueName(supabase, league.name);
    
    // Verificar si falta mapeo
    if (!logoUrl) {
      missingMappings.add(league.name);
      console.log(`   ⚠️  Falta mapeo para: ${league.name}`);
      skipped++;
      continue;
    }
    
    console.log(`   🔗 Logo URL: ${logoUrl}`);
    
    // Actualizar la liga
    const { error: updateError } = await supabase
      .from('leagues')
      .update({ logo_url: logoUrl })
      .eq('id', league.id);
    
    if (updateError) {
      console.error(`   ❌ Error al actualizar: ${updateError.message}`);
      skipped++;
    } else {
      console.log(`   ✅ Actualizada correctamente`);
      updated++;
    }
  }
  
  // Resumen
  console.log('');
  console.log('═'.repeat(60));
  console.log('📈 RESUMEN FINAL');
  console.log('═'.repeat(60));
  console.log(`✅ Actualizadas: ${updated}`);
  console.log(`⏭️  Ya tenían logos: ${alreadyHas}`);
  console.log(`⚠️  Omitidas (sin mapeo): ${skipped}`);
  console.log(`📊 Total procesadas: ${leagues.length}`);
  console.log('═'.repeat(60));
  
  // Mostrar mapeos faltantes
  if (missingMappings.size > 0) {
    console.log('');
    console.log('⚠️  LIGAS SIN MAPEO EN logoHelper.js:');
    console.log('═'.repeat(60));
    console.log('Agrega estos a src/utils/logoHelper.js → leagueLogoMap:\n');
    
    missingMappings.forEach(leagueName => {
      const slug = leagueName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      console.log(`  '${leagueName}': '${slug}',`);
    });
    console.log('');
    console.log('Luego sube los logos a Supabase Storage:');
    console.log('📁 league-logos/{slug}.png');
    console.log('');
    console.log('═'.repeat(60));
  }
  
  console.log('\n✨ Proceso completado!\n');
  
  // Verificar algunos registros actualizados
  console.log('🔍 Verificando registros actualizados...\n');
  const { data: verifyLeagues } = await supabase
    .from('leagues')
    .select('name, season, logo_url')
    .not('logo_url', 'is', null)
    .limit(5);
  
  if (verifyLeagues && verifyLeagues.length > 0) {
    console.log('✅ Ejemplos de ligas con logos:\n');
    verifyLeagues.forEach(league => {
      console.log(`   • ${league.name} (${league.season})`);
      console.log(`     ${league.logo_url}\n`);
    });
  }
  
  console.log('═'.repeat(60));
  console.log('');
}

updateAllLeagueLogos().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});