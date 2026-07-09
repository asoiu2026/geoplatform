// ui/templates.js
export function replaceTokens(template, keys, values) {
    return keys.reduce((result, key, index) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return result.replace(new RegExp(escapedKey, 'g'), values[index] ?? '');
    }, template);
}

export function tpl2item(tpl, keys, values) {
    const html = replaceTokens(tpl, keys, values).trim();
    return $(html)[0];
}

export function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function hasMeaningfulValue(value) {
    return !['', undefined, 'null', null, 'Не заполнено'].includes(value);
}

export const heatmapLegendTpl = `
<li class="heatmap-legend-item">
    <div class="heatmap-legend">
        <div class="heatmap-legend__bar" style="background: {HEATMAP_GRADIENT};"></div>
        <div class="heatmap-legend__labels">
            <span>Низкая</span>
            <span>Высокая</span>
        </div>
    </div>
</li>
`;