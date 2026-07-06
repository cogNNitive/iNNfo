import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      server: 'src/server.ts'
    },
    format: 'esm',
    clean: true,
    outDir: 'dist',
    dts: false,
    noExternal: ['@innv0/innfo-core'],
    external: ['yaml'],
  },
  {
    entry: {
      'innfo-mcp.bundle': 'src/server.ts'
    },
    format: 'esm',
    clean: false,
    outDir: 'bin',
    dts: false,
    noExternal: [/.*/],
    minify: true,
  }
])
