// services/OpacityService.js
export class OpacityService {
    constructor(state, $) {
        this.state = state;
        this.$ = $;
    }

    normalizeOpacity(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 1;
        return Math.max(0, Math.min(1, num));
    }

    isHeatmapLayer(layer) {
        return !!(layer && typeof layer.setData === 'function');
    }

    applyHeatmapOpacity(layer, value) {

        const opacity = this.normalizeOpacity(value);

        if (!layer) return;

        if (layer._el && layer._el.style) {
            layer._el.style.opacity = String(opacity);
            return;
        }

        if (layer._canvas && layer._canvas.style) {
            layer._canvas.style.opacity = String(opacity);
            return;
        }

        if (typeof layer.setOptions === 'function') {
            layer.setOptions({ minOpacity: opacity });

            if (typeof layer._redraw === 'function') {
                layer._redraw();
            } else if (typeof layer.redraw === 'function') {
                layer.redraw();
            }
        }
    }

    applyVectorOpacity(layer, value) {
        const opacity = this.normalizeOpacity(value);

        if (layer && layer.setStyle) {
            layer.setStyle({
                opacity,
                fillOpacity: opacity
            });
        }
    }

    changeOpacity(el) {
        const value = this.normalizeOpacity(this.$(el).val());
        const selectors = el.closest('li').querySelectorAll('ul input.layer-selector');

        if (selectors.length) {
            selectors.forEach((layerSelector) => {
                const layerValue = layerSelector.value;
                const layer = this.state.subGroupsPolygons[layerValue];

                if (!layer) return;

                if (this.isHeatmapLayer(layer)) {
                    this.applyHeatmapOpacity(layer, value);
                    return;
                }

                if (layer.setStyle) {
                    this.applyVectorOpacity(layer, value);
                }
            });

            return;
        }

        const layerId = this.$(el).data('id');
        const layer = this.state.subGroupsPolygons[layerId];

        if (!layer) return;

        if (this.isHeatmapLayer(layer)) {
            this.applyHeatmapOpacity(layer, value);
            return;
        }

        if (layer.setStyle) {
            this.applyVectorOpacity(layer, value);
            return;
        }

        if (layer.setOpacity) {
            layer.setOpacity(value);
        }
    }

    changeOpacityTiles(el) {
        const value = this.normalizeOpacity(this.$(el).val());
        const layerId = this.$(el).data('id');
        const layer = this.state.subGroupsPolygons[layerId];

        if (!layer) return;

        if (this.isHeatmapLayer(layer)) {
            this.applyHeatmapOpacity(layer, value);
            return;
        }

        if (layer.setOpacity) {
            layer.setOpacity(value);
        }
    }
}