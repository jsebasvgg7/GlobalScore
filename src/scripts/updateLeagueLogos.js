import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getLogoUrlByLeagueName, leagueLogoMap } from '../utils/logoHelper.js';

dotenv.config();

async function updateAllLeagueLogos() {
  console.log('🏆 Actualizando logos de ligas...\n');
  console.log('═'.repeat(60));
  
  // Verificar variables de entorno
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('❌ Faltan variables de entorno en .env\n');
    console.log('Asegúrate de tener:');
    console.log('  - VITE_SUPABASE_URL');
    console.log('  - VITE_SUPABASE_ANON_KEY\n');
    return;
  }
  
  // Crear cliente de Supabase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  console.log('✅ Cliente de Supabase creado\n');
  console.log('═'.repeat(60));
  
  // Obtener todas las ligas
  console.log('\n📊 Obteniendo ligas...');
  const { data: leagues, error, count } = await supabase
    .from('leagues')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Posibles causas:');
    console.log('   • Problemas de permisos (RLS)');
    console.log('   • La tabla no existe o se llama diferente');
    console.log('\n📝 Solución:');
    console.log('   Usa el script con service_role key:');
    console.log('   node src/scripts/updateLeagueLogosWithServiceRole.js\n');
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
    // Si ya tiene logo_url, saltar (opcional: elimina esto para forzar actualización)
    if (league.logo_url) {
      console.log(`⏭️  Ya tiene logo: ${league.name}`);
      alreadyHas++;
      continue;
    }
    
    // Generar URL del logo
    const logoUrl = getLogoUrlByLeagueName(supabase, league.name);
    
    // Verificar si falta mapeo
    if (!logoUrl) {
      missingMappings.add(league.name);
      console.log(`⚠️  Falta mapeo: ${league.name}`);
      skipped++;
      continue;
    }
    
    // Actualizar la liga
    const { error: updateError } = await supabase
      .from('leagues')
      .update({ logo_url: logoUrl })
      .eq('id', league.id);
    
    if (updateError) {
      console.error(`❌ Error: ${league.name}`);
      console.error(`   ${updateError.message}`);
      skipped++;
    } else {
      console.log(`✅ ${league.name} → ${logoUrl}`);
      updated++;
    }
  }
  
  // Resumen
  console.log('');
  console.log('═'.repeat(60));
  console.log('📈 RESUMEN');
  console.log('═'.repeat(60));
  console.log(`✅ Actualizadas: ${updated}`);
  console.log(`⏭️  Ya tenían logos: ${alreadyHas}`);
  console.log(`⚠️  Omitidas: ${skipped}`);
  console.log(`📊 Total: ${leagues.length}`);
  console.log('═'.repeat(60));
  
  // Mostrar mapeos faltantes
  if (missingMappings.size > 0) {
    console.log('');
    console.log('⚠️  LIGAS SIN MAPEO:');
    console.log('═'.repeat(60));
    console.log('Agrega estos a src/utils/logoHelper.js en leagueLogoMap:\n');
    
    missingMappings.forEach(leagueName => {
      const slug = leagueName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      console.log(`  '${leagueName}': '${slug}',`);
    });
    console.log('');
    console.log('═'.repeat(60));
  }
  
  console.log('\n✨ Proceso completado!\n');
  console.log('💡 Recuerda subir los logos correspondientes a:');
  console.log('   Supabase Storage → league-logos → {slug}.png\n');
}

updateAllLeagueLogos().catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});