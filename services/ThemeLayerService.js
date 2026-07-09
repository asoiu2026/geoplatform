// services/ThemeLayerService.js
import { tpl2item } from '../ui/templates.js';

export class ThemeLayerService {
    constructor(state, legendStyleService, identifyService, L, geobuf, Pbf, $) {
        this.state = state;
        this.legend = legendStyleService;
        this.identify = identifyService;
        this.L = L;
        this.geobuf = geobuf;
        this.Pbf = Pbf;
        this.$ = $;
    }

    initParentGroup() {
        this.state.parentGroup = this.L.markerClusterGroup({
            disableClusteringAtZoom: 11,
            maxClusterRadius: 100
        });
        this.state.parentGroup.addTo(this.state.map);
    }

    loadTheme(item, grouplayerItem, noneID = null) {
        return fetch(item.source, { method: 'GET' })
            .then((res) => res.arrayBuffer())
            .then((responseData) => {
                const decoded = this.geobuf.decode(new this.Pbf(responseData));
                const x = JSON.parse(JSON.stringify(decoded));

                if (item.renderMode === 'heatmap') {
                    return this._loadHeatmapTheme(item, x, grouplayerItem);
                }

                return this._loadVectorTheme(item, x, grouplayerItem, noneID);
            });
    }

    _loadHeatmapTheme(item, geojson, grouplayerItem) {
        const points = this._extractHeatPoints(geojson);
        const heatmapConfig = item.heatmap || {};

        const initialOpacity =
            typeof heatmapConfig.minOpacity === 'number'
                ? heatmapConfig.minOpacity
                : 1;

        const heatLayer = new HeatmapOverlay({
            radius: heatmapConfig.radius,
            maxOpacity: heatmapConfig.maxOpacity,
            minOpacity: heatmapConfig.minOpacity,
            scaleRadius: heatmapConfig.scaleRadius,
            useLocalExtrema: heatmapConfig.useLocalExtrema,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count',
            gradient: heatmapConfig.gradient
        });

        heatLayer.setData({
            max: heatmapConfig.max,
            data: points.map((p) => ({
                lat: p.lat,
                lng: p.lng,
                count: p.intensity
            }))
        });

        this.state.subGroupsPolygons[item.id] = heatLayer;
        this.state.thematicLayers[item.id] = {
            type: 'heatmap',
            layer: heatLayer,
            meta: item,
            points
        };

        if (item.visible) {
            heatLayer.addTo(this.state.map);

            requestAnimationFrame(() => {
                if (heatLayer._el) {
                    heatLayer._el.style.opacity = String(initialOpacity);
                }
            });
        }

        this.state.uploadedLayers++;
        this.$(`#loader-widget-${item.id}`).remove();

        return heatLayer;
    }

    _loadVectorTheme(item, geojson, grouplayerItem, noneID) {
        const geoJsonLayer = this.L.geoJson(geojson, {
            style: (feature) => this._styleFeature(item, feature),
            pointToLayer: (feature, coordinates) =>
                this._pointToLayer(item, feature, coordinates),
            onEachFeature: (feature, featureLayer) =>
                this._onEachFeature(item, feature, featureLayer, noneID)
        });

        this.state.thematicLayers[item.id] = {
            type: 'vector',
            geoJson: geoJsonLayer,
            meta: item
        };

        if (item.visible) {
            item.layers.forEach((l) => {
                this.state.subGroupsPolygons[l.id].addTo(this.state.map);
            });
            this.state.subGroupsPolygons[noneID].addTo(this.state.map);
        }

        this.state.uploadedLayers++;
        this.$(`#loader-widget-${item.id}`).remove();

        if (noneID && this.state.subGroupsPolygons[noneID].getLayers().length) {
            const terminallayerItem = tpl2item(
                this.state.terminallayercolorTpl,
                ['{LAYER_ID}', '{LAYER_TITLE}', '{LAYER_COLOR}'],
                [noneID, 'Неклассифицировано', '#999999']
            );
            this.$(grouplayerItem).find('ul').append(terminallayerItem);
        }

        return geoJsonLayer;
    }

    _extractHeatPoints(geojson) {
        const points = [];

        if (!geojson || !Array.isArray(geojson.features)) {
            return points;
        }

        geojson.features.forEach((feature) => {
            if (!feature || !feature.geometry) return;

            const geometry = feature.geometry;

            if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
                const [lng, lat] = geometry.coordinates;
                points.push({ lat, lng, intensity: 1, feature });
            }

            if (geometry.type === 'MultiPoint' && Array.isArray(geometry.coordinates)) {
                geometry.coordinates.forEach((coords) => {
                    const [lng, lat] = coords;
                    points.push({ lat, lng, intensity: 1, feature });
                });
            }
        });

        return points;
    }

    _styleFeature(item, feature) {
        const currentLayer = this.legend.findLayer(item, feature);

        if (currentLayer) {
            return this.legend.buildPolygonStyle(currentLayer);
        }

        return {
            fillColor: '#999999',
            weight: 2,
            fillOpacity: 1,
            opacity: 1
        };
    }

    _pointToLayer(item, feature, coordinates) {
        const currentLayer = this.legend.findLayer(item, feature);
        const popupContent = this.legend.popupContentBuild(item, currentLayer, feature);

        let itemColor = '#999999';
        let currentIcon = '';
        if (currentLayer) {
            itemColor = currentLayer.color;
            currentIcon = currentLayer.icon;
        }

        const customicon = this.L.divIcon({
            className: 'custom-div-icon',
            html:
                "<div style='background:" +
                itemColor +
                ";' class='marker-pin'></div><i class=\"marker-icon " +
                currentIcon +
                '\"></i>',
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -35]
        });

        const marker = this.L.marker(coordinates, {
            icon: customicon,
            bubblingMouseEvents: true
        }).bindPopup(popupContent, {
            className: 'modern-popup',
            maxHeight: '300',
            minWidth: '300',
            autoClose: true,
            closeOnClick: true,
            autoPan: false
        });

        marker.on('click', (e) => {
            if (this.state.identifyMode) {
                return this.identify.identifyFromLayerClick(e);
            }
        });

        return marker;
    }

    _onEachFeature(item, feature, featureLayer, noneID) {
        const currentLayer = this.legend.findLayer(item, feature);
        const popupContent = this.legend.popupContentBuild(item, currentLayer, feature);

        featureLayer.bindPopup(popupContent, {
            className: 'modern-popup',
            maxHeight: '300',
            minWidth: '300',
            autoClose: true,
            closeOnClick: true,
            autoPan: false
        });

        featureLayer.on('click', (e) => {
            if (this.state.identifyMode) {
                return this.identify.identifyFromLayerClick(e);
            }
        });

        if (item.deny_attr) {
            const code = featureLayer.feature.properties[item.deny_attr];
            if (item.deny_list && item.deny_list.includes(code)) {
                return;
            }
        }

        if (currentLayer) {
            this.state.subGroupsPolygons[currentLayer.id].addLayer(featureLayer);
        } else if (noneID) {
            this.state.subGroupsPolygons[noneID].addLayer(featureLayer);
        }

        if (currentLayer && currentLayer.front === true) {
            setInterval(() => {
                featureLayer.bringToFront();
            }, 500);
        }
    }
}