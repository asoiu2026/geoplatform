// services/LegendStyleService.js
import { hasMeaningfulValue } from '../ui/templates.js';

export class LegendStyleService {
    findLayer(item, feature) {
        const layers = item.layers || [];
        const value = feature.properties?.[item.attribute];

        let currentLayer = null;

        layers.some((layer) => {
            let condition = false;

            if (layer.method === 'set') {
                condition = Array.isArray(layer.value) && layer.value.includes(value);
            } else if (layer.method === 'interval') {
                condition = value >= layer.value[0] && value <= layer.value[1];
            }

            if (condition) {
                currentLayer = layer;
                return true;
            }
            return false;
        });

        return currentLayer;
    }

    popupContentBuild(item, currentLayer, feature) {
        const title = currentLayer ? currentLayer.title : 'Неклассифицировано';
        let popupContent = `<h3 style="font-weight: normal;"><strong>${item.title}</strong>: ${title}</h3>`;

        if (!Array.isArray(item.properties)) return popupContent;

        item.properties.forEach((propertyKey) => {
            let label = propertyKey;
            if (item.aliases && item.aliases[propertyKey] !== undefined) {
                label = item.aliases[propertyKey];
            }

            const value = feature.properties?.[propertyKey];
            if (hasMeaningfulValue(value)) {
                popupContent += `<p><strong>${label}:</strong> ${value}</p>`;
            }
        });

        return popupContent;
    }

    buildPolygonStyle(currentLayer) {
        if (!currentLayer) {
            return {
                fillColor: '#999999',
                weight: 2,
                fillOpacity: 1,
                opacity: 1
            };
        }

        const itemColor = currentLayer.color;
        const borderColor = currentLayer.border || itemColor;
        const borderWidth = currentLayer['border-width'] || 1;
        const opacityVal = currentLayer.opacity !== undefined ? currentLayer.opacity : 1;

        return {
            color: borderColor,
            weight: borderWidth,
            fillColor: itemColor,
            fillOpacity: opacityVal,
            opacity: 1
        };
    }
}