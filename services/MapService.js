// services/MapService.js
export class MapService {
    constructor(state, L) {
        this.state = state;
        this.L = L;
    }

    prepareMap() {
        document.title = 'Метагеосистемы Мордовии';
        document.portal_id = 1;

        this.state.map = this.L.map('map', {
            attributionControl: false,
            zoomControl: false,
            minZoom: 7,
            maxZoom: 18
        }).setView([54.685543, 45.174236], 8);

        this.state.analysisPolygonGroup = new this.L.FeatureGroup();
        this.state.map.addLayer(this.state.analysisPolygonGroup);

        this.L.control.zoom({ position: 'bottomright' }).addTo(this.state.map);
        this.L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(this.state.map);

        requestAnimationFrame(() => {
            this.state.map.invalidateSize(true);
        });

        setTimeout(() => {
            this.state.map.invalidateSize(true);
        }, 200);


    }
}