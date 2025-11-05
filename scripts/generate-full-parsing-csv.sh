#!/usr/bin/env bash
set -euo pipefail

# Genera tests/yaml/data/full-parsing-tests.csv con todas las rutas yml/yaml
OUT="tests/yaml/data/full-parsing-tests.csv"
ROOT_DIR="tests/resources/pricing/full"

echo "Scanning: $ROOT_DIR"

# Recolectar archivos en un array (manteniendo nombres con espacios)
mapfile -t files < <(find "$ROOT_DIR" -type f \( -iname '*.yml' -o -iname '*.yaml' \) -print0 | xargs -0 -n1 echo)

if [ ${#files[@]} -eq 0 ]; then
  echo "No YAML files found under $ROOT_DIR" >&2
  exit 1
fi

# Ordenar rutas
IFS=$'\n' sorted=( $(printf '%s\n' "${files[@]}" | sort) )

# Escribir CSV
tmpout=$(mktemp)
printf '%s\n' "testName,pricingPath,expected" > "$tmpout"

for f in "${sorted[@]}"; do
  product=$(basename "$(dirname "$f")")
  filename=$(basename "$f")
  year=${filename%.*}
  # Capitalizar el nombre del producto adecuadamente (ej: microsoft365Business -> Microsoft365Business)
  expected=$(echo "$product" | sed -E 's/[^a-zA-Z0-9]+/ /g' | awk '{for(i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) }}1' | tr -d '\n')
  testName="$product $year"
  printf '%s,%s,%s\n' "$testName" "$f" "$expected" >> "$tmpout"
done

mv "$tmpout" "$OUT"

# Verificación rápida
file_count=${#sorted[@]}
csv_count=$(( $(wc -l < "$OUT") - 1 ))

echo "Wrote $OUT (entries: $csv_count, files found: $file_count)"

if [ "$file_count" -ne "$csv_count" ]; then
  echo "WARNING: mismatch between files found and CSV entries" >&2
  echo "Listing missing files (found but not in CSV):" >&2
  # Buscar diferencias
  # crear temp lists
  t1=$(mktemp)
  t2=$(mktemp)
  printf '%s\n' "${sorted[@]}" > "$t1"
  tail -n +2 "$OUT" | cut -d',' -f2 > "$t2"
  # comparar
  comm -23 <(sort "$t1") <(sort "$t2") || true
  rm -f "$t1" "$t2"
fi

exit 0
