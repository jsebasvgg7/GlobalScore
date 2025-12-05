// src/scripts/diagnoseDatabase.js
import { supabase } from '../utils/supabaseClientNode.js';

async function diagnoseDatabase() {
  console.log('🔍 DIAGNÓSTICO DE BASE DE DATOS\n');
  console.log('═'.repeat(60));
  
  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno...');
  console.log(`   URL: ${process.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Falta'}`);
  console.log(`   KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Falta'}`);
  
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('\n❌ Faltan variables de entorno en .env\n');
    return;
  }
  
  console.log('═'.repeat(60));
  
  // 2. Intentar diferentes consultas
  console.log('\n2️⃣ Probando diferentes métodos de consulta...\n');
  
  // Método 1: Select simple
  console.log('📊 Método 1: SELECT simple');
  const { data: data1, error: error1, count: count1 } = await supabase
    .from('matches')
    .select('*', { count: 'exact' });
  
  if (error1) {
    console.log(`   ❌ Error: ${error1.message}`);
    console.log(`   Código: ${error1.code}`);
    console.log(`   Detalles: ${error1.details}`);
  } else {
    console.log(`   ✅ Éxito: ${count1} registros encontrados`);
    if (data1 && data1.length > 0) {
      console.log(`   📄 Ejemplo:`, JSON.stringify(data1[0], null, 2));
    }
  }
  
  console.log('');
  
  // Método 2: Count directo
  console.log('📊 Método 2: COUNT directo');
  const { count: count2, error: error2 } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });
  
  if (error2) {
    console.log(`   ❌ Error: ${error2.message}`);
  } else {
    console.log(`   ✅ Total de registros: ${count2}`);
  }
  
  console.log('');
  
  // Método 3: Sin RLS usando service_role (si está disponible)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('📊 Método 3: Con service_role key');
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: data3, error: error3, count: count3 } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact' });
    
    if (error3) {
      console.log(`   ❌ Error: ${error3.message}`);
    } else {
      console.log(`   ✅ Registros con service_role: ${count3}`);
    }
    console.log('');
  }
  
  console.log('═'.repeat(60));
  
  // 3. Verificar otras tablas
  console.log('\n3️⃣ Verificando otras tablas...\n');
  
  const tables = ['users', 'predictions', 'leagues', 'awards'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ${table}: ❌ Error - ${error.message}`);
    } else {
      console.log(`   ${table}: ✅ ${count} registros`);
    }
  }
  
  console.log('\n═'.repeat(60));
  
  // 4. Recomendaciones
  console.log('\n4️⃣ DIAGNÓSTICO Y RECOMENDACIONES:\n');
  
  if (error1) {
    if (error1.message.includes('permission') || error1.message.includes('policy')) {
      console.log('❌ PROBLEMA: Políticas RLS (Row Level Security)');
      console.log('\n📝 SOLUCIÓN:');
      console.log('   1. Ve a Supabase Dashboard → Authentication → Policies');
      console.log('   2. En la tabla "matches", crea una política temporal:');
      console.log('');
      console.log('   CREATE POLICY "temp_read_matches"');
      console.log('   ON matches FOR SELECT');
      console.log('   TO anon');
      console.log('   USING (true);');
      console.log('');
      console.log('   CREATE POLICY "temp_update_matches"');
      console.log('   ON matches FOR UPDATE');
      console.log('   TO anon');
      console.log('   USING (true)');
      console.log('   WITH CHECK (true);');
      console.log('');
      console.log('   3. Ejecuta este script nuevamente');
      console.log('   4. Después de actualizar los logos, ELIMINA estas políticas');
      console.log('');
    } else if (error1.message.includes('not found')) {
      console.log('❌ PROBLEMA: Tabla "matches" no encontrada');
      console.log('\n📝 SOLUCIÓN:');
      console.log('   1. Verifica que la tabla existe en Supabase');
      console.log('   2. Verifica que se llama exactamente "matches"');
      console.log('');
    } else {
      console.log('❌ PROBLEMA DESCONOCIDO:');
      console.log(`   Error: ${error1.message}`);
      console.log(`   Código: ${error1.code}`);
      console.log('');
    }
  } else if (count1 === 0) {
    console.log('⚠️  La tabla "matches" existe pero está vacía');
    console.log('\n📝 SOLUCIÓN:');
    console.log('   1. Agrega partidos desde el panel de admin de tu app');
    console.log('   2. O inserta datos manualmente en Supabase');
    console.log('');
  } else {
    console.log('✅ Todo parece estar bien!');
    console.log('\n📝 SIGUIENTE PASO:');
    console.log('   Ejecuta: node src/scripts/updateLogosImproved.js');
    console.log('');
  }
  
  console.log('═'.repeat(60));
  console.log('\n💡 AYUDA ADICIONAL:');
  console.log('   • Si el problema persiste, usa service_role key:');
  console.log('     Agrega a .env: SUPABASE_SERVICE_ROLE_KEY=tu_service_key');
  console.log('   • La service_role key la encuentras en:');
  console.log('     Supabase Dashboard → Settings → API');
  console.log('');
}

diagnoseDatabase().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});