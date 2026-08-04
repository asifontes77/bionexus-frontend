<template>
     <draggable v-model=" rows" v-bind="dragOptions" :move="onMove" handle=".item" @start="dragging = true" @end="endDragging">
        <transition-group type="transition" :name="!drag ? 'flip-list' : null">
            <div v-for="child in rows" :key="child.id" class="list-group" >
                <div class="d-flex justify-space-between align-center item">
                  <div class="d-flex align-center">
                    <div class="row-hover">
                        <v-icon color="primary">mdi-drag-vertical</v-icon>
                    </div> 
                    <div class="ml-1" style="width: 40px; cursor: move">
                        <v-icon color="primary">mdi-needle</v-icon>
                    </div>
                    <div style="width: 40px">
                        <v-btn icon color="secondary" @click="$emit('active-selected-exa',child)">
                            <v-icon>mdi-cog</v-icon>
                        </v-btn>
                    </div>
                    <div>
                        {{child.description}}
                    </div>
                  </div>
                  <div style="width: 40px">
                    <v-icon v-if="child.annulled" color="secundary">mdi-eye-off</v-icon>
                    <v-icon v-if="!child.annulled" color="primary">mdi-eye</v-icon>
                  </div>
                </div>
            </div>
        </transition-group>
    </draggable>
</template>

<script>
import draggable from 'vuedraggable'

export default {
    name: 'ExamList',
    components: { draggable },
    props: {
        rowsTmp: {
            type: Array,
            default: () => ([])
        },
    },
    data () {
      return {
        drag: false,
        rows: this.rowsTmp,
        dragging: false,
      }
    },
    computed: {
        dragOptions() {
            return {
            animation: 200,
            group: "description",
            disabled: false,
            ghostClass: "ghost"
            };
        },
    },
    watch: {
      isDragging(newValue) {
        if (newValue) {
          this.delayedDragging = true;
          return;
        }
        this.$nextTick(() => {
          this.delayedDragging = false;
        });
      }
    },
    methods: {
        endDragging() {
            this.dragging = false
            this.$emit('change-row', this.rows)
        },
        onMove({ relatedContext, draggedContext }) {
            const relatedElement = relatedContext.element
            const draggedElement = draggedContext.element
            return (
                (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
            )
        },
    },
}
</script>
<style scoped>
.item {
  background-color: white;
  height: 40px;
}
.item.active {
  background-color: #D3DEE1;
}
.rotate {
  transform: rotate(-180deg)
}
.item-child {
  background-color: white;
  height: 40px;
}
.row-hover {
  display: none;
  cursor: move;
}
.list-group:hover>.item {
  background-color: var(--v-gray-base) !important;
}
.list-group:hover .row-hover {
  display: block;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
</style>
