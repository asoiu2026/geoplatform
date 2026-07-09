// services/BaseLayerService.js
export class BaseLayerService {
    constructor(state, L, gridService) {
        this.state = state;
        this.L = L;
        this.gridService = gridService;
    }

    selectBaseLayer(key, isBackend = false) {
        const baseMaps = this.state.baseMaps;
        const map = this.state.map;
        const config = baseMaps[key];
        if (!config) return false;

        if (this.state.backendTiles) {
            this.state.backendTiles.removeFrom(map);
        }
        if (this.state.baseTiles) {
            this.state.baseTiles.removeFrom(map);
        }

        if (config.backend !== undefined && !isBackend) {
            this.selectBaseLayer(config.backend, true);
        }

        const opts = {
            maxNativeZoom: config.maxNativeZoom,
            maxZoom: 18
        };
        if (config.subdomains) {
            opts.subdomains = config.subdomains;
        }

        if (isBackend) {
            this.state.backendTiles = this.L.tileLayer(config.url, opts);
            this.state.backendTiles.addTo(map).setZIndex(-2);
        } else {
            this.state.baseTiles = this.L.tileLayer(config.url, opts);
            this.state.baseTiles.addTo(map).setZIndex(-1);
            this.state.selectedBaseLayer = config;
        }

        this.gridService.updateGrid(config.gridColor);

        return true;
    }
}