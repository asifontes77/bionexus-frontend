import { defineStore } from 'pinia'

export const useMigrationStore = defineStore('migration', {
  state: () => ({
    applicationName: 'Bio Nexus',
    sourceVersion: 'Vue 2.7.16',
    targetVersion: 'Vue 3.5.41',
    phase: 'Base tecnica'
  })
})
