#!/usr/bin/env node
/**
 * Script para verificar progresso das melhorias
 * Uso: node scripts/check-improvements.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const srcDir = join(projectRoot, 'src');

/**
 * Conta ocorrências de um padrão em arquivos
 */
function countPattern(directory, pattern, extensions = ['.ts', '.tsx', '.astro', '.js', '.jsx']) {
  let count = 0;
  const files = [];

  function searchDir(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and dist
          if (!['node_modules', 'dist', '.astro'].includes(entry.name)) {
            searchDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = entry.name.substring(entry.name.lastIndexOf('.'));
          if (extensions.includes(ext)) {
            try {
              const content = readFileSync(fullPath, 'utf-8');
              const matches = content.match(new RegExp(pattern, 'g'));
              if (matches) {
                count += matches.length;
                files.push({ path: fullPath.replace(projectRoot, ''), count: matches.length });
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  searchDir(directory);
  return { count, files };
}

/**
 * Verifica progresso das melhorias
 */
function checkImprovements() {
  console.log('🔍 Verificando progresso das melhorias...\n');

  // 1. Contar @ts-nocheck
  console.log('1️⃣  @ts-nocheck:');
  const tsNocheck = countPattern(srcDir, '@ts-nocheck');
  console.log(`   Total: ${tsNocheck.count} ocorrências`);
  if (tsNocheck.files.length > 0) {
    console.log('   Arquivos:');
    tsNocheck.files.forEach(({ path, count }) => {
      console.log(`     - ${path} (${count}x)`);
    });
  }
  console.log('');

  // 2. Contar 'any' types
  console.log('2️⃣  Tipos "any":');
  const anyTypes = countPattern(srcDir, ':\\s*any\\b');
  console.log(`   Total: ${anyTypes.count} ocorrências`);
  if (anyTypes.files.length > 0 && anyTypes.files.length <= 10) {
    console.log('   Arquivos:');
    anyTypes.files.slice(0, 10).forEach(({ path, count }) => {
      console.log(`     - ${path} (${count}x)`);
    });
    if (anyTypes.files.length > 10) {
      console.log(`     ... e mais ${anyTypes.files.length - 10} arquivos`);
    }
  }
  console.log('');

  // 3. Contar scripts inline grandes (>50 linhas)
  console.log('3️⃣  Scripts inline grandes:');
  const inlineScripts = findLargeInlineScripts(srcDir);
  console.log(`   Total: ${inlineScripts.length} arquivos com scripts >50 linhas`);
  inlineScripts.forEach(({ path, lines }) => {
    console.log(`     - ${path} (${lines} linhas)`);
  });
  console.log('');

  // 4. Resumo
  console.log('📊 Resumo:');
  console.log(`   ✅ Progresso: ${calculateProgress(tsNocheck.count, anyTypes.count, inlineScripts.length)}`);
  console.log('');

  // 5. Recomendações
  console.log('💡 Recomendações:');
  if (tsNocheck.count > 0) {
    console.log(`   - Remover ${tsNocheck.count} @ts-nocheck (crítico)`);
  }
  if (anyTypes.count > 10) {
    console.log(`   - Substituir ${anyTypes.count} tipos "any" (importante)`);
  }
  if (inlineScripts.length > 0) {
    console.log(`   - Modularizar ${inlineScripts.length} scripts inline (crítico)`);
  }
  if (tsNocheck.count === 0 && anyTypes.count < 5 && inlineScripts.length === 0) {
    console.log('   🎉 Excelente! Código está em bom estado.');
  }
}

/**
 * Encontra scripts inline grandes
 */
function findLargeInlineScripts(directory) {
  const largeScripts = [];

  function searchDir(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', '.astro'].includes(entry.name)) {
            searchDir(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.astro')) {
          try {
            const content = readFileSync(fullPath, 'utf-8');
            const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
            if (scriptMatches) {
              scriptMatches.forEach((match) => {
                const lines = match.split('\n').length;
                if (lines > 50) {
                  largeScripts.push({
                    path: fullPath.replace(projectRoot, ''),
                    lines,
                  });
                }
              });
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  searchDir(directory);
  return largeScripts;
}

/**
 * Calcula progresso geral
 */
function calculateProgress(tsNocheck, anyTypes, largeScripts) {
  // Pesos: ts-nocheck é mais crítico
  const total = tsNocheck * 3 + anyTypes * 1 + largeScripts * 2;
  
  // Valores ideais (meta)
  const ideal = 0; // Zero é o ideal
  
  if (total === 0) return '100% - Excelente!';
  if (total < 5) return '80-99% - Muito bom';
  if (total < 10) return '60-79% - Bom';
  if (total < 20) return '40-59% - Regular';
  return '0-39% - Precisa melhorar';
}

// Executar
checkImprovements();

