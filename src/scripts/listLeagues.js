import { supabase } from '../utils/supabaseClientNode.js';

async function listAllLeagues() {
  console.log('🏆 Obteniendo todas las ligas...\n');
  console.log('═'.repeat(60));
  
  // Obtener todas las ligas
  const { data: leagues, error, count } = await supabase
    .from('leagues')
    .select('*', { count: 'exact' });
  
  console.log(`📊 Total de registros en leagues: ${count}\n`);
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Posibles causas:');
    console.log('   • La tabla no se llama "leagues"');
    console.log('   • No hay ligas en la base de datos');
    console.log('   • Problemas de permisos (RLS)\n');
    console.log('💡 Solución:');
    console.log('   Usa: node src/scripts/listLeaguesWithServiceRole.js\n');
    return;
  }
  
  if (!leagues || leagues.length === 0) {
    console.log('⚠️  La tabla leagues está vacía o no existe\n');
    return;
  }
  
  // Mostrar información de cada liga
  console.log('📋 LIGAS ENCONTRADAS:\n');
  leagues.forEach((league, index) => {
    console.log(`${index + 1}. ${league.name} (${league.season})`);
    console.log(`   ID: ${league.id}`);
    console.log(`   Logo emoji: ${league.logo || 'N/A'}`);
    console.log(`   Logo URL: ${league.logo_url || 'No configurado'}`);
    console.log(`   Estado: ${league.status}`);
    console.log(`   Deadline: ${league.deadline || 'N/A'}`);
    console.log('');
  });
  
  console.log('═'.repeat(60));
  
  // Generar mapeo sugerido
  const uniqueNames = [...new Set(leagues.map(l => l.name))];
  
  console.log('\n📝 MAPEO SUGERIDO para logoHelper.js:\n');
  console.log('export const leagueLogoMap = {');
  uniqueNames.sort().forEach(name => {
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    console.log(`  '${name}': '${slug}',`);
  });
  console.log('};\n');
  
  console.log('═'.repeat(60));
  
  // Estadísticas
  const withLogos = leagues.filter(l => l.logo_url).length;
  const withoutLogos = leagues.length - withLogos;
  
  console.log('\n📊 ESTADÍSTICAS:');
  console.log(`   • Total de ligas: ${leagues.length}`);
  console.log(`   • Con logo_url: ${withLogos}`);
  console.log(`   • Sin logo_url: ${withoutLogos}`);
  console.log(`   • Estados únicos: ${[...new Set(leagues.map(l => l.status))].join(', ')}`);
  console.log('');
  console.log('═'.repeat(60));
  
  // Verificar si el bucket existe
  console.log('\n🗂️  VERIFICANDO BUCKET league-logos...\n');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.log('❌ No se pudo verificar buckets:', bucketError.message);
  } else {
    const leagueBucket = buckets.find(b => b.name === 'league-logos');
    if (leagueBucket) {
      console.log('✅ Bucket "league-logos" existe');
      console.log(`   • Creado: ${new Date(leagueBucket.created_at).toLocaleString()}`);
      console.log(`   • Público: ${leagueBucket.public ? 'Sí' : 'No'}`);
    } else {
      console.log('❌ Bucket "league-logos" NO existe');
      console.log('\n📝 Crea el bucket en Supabase:');
      console.log('   1. Ve a Storage → Create bucket');
      console.log('   2. Nombre: league-logos');
      console.log('   3. Público: Sí');
      console.log('   4. Ejecuta las políticas SQL del archivo league-logos-policies.sql\n');
    }
  }
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('\n✅ Diagnóstico completado\n');
}

listAllLeagues().catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});