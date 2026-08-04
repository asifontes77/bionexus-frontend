<template>
  <v-hover>
    <template v-slot:default="{ hover }">
        <div
            class="over-active"
            :class="itemContent.active ? 'content-active' : ''"
            style="z-index: 100; background-color: transparent"
        >
            <v-fade-transition>
                <v-overlay
                    v-if="hover"
                    absolute
                    color="#E6E0E9"
                    style="display: block; border: 2px solid var(--v-primary-base)"
                >
                    <div class="content-label">{{ labelList[itemContent.type] }}</div>
                    <div class="btn-setting">
                        <v-icon @click="$emit('content-active', itemContent)">
                            mdi-cog-outline
                        </v-icon>
                    </div>
                </v-overlay>
            </v-fade-transition>
            <div
                v-if="itemContent.type === 'label'"
                style="background: transparent; padding: 5px 10px; font-size: 12px;"
                v-html="itemContent.text"
            >
            </div>
            <div v-if="itemContent.type === 'variable'" style="background: transparent; border: 1px solid gray; border-radius: 4px; padding: 5px 10px; font-size: 12px;">
                {{ itemContent.value }}
            </div>
            <div v-if="itemContent.type === 'formula'" style="background: transparent; border: 1px solid gray; border-radius: 4px; padding: 5px 10px; font-size: 12px;">
                {{ itemContent.value }}
            </div>
            <div
                v-if="itemContent.type === 'description'"
                style="background: transparent; padding: 5px 0; font-size: 12px;"
                v-html="itemContent.text"
            >
            </div>
            <div
                v-if="itemContent.type === 'units'"
                style="background: transparent; padding: 5px 0 5px 3px; font-size: 12px;"
                v-html="itemContent.text"
            >
            </div>
            <div 
                v-if="itemContent.type === 'vr'"
                style="background: transparent; padding: 5px 0; font-size: 12px;"
                v-html="itemContent.text"
            >
            </div>
        </div>
    </template>
  </v-hover>
</template>

<script>
export default {
  props: {
    itemContent: {
        type: Object,
        default: () => ({}),
    },
    indexCol: {
        type: Number,
        default: 0,
    },
    indexContent: {
        type: Number,
        default: 0,
    },
  },
  data() {
    return {
        labelList: {description: 'Descripción', variable: 'Variable', units: 'Unidades', vr: 'VR'},
    }
  },
}
</script>

<style scoped>

.content-active {
    border: 2px solid var(--v-primary-base);
    background-color: #e6e0e9 !important;
}
.content-label {
    display: flex;
    display: -ms-flexbox;
    align-items: center;
    -ms-flex-align: center;
    justify-content: center;
    -ms-flex-pack: center;
    position: absolute;
    top: -22px;
    right: 0;
    padding: 3px 5px;
    width: 75px;
    color: #fff;
    font-size: 10px;
    text-align: center;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 1px 1px 0 0;
    background-color: var(--v-primary-base);
    pointer-events: none;
    z-index: 8;
}
.icon-move {
    display: flex;
    flex-direction: column;
    align-content: space-around;
    position: absolute;
    left: 0;
    top: 0;
    cursor: -webkit-grab;
    cursor: grab;
    z-index: 3;
}

.btn-setting {
    display: inline-block;
    position: absolute;
    background: var(--v-primary-base);
    top: 0;
    right: 0;
    padding: 0 8px;
    z-index: 4;
    line-height: 30px;
}
.btn-setting:hover {
    background-color: #5db7ca;
}
.StageModuleVideo {
    position: absolute;
    white-space: nowrap;
    vertical-align: middle;
    text-align: left;
    line-height: 100% !important;
    left: 50%;
    top: 0;
    bottom: 0;
}
.StageModuleVideo-1sfIa {
    height: 100%;
    display: inline-block;
    vertical-align: middle;
}
.StageModuleVideo > img {
    margin-left: -50%;
    display: inline-block;
    vertical-align: middle;
}
.over-active:hover {
    min-height: 50px;
}
</style>
