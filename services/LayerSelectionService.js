// services/LayerSelectionService.js
export class LayerSelectionService {
    constructor(state, L, $) {
        this.state = state;
        this.L = L;
        this.$ = $;
    }

    selectLayer(el) {
        const layerID = el.value;
        const layer = this.state.subGroupsPolygons[layerID];
        if (!layer) return;

        if (el.checked) {
            layer.addTo(this.state.map);
            const sellall = el.closest('li.group-li')?.querySelector('input.sellall');
            if (sellall) sellall.checked = true;
        } else {
            layer.removeFrom(this.state.map);
            const checkedBoxes = el.closest('ul')?.querySelectorAll('input:checked').length ?? 0;
            if (checkedBoxes === 0) {
                const sellall = el.closest('li.group-li')?.querySelector('input.sellall');
                if (sellall) sellall.checked = false;
            }
        }
    }

    selectLayersGroup(el) {
        const li = el.closest('li');
        const selectors = li.querySelectorAll('ul input.layer-selector');

        // special case: group without inner sublayers (heatmap / single overlay)
        if (!selectors.length) {
            const layerId = el.value;
            const layer = this.state.subGroupsPolygons[layerId];

            if (!layer) return;

            if (el.checked) {
                layer.addTo(this.state.map);
                this.$(li).removeClass('sublayers_hidden');
            } else {
                layer.removeFrom(this.state.map);
                this.$(li).addClass('sublayers_hidden');
            }

            return;
        }

        // старая логика для обычных grouped layers
        selectors.forEach((layerSelector) => {
            if (el.checked) {
                this.$(li).removeClass('sublayers_hidden');

                if (layerSelector.value in this.state.subGroupsPolygons) {
                    this.state.subGroupsPolygons[layerSelector.value].addTo(this.state.map);
                }

                layerSelector.checked = true;
            } else {
                this.$(li).addClass('sublayers_hidden');

                if (layerSelector.value in this.state.subGroupsPolygons) {
                    this.state.subGroupsPolygons[layerSelector.value].removeFrom(this.state.map);
                }

                layerSelector.checked = false;
            }
        });
    }

    toggleLayerGroup(el) {
        this.$(el).closest('li.group-li').toggleClass('sublayers_hidden');
    }
}