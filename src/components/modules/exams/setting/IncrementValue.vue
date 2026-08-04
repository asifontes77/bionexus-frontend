<template>
    <div>
        <div class="caption gray300--text">{{ label }}</div>
        <div class="d-flex">
            <v-btn text class="btn-left px-0" @click="$emit('increment-value','menos', label)">-</v-btn>
            <input
                v-model.number="value"
                class="number-selector-input center"
                style="width: 45px"
                disabled
            />
            <v-btn text class="btn-right px-0" @click="$emit('increment-value','mas', label)">+</v-btn>
        </div>
    </div>
  </template>
  
  <script>
  export default {
      name: 'IncrementValue',
      props: {
          label: {
              type: String,
              default: '',
          },
          value: {
              type: Number,
              default: 0,
          },
      },
      methods: {},
  }
  </script>
  <style scoped>
  .btn-left {
      white-space: nowrap;
      padding: 6px 11px;
      cursor: pointer;
      border: 1px solid var(--v-gray300-base);
      vertical-align: middle;
      outline: none !important;
      border-right: none !important;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      min-width: 32px !important;
      height: 32px !important;
  }
  .btn-right {
      white-space: nowrap;
      padding: 6px 11px;
      cursor: pointer;
      border: 1px solid var(--v-gray300-base);
      vertical-align: middle;
      outline: none !important;
      border-left: none !important;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      min-width: 32px !important;
      height: 32px !important;
  }
  .number-selector-input {
      color: #7f7f7f;
      font-size: .9rem;
      background-color: #f9f9f9;
      border: 1px solid var(--v-gray300-base);
      padding: 6px 12px;
      display: inline-block;
      width: 45px;
      margin-bottom: 0;
      line-height: 18px;
      font-weight: 700;
      text-align: center;
      vertical-align: middle;
      height: 32px;
  }
  </style>