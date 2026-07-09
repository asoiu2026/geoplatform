export class SentinelIndexService {

    static formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static getDefaultDateTo() {
        return SentinelIndexService.formatDateForInput(new Date());
    }

    static getDefaultDateFrom() {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return SentinelIndexService.formatDateForInput(date);
    }

    isValidIsoDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(`${value}T00:00:00`);
        return !Number.isNaN(date.getTime()) &&
            SentinelIndexService.formatDateForInput(date) === value;
    }

    static CONFIG = {
        previewPx: 256,
        maxAreaM2: 10_000_000,
        stacCandidateLimit: 8,
        fetchRetries: 3,
        fetchRetryDelayMs: 1000,
        rasterRetries: 3,
        rasterRetryDelayMs: 1000,
        geotiffMetaRetryDelayMs: 700,
        defaultCloudMax: 20,
        defaultDateFrom: SentinelIndexService.getDefaultDateFrom(),
        defaultDateTo: SentinelIndexService.getDefaultDateTo(),
        defaultIndexKey: 'ndvi',
        defaultSceneEpsg: 32638,
        indices: {
            ndvi: {
                title: 'NDVI',
                subtitle: 'Плотная растительность справа, низкие или отрицательные значения слева.',
                labels: ['-1', '-0.5', '0', '0.5', '1'],
                gradient: 'linear-gradient(to right, #8c510a, #d8b365, #f6e8c3, #f5f5f5, #c7eae5, #5ab4ac, #01665e)',
                rgbStops: [
                    [140, 81, 10],
                    [216, 179, 101],
                    [246, 232, 195],
                    [245, 245, 245],
                    [199, 234, 229],
                    [90, 180, 172],
                    [1, 102, 94]
                ],
                bands: ['red', 'nir'],
                formula: 'ndvi'
            },
            savi: {
                title: 'SAVI',
                subtitle: 'Учитывает влияние оголённой почвы при оценке растительности.',
                labels: ['-1', '-0.25', '0', '0.5', '1'],
                gradient: 'linear-gradient(to right, #7f3b08, #b35806, #f1a340, #fee0b6, #d8daeb, #998ec3, #542788)',
                rgbStops: [
                    [127, 59, 8],
                    [179, 88, 6],
                    [241, 163, 64],
                    [254, 224, 182],
                    [216, 218, 235],
                    [153, 142, 195],
                    [84, 39, 136]
                ],
                bands: ['red', 'nir'],
                formula: 'savi'
            },
            ndmi: {
                title: 'NDMI',
                subtitle: 'Индекс влажности растительности и поверхности.',
                labels: ['-1', '-0.5', '0', '0.5', '1'],
                gradient: 'linear-gradient(to right, #8c510a, #d8b365, #f6e8c3, #e0f3f8, #91bfdb, #4575b4, #313695)',
                rgbStops: [
                    [140, 81, 10],
                    [216, 179, 101],
                    [246, 232, 195],
                    [224, 243, 248],
                    [145, 191, 219],
                    [69, 117, 180],
                    [49, 54, 149]
                ],
                bands: ['nir', 'swir1'],
                formula: 'ndmi'
            },
            ndwi: {
                title: 'NDWI',
                subtitle: 'Открытая вода обычно проявляется в правой части шкалы.',
                labels: ['-1', '-0.5', '0', '0.5', '1'],
                gradient: 'linear-gradient(to right, #543005, #8c510a, #bf812d, #f6e8c3, #c7eae5, #80cdc1, #01665e)',
                rgbStops: [
                    [84, 48, 5],
                    [140, 81, 10],
                    [191, 129, 45],
                    [246, 232, 195],
                    [199, 234, 229],
                    [128, 205, 193],
                    [1, 102, 94]
                ],
                bands: ['green', 'nir'],
                formula: 'ndwi'
            },
            nbr: {
                title: 'NBR',
                subtitle: 'Используется для оценки гарей и выгорания.',
                labels: ['-1', '-0.5', '0', '0.5', '1'],
                gradient: 'linear-gradient(to right, #4d4d4d, #7f2704, #d7301f, #fc8d59, #fee08b, #d9ef8b, #1a9850)',
                rgbStops: [
                    [77, 77, 77],
                    [127, 39, 4],
                    [215, 48, 31],
                    [252, 141, 89],
                    [254, 224, 139],
                    [217, 239, 139],
                    [26, 152, 80]
                ],
                bands: ['nir', 'swir2'],
                formula: 'nbr'
            },
            ndbi: {
                title: 'NDBI',
                subtitle: 'Застроенные территории чаще смещаются вправо.',
                labels: ['-1', '-0.5', '0', '0.5', '1'],
                gradient: 'linear-gradient(to right, #2166ac, #67a9cf, #d1e5f0, #f7f7f7, #fddbc7, #ef8a62, #b2182b)',
                rgbStops: [
                    [33, 102, 172],
                    [103, 169, 207],
                    [209, 229, 240],
                    [247, 247, 247],
                    [253, 219, 199],
                    [239, 138, 98],
                    [178, 24, 43]
                ],
                bands: ['swir1', 'nir'],
                formula: 'ndbi'
            }
        },
        assetAliases: {
            red: ['red', 'B04'],
            nir: ['nir', 'B08'],
            green: ['green', 'B03'],
            swir1: ['swir16', 'B11'],
            swir2: ['swir22', 'B12']
        }
    };

    constructor({
                    state,
                    map,
                    L,
                    GeoTIFF,
                    proj4,
                    documentObj = document,
                    ui = {},
                    config = null
                }) {
        this.state = state;
        this.map = map;
        this.L = L;
        this.GeoTIFF = GeoTIFF;
        this.proj4 = proj4;
        this.documentObj = documentObj;
        this.config = config || SentinelIndexService.CONFIG;

        this.overlay = null;
        this.overlayUrl = null;
        this.currentRect = null;
        this.isBound = false;
        this.lastResult = null;

        this.handlePmCreate = this.handlePmCreate.bind(this);

        if (this.proj4) {
            this.proj4.defs('EPSG:32638', '+proj=utm +zone=38 +datum=WGS84 +units=m +no_defs +type=crs');
        }

        this.ui = this.resolveUi(ui);
        this.populateIndexSelect();
        this.applyDefaultInputs();
        this.updateLegend(this.getSelectedIndexKey());
        this.setStatus('Готово.');
    }

    resolveElement(ref) {
        if (!ref) return null;
        if (typeof ref !== 'string') return ref;
        return this.documentObj.getElementById(ref);
    }

    resolveUi(ui) {
        return {
            dateFromEl: this.resolveElement(ui.dateFromEl || 'sentinel-date-from'),
            dateToEl: this.resolveElement(ui.dateToEl || 'sentinel-date-to'),
            cloudMaxEl: this.resolveElement(ui.cloudMaxEl || 'sentinel-cloud-max'),
            indexSelectEl: this.resolveElement(ui.indexSelectEl || 'sentinel-index-select'),
            statusEl: this.resolveElement(ui.statusEl || 'sentinel-status'),
            bboxEl: this.resolveElement(ui.bboxEl || 'sentinel-bbox'),
            resultEl: this.resolveElement(ui.resultEl || 'sentinel-result'),
            legendTitleEl: this.resolveElement(ui.legendTitleEl || 'sentinel-legend-title'),
            legendSubtitleEl: this.resolveElement(ui.legendSubtitleEl || 'sentinel-legend-subtitle'),
            legendBarEl: this.resolveElement(ui.legendBarEl || 'sentinel-legend-bar'),
            legendLabelsEl: this.resolveElement(ui.legendLabelsEl || 'sentinel-legend-labels')
        };
    }

    populateIndexSelect() {

        const select = this.ui.indexSelectEl;
        if (!select) return;
        if (select.options.length > 0) return;

        const entries = Object.entries(this.getConfig().indices);
        select.innerHTML = entries.map(([key, cfg]) => {
            return `<option value="${this.escapeHtml(key)}">${this.escapeHtml(cfg.title)} — ${this.escapeHtml(cfg.subtitle)}</option>`;
        }).join('');

        select.value = this.getConfig().defaultIndexKey;
        select.addEventListener('change', () => {
            this.updateLegend(this.getSelectedIndexKey());
        });
    }

    bindMapEvents() {
        if (this.isBound || !this.map) return;
        this.map.on('pm:create', this.handlePmCreate);
        this.isBound = true;
    }

    applyDefaultInputs() {
        const cfg = this.getConfig();
        const { dateFromEl, dateToEl, cloudMaxEl, indexSelectEl } = this.ui;

        if (dateFromEl && !dateFromEl.value) dateFromEl.value = cfg.defaultDateFrom;
        if (dateToEl && !dateToEl.value) dateToEl.value = cfg.defaultDateTo;
        if (cloudMaxEl && !cloudMaxEl.value) cloudMaxEl.value = String(cfg.defaultCloudMax);
        if (indexSelectEl && !indexSelectEl.value) indexSelectEl.value = cfg.defaultIndexKey;
    }

    getConfig() {
        return this.config;
    }

    getSelectedIndexKey() {
        return this.ui.indexSelectEl?.value || this.getConfig().defaultIndexKey;
    }

    getInputParams() {
        const cfg = this.getConfig();

        const dateFrom = this.ui.dateFromEl?.value || cfg.defaultDateFrom;
        const dateTo = this.ui.dateToEl?.value || cfg.defaultDateTo;
        const cloudMax = Number(this.ui.cloudMaxEl?.value || cfg.defaultCloudMax);

        if (!this.isValidIsoDate(dateFrom)) {
            throw new Error('Дата "от" должна быть в формате YYYY-MM-DD.');
        }

        if (!this.isValidIsoDate(dateTo)) {
            throw new Error('Дата "до" должна быть в формате YYYY-MM-DD.');
        }

        return {
            indexKey: this.getSelectedIndexKey(),
            dateFrom,
            dateTo,
            cloudMax
        };
    }

    getIndexConfig(indexKey) {
        const cfg = this.getConfig();
        return cfg.indices[indexKey] || cfg.indices[cfg.defaultIndexKey];
    }

    updateLegend(indexKey) {
        const cfg = this.getIndexConfig(indexKey);

        if (this.ui.legendTitleEl) this.ui.legendTitleEl.textContent = cfg.title;
        if (this.ui.legendSubtitleEl) this.ui.legendSubtitleEl.textContent = cfg.subtitle;
        if (this.ui.legendBarEl) this.ui.legendBarEl.style.background = cfg.gradient;
        if (this.ui.legendLabelsEl) {
            this.ui.legendLabelsEl.innerHTML = cfg.labels.map((label) => `<span>${label}</span>`).join('');
        }
    }

    setStatus(text, cls = '') {
        if (!this.ui.statusEl) return;
        this.ui.statusEl.className = `mono ${cls}`.trim();
        this.ui.statusEl.textContent = text;
    }

    setBbox(data) {
        if (!this.ui.bboxEl) return;
        this.ui.bboxEl.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    setResult(data) {
        if (!this.ui.resultEl) return;
        this.ui.resultEl.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    enableDraw() {
        if (!this.map?.pm) {
            this.setStatus('Geoman недоступен.', 'bad');
            return;
        }

        this.map.pm.enableDraw('Rectangle', {
            snappable: false,
            templineStyle: { color: '#1d6f42' },
            pathOptions: { color: '#1d6f42', weight: 2 }
        });

        this.setStatus('Режим рисования включён. Нарисуй прямоугольник.');
    }

    toggle() {
        this.enableDraw();
    }

    disableDraw() {
        if (this.map?.pm) {
            this.map.pm.disableDraw();
        }
    }

    clearOverlayOnly() {
        if (this.overlay && this.map) {
            this.map.removeLayer(this.overlay);
            this.overlay = null;
        }

        if (this.overlayUrl) {
            URL.revokeObjectURL(this.overlayUrl);
            this.overlayUrl = null;
        }
    }

    clearAll() {
        if (this.map?.pm) {
            try {
                this.map.pm.disableDraw();
            } catch (e) {
                console.warn('disableDraw failed', e);
            }

            try {
                this.map.pm.Draw?.Rectangle?.disable?.();
            } catch (e) {
                console.warn('Rectangle.disable failed', e);
            }

            try {
                this.map.pm.Draw?.disable?.();
            } catch (e) {
                console.warn('Draw.disable failed', e);
            }
        }

        if (this.currentRect && this.map) {
            this.map.removeLayer(this.currentRect);
            this.currentRect = null;
        }

        this.clearOverlayOnly();
        this.lastResult = null;

        if (this.state) {
            this.state.sentinelIndexResult = null;
        }

        this.setBbox('—');
        this.setResult('—');
        this.setStatus('Готово.');

        this.resetInputs();
    }

    resetInputs() {
        const cfg = this.getConfig();

        if (this.ui.dateFromEl) {
            this.ui.dateFromEl.value = cfg.defaultDateFrom;
        }

        if (this.ui.dateToEl) {
            this.ui.dateToEl.value = cfg.defaultDateTo;
        }

        if (this.ui.cloudMaxEl) {
            this.ui.cloudMaxEl.value = String(cfg.defaultCloudMax);
        }

        if (this.ui.indexSelectEl) {
            this.ui.indexSelectEl.value = cfg.defaultIndexKey;
        }

        this.updateLegend(this.getSelectedIndexKey());
    }

    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    safeRatio(num, den) {
        return den === 0 ? 0 : num / den;
    }

    computeApproxAreaM2(bounds) {
        const lat1 = bounds.getSouth() * Math.PI / 180;
        const lat2 = bounds.getNorth() * Math.PI / 180;
        const dLon = (bounds.getEast() - bounds.getWest()) * Math.PI / 180;
        const earthRadius = 6378137;

        return earthRadius * earthRadius *
            Math.abs(Math.sin(lat2) - Math.sin(lat1)) *
            Math.abs(dLon);
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async withRetry(fn, retries, delay, label) {
        let lastError;

        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (err) {
                lastError = err;
                console.warn(`${label} failed, attempt ${i + 1}/${retries}`, err);
                if (i < retries - 1) {
                    await this.sleep(delay * (i + 1));
                }
            }
        }

        throw lastError;
    }

    async fetchJsonWithRetry(url, options = {}) {
        const cfg = this.getConfig();

        return this.withRetry(
            async () => {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            },
            cfg.fetchRetries,
            cfg.fetchRetryDelayMs,
            'fetchJson'
        );
    }

    projectBboxFrom4326(bbox4326, targetEpsg) {
        if (!this.proj4) {
            throw new Error('proj4 is not loaded');
        }

        const [west, south, east, north] = bbox4326;
        const targetCrs = `EPSG:${targetEpsg}`;
        const sw = this.proj4('EPSG:4326', targetCrs, [west, south]);
        const ne = this.proj4('EPSG:4326', targetCrs, [east, north]);

        return [sw[0], sw[1], ne[0], ne[1]];
    }

    scoreCandidate(item, bboxCenter, cloudMax) {
        const itemBbox = item.bbox || [];
        const itemCenterLon = (itemBbox[0] + itemBbox[2]) / 2;
        const itemCenterLat = (itemBbox[1] + itemBbox[3]) / 2;
        const dLon = itemCenterLon - bboxCenter.lng;
        const dLat = itemCenterLat - bboxCenter.lat;
        const dist2 = dLon * dLon + dLat * dLat;

        const cloud = item.properties && typeof item.properties['eo:cloud_cover'] === 'number'
            ? item.properties['eo:cloud_cover']
            : cloudMax;

        return dist2 + cloud / 1000;
    }

    async searchScene(bbox, bboxCenter, params) {
        const cfg = this.getConfig();

        const payload = {
            collections: ['sentinel-2-l2a'],
            bbox,
            datetime: `${params.dateFrom}T00:00:00Z/${params.dateTo}T23:59:59Z`,
            query: {
                'eo:cloud_cover': { lte: Number(params.cloudMax) }
            },
            sortby: [{ field: 'properties.datetime', direction: 'desc' }],
            limit: cfg.stacCandidateLimit
        };

        const data = await this.fetchJsonWithRetry(
            'https://earth-search.aws.element84.com/v1/search',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        const features = data.features || [];
        if (!features.length) return null;

        const best = [...features].sort((a, b) => {
            const sa = this.scoreCandidate(a, bboxCenter, Number(params.cloudMax));
            const sb = this.scoreCandidate(b, bboxCenter, Number(params.cloudMax));
            return sa - sb;
        })[0];

        return { best, candidates: features };
    }

    getAssetHref(item, logicalBand) {
        const aliases = this.getConfig().assetAliases[logicalBand] || [];

        for (const key of aliases) {
            const href = item?.assets?.[key]?.href;
            if (href) return href;
        }

        return null;
    }

    buildAssetUrls(item, indexKey) {
        const cfg = this.getIndexConfig(indexKey);
        const assetUrls = {};

        for (const bandKey of cfg.bands) {
            const href = this.getAssetHref(item, bandKey);
            if (!href) {
                throw new Error(`Не найден asset для канала ${bandKey}`);
            }
            assetUrls[bandKey] = href;
        }

        return assetUrls;
    }

    async loadWindowedBands(assetUrls, bbox, targetEpsg) {
        const cfg = this.getConfig();
        const projectedBbox = this.projectBboxFrom4326(bbox, targetEpsg);
        const [west, south, east, north] = projectedBbox;
        const images = {};

        for (const [bandKey, url] of Object.entries(assetUrls)) {
            this.setStatus(`Открываем ${bandKey} band COG...`);

            const tiff = await this.withRetry(
                () => this.GeoTIFF.fromUrl(url),
                cfg.rasterRetries,
                cfg.rasterRetryDelayMs,
                `${bandKey} COG open`
            );

            this.setStatus(`Читаем метаданные ${bandKey} band...`);

            images[bandKey] = await this.withRetry(
                () => tiff.getImage(),
                cfg.rasterRetries,
                cfg.geotiffMetaRetryDelayMs,
                `${bandKey} getImage`
            );
        }

        const bboxToWindow = (image) => {
            const imgBBox = image.getBoundingBox();
            const width = image.getWidth();
            const height = image.getHeight();
            const resX = (imgBBox[2] - imgBBox[0]) / width;
            const resY = (imgBBox[3] - imgBBox[1]) / height;

            let x1 = Math.floor((west - imgBBox[0]) / resX);
            let x2 = Math.ceil((east - imgBBox[0]) / resX);
            let y1 = Math.floor((imgBBox[3] - north) / resY);
            let y2 = Math.ceil((imgBBox[3] - south) / resY);

            x1 = this.clamp(x1, 0, width - 1);
            x2 = this.clamp(x2, 1, width);
            y1 = this.clamp(y1, 0, height - 1);
            y2 = this.clamp(y2, 1, height);

            return [x1, y1, x2, y2];
        };

        const width = cfg.previewPx;
        const height = cfg.previewPx;
        const rastersByBand = {};

        for (const [bandKey, image] of Object.entries(images)) {
            const window = bboxToWindow(image);
            this.setStatus(`Читаем окно ${bandKey} band...`);

            rastersByBand[bandKey] = await this.withRetry(
                () => image.readRasters({
                    window,
                    width,
                    height,
                    resampleMethod: 'bilinear',
                    interleave: true
                }),
                cfg.rasterRetries,
                cfg.rasterRetryDelayMs,
                `${bandKey} readRasters`
            );
        }

        return { width, height, rastersByBand };
    }

    calculateIndexValue(indexKey, bands) {
        const formula = this.getIndexConfig(indexKey).formula;

        switch (formula) {
            case 'savi':
                return 1.5 * this.safeRatio(bands.nir - bands.red, bands.nir + bands.red + 0.5);
            case 'ndmi':
                return this.safeRatio(bands.nir - bands.swir1, bands.nir + bands.swir1);
            case 'ndwi':
                return this.safeRatio(bands.green - bands.nir, bands.green + bands.nir);
            case 'nbr':
                return this.safeRatio(bands.nir - bands.swir2, bands.nir + bands.swir2);
            case 'ndbi':
                return this.safeRatio(bands.swir1 - bands.nir, bands.swir1 + bands.nir);
            case 'ndvi':
            default:
                return this.safeRatio(bands.nir - bands.red, bands.nir + bands.red);
        }
    }

    valueToRgb(value, indexKey) {
        const stops = this.getIndexConfig(indexKey).rgbStops;
        const x = this.clamp((value + 1) / 2, 0, 1);
        const scaled = x * (stops.length - 1);
        const i = Math.floor(scaled);
        const t = scaled - i;
        const a = stops[Math.min(i, stops.length - 1)];
        const b = stops[Math.min(i + 1, stops.length - 1)];

        return [
            Math.round(a[0] + (b[0] - a[0]) * t),
            Math.round(a[1] + (b[1] - a[1]) * t),
            Math.round(a[2] + (b[2] - a[2]) * t)
        ];
    }

    renderIndexCanvas(width, height, rastersByBand, indexKey) {
        const canvas = this.documentObj.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(width, height);
        const bandKeys = this.getIndexConfig(indexKey).bands;
        const count = rastersByBand[bandKeys[0]].length;

        for (let i = 0; i < count; i++) {
            const bands = {
                red: rastersByBand.red ? rastersByBand.red[i] : 0,
                nir: rastersByBand.nir ? rastersByBand.nir[i] : 0,
                green: rastersByBand.green ? rastersByBand.green[i] : 0,
                swir1: rastersByBand.swir1 ? rastersByBand.swir1[i] : 0,
                swir2: rastersByBand.swir2 ? rastersByBand.swir2[i] : 0
            };

            const value = this.calculateIndexValue(indexKey, bands);
            const [r, g, b] = this.valueToRgb(value, indexKey);
            const o = i * 4;

            img.data[o] = r;
            img.data[o + 1] = g;
            img.data[o + 2] = b;
            img.data[o + 3] = 255;
        }

        ctx.putImageData(img, 0, 0);
        return canvas;
    }

    async canvasToBlob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Не удалось получить PNG blob из canvas'));
                    return;
                }
                resolve(blob);
            }, 'image/png');
        });
    }

    openResultPopup(bounds, item, candidateCount, indexKey) {
        this.L.popup()
            .setLatLng(bounds.getCenter())
            .setContent(`
                <div style="font:13px Arial,sans-serif">
                    <b>${this.escapeHtml(indexKey.toUpperCase())} ready</b><br>
                    ID: ${this.escapeHtml(item?.id || '—')}<br>
                    Date: ${this.escapeHtml(item?.properties?.datetime || '—')}<br>
                    Cloud: ${this.escapeHtml(item?.properties?.['eo:cloud_cover'] ?? '—')}%<br>
                    Candidates: ${this.escapeHtml(candidateCount)}
                </div>
            `)
            .openOn(this.map);
    }

    async handlePmCreate(e) {
        if (this.currentRect) this.map.removeLayer(this.currentRect);
        this.clearOverlayOnly();
        this.currentRect = e.layer;

        const bounds = this.currentRect.getBounds();
        const bbox = [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth()
        ];
        const bboxCenter = bounds.getCenter();
        const areaM2 = this.computeApproxAreaM2(bounds);
        const approxAreaM2 = Math.round(areaM2);
        const params = this.getInputParams();
        const selectedIndex = params.indexKey;

        this.updateLegend(selectedIndex);
        this.setBbox({ bbox, approx_area_m2: approxAreaM2 });

        if (areaM2 > this.getConfig().maxAreaM2) {
            const payload = {
                error: 'area_limit_exceeded',
                approx_area_m2: approxAreaM2,
                max_area_m2: this.getConfig().maxAreaM2
            };

            this.lastResult = payload;
            if (this.state) this.state.sentinelIndexResult = payload;

            const approxAreaKm2 = areaM2 / 1_000_000;
            const maxAreaKm2 = this.getConfig().maxAreaM2 / 1_000_000;

            this.setStatus(
                `Площадь слишком большая: ${approxAreaKm2.toFixed(2)} км². Допустимо не более ${maxAreaKm2.toFixed(2)} км².`,
                'bad'
            );

            this.setResult(payload);
            this.disableDraw();
            return;
        }

        this.setStatus('Ищем сцену Sentinel-2...');
        this.setResult('Запрос...');

        try {
            const searchResult = await this.searchScene(bbox, bboxCenter, params);

            if (!searchResult?.best) {
                const payload = {
                    error: 'no_scene',
                    approx_area_m2: approxAreaM2
                };

                this.lastResult = payload;
                if (this.state) this.state.sentinelIndexResult = payload;

                this.setStatus('Сцена не найдена.', 'bad');
                this.setResult('По заданному bbox/диапазону дат/облачности ничего не найдено.');
                this.disableDraw();
                return;
            }

            const item = searchResult.best;
            const sceneEpsg = item?.properties?.['proj:epsg'] || this.getConfig().defaultSceneEpsg;
            const assetUrls = this.buildAssetUrls(item, selectedIndex);

            const previewPayload = {
                id: item.id,
                datetime: item?.properties?.datetime || null,
                cloud_cover: item?.properties?.['eo:cloud_cover'] ?? null,
                epsg: sceneEpsg,
                index: selectedIndex,
                assets: assetUrls,
                preview_px: this.getConfig().previewPx,
                approx_area_m2: approxAreaM2,
                candidate_count: searchResult.candidates.length,
                candidate_ids: searchResult.candidates.map((f) => f.id)
            };

            this.setResult(previewPayload);
            this.setStatus(`Читаем COG и считаем ${selectedIndex.toUpperCase()}...`);

            const { width, height, rastersByBand } = await this.loadWindowedBands(
                assetUrls,
                bbox,
                sceneEpsg
            );

            const canvas = this.renderIndexCanvas(width, height, rastersByBand, selectedIndex);
            const blob = await this.canvasToBlob(canvas);

            this.overlayUrl = URL.createObjectURL(blob);
            this.overlay = this.L.imageOverlay(this.overlayUrl, bounds, {
                opacity: 1,
                interactive: false
            }).addTo(this.map);

            const finalPayload = {
                indexKey: selectedIndex,
                indexTitle: this.getIndexConfig(selectedIndex).title,
                indexSubtitle: this.getIndexConfig(selectedIndex).subtitle,
                legendLabels: this.getIndexConfig(selectedIndex).labels,
                legendGradient: this.getIndexConfig(selectedIndex).gradient,
                bbox,
                approx_area_m2: approxAreaM2,
                scene_id: item.id,
                datetime: item?.properties?.datetime || null,
                cloud_cover: item?.properties?.['eo:cloud_cover'] ?? null,
                epsg: sceneEpsg,
                assets: assetUrls,
                preview_px: this.getConfig().previewPx,
                candidate_count: searchResult.candidates.length,
                candidate_ids: searchResult.candidates.map((feature) => feature.id)
            };

            this.lastResult = finalPayload;
            if (this.state) this.state.sentinelIndexResult = finalPayload;

            this.setStatus(`${selectedIndex.toUpperCase()} построен.`, 'ok');
            this.setResult(finalPayload);
            this.openResultPopup(bounds, item, searchResult.candidates.length, selectedIndex);

        } catch (err) {
            console.error('Index error raw:', err);
            console.error('Index error message:', err?.message);
            console.error('Index error stack:', err?.stack);
            console.error('Index error object json:', (() => {
                try {
                    return JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
                } catch (e) {
                    return 'json stringify failed';
                }
            })());

            const errorText =
                err?.message ||
                err?.stack ||
                (typeof err === 'string' ? err : 'Unknown error');

            this.setStatus('Ошибка: ' + errorText, 'bad');
            this.setResult({
                message: err?.message || null,
                stack: err?.stack || null,
                name: err?.name || null
            });

            this.lastResult = {
                error: errorText,
                message: err?.message || null,
                stack: err?.stack || null,
                name: err?.name || null
            };

            if (this.state) {
                this.state.sentinelIndexResult = this.lastResult;
            }
        } finally {
            this.disableDraw();
        }
    }
}