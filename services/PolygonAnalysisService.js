// services/PolygonAnalysisService.js
export class PolygonAnalysisService {
    constructor(state, identifyService, L) {
        this.state = state;
        this.identifyService = identifyService;
        this.L = L;
    }

    disable() {
        this.state.polygonAnalysisMode = false;

        const btn = document.getElementById('polygon-analysis-toggle');
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa fa-draw-polygon" aria-hidden="true"></i><span>Анализ по полигону</span>';
        }

        if (this.state.analysisDrawHandler) {
            this.state.analysisDrawHandler.disable();
            this.state.analysisDrawHandler = null;
        }

        if (this.state.map && this.state.map.getContainer) {
            const container = this.state.map.getContainer();
            container.style.cursor = '';
            container.classList.remove('polygon-analysis-mode');
        }
    }

    enable() {
        if (this.state.identifyMode) {
            this.identifyService.disable();
        }

        this.state.polygonAnalysisMode = true;

        const btn = document.getElementById('polygon-analysis-toggle');
        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa fa-draw-polygon" aria-hidden="true"></i><span>Нарисуйте полигон...</span>';
        }

        if (this.state.map && this.state.map.getContainer) {
            const container = this.state.map.getContainer();
            container.style.cursor = 'crosshair';
            container.classList.add('polygon-analysis-mode');
        }

        if (this.state.analysisDrawHandler) {
            this.state.analysisDrawHandler.disable();
        }

        this.state.analysisDrawHandler = new this.L.Draw.Polygon(this.state.map, {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
                color: '#2563eb',
                weight: 2,
                fillColor: '#60a5fa',
                fillOpacity: 0.15
            }
        });

        this.state.analysisDrawHandler.enable();
    }

    toggle() {
        if (this.state.polygonAnalysisMode) {
            this.disable();
            return;
        }

        this.enable();
    }

    bindMapEvents() {
        this.state.map.on(this.L.Draw.Event.CREATED, (e) => {
            if (e.layerType !== 'polygon') return;

            if (this.state.analysisPolygonGroup) {
                this.state.analysisPolygonGroup.clearLayers();
                this.state.analysisPolygonGroup.addLayer(e.layer);
            }

            this.state.analysisPolygon = e.layer;

            e.layer.on('click', () => {
                this.identifyService.runAtPolygonLayer(e.layer);
            });

            this.disable();
            this.identifyService.runAtPolygonLayer(e.layer);
        });
    }
}