// ui/MenuRenderer.js
import { tpl2item } from './templates.js';
import { heatmapLegendTpl } from './templates.js';

export class MenuRenderer {
    constructor(state, baseLayerService, themeLayerService, $, L) {
        this.state = state;
        this.baseLayerService = baseLayerService;
        this.themeLayerService = themeLayerService;
        this.$ = $;
        this.L = L;
    }

    prepareMenu() {
        this.state.subGroups = {};
        this.state.subGroupsPolygons = {};
        this.state.thematicLayers = {};

        this._renderBaseLayers();
        this._renderTileLayers();

        this.state.numberOfLayers = this.state.legend.length;
        this.state.uploadedLayers = 0;

        this.state.grouplayerTpl = document.getElementById('grouplayer-tpl').innerHTML;
        this.state.terminallayerTpl = document.getElementById('terminallayer-tpl').innerHTML;
        this.state.terminallayercolorTpl =
            document.getElementById('terminallayercolor-tpl').innerHTML;

        this.themeLayerService.initParentGroup();
        this._renderLegendGroupsAndLoadThemes();
    }

    _renderBaseLayers() {
        const ulBase = document.getElementById('base-layers');
        const baselayerTpl = document.getElementById('baselayer-tpl').innerHTML;

        Object.values(this.state.baseMaps).forEach((baseLayer) => {
            const baselayerItem = tpl2item(
                baselayerTpl,
                ['{LAYER_ID}', '{LAYER_TITLE}'],
                [baseLayer.key, baseLayer.title]
            );

            if (baseLayer.selected) {
                this.$(baselayerItem).find('.layer-selector').attr('checked', 'checked');
                this.baseLayerService.selectBaseLayer(baseLayer.key);
            }

            ulBase.appendChild(baselayerItem);
        });
    }

    _renderTileLayers() {
        const tilesLayerTpl = document.getElementById('tileslayer-tpl').innerHTML;
        const ulTiles = document.getElementById('tiles-layers');

        Object.values(this.state.tiles).forEach((tileLayer) => {
            const tilelayerItem = tpl2item(
                tilesLayerTpl,
                ['{LAYER_ID}', '{LAYER_TITLE}'],
                [tileLayer.key, tileLayer.title]
            );
            ulTiles.appendChild(tilelayerItem);

            this.state.subGroupsPolygons[tileLayer.key] = this.L.tileLayerPixelFilter(
                tileLayer.url,
                {
                    maxNativeZoom: tileLayer.maxNativeZoom,
                    matchRGBA: [0, 0, 0, 0],
                    pixelCodes: [[192, 192, 192]]
                }
            );
        });
    }


    _buildHeatmapLegendGradient(item) {
        const gradient = item?.heatmap?.gradient;

        if (!gradient || typeof gradient !== 'object') {
            return '';
        }

        const entries = Object.keys(gradient)
            .map((key) => ({
                stop: Number(key),
                color: gradient[key]
            }))
            .filter((entry) => !Number.isNaN(entry.stop) && typeof entry.color === 'string' && entry.color.trim() !== '')
            .sort((a, b) => a.stop - b.stop);

        if (!entries.length) {
            return '';
        }

        const normalized = [];

        if (entries[0].stop > 0) {
            normalized.push({
                stop: 0,
                color: entries[0].color
            });
        }

        normalized.push(...entries);

        if (entries[entries.length - 1].stop < 1) {
            normalized.push({
                stop: 1,
                color: entries[entries.length - 1].color
            });
        }

        const stops = normalized
            .map((entry) => `${entry.color} ${entry.stop * 100}%`)
            .join(', ');

        return `linear-gradient(to right, ${stops})`;
    }
// ui/MenuRenderer.js
    _renderLegendGroupsAndLoadThemes() {
        const ulMain = document.getElementById('object-layers');

        this.state.legend.forEach((item) => {
            if (item.renderMode === 'heatmap') {
                const grouplayerItem = tpl2item(
                    this.state.grouplayerTpl,
                    ['{LAYER_ID}', '{LAYER_TITLE}'],
                    [item.id, item.title]
                );

                ulMain.appendChild(grouplayerItem);

                this.$(grouplayerItem)
                    .find('input.sellall')
                    .val(item.id);

                const gradient = this._buildHeatmapLegendGradient(item);

                const legendHtml = `
                  <li class="heatmap-legend-item">
                    <div class="heatmap-legend">
                      <div class="heatmap-legend__bar" style="background: ${gradient};"></div>
                      <div class="heatmap-legend__labels">
                        <span>Низкая</span>
                        <span>Высокая</span>
                      </div>
                    </div>
                  </li>
                `;

                this.$(grouplayerItem).find('ul').append(legendHtml);

                this.state.subGroupsPolygons[item.id] = null;

                if (!item.visible) {
                    this.$(grouplayerItem).addClass('sublayers_hidden');
                    this.$(grouplayerItem).find('input.sellall').prop('checked', false);
                } else {
                    this.$(grouplayerItem).find('input.sellall').prop('checked', true);
                }

                if (item.opacity !== true) {
                    this.$(grouplayerItem).find('.range_widget').remove();
                }

                this.themeLayerService.loadTheme(item, grouplayerItem, null);
                return;
            }

            const isVisible = item.visible;
            const grouplayerItem = tpl2item(
                this.state.grouplayerTpl,
                ['{LAYER_ID}', '{LAYER_TITLE}'],
                [item.id, item.title]
            );

            item.layers.forEach((layer) => {
                let terminallayerItem;

                if (layer.icon) {
                    terminallayerItem = tpl2item(
                        this.state.terminallayerTpl,
                        ['{LAYER_ID}', '{LAYER_ICON}', '{LAYER_TITLE}', '{LAYER_COLOR}'],
                        [layer.id, layer.icon, layer.title, layer.color]
                    );
                } else {
                    terminallayerItem = tpl2item(
                        this.state.terminallayercolorTpl,
                        ['{LAYER_ID}', '{LAYER_TITLE}', '{LAYER_COLOR}'],
                        [layer.id, layer.title, layer.color]
                    );
                }

                this.$(grouplayerItem).find('ul').append(terminallayerItem);
                this.state.subGroupsPolygons[layer.id] = this.L.featureGroup.subGroup(
                    this.state.parentGroup,
                    []
                );
            });

            const noneID = `none-${item.id}`;
            this.state.subGroupsPolygons[noneID] = this.L.featureGroup.subGroup(
                this.state.parentGroup,
                []
            );

            ulMain.appendChild(grouplayerItem);

            if (!item.visible) {
                this.$(grouplayerItem).addClass('sublayers_hidden');
                this.$(grouplayerItem).find('input.layer-selector').prop('checked', false);
                this.$(grouplayerItem).find('input.sellall').prop('checked', false);
            }

            if (item.opacity !== true) {
                this.$(grouplayerItem).find('.range_widget').remove();
            }

            this.themeLayerService.loadTheme(item, grouplayerItem, noneID);
        });
    }
}