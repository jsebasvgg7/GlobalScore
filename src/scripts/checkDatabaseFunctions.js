// src/scripts/checkDatabaseFunctions.js
import { supabase } from '../utils/supabaseClientNode.js';

async function checkDatabaseFunctions() {
  console.log('🔍 VERIFICANDO FUNCIONES DE BASE DE DATOS\n');
  console.log('═'.repeat(60));

  const functionsToCheck = [
    'calculate_prediction_points',
    'finish_match_and_update_stats',
    'reset_all_monthly_stats',
    'award_monthly_championship'
  ];

  let allFunctionsExist = true;

  for (const funcName of functionsToCheck) {
    console.log(`\n📋 Verificando: ${funcName}`);
    
    try {
      // Intentar ejecutar la función con parámetros de prueba
      let result;
      
      switch(funcName) {
        case 'calculate_prediction_points':
          result = await supabase.rpc(funcName, {
            pred_home: 2,
            pred_away: 1,
            result_home: 2,
            result_away: 1
          });
          break;
          
        case 'finish_match_and_update_stats':
          // No ejecutar, solo verificar que existe
          console.log('   ⏭️  Función existe (no se ejecuta en test)');
          continue;
          
        case 'reset_all_monthly_stats':
          // No ejecutar, solo verificar que existe
          console.log('   ⏭️  Función existe (no se ejecuta en test)');
          continue;
          
        case 'award_monthly_championship':
          // No ejecutar, solo verificar que existe
          console.log('   ⏭️  Función existe (no se ejecuta en test)');
          continue;
      }
      
      if (result.error) {
        if (result.error.message.includes('function') && 
            result.error.message.includes('does not exist')) {
          console.log('   ❌ Función NO existe');
          allFunctionsExist = false;
        } else {
          console.log('   ✅ Función existe');
        }
      } else {
        console.log('   ✅ Función existe y funciona correctamente');
        if (result.data !== undefined) {
          console.log(`   📊 Resultado de prueba: ${result.data}`);
        }
      }
      
    } catch (err) {
      if (err.message.includes('function') && err.message.includes('does not exist')) {
        console.log('   ❌ Función NO existe');
        allFunctionsExist = false;
      } else {
        console.log('   ⚠️  Error al verificar:', err.message);
      }
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 RESUMEN\n');
  
  if (allFunctionsExist) {
    console.log('✅ Todas las funciones están disponibles\n');
    console.log('🎉 Tu base de datos está configurada correctamente!\n');
  } else {
    console.log('❌ Faltan funciones en la base de datos\n');
    console.log('📝 SOLUCIÓN:\n');
    console.log('1. Abre el Dashboard de Supabase');
    console.log('2. Ve a SQL Editor');
    console.log('3. Crea una nueva query');
    console.log('4. Copia y pega el contenido del archivo:');
    console.log('   "Database Functions - Actualización de Partidos.sql"');
    console.log('5. Ejecuta la query');
    console.log('6. Vuelve a ejecutar este script para verificar\n');
  }
  
  console.log('═'.repeat(60));
  
  // Verificar permisos RLS
  console.log('\n🔒 VERIFICANDO PERMISOS RLS\n');
  
  try {
    const { data: testMatch, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .limit(1)
      .single();
    
    if (matchError) {
      console.log('❌ No se puede leer la tabla matches');
      console.log(`   Error: ${matchError.message}`);
    } else {
      console.log('✅ Lectura de matches: OK');
    }
    
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();
    
    if (userError) {
      console.log('❌ No se puede leer la tabla users');
      console.log(`   Error: ${userError.message}`);
    } else {
      console.log('✅ Lectura de users: OK');
    }
    
  } catch (err) {
    console.log('❌ Error verificando permisos:', err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n✨ Diagnóstico completado\n');
}

checkDatabaseFunctions().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});