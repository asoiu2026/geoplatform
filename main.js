import { initGisEngine } from './gisEngine.js';

try {
    window.GisEngine = initGisEngine({
        L,
        turf,
        geobuf,
        Pbf,
        $,
        Slideout,
        GeoTIFF,
        proj4
    });
} catch (e) {
    console.error('GisEngine init failed:', e);
}