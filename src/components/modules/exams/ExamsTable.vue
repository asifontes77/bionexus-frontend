<template>
    <div class="width-table pa-6">
      <v-row class="mb-2">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar examen..."
            single-line
            hide-details
            dense
            outlined
            clearable
          ></v-text-field>
        </v-col>
      </v-row>

      <v-data-table
          dense
          class="table-height"
          :headers="headers"
          :items="databaseList"
          :search="search"
          :items-per-page="25"
          :footer-props="{
              'show-current-page': true,
              'show-first-last-page': true,
              'items-per-page-text': 'Elementos por página',
              'items-per-page-options': [5, 10, 15, 20, 25],
          }"
      >
          <template v-slot:[`item.annulled`]="{ item }">
              <v-icon v-if="item.annulled" color="secondary">mdi-eye-off</v-icon>
              <v-icon v-if="!item.annulled" color="primary">mdi-eye</v-icon>
          </template>
          <template v-slot:[`item.special_test`]="{ item }">
            <v-icon v-if="item.special_test === 1" color="secondary">mdi-check-decagram</v-icon>
          </template>
          <template v-slot:[`item.menu`]="{ item }">
              <v-menu bottom>
                  <template v-slot:activator="{on, attrs}">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on">
                          <v-icon color="primary">mdi-dots-vertical</v-icon>
                      </v-btn>
                  </template>
                  <v-list>
                      <v-list-item
                          v-for="(menuItem, index) in menuItems"
                          :key="index"
                          @click="$emit('menu-actions',item, menuItem.text)"
                      >   <v-list-item-icon>
                              <v-icon>{{ menuItem.icon }}</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>{{ menuItem.text }}</v-list-item-title>
                      </v-list-item>
                  </v-list>
              </v-menu>
              
          </template>
          
      </v-data-table>
    </div>
  </template>
  
  <script>
  
  export default {
      name: 'ExamsTable',
      props: {
          databaseList: {
              type: Array,
              default: () => [],
          }
      },
      data() {
          return {
              search: '',
              headers: [
                  {text: 'Activo', align: 'center', value: 'annulled', sortable: false},
                  {text: 'Descripción', align: 'start', value: 'description'},
                  {text: 'Abreviatura', align: 'start', value: 'abbreviation'},
                  {text: 'Prueba especial', align: 'center', value: 'special_test', width: '50'},
                  {text: 'Precio 1', align: 'end', value: 'cost1', sortable: false},
                  {text: 'Precio 2', align: 'end', value: 'cost2', sortable: false},
                  {text: 'Precio 3', align: 'end', value: 'cost3', sortable: false},
                  {text: 'Precio 4', align: 'end', value: 'cost4', sortable: false},
                  {text: 'Precio 5', align: 'end', value: 'cost5', sortable: false},
                  {text: 'Precio 6', align: 'end', value: 'cost6', sortable: false},
                  {text: 'Acciones', align: 'center', value: 'menu', sortable: false},
              ],
              menuItems: [{text: 'Editar', icon: 'mdi-pencil'},{text: 'Ocultar', icon: 'mdi-eye-off'}]
          }
      },
  }
  </script>
  <style scoped>
  .width-table {
      width: calc(100vw - 356px);
  }
  .table-height {
    max-height: calc(100vh - 162px);
    overflow-x: hidden;
    overflow-y: auto;
}
  </style>