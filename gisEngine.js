// gisEngine.js
import { AppState } from './core/AppState.js';
import { MapService } from './services/MapService.js';
import { GridService } from './services/GridService.js';
import { BaseLayerService } from './services/BaseLayerService.js';
import { LegendStyleService } from './services/LegendStyleService.js';
import { IdentifyService } from './services/IdentifyService.js';
import { LayerSelectionService } from './services/LayerSelectionService.js';
import { OpacityService } from './services/OpacityService.js';
import { ThemeLayerService } from './services/ThemeLayerService.js';
import { PolygonAnalysisService } from './services/PolygonAnalysisService.js';
import { SentinelIndexService } from './services/SentinelIndexService.js';
import { MenuRenderer } from './ui/MenuRenderer.js';
import { bindUiControls } from './ui/bindUiControls.js';

export function initGisEngine({ L, turf, geobuf, Pbf, $, Slideout, GeoTIFF, proj4 }) {
    const state = new AppState();


    const mapService = new MapService(state, L);
    const gridService = new GridService(state, L);
    const baseLayerService = new BaseLayerService(state, L, gridService);
    const legendStyleService = new LegendStyleService();
    const identifyService = new IdentifyService(state, legendStyleService, turf, L);
    const polygonAnalysisService = new PolygonAnalysisService(state, identifyService, L);
    const layerSelectionService = new LayerSelectionService(state, L, $);
    const opacityService = new OpacityService(state, $);
    const themeLayerService = new ThemeLayerService(
        state,
        legendStyleService,
        identifyService,
        L,
        geobuf,
        Pbf,
        $
    );
    const menuRenderer = new MenuRenderer(
        state,
        baseLayerService,
        themeLayerService,
        $,
        L
    );

    mapService.prepareMap();
    polygonAnalysisService.bindMapEvents();
    menuRenderer.prepareMenu();

    const sentinelIndexService = new SentinelIndexService({
        state,
        map: state.map,
        L,
        GeoTIFF,
        proj4,
        ui: {
            dateFromEl: 'sentinel-date-from',
            dateToEl: 'sentinel-date-to',
            cloudMaxEl: 'sentinel-cloud-max',
            indexSelectEl: 'sentinel-index-select',
            statusEl: 'sentinel-status',
            bboxEl: 'sentinel-bbox',
            resultEl: 'sentinel-result',
            legendTitleEl: 'sentinel-legend-title',
            legendSubtitleEl: 'sentinel-legend-subtitle',
            legendBarEl: 'sentinel-legend-bar',
            legendLabelsEl: 'sentinel-legend-labels'
        }
    });

    sentinelIndexService.bindMapEvents();

    bindUiControls({
        identifyService,
        polygonAnalysisService,
        sentinelIndexService,
        $
    });

    return {
        selectBaseLayer: (key) => baseLayerService.selectBaseLayer(key),
        selectLayer: (el) => layerSelectionService.selectLayer(el),
        selectLayersGroup: (el) => layerSelectionService.selectLayersGroup(el),
        changeOpacity: (el) => opacityService.changeOpacity(el),
        changeOpacityTiles: (el) => opacityService.changeOpacityTiles(el),
        toggleLayerGroup: (el) => layerSelectionService.toggleLayerGroup(el),
        togglePolygonAnalysisMode: () => polygonAnalysisService.toggle(),
        toggleIdentifyMode: () => identifyService.toggle(),
        runSentinelIndexForBounds: (bounds, params = {}) => sentinelIndexService.runForBounds(bounds, params),
        toggleSentinelIndexMode: () => sentinelIndexService.toggle(),
        clearSentinelIndex: () => sentinelIndexService.clearAll(),
    };
}