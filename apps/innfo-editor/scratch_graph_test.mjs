import { useModelStore } from './src/stores/modelStore.ts'
import { useMetamodelStore } from './src/stores/metamodelStore.ts'
import { createPinia, setActivePinia } from 'pinia'
import fs from 'fs'

// Mock DOM globals if needed for stores
import { jsdom } from 'jsdom'
const dom = new jsdom('<!DOCTYPE html><html><body></body></html>')
global.window = dom.window
global.document = dom.window.document

// Corremos una simulación de carga y resolución
console.log('Test logic initialized.')
