# exceljs

- **Category:** Parseo de archivos (XLSX)
- **Version:** 4.4.0
- **Status:** Accepted
- **Decided in phase:** excel-ingestion
- **Date:** 2026-06-17

## Por qué la elegimos

Parseo en streaming de archivos XLSX en el módulo `imports`. Se usa `WorkbookReader` (modo streaming) sobre Bun, validado empíricamente en spike:

- RAM constante ~180 MB independientemente del tamaño del archivo (53 MB / 600k filas → pico RSS 181 MB, heap 47 MB).
- Comparativa vs. modo buffer (`Workbook.xlsx.readFile`): el buffer usa ~32x más RAM (5.7 GB para el mismo archivo) → OOM seguro con archivos grandes. Descartado.
- Estrategia de acceso: **path en disco** — el worker baja el xlsx de object storage a un archivo temporario en disco (`os.tmpdir()/imports/{importId}.xlsx`) y pasa el path al `WorkbookReader` (no un stream directo). Esto garantiza acceso random al ZIP, que es la estrategia robusta; el stream puro (storage → unzip → SAX) es frágil en Bun.

## Alternativas descartadas

- **SheetJS Community (xlsx):** no ofrece streaming real en su edición comunitaria (lee el archivo completo en RAM); la edición Pro tiene streaming pero es de pago y con licencia mixta. Descartado.
- **Modo buffer de exceljs (`Workbook.xlsx.readFile`):** 32x más RAM — OOM seguro con archivos grandes. Descartado (validado en spike).
- **SAX manual sobre el XML del sheet:** viable pero reinventa la rueda; más superficie de errores sin ganancia real dado que exceljs ya funciona.

## Notas

Caveats validados en spike (obligatorio tenerlos en cuenta al implementar):

- `row.values` es **1-indexed** — el índice 0 siempre es `null`. Mapear campos con `row.values.slice(1)` o por índice explícito.
- **Bug #2772 — filas en blanco salteadas:** `WorkbookReader` no emite eventos para filas completamente vacías. `row.number` conserva el número de fila real de Excel (permite detectar gaps). Para la ingesta de contactos esto es aceptable. **Consecuencia en resume:** usar `row.number` como ancla de checkpoint (`last_row_number`), NO un contador propio — el contador drift con las filas saltadas.
- Bug #2790 (> 100 worksheets) no validado en spike — irrelevante para ingesta de un solo sheet.
- Dep ya presente en `package.json` (instalada durante el spike). El módulo `imports` es el único consumidor.
- Limpiar el archivo temporario en `finally` del job de procesamiento (independientemente del resultado).
- Bun streams experimentales: el spike confirma que el acceso vía path funciona; el stream directo (sin path) no fue validado y puede tener comportamiento errático en Bun.
