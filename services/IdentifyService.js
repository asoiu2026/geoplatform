// services/IdentifyService.js
import { escapeHtml } from '../ui/templates.js';

import {
    renderPolygonIdentifyTemplate,
    renderPointIdentifyTemplate
} from '../templates/analysisTemplates.js';

export class IdentifyService {
    constructor(state, legendStyleService, turf, L) {
        this.state = state;
        this.legend = legendStyleService;
        this.turf = turf;
        this.L = L;
        this.initAnalysisOverlay();
    }

    disable() {
        this.state.identifyMode = false;

        const btn = document.getElementById('identify-toggle');
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa fa-crosshairs" aria-hidden="true"></i><span>Сводные данные по точке</span>';
        }

        if (this.state.map && this.state.map.getContainer) {
            const container = this.state.map.getContainer();
            container.style.cursor = '';
            container.classList.remove('identify-mode');
        }

        if (this.state.identifyClickHandler && this.state.map) {
            this.state.map.off('click', this.state.identifyClickHandler);
            this.state.identifyClickHandler = null;
        }
    }

    toggle() {
        if (this.state.identifyMode) {
            this.disable();
            return;
        }

        this.state.identifyMode = true;

        const btn = document.getElementById('identify-toggle');
        if (btn) {
            btn.classList.add('active');
            btn.innerText = 'Кликните по карте...';
        }

        if (this.state.map && this.state.map.getContainer) {
            const container = this.state.map.getContainer();
            container.style.cursor = 'crosshair';
            container.classList.add('identify-mode');
        }

        this.state.identifyClickHandler = (e) => {
            if (!this.state.identifyMode) return;
            this.runAtLatLng(e.latlng);
            this.disable();
        };

        this.state.map.on('click', this.state.identifyClickHandler);
    }

    shouldIncludeTheme(themeId) {
        if (!this.state.identifyConfig) return false;
        if (!Object.prototype.hasOwnProperty.call(this.state.identifyConfig, themeId)) return false;

        const cfg = this.state.identifyConfig[themeId];
        return !!cfg && cfg.enabled !== false;
    }

    runAtLatLng(latlng) {
        const popup = this.openLoadingPopup(
            latlng,
            'Считаем статистику',
            'Анализируем объекты в точке',
            280
        );

        setTimeout(() => {
            const results = [];

            Object.keys(this.state.thematicLayers).forEach((themeId) => {
                const themeData = this.state.thematicLayers[themeId];
                if (!themeData || !themeData.meta) return;

                if (themeData.type === 'heatmap') {
                    if (!this.state.identifyConfig ||
                        !Object.prototype.hasOwnProperty.call(this.state.identifyConfig, themeId)) {
                        return;
                    }

                    const cfg = this.state.identifyConfig[themeId];
                    if (cfg.enabled === false) return;

                    const densityInfo = this.calculateHeatDensity(themeData, latlng);
                    if (!densityInfo) return;

                    results.push({
                        themeId,
                        title: themeData.meta.title,
                        mode: 'heatmap',
                        densityInfo
                    });
                    return;
                }

                if (!themeData.geoJson) return;

                if (!this.shouldIncludeTheme(themeId)) return;

                const item = themeData.meta;
                const geoJsonLayer = themeData.geoJson;
                const matches = [];

                geoJsonLayer.eachLayer((featureLayer) => {
                    if (!featureLayer?.feature?.geometry) return;

                    const geomType = featureLayer.feature.geometry.type;
                    if (geomType === 'Point' || geomType === 'MultiPoint') return;
                    if (!this.identifyPointMatch(featureLayer, latlng)) return;

                    const feature = featureLayer.feature;
                    const currentLayer = this.legend.findLayer(item, feature);
                    const properties = this.buildIdentifyProperties(themeId, item, feature);

                    matches.push({
                        feature,
                        layerId: currentLayer ? currentLayer.id : null,
                        layerTitle: currentLayer ? currentLayer.title : null,
                        layerColor: currentLayer ? currentLayer.color : '#999999',
                        layerBorder: currentLayer?.border || '#666666',
                        properties
                    });
                });

                const nearestPointMatch = this.findNearestPointMatchInTheme(themeId, geoJsonLayer, item, latlng);
                if (nearestPointMatch) {
                    matches.push(nearestPointMatch);
                }

                if (matches.length) {
                    results.push({
                        themeId,
                        title: item.title,
                        matches
                    });
                }
            });

            const aggregations = this.computeAggregationProfiles(results, 'point');
            const html = this.buildIdentifyPopup(results, latlng, aggregations);

            if (this.state.map && popup) {
                this.state.map.closePopup(popup);
            }
            this.openAnalysisOverlay(html, 'Результаты анализа точки');
        }, 0);
    }

    runAtPolygonLayer(layer) {
        if (!layer || !layer.toGeoJSON) return;

        const center = layer.getBounds ? layer.getBounds().getCenter() : null;
        if (!center) return;

        const popup = this.openLoadingPopup(
            center,
            'Считаем сводку по полигону',
            'Анализируем объекты в пределах контура',
            300
        );

        setTimeout(() => {
            const polygonFeature = layer.toGeoJSON();
            this.state.lastAnalysisPolygonFeature = polygonFeature;
            const results = [];

            Object.keys(this.state.thematicLayers || {}).forEach((themeId) => {
                const themeData = this.state.thematicLayers[themeId];

                if (!themeData || !themeData.meta) return;
                if (!this.shouldIncludeTheme(themeId)) return;

                if (themeData.type === 'heatmap') {
                    const heatResult = this.summarizeHeatmapInPolygon(themeData, polygonFeature);
                    if (heatResult) {
                        results.push({
                            themeId,
                            title: themeData.meta.title,
                            mode: 'heatmap-polygon',
                            summary: heatResult
                        });
                    }
                    return;
                }

                if (!themeData.geoJson) return;

                const geomSummary = this.summarizeGeoJsonInPolygon(themeId, themeData, polygonFeature);
                if (geomSummary && geomSummary.items.length) {
                    results.push({
                        themeId,
                        title: themeData.meta.title,
                        mode: 'polygon-summary',
                        summary: geomSummary
                    });
                }
            });

            const aggregations = this.computeAggregationProfiles(results, 'polygon');
            this.state.lastPolygonAggregations = aggregations;

            const profileId = Array.isArray(aggregations) && aggregations.length
                ? aggregations[0].id
                : null;

            if (profileId) {
                const cellSizeMeters = this.getAdaptiveCellSizeMeters(polygonFeature, {
                    minCellSize: 150,
                    maxCellSize: 2000,
                    targetCells: 180
                });

                // this.renderPolygonIntegralGrid(polygonFeature, profileId, cellSizeMeters);
                this.renderPolygonIntegralSampleMap(polygonFeature, profileId);
            } else {
                this.clearAggregationOverlayGroup();
            }

            const html = this.buildPolygonIdentifyPopup(results, polygonFeature, aggregations);

            if (this.state.map && popup) {
                this.state.map.closePopup(popup);
            }

            this.openAnalysisOverlay(html, 'Результаты анализа полигона');
        }, 0);
    }

    summarizeHeatmapInPolygon(themeData, polygonFeature) {
        const points = Array.isArray(themeData.points) ? themeData.points : [];
        const heatmapCfg = themeData.meta?.heatmap || {};
        const identifyCfg = heatmapCfg.identify || {};

        const areaUnit = identifyCfg.areaUnit || 'km2';
        const decimals = Number.isFinite(Number(identifyCfg.decimals))
            ? Number(identifyCfg.decimals)
            : 2;

        let count = 0;

        points.forEach((point) => {
            if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;

            const pt = this.turf.point([point.lng, point.lat]);
            const inside = this.turf.booleanPointInPolygon(pt, polygonFeature);

            if (inside) {
                count += 1;
            }
        });

        const areaSqMeters = this.turf.area(polygonFeature);
        const area = this.convertAreaFromSqMeters(areaSqMeters, areaUnit);

        if (!Number.isFinite(area) || area <= 0) return null;

        const density = count / area;

        return {
            count,
            area: Number(area.toFixed(decimals)),
            areaUnit,
            density,
            densityText: density.toFixed(decimals)
        };
    }

    summarizeGeoJsonInPolygon(themeId, themeData, polygonFeature) {
        const item = themeData.meta;
        const summaryMap = new Map();

        themeData.geoJson.eachLayer((featureLayer) => {
            if (!featureLayer?.feature?.geometry) return;

            const feature = featureLayer.feature;
            const geomType = feature.geometry.type;
            const currentLayer = this.legend.findLayer(item, feature);

            const layerId = currentLayer?.id ?? 'unknown';
            const layerTitle = currentLayer ? currentLayer.title : 'Неклассифицировано';
            const layerColor = currentLayer ? currentLayer.color : '#999999';
            const layerBorder = currentLayer?.border || '#666666';
            const key = `${layerTitle}__${layerColor}__${layerBorder}`;

            if (geomType === 'Point' || geomType === 'MultiPoint') {
                let inside = false;

                try {
                    if (geomType === 'Point') {
                        inside = this.turf.booleanPointInPolygon(feature, polygonFeature);
                    } else {
                        inside = feature.geometry.coordinates.some((coords) =>
                            this.turf.booleanPointInPolygon(this.turf.point(coords), polygonFeature)
                        );
                    }
                } catch (e) {
                    inside = false;
                }

                if (!inside) return;

                if (!summaryMap.has(key)) {
                    summaryMap.set(key, {
                        layerId,
                        layerTitle,
                        layerColor,
                        layerBorder,
                        count: 0,
                        area: 0
                    });
                }

                summaryMap.get(key).count += 1;
                return;
            }

            if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
                let intersection = null;

                try {
                    intersection = this.turf.intersect(feature, polygonFeature);
                } catch (e) {
                    intersection = null;
                }

                if (!intersection) return;

                const intersectionArea = this.turf.area(intersection);
                if (!intersectionArea || intersectionArea <= 0) return;

                if (!summaryMap.has(key)) {
                    summaryMap.set(key, {
                        layerId,
                        layerTitle,
                        layerColor,
                        layerBorder,
                        count: 0,
                        area: 0
                    });
                }

                const bucket = summaryMap.get(key);
                bucket.count += 1;
                bucket.area += intersectionArea;
            }
        });

        const polygonAreaSqMeters = this.turf.area(polygonFeature);

        const items = Array.from(summaryMap.values())
            .map((entry) => {
                const share = polygonAreaSqMeters > 0 ? entry.area / polygonAreaSqMeters : 0;

                return {
                    ...entry,
                    areaSqMeters: entry.area,
                    share,
                    sharePercent: share * 100,
                    fragmentationLabel:
                        entry.count === 1
                            ? 'Цельный массив'
                            : entry.count <= 3
                                ? 'Несколько массивов'
                                : 'Фрагментировано'
                };
            })
            .sort((a, b) => {
                if (b.share !== a.share) return b.share - a.share;
                if (b.areaSqMeters !== a.areaSqMeters) return b.areaSqMeters - a.areaSqMeters;
                return a.layerTitle.localeCompare(b.layerTitle, 'ru');
            });

        return {
            polygonAreaSqMeters,
            dominantItem: items[0] || null,
            items
        };
    }

    convertAreaFromSqMeters(areaSqMeters, areaUnit) {
        switch (areaUnit) {
            case 'm2':
                return areaSqMeters;
            case 'ha':
                return areaSqMeters / 10000;
            case 'km2':
                return areaSqMeters / 1000000;
            default:
                return areaSqMeters / 1000000;
        }
    }

    formatAreaUnit(areaUnit) {
        switch (areaUnit) {
            case 'm2':
                return 'м²';
            case 'ha':
                return 'га';
            case 'km2':
                return 'км²';
            default:
                return areaUnit;
        }
    }

    formatDensityLabel(areaUnit) {
        return `объектов/${this.formatAreaUnit(areaUnit)}`;
    }

    calculateHeatDensity(themeData, latlng) {
        const points = Array.isArray(themeData.points) ? themeData.points : [];
        const heatmapCfg = themeData.meta?.heatmap || {};
        const identifyCfg = heatmapCfg.identify || {};

        const radiusMeters = Number(identifyCfg.radiusMeters ?? 1000);
        const areaUnit = identifyCfg.areaUnit || 'km2';
        const decimals = Number.isFinite(Number(identifyCfg.decimals))
            ? Number(identifyCfg.decimals)
            : 2;
        const showCount = identifyCfg.showCount !== false;

        if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
            return null;
        }

        let count = 0;

        points.forEach((point) => {
            if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;

            const pointLatLng = this.L.latLng(point.lat, point.lng);
            const distanceMeters = latlng.distanceTo(pointLatLng);

            if (distanceMeters <= radiusMeters) {
                count += 1;
            }
        });

        const areaSqMeters = Math.PI * radiusMeters * radiusMeters;
        const area = this.convertAreaFromSqMeters(areaSqMeters, areaUnit);

        if (!Number.isFinite(area) || area <= 0) {
            return null;
        }

        const density = count / area;

        return {
            count,
            radiusMeters,
            area: Number(area.toFixed(decimals)),
            areaUnit,
            density,
            densityText: density.toFixed(decimals),
            showCount
        };
    }

    buildIdentifyPopup(results, latlng, aggregations = []) {
        return renderPointIdentifyTemplate({
            results,
            latlng,
            aggregations,
            formatAreaUnit: this.formatAreaUnit.bind(this),
            formatDensityLabel: this.formatDensityLabel.bind(this)
        });
    }

    buildPolygonIdentifyPopup(results, polygonFeature, aggregations = []) {
        const polygonAreaSqMeters = this.turf.area(polygonFeature);
        const polygonAreaKm2 = polygonAreaSqMeters / 1000000;

        return renderPolygonIdentifyTemplate({
            results,
            aggregations,
            polygonAreaKm2,
            formatAreaUnit: this.formatAreaUnit.bind(this),
            formatDensityLabel: this.formatDensityLabel.bind(this)
        });
    }

    buildIdentifyProperties(themeId, item, feature) {
        const cfg = this.state.identifyConfig && this.state.identifyConfig[themeId];
        const propsList = (cfg && Array.isArray(cfg.properties) && cfg.properties.length)
            ? cfg.properties
            : (Array.isArray(item.properties) ? item.properties : []);

        return propsList.reduce((acc, currentProperty) => {
            let label = currentProperty;
            if (item.aliases && item.aliases[currentProperty] !== undefined) {
                label = item.aliases[currentProperty];
            }

            const value = feature.properties[currentProperty];
            if (!['', undefined, 'null', null, 'Не заполнено'].includes(value)) {
                acc.push({ key: currentProperty, label, value });
            }

            return acc;
        }, []);
    }

    findNearestPointMatchInTheme(themeId, geoJsonLayer, item, latlng) {
        let nearestMatch = null;
        let minDistance = Infinity;

        geoJsonLayer.eachLayer((featureLayer) => {
            if (!featureLayer?.feature?.geometry) return;

            const geomType = featureLayer.feature.geometry.type;
            if (geomType !== 'Point' && geomType !== 'MultiPoint') return;
            if (!featureLayer.getLatLng) return;

            const pointLatLng = featureLayer.getLatLng();
            if (!pointLatLng) return;

            const distance = latlng.distanceTo(pointLatLng);
            if (distance < minDistance) {
                minDistance = distance;

                const feature = featureLayer.feature;
                const currentLayer = this.legend.findLayer(item, feature);
                const properties = this.buildIdentifyProperties(themeId, item, feature);

                nearestMatch = {
                    feature,
                    layerTitle: currentLayer ? currentLayer.title : null,
                    layerColor: currentLayer ? currentLayer.color : '#999999',
                    layerBorder: currentLayer?.border || '#666666',
                    layerId: currentLayer ? currentLayer.id : null,
                    properties,
                    distance
                };
            }
        });

        if (nearestMatch && minDistance > 1000) {
            return null;
        }

        return nearestMatch;
    }

    identifyPointMatch(featureLayer, latlng) {
        if (!featureLayer?.feature?.geometry) return false;
        const geomType = featureLayer.feature.geometry.type;

        if (geomType === 'Point' || geomType === 'MultiPoint') {
            const flLatLng = featureLayer.getLatLng ? featureLayer.getLatLng() : null;
            return flLatLng ? latlng.distanceTo(flLatLng) <= 200 : false;
        }

        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
            if (featureLayer.getBounds) {
                try {
                    if (!featureLayer.getBounds().contains(latlng)) return false;
                } catch (e) {}
            }

            try {
                const pt = this.turf.point([latlng.lng, latlng.lat]);
                return this.turf.booleanPointInPolygon(pt, featureLayer.feature);
            } catch (e) {
                return false;
            }
        }

        if (geomType === 'LineString' || geomType === 'MultiLineString') {
            if (!featureLayer.getBounds) return false;
            try {
                return featureLayer.getBounds().contains(latlng);
            } catch (e) {
                return false;
            }
        }

        return false;
    }

    identifyFromLayerClick(e) {
        if (!this.state.identifyMode) return false;

        if (e) {
            this.L.DomEvent.stop(e);
            if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }
        }

        if (e && e.latlng) {
            this.runAtLatLng(e.latlng);
        } else if (e?.target?.getLatLng) {
            this.runAtLatLng(e.target.getLatLng());
        }

        this.disable();
        return false;
    }

    buildLoadingHtml(title = 'Считаем статистику', hint = 'Это может занять несколько секунд') {
        return `
        <div class="identify-loading">
            <div class="identify-loading__spinner"></div>
            <div class="identify-loading__text">
                <div class="identify-loading__title">${escapeHtml(title)}</div>
                <div class="identify-loading__hint">${escapeHtml(hint)}</div>
            </div>
        </div>
    `;
    }

    openLoadingPopup(latlng, title, hint, minWidth = 280) {
        if (!this.state.map) return null;

        const popup = this.L.popup({
            maxHeight: 400,
            minWidth,
            autoClose: true,
            closeOnClick: true,
            autoPan: true,
            className: 'modern-popup'
        });

        popup
            .setLatLng(latlng)
            .setContent(this.buildLoadingHtml(title, hint))
            .openOn(this.state.map);

        return popup;
    }

    initAnalysisOverlay() {
        const overlay = document.getElementById('analysisOverlay');
        if (!overlay) return;

        if (overlay.dataset.initialized === '1') return;

        overlay.addEventListener('click', (event) => {
            const closeTrigger = event.target.closest('[data-analysis-close]');
            if (closeTrigger) {
                this.closeAnalysisOverlay();
                return;
            }

            const showOnMapTrigger = event.target.closest('[data-show-aggregation-on-map]');
            if (showOnMapTrigger) {
                const profileId = showOnMapTrigger.dataset.showAggregationOnMap;
                if (!profileId) return;

                this.showAggregationOnMap(profileId, showOnMapTrigger);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAnalysisOverlay();
            }
        });

        overlay.dataset.initialized = '1';
    }

    getFeatureCenterLatLng(feature) {
        if (!feature) return null;

        try {
            const centerFeature = this.turf.center(feature);
            const coords = centerFeature?.geometry?.coordinates;

            if (!Array.isArray(coords) || coords.length < 2) return null;

            return this.L.latLng(coords[1], coords[0]);
        } catch (e) {
            return null;
        }
    }

    showAggregationOnMap(profileId, triggerButton = null) {
        const polygonFeature = this.state?.lastAnalysisPolygonFeature;
        if (!polygonFeature || !profileId || !this.state?.map) return;

        if (triggerButton) {
            triggerButton.disabled = true;
            triggerButton.classList.add('is-loading');
        }

        const center = this.getFeatureCenterLatLng(polygonFeature);
        const loadingPopup = center
            ? this.openLoadingPopup(
                center,
                'Строим карту',
                'Подготавливаем интегральную визуализацию',
                280
            )
            : null;

        this.state.selectedAggregationProfileId = profileId;

        this.closeAnalysisOverlay();

        setTimeout(() => {
            try {
                if (typeof this.renderPolygonIntegralSampleMap === 'function') {
                    this.renderPolygonIntegralSampleMap(polygonFeature, profileId);
                } else {
                    const aggregations = Array.isArray(this.state?.lastPolygonAggregations)
                        ? this.state.lastPolygonAggregations
                        : [];

                    const selectedAggregation =
                        aggregations.find((item) => item?.id === profileId) || null;

                    const profileConfig = this.getAggregationProfileConfig(profileId);
                    const overlayConfig = profileConfig?.visualization?.polygonOverlay;

                    if (selectedAggregation && overlayConfig?.enabled) {
                        this.clearAggregationOverlayGroup();

                        const score = Number(selectedAggregation.score);
                        const color = this.getAggregationOverlayColor(score, overlayConfig);

                        const overlayLayer = this.L.geoJSON(polygonFeature, {
                            interactive: false,
                            style: {
                                color,
                                weight: Number(overlayConfig.weight) || 3,
                                opacity: Number(overlayConfig.opacity) || 0.95,
                                fillColor: color,
                                fillOpacity: Number(overlayConfig.fillOpacity) || 0.25
                            }
                        });

                        this.state.aggregationOverlayGroup =
                            this.L.layerGroup([overlayLayer]).addTo(this.state.map);
                    }
                }
            } finally {
                if (loadingPopup && this.state.map) {
                    this.state.map.closePopup(loadingPopup);
                }

                if (triggerButton) {
                    triggerButton.disabled = false;
                    triggerButton.classList.remove('is-loading');
                }
            }
        }, 30);
    }

    openAnalysisOverlay(html, title = 'Результаты анализа') {
        const overlay = document.getElementById('analysisOverlay');
        const body = document.getElementById('analysisOverlayBody');

        if (!overlay || !body) return;

        body.innerHTML = `
        ${html}
    `;

        overlay.hidden = false;
        document.body.classList.add('analysis-overlay-open');
    }

    closeAnalysisOverlay() {
        const overlay = document.getElementById('analysisOverlay');
        if (!overlay) return;
        overlay.hidden = true;
        document.body.classList.remove('analysis-overlay-open');
    }

    ////////

    computeAggregationProfiles(results, target = 'point') {
        const profiles = Array.isArray(this.state.aggregationProfiles) ? this.state.aggregationProfiles : [];

        return profiles
            .filter((profile) => {
                if (!profile) return false;
                if (!Array.isArray(profile.target)) return true;
                return profile.target.includes(target);
            })
            .map((profile) => this.computeAggregationProfile(profile, results, target))
            .filter(Boolean);
    }

    computeAggregationProfile(profile, results, target) {
        const branches = Array.isArray(profile.branches) ? profile.branches : [];
        const branchResults = branches
            .map((branch) => this.computeAggregationBranch(branch, results, target))
            .filter((item) => item && Number.isFinite(item.score));

        const score = this.aggregateScores(branchResults, profile.formula || 'weighted_mean');
        if (!Number.isFinite(score)) return null;

        return {
            id: profile.id,
            title: profile.title,
            description: profile.description,
            score: Number(score.toFixed(2)),
            scoreLabel: this.getScoreLabel(score),
            branches: branchResults
        };
    }

    computeAggregationBranch(branch, results, target) {
        const items = Array.isArray(branch.items) ? branch.items : [];
        const itemResults = items
            .map((item) => this.computeAggregationItem(item, results, target))
            .filter((itemResult) => itemResult && Number.isFinite(itemResult.score));

        const score = this.aggregateScores(itemResults, branch.formula || 'weighted_mean');
        if (!Number.isFinite(score)) return null;

        return {
            id: branch.id,
            title: branch.title,
            weight: Number(branch.weight) || 0,
            score: Number(score.toFixed(2)),
            scoreLabel: this.getScoreLabel(score),
            items: itemResults
        };
    }

    computeAggregationItem(item, results, target) {
        if (!item || !item.layerId) return null;

        const themeResult = results.find((entry) => entry.themeId === item.layerId);
        if (!themeResult) return null;

        if (item.scoringMode === 'density-inverted') {
            const density = this.extractDensityValue(themeResult);
            if (!Number.isFinite(density)) return null;

            const score = this.getDensityScore(item.bins, density);
            if (!Number.isFinite(score)) return null;

            return {
                layerId: item.layerId,
                title: item.title,
                weight: Number(item.weight) || 0,
                score,
                rawValue: density,
                matchedLabel: `Плотность: ${density}`
            };
        }

        if (target === 'polygon' && themeResult.mode === 'polygon-summary') {
            const summaryItems = Array.isArray(themeResult.summary?.items) ? themeResult.summary.items : [];
            if (!summaryItems.length) return null;

            let weightedSum = 0;
            let weightedShare = 0;
            const matchedItems = [];

            summaryItems.forEach((summaryItem) => {
                const share = Number(summaryItem.share) || 0;
                if (share <= 0) return;

                let score = null;
                let matchedPrefix = null;

                if (item.scoringMode === 'by-title-prefix') {
                    const prefix = this.extractLandscapePrefix(summaryItem.layerTitle);
                    if (!prefix) return;
                    matchedPrefix = prefix;
                    score = this.getPrefixScore(item, prefix);
                } else if (item.scoringMode === 'external-classifier') {
                    score = this.getExternalClassifierScore(item, {
                        layerId: summaryItem.layerId || null,
                        layerTitle: summaryItem.layerTitle || null,
                        count: summaryItem.count || 0,
                        share
                    }, target);
                } else {
                    score = item.scoring ? item.scoring[summaryItem.layerId] : null;
                }

                const numericScore = Number(score);
                if (!Number.isFinite(numericScore)) return;

                weightedSum += numericScore * share;
                weightedShare += share;

                matchedItems.push({
                    matchedId: summaryItem.layerId || null,
                    matchedLabel: summaryItem.layerTitle || null,
                    matchedPrefix,
                    score: numericScore,
                    share,
                    sharePercent: Number(summaryItem.sharePercent) || share * 100,
                    areaSqMeters: Number(summaryItem.areaSqMeters) || 0,
                    count: Number(summaryItem.count) || 0,
                    fragmentationLabel: summaryItem.fragmentationLabel || null
                });
            });

            if (weightedShare <= 0) return null;

            matchedItems.sort((a, b) => (b.share || 0) - (a.share || 0));

            return {
                layerId: item.layerId,
                title: item.title,
                weight: Number(item.weight) || 0,
                score: Number((weightedSum / weightedShare).toFixed(2)),
                matchedItems,
                matchedLabel: matchedItems
                    .map((entry) => `${entry.matchedLabel}: ${entry.sharePercent.toFixed(1)}%`)
                    .join(', ')
            };
        }

        let dominantClass = null;

        if (item.scoringMode === 'by-title-prefix') {
            dominantClass = this.extractDominantClass(themeResult, target);
            if (!dominantClass || !dominantClass.layerTitle) return null;

            const prefix = this.extractLandscapePrefix(dominantClass.layerTitle);
            if (!prefix) return null;

            const score = this.getPrefixScore(item, prefix);
            if (!Number.isFinite(score)) return null;

            return {
                layerId: item.layerId,
                title: item.title,
                weight: Number(item.weight) || 0,
                score,
                matchedId: dominantClass.layerId || null,
                matchedLabel: dominantClass.layerTitle,
                matchedPrefix: prefix
            };
        }

        if (item.scoringMode === 'external-classifier') {
            dominantClass = this.extractDominantClass(themeResult, target);
            if (!dominantClass) return null;

            const score = this.getExternalClassifierScore(item, dominantClass, target);
            if (!Number.isFinite(score)) return null;

            return {
                layerId: item.layerId,
                title: item.title,
                weight: Number(item.weight) || 0,
                score,
                matchedId: dominantClass.layerId || null,
                matchedLabel: dominantClass.layerTitle || null
            };
        }

        dominantClass = this.extractDominantClass(themeResult, target);
        if (!dominantClass || !dominantClass.layerId) return null;

        const score = item.scoring ? item.scoring[dominantClass.layerId] : null;
        if (!Number.isFinite(score)) return null;

        return {
            layerId: item.layerId,
            title: item.title,
            weight: Number(item.weight) || 0,
            score,
            matchedId: dominantClass.layerId,
            matchedLabel: dominantClass.layerTitle || null
        };
    }
    extractDominantClass(themeResult, target) {
        if (!themeResult) return null;

        if (target === 'point') {
            if (Array.isArray(themeResult.matches) && themeResult.matches.length) {
                const first = themeResult.matches[0];
                return {
                    layerId: this.findLayerIdByTitle(themeResult.themeId, first.layerTitle),
                    layerTitle: first.layerTitle || themeResult.title,
                    count: 1,
                    share: 1
                };
            }
            return null;
        }

        if (target === 'polygon') {
            const items = themeResult.summary?.items;
            if (!Array.isArray(items) || !items.length) return null;

            const sorted = [...items].sort((a, b) => {
                const shareDiff = (b.share || 0) - (a.share || 0);
                if (shareDiff !== 0) return shareDiff;
                return (b.count || 0) - (a.count || 0);
            });

            const top = sorted[0];
            return {
                layerId: this.findLayerIdByTitle(themeResult.themeId, top.layerTitle),
                layerTitle: top.layerTitle,
                count: top.count || 0,
                share: top.share || 0
            };
        }

        return null;
    }

    findLayerIdByTitle(themeId, layerTitle) {
        const themeMeta = Array.isArray(this.state.legend)
            ? this.state.legend.find((item) => item.id === themeId)
            : null;

        if (!themeMeta || !Array.isArray(themeMeta.layers)) return null;

        const layer = themeMeta.layers.find((entry) => entry.title === layerTitle);
        return layer ? layer.id : null;
    }

    extractDensityValue(themeResult) {
        if (themeResult?.densityInfo && Number.isFinite(Number(themeResult.densityInfo.density))) {
            return Number(themeResult.densityInfo.density);
        }
        if (themeResult?.summary && Number.isFinite(Number(themeResult.summary.density))) {
            return Number(themeResult.summary.density);
        }
        return null;
    }

    getDensityScore(bins, value) {
        if (!Array.isArray(bins)) return null;

        for (const bin of bins) {
            if (bin.max === null || bin.max === undefined) return bin.score;
            if (value <= bin.max) return bin.score;
        }

        return null;
    }

    extractLandscapePrefix(title) {
        if (!title) return null;
        const match = String(title).trim().match(/^([А-ЯA-Z0-9]+[а-яa-z]?)/u);
        return match ? match[1] : null;
    }

    getPrefixScore(item, prefix) {
        const groups = item.scoringGroups || {};
        const scores = item.scores || {};

        for (const [groupName, prefixes] of Object.entries(groups)) {
            if (Array.isArray(prefixes) && prefixes.includes(prefix)) {
                return scores[groupName] ?? null;
            }
        }

        return null;
    }

    getExternalClassifierScore(item, dominantClass, target) {
        if (!item) return null;

        if (item.classifier && item.classifier.type === 'title-contains') {
            const title = String(dominantClass?.layerTitle || '').toLowerCase();
            const map = item.classifier.map || {};

            for (const [needle, score] of Object.entries(map)) {
                if (title.includes(String(needle).toLowerCase())) {
                    return score;
                }
            }
        }

        if (item.classifier && item.classifier.type === 'layer-id') {
            const layerId = dominantClass?.layerId;
            if (!layerId) return null;
            return item.classifier.map?.[layerId] ?? null;
        }

        if (item.classifier && item.classifier.type === 'ranges-by-share') {
            const share = Number(dominantClass?.share);
            if (!Number.isFinite(share)) return null;

            for (const rule of item.classifier.rules || []) {
                const minOk = rule.min === undefined || share >= rule.min;
                const maxOk = rule.max === undefined || share < rule.max;
                if (minOk && maxOk) return rule.score;
            }
        }

        return null;
    }

    getScoreLabel(score) {
        if (!Number.isFinite(score)) return 'Нет данных';
        if (score >= 4.5) return 'Очень высокое';
        if (score >= 3.5) return 'Высокое';
        if (score >= 2.5) return 'Среднее';
        if (score >= 1.5) return 'Низкое';
        return 'Очень низкое';
    }

    aggregateScores(items = [], formula = 'weighted_mean') {
        const prepared = (Array.isArray(items) ? items : [])
            .filter((item) => item && Number.isFinite(Number(item.score)))
            .map((item) => ({
                score: Number(item.score),
                weight: Number(item.weight) || 0
            }));

        if (!prepared.length) return null;

        switch (formula) {
            case 'weighted_sum': {
                return prepared.reduce((sum, item) => sum + item.score * item.weight, 0);
            }

            case 'sum': {
                return prepared.reduce((sum, item) => sum + item.score, 0);
            }

            case 'mean': {
                return prepared.reduce((sum, item) => sum + item.score, 0) / prepared.length;
            }

            case 'min': {
                return Math.min(...prepared.map((item) => item.score));
            }

            case 'max': {
                return Math.max(...prepared.map((item) => item.score));
            }

            case 'weighted_mean':
            default: {
                const weightedItems = prepared.filter((item) => item.weight > 0);
                if (!weightedItems.length) return null;

                const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
                if (!totalWeight) return null;

                return weightedItems.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
            }
        }
    }

    getAggregationProfilesForTarget(target) {
        const profiles = Array.isArray(this.state.aggregationProfiles)
            ? this.state.aggregationProfiles
            : [];

        return profiles.filter((profile) =>
            Array.isArray(profile?.target) && profile.target.includes(target)
        );
    }

    getAggregationProfileConfig(profileId) {
        const profiles = Array.isArray(this.state?.aggregationProfiles)
            ? this.state.aggregationProfiles
            : [];

        return profiles.find((profile) => profile?.id === profileId) || null;
    }

    getPolygonOverlayAggregation(aggregations = []) {
        if (!Array.isArray(aggregations) || !aggregations.length) return null;

        for (const aggregation of aggregations) {
            const profileConfig = this.getAggregationProfileConfig(aggregation?.id);
            const overlayConfig = profileConfig?.visualization?.polygonOverlay;

            if (!overlayConfig?.enabled) continue;
            if (!Number.isFinite(Number(aggregation?.score))) continue;

            return {
                aggregation,
                overlayConfig,
                profileConfig
            };
        }

        return null;
    }

    getAggregationOverlayColor(score, overlayConfig = {}) {
        const value = Number(score);
        if (!Number.isFinite(value)) {
            return overlayConfig?.noDataColor || '#6b7280';
        }

        const palette = Array.isArray(overlayConfig?.palette)
            ? overlayConfig.palette
            : [];

        const sorted = [...palette]
            .filter((item) => item && item.color && Number.isFinite(Number(item.min)))
            .sort((a, b) => Number(b.min) - Number(a.min));

        for (const step of sorted) {
            if (value >= Number(step.min)) {
                return step.color;
            }
        }

        return overlayConfig?.noDataColor || '#6b7280';
    }

    clearAggregationOverlayGroup() {
        if (!this.state?.map || !this.state.aggregationOverlayGroup) return;
        this.state.map.removeLayer(this.state.aggregationOverlayGroup);
        this.state.aggregationOverlayGroup = null;
    }

    ///////////////////////////

    clearAggregationOverlayGroup() {
        if (!this.state?.map || !this.state.aggregationOverlayGroup) return;
        this.state.map.removeLayer(this.state.aggregationOverlayGroup);
        this.state.aggregationOverlayGroup = null;
    }

    getAggregationProfileConfig(profileId) {
        const profiles = Array.isArray(this.state?.aggregationProfiles)
            ? this.state.aggregationProfiles
            : [];
        return profiles.find((profile) => profile?.id === profileId) || null;
    }

    getAggregationOverlayColor(score, overlayConfig = {}) {
        const value = Number(score);
        if (!Number.isFinite(value)) {
            return overlayConfig?.noDataColor || '#6b7280';
        }

        const palette = Array.isArray(overlayConfig.palette)
            ? overlayConfig.palette
            : [];

        const sorted = [...palette]
            .filter((item) => item && item.color && Number.isFinite(Number(item.min)))
            .sort((a, b) => Number(b.min) - Number(a.min));

        for (const step of sorted) {
            if (value >= Number(step.min)) return step.color;
        }

        return overlayConfig?.noDataColor || '#6b7280';
    }

    collectPolygonResultsForFeature(polygonFeature) {
        const results = [];

        Object.keys(this.state.thematicLayers || {}).forEach((themeId) => {
            const themeData = this.state.thematicLayers[themeId];
            if (!themeData || !themeData.meta) return;
            if (!this.shouldIncludeTheme(themeId)) return;

            if (themeData.type === 'heatmap') {
                const heatResult = this.summarizeHeatmapInPolygon(themeData, polygonFeature);
                if (heatResult) {
                    results.push({
                        themeId,
                        title: themeData.meta.title,
                        mode: 'heatmap-polygon',
                        summary: heatResult
                    });
                }
                return;
            }

            if (!themeData.geoJson) return;

            const geomSummary = this.summarizeGeoJsonInPolygon(themeId, themeData, polygonFeature);
            if (geomSummary && Array.isArray(geomSummary.items) && geomSummary.items.length) {
                results.push({
                    themeId,
                    title: themeData.meta.title,
                    mode: 'polygon-summary',
                    summary: geomSummary
                });
            }
        });

        return results;
    }

    getPolygonBoundsBBox(polygonFeature) {
        const bounds = this.turf.bbox(polygonFeature);
        return {
            minX: bounds[0],
            minY: bounds[1],
            maxX: bounds[2],
            maxY: bounds[3]
        };
    }

    metersToDegreesLat(meters) {
        return meters / 111320;
    }

    metersToDegreesLng(meters, lat) {
        const safeLat = Math.max(-89.9, Math.min(89.9, Number(lat) || 0));
        return meters / (111320 * Math.cos((safeLat * Math.PI) / 180));
    }

    buildGridCellsInsidePolygon(polygonFeature, cellSizeMeters = 250) {
        const { minX, minY, maxX, maxY } = this.getPolygonBoundsBBox(polygonFeature);
        const centerLat = (minY + maxY) / 2;
        const stepLat = this.metersToDegreesLat(cellSizeMeters);
        const stepLng = this.metersToDegreesLng(cellSizeMeters, centerLat);

        const cells = [];

        for (let y = minY; y < maxY; y += stepLat) {
            for (let x = minX; x < maxX; x += stepLng) {
                const cell = this.turf.polygon([[
                    [x, y],
                    [Math.min(x + stepLng, maxX), y],
                    [Math.min(x + stepLng, maxX), Math.min(y + stepLat, maxY)],
                    [x, Math.min(y + stepLat, maxY)],
                    [x, y]
                ]]);

                let clipped = null;
                try {
                    clipped = this.turf.intersect(cell, polygonFeature);
                } catch (e) {
                    clipped = null;
                }

                if (!clipped) continue;

                let area = 0;
                try {
                    area = this.turf.area(clipped);
                } catch (e) {
                    area = 0;
                }

                if (!Number.isFinite(area) || area <= 1) continue;

                cells.push(clipped);
            }
        }

        return cells;
    }

    computeIntegralScoreForCell(cellFeature, profileId) {
        const localResults = this.collectPolygonResultsForFeature(cellFeature);
        const localAggregations = this.computeAggregationProfiles(localResults, 'polygon');
        const aggregation = Array.isArray(localAggregations)
            ? localAggregations.find((item) => item?.id === profileId)
            : null;

        if (!aggregation || !Number.isFinite(Number(aggregation.score))) {
            return null;
        }

        return {
            score: Number(aggregation.score),
            aggregation,
            results: localResults
        };
    }

    renderPolygonIntegralGrid(polygonFeature, profileId = null, cellSizeMeters = 250) {
        if (!this.state?.map || !polygonFeature) return null;

        this.clearAggregationOverlayGroup();

        const allProfiles = Array.isArray(this.state?.aggregationProfiles)
            ? this.state.aggregationProfiles
            : [];

        const selectedProfileId = profileId || allProfiles.find((profile) =>
            Array.isArray(profile?.target) && profile.target.includes('polygon')
        )?.id;

        if (!selectedProfileId) return null;

        const profileConfig = this.getAggregationProfileConfig(selectedProfileId);
        const overlayConfig = profileConfig?.visualization?.polygonOverlay || {};

        const cells = this.buildGridCellsInsidePolygon(polygonFeature, cellSizeMeters);
        if (!cells.length) return null;

        const layers = [];

        cells.forEach((cellFeature) => {
            const scored = this.computeIntegralScoreForCell(cellFeature, selectedProfileId);
            if (!scored) return;

            const color = this.getAggregationOverlayColor(scored.score, overlayConfig);

            const cellLayer = this.L.geoJSON(cellFeature, {
                interactive: false,
                style: () => ({
                    color: color,
                    weight: 0.5,
                    opacity: 0.7,
                    fillColor: color,
                    fillOpacity: Number(overlayConfig.fillOpacity) || 0.55
                })
            });

            layers.push(cellLayer);
        });

        if (!layers.length) return null;

        this.state.aggregationOverlayGroup = this.L.layerGroup(layers);
        this.state.aggregationOverlayGroup.addTo(this.state.map);

        return this.state.aggregationOverlayGroup;
    }

    renderPolygonAggregationOverlay(layer, aggregations) {
        if (!this.state?.map || !layer) return null;

        this.clearAggregationOverlayGroup();

        const selected = this.getPolygonOverlayAggregation(aggregations);
        if (!selected) return null;

        const score = Number(selected.aggregation.score);
        const color = this.getAggregationOverlayColor(score, selected.overlayConfig);

        const overlayLayer = this.L.geoJSON(layer.toGeoJSON(), {
            interactive: false,
            style: () => ({
                color,
                weight: Number(selected.overlayConfig.weight) || 3,
                opacity: Number(selected.overlayConfig.opacity) || 0.95,
                fillColor: color,
                fillOpacity: Number(selected.overlayConfig.fillOpacity) || 0.25
            })
        });

        this.state.aggregationOverlayGroup = this.L.layerGroup([overlayLayer]);
        this.state.aggregationOverlayGroup.addTo(this.state.map);

        return this.state.aggregationOverlayGroup;
    }

    getAdaptiveCellSizeMeters(polygonFeature, options = {}) {
        const polygonAreaSqMeters = Number(this.turf.area(polygonFeature));
        if (!Number.isFinite(polygonAreaSqMeters) || polygonAreaSqMeters <= 0) {
            return 800;
        }

        const minCellSize = Number(options.minCellSize ?? 150);
        const maxCellSize = Number(options.maxCellSize ?? 2000);
        const targetCells = Number(options.targetCells ?? 180);

        const rawCellSize = Math.sqrt(polygonAreaSqMeters / targetCells);

        return Math.max(minCellSize, Math.min(maxCellSize, rawCellSize));
    }

    ///////////////////////////////////

    getProfileThemeIds(profileId) {
        const profile = this.getAggregationProfileConfig(profileId);
        const ids = new Set();

        (profile?.branches || []).forEach((branch) => {
            (branch?.items || []).forEach((item) => {
                if (item?.layerId) ids.add(item.layerId);
            });
        });

        return ids;
    }

    collectPointResultsForLatLng(latlng, profileId = null) {
        const results = [];
        const allowedThemeIds = profileId ? this.getProfileThemeIds(profileId) : null;

        Object.keys(this.state.thematicLayers || {}).forEach((themeId) => {
            if (allowedThemeIds && !allowedThemeIds.has(themeId)) return;

            const themeData = this.state.thematicLayers[themeId];
            if (!themeData || !themeData.meta) return;
            if (!this.shouldIncludeTheme(themeId)) return;

            if (themeData.type === 'heatmap') {
                const densityInfo = this.calculateHeatDensity(themeData, latlng);
                if (!densityInfo) return;

                results.push({
                    themeId,
                    title: themeData.meta.title,
                    mode: 'heatmap',
                    densityInfo
                });
                return;
            }

            if (!themeData.geoJson) return;

            const item = themeData.meta;
            const matches = [];

            themeData.geoJson.eachLayer((featureLayer) => {
                if (!featureLayer?.feature?.geometry) return;

                const geomType = featureLayer.feature.geometry.type;
                if (geomType === 'Point' || geomType === 'MultiPoint') return;

                if (!this.identifyPointMatch(featureLayer, latlng)) return;

                const feature = featureLayer.feature;
                const currentLayer = this.legend.findLayer(item, feature);
                const properties = this.buildIdentifyProperties(themeId, item, feature);

                matches.push({
                    feature,
                    layerId: currentLayer ? currentLayer.id : null,
                    layerTitle: currentLayer ? currentLayer.title : null,
                    layerColor: currentLayer ? currentLayer.color : '#999999',
                    layerBorder: currentLayer?.border || '#666666',
                    properties
                });
            });

            const nearestPointMatch = this.findNearestPointMatchInTheme(
                themeId,
                themeData.geoJson,
                item,
                latlng
            );

            if (nearestPointMatch) {
                matches.push(nearestPointMatch);
            }

            if (matches.length) {
                results.push({
                    themeId,
                    title: item.title,
                    matches
                });
            }
        });

        return results;
    }

    getPointGridStepMeters(polygonFeature, options = {}) {
        const polygonAreaSqMeters = Number(this.turf.area(polygonFeature));
        if (!Number.isFinite(polygonAreaSqMeters) || polygonAreaSqMeters <= 0) return 1000;

        const minStep = Number(options.minStep ?? 400);
        const maxStep = Number(options.maxStep ?? 3000);
        const targetPoints = Number(options.targetPoints ?? 60);

        let step = Math.sqrt(polygonAreaSqMeters / targetPoints);
        step = Math.max(minStep, Math.min(maxStep, step));

        return Math.round(step / 50) * 50;
    }

    //////////////////////

    buildFiveSamplePointsForSquare(centerLatLng, stepMeters) {
        const quarterSize = stepMeters / 4;

        const lat = centerLatLng.lat;
        const lng = centerLatLng.lng;

        const dLat = quarterSize / 111320;
        const dLng = quarterSize / (111320 * Math.cos((lat * Math.PI) / 180));

        return [
            {
                key: 'center',
                latlng: this.L.latLng(lat, lng)
            },
            {
                key: 'nw',
                latlng: this.L.latLng(lat + dLat, lng - dLng)
            },
            {
                key: 'ne',
                latlng: this.L.latLng(lat + dLat, lng + dLng)
            },
            {
                key: 'sw',
                latlng: this.L.latLng(lat - dLat, lng - dLng)
            },
            {
                key: 'se',
                latlng: this.L.latLng(lat - dLat, lng + dLng)
            }
        ];
    }

    getAggregationPaletteBucket(score, overlayConfig = {}) {
        const value = Number(score);
        if (!Number.isFinite(value)) {
            return {
                min: null,
                color: overlayConfig?.noDataColor || '#6b7280',
                key: `nodata:${overlayConfig?.noDataColor || '#6b7280'}`
            };
        }

        const palette = Array.isArray(overlayConfig?.palette)
            ? overlayConfig.palette
            : [];

        const sorted = [...palette]
            .filter((item) => item && item.color && Number.isFinite(Number(item.min)))
            .sort((a, b) => Number(b.min) - Number(a.min));

        for (const step of sorted) {
            if (value >= Number(step.min)) {
                return {
                    min: Number(step.min),
                    color: step.color,
                    key: `${Number(step.min)}__${step.color}`
                };
            }
        }

        return {
            min: null,
            color: overlayConfig?.noDataColor || '#6b7280',
            key: `nodata:${overlayConfig?.noDataColor || '#6b7280'}`
        };
    }

    computePointAggregationScore(latlng, profileId) {
        const localResults = this.collectPointResultsForLatLng(latlng, profileId);
        const aggregations = this.computeAggregationProfiles(localResults, 'point');
        const aggregation = Array.isArray(aggregations)
            ? aggregations.find((item) => item?.id === profileId)
            : null;

        if (!aggregation || !Number.isFinite(Number(aggregation.score))) {
            return null;
        }

        return {
            score: Number(aggregation.score),
            aggregation,
            results: localResults
        };
    }

    computeDominantPointScoreForSquare(centerLatLng, polygonFeature, profileId, overlayConfig, stepMeters) {
        const sampleCandidates = this.buildFiveSamplePointsForSquare(centerLatLng, stepMeters);
        const validSamples = [];

        sampleCandidates.forEach((sample) => {
            let inside = false;

            try {
                inside = this.turf.booleanPointInPolygon(
                    this.turf.point([sample.latlng.lng, sample.latlng.lat]),
                    polygonFeature
                );
            } catch (e) {
                inside = false;
            }

            if (!inside) return;

            const pointScore = this.computePointAggregationScore(sample.latlng, profileId);
            if (!pointScore) return;

            const bucket = this.getAggregationPaletteBucket(pointScore.score, overlayConfig);

            validSamples.push({
                key: sample.key,
                latlng: sample.latlng,
                score: pointScore.score,
                color: bucket.color,
                bucketKey: bucket.key,
                bucketMin: bucket.min
            });
        });

        if (!validSamples.length) return null;

        const buckets = new Map();

        validSamples.forEach((sample) => {
            if (!buckets.has(sample.bucketKey)) {
                buckets.set(sample.bucketKey, []);
            }
            buckets.get(sample.bucketKey).push(sample);
        });

        const dominantSamples = Array.from(buckets.values()).sort((a, b) => {
            if (b.length !== a.length) return b.length - a.length;

            const avgA = a.reduce((sum, item) => sum + item.score, 0) / a.length;
            const avgB = b.reduce((sum, item) => sum + item.score, 0) / b.length;
            return avgB - avgA;
        })[0];

        const dominantScore = dominantSamples.reduce((sum, item) => sum + item.score, 0) / dominantSamples.length;
        const dominantColor = dominantSamples[0]?.color || (overlayConfig?.noDataColor || '#6b7280');

        return {
            score: Number(dominantScore.toFixed(2)),
            color: dominantColor,
            allSamples: validSamples,
            dominantSamples
        };
    }

    buildSamplePointMarker(sample, color = '#111827') {
        return this.L.circleMarker(sample.latlng, {
            radius: sample.key === 'center' ? 5 : 4,
            stroke: true,
            weight: 1,
            color: '#ffffff',
            opacity: 1,
            fillColor: color,
            fillOpacity: 0.95
        });
    }

    renderPolygonIntegralSampleMap(polygonFeature, profileId = null) {
        if (!this.state?.map || !polygonFeature) return null;

        this.clearAggregationOverlayGroup();

        const allProfiles = Array.isArray(this.state?.aggregationProfiles)
            ? this.state.aggregationProfiles
            : [];

        const selectedProfileId = profileId || allProfiles.find((profile) =>
            Array.isArray(profile?.target) && profile.target.includes('point')
        )?.id;

        if (!selectedProfileId) return null;

        const profileConfig = this.getAggregationProfileConfig(selectedProfileId);
        const overlayConfig = profileConfig?.visualization?.polygonOverlay || {};

        const stepMeters = this.getPointGridStepMeters(polygonFeature, {
            minStep: 400,
            maxStep: 3000,
            targetPoints: 60
        });

        const samplePoints = this.buildSamplePointsForSquareCoverage(polygonFeature, stepMeters);
        if (!samplePoints.length) return null;

        const layers = [];

        samplePoints.forEach((latlng) => {
            const dominant = this.computeDominantPointScoreForSquare(
                latlng,
                polygonFeature,
                selectedProfileId,
                overlayConfig,
                stepMeters
            );

            if (!dominant || !Number.isFinite(Number(dominant.score))) return;

            const squareFeature = this.buildSquareCellFromCenter(latlng, stepMeters);

            let clippedSquare = null;
            try {
                clippedSquare = this.turf.intersect(squareFeature, polygonFeature);
            } catch (e) {
                clippedSquare = null;
            }

            if (!clippedSquare) return;

            const squareLayer = this.L.geoJSON(clippedSquare, {
                interactive: false,
                style: {
                    color: dominant.color,
                    weight: 1,
                    opacity: 0.7,
                    fillColor: dominant.color,
                    fillOpacity: 0.65
                }
            });

            layers.push(squareLayer);

            /*
            dominant.allSamples.forEach((sample) => {
                const marker = this.buildSamplePointMarker(sample, sample.color);
                layers.push(marker);
            });
            */
        });

        if (!layers.length) return null;

        this.state.aggregationOverlayGroup = this.L.layerGroup(layers);
        this.state.aggregationOverlayGroup.addTo(this.state.map);

        return this.state.aggregationOverlayGroup;
    }

    buildSquareCellFromCenter(latlng, sizeMeters) {
        const halfSize = sizeMeters / 2;

        const lat = latlng.lat;
        const lng = latlng.lng;

        const dLat = halfSize / 111320;
        const dLng = halfSize / (111320 * Math.cos((lat * Math.PI) / 180));

        return this.turf.polygon([[
            [lng - dLng, lat - dLat],
            [lng + dLng, lat - dLat],
            [lng + dLng, lat + dLat],
            [lng - dLng, lat + dLat],
            [lng - dLng, lat - dLat]
        ]]);
    }

    buildSamplePointsForSquareCoverage(polygonFeature, stepMeters = 1000) {
        const bbox = this.turf.bbox(polygonFeature);
        const minX = bbox[0];
        const minY = bbox[1];
        const maxX = bbox[2];
        const maxY = bbox[3];

        const centerLat = (minY + maxY) / 2;
        const stepLat = stepMeters / 111320;
        const stepLng = stepMeters / (111320 * Math.cos((centerLat * Math.PI) / 180));

        const overscanLat = stepLat / 2;
        const overscanLng = stepLng / 2;

        const points = [];

        for (let y = minY - overscanLat; y <= maxY + overscanLat; y += stepLat) {
            for (let x = minX - overscanLng; x <= maxX + overscanLng; x += stepLng) {
                const latlng = this.L.latLng(y, x);
                const squareFeature = this.buildSquareCellFromCenter(latlng, stepMeters);

                let intersects = false;
                try {
                    intersects = this.turf.booleanIntersects(squareFeature, polygonFeature);
                } catch (e) {
                    intersects = false;
                }

                if (!intersects) continue;

                points.push(latlng);
            }
        }

        return points;
    }

    setAggregationMapButtonLoading(button, isLoading) {
        if (!button) return;

        const textNode = button.querySelector('.analysis-action-button__text');

        if (isLoading) {
            button.disabled = true;
            button.classList.add('is-loading');
            button.setAttribute('aria-busy', 'true');

            if (!button.dataset.originalText) {
                button.dataset.originalText = textNode
                    ? textNode.textContent
                    : button.textContent;
            }

            if (textNode) {
                textNode.textContent = 'Строим карту...';
            } else {
                button.textContent = 'Строим карту...';
            }
        } else {
            button.disabled = false;
            button.classList.remove('is-loading');
            button.removeAttribute('aria-busy');

            const originalText = button.dataset.originalText || 'Показать на карте';
            if (textNode) {
                textNode.textContent = originalText;
            } else {
                button.textContent = originalText;
            }
        }
    }

}