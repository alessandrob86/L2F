import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  /* Le edge function girano su Deno, non nel browser: hanno altri globali,
     nessun tsconfig che le copra, e i loro `any` sono confini con l'esterno
     dove il tipo davvero non si conosce. Controllarle con la configurazione
     dell'applicazione produceva sette errori che nessuno poteva risolvere,
     e un controllo che non passa mai smette di essere letto. */
  globalIgnores(['dist', 'supabase/functions/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      /* Regola nata col compilatore React: segnala `setLoadingOrders(true)`
         all'inizio di un effetto che carica dati. È un consiglio di
         prestazione — un disegno in più — non un difetto: quel modo di
         scrivere un caricamento è quello normale. Resta come avviso perché
         valga la pena guardarla, non come errore che blocca tutto. */
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
