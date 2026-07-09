function h(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderHero({ eyebrow, title, metricLabel, metricValue }) {
    return `
        <div class="analysis-sheet__hero">
            <div>
                <div class="analysis-sheet__eyebrow">${h(eyebrow || '')}</div>
                <h2 class="analysis-sheet__title">${h(title || '')}</h2>
            </div>

            ${metricLabel && metricValue ? `
                <div class="analysis-sheet__hero-metric">
                    <div class="analysis-sheet__hero-metric-label">${h(metricLabel)}</div>
                    <div class="analysis-sheet__hero-metric-value">${h(metricValue)}</div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderEmpty(text, compact = false) {
    return `
        <div class="analysis-empty ${compact ? 'analysis-empty--compact' : ''}">
            ${h(text)}
        </div>
    `;
}

function renderCard(title, bodyHtml, cardClass = '') {
    const cls = ['analysis-card', cardClass].filter(Boolean).join(' ');

    return `
        <section class="${cls}">
            <div class="analysis-card__header">
                <h3 class="analysis-card__title">${(title || 'Без названия')}</h3>
            </div>
            ${bodyHtml}
        </section>
    `;
}

function renderStat(label, value, meta = '') {
    return `
        <div class="analysis-stat">
            <div class="analysis-stat__label">${h(label)}</div>
            <div class="analysis-stat__value">${h(value)}</div>
            ${meta ? `<div class="analysis-stat__meta">${h(meta)}</div>` : ''}
        </div>
    `;
}

function renderKeyValueRows(rows) {
    return `
        <div class="analysis-kv">
            ${rows.map((row) => `
                <div class="analysis-kv__row">
                    <span class="analysis-kv__key">${h(row.key)}</span>
                    <span class="analysis-kv__value">${h(row.value)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLegendListItem({ color, border, title, rows }) {
    return `
        <div class="analysis-list-item">
            <div class="analysis-list-item__head">
                <span
                    class="analysis-list-item__swatch"
                    style="--swatch-bg:${h(color || '#94a3b8')}; --swatch-border:${h(border || '#64748b')};"
                ></span>
                <div class="analysis-list-item__title">${h(title || 'Неклассифицировано')}</div>
            </div>

            ${renderKeyValueRows(rows)}
        </div>
    `;
}

function renderPropertyList(properties = []) {
    if (!properties.length) {
        //return renderEmpty('Нет доступных атрибутов.', true);
    }

    return `
        <div class="analysis-kv">
            ${properties.map((prop) => `
                <div class="analysis-kv__row">
                    <span class="analysis-kv__key">${h(prop.label || prop.key || 'Поле')}</span>
                    <span class="analysis-kv__value">${h(String(prop.value ?? ''))}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPointMatchItem(match) {
    return `
        <div class="analysis-list-item">
            <div class="analysis-list-item__head">
                <span
                    class="analysis-list-item__swatch"
                    style="--swatch-bg:${h(match.layerColor || '#94a3b8')}; --swatch-border:${h(match.layerBorder || '#64748b')};"
                ></span>
                <div class="analysis-list-item__title">${h(match.layerTitle || 'Объект')}</div>
            </div>

            ${renderPropertyList(match.properties || [])}
        </div>
    `;
}

function renderHeatmapStats(info, formatAreaUnit, formatDensityLabel) {
    return `
        <div class="analysis-stats-grid">
            ${renderStat('Количество объектов', String(info.count ?? 0))}
            ${renderStat('Площадь полигона', `${String(info.area ?? '')} ${formatAreaUnit(info.areaUnit)}`)}
            ${renderStat('Плотность', info.densityText || '', formatDensityLabel(info.areaUnit))}
        </div>
    `;
}

function renderPolygonHeatmapCard(res, formatAreaUnit, formatDensityLabel) {
    return renderCard(
        res.title || 'Тепловой слой',
        renderHeatmapStats(res.summary, formatAreaUnit, formatDensityLabel),
        'analysis-card--compact'
    );
}

function renderPointHeatmapCard(res, formatAreaUnit, formatDensityLabel) {
    return renderCard(
        res.title || 'Тепловой слой',
        renderHeatmapStats(res.densityInfo, formatAreaUnit, formatDensityLabel),
        'analysis-card--compact'
    );
}

function renderPolygonSummaryCard(res) {
    if (!res.summary?.items?.length) {
        return renderCard(
            res.title || 'Без названия',
            renderEmpty('Нет объектов в пределах полигона.', true),
            ''
        );
    }

    const bodyHtml = `
        <div class="analysis-list">
            ${res.summary.items.map((entry) => {
        const rows = [];

        if (entry.count > 0) {
            rows.push({
                key: 'Количество',
                value: String(entry.count)
            });
        }

        if (entry.areaSqMeters > 0) {
            rows.push({
                key: 'Площадь',
                value: `${(entry.areaSqMeters / 1000000).toFixed(2)} км²`
            });

            rows.push({
                key: 'Доля',
                value: `${(entry.share * 100).toFixed(1)}%`
            });
        }

        return renderLegendListItem({
            color: entry.layerColor,
            border: entry.layerBorder,
            title: entry.layerTitle || 'Неклассифицировано',
            rows
        });
    }).join('')}
        </div>
    `;

    return renderCard(res.title || 'Без названия', bodyHtml, '');
}

function renderThemeMatchesCard(res) {
    if (!res.matches?.length) {
        return renderCard(
            res.title || 'Без названия',
            renderEmpty('Совпадения не найдены.', true),
            ''
        );
    }

    const bodyHtml = `
        <div class="analysis-list">
            ${res.matches.map((match) => renderPointMatchItem(match)).join('')}
        </div>
    `;

    return renderCard(res.title || 'Без названия', bodyHtml, '');
}

export function renderPolygonIdentifyTemplate({
                                                  results,
                                                  polygonAreaKm2,
                                                  aggregations = [],
                                                  formatAreaUnit,
                                                  formatDensityLabel
                                              }) {
    const heroHtml = renderHero({
        eyebrow: 'Пространственный анализ',
        title: 'Паспорт территории',
        metricLabel: 'Площадь полигона',
        metricValue: `${polygonAreaKm2.toFixed(2)} км²`
    });

    const aggregationsHtml = renderAggregations(aggregations, {
        showMapActions: true
    });

    if (!results.length && !aggregations.length) {
        return `
            <div class="analysis-sheet">
                ${heroHtml}

                <div class="analysis-card analysis-card--empty">
                    ${renderEmpty('Данные в пределах полигона не найдены.')}
                </div>
            </div>
        `;
    }

    const sectionsHtml = results.map((res) => {
        if (res.mode === 'heatmap-polygon') {
            return renderPolygonHeatmapCard(res, formatAreaUnit, formatDensityLabel);
        }

        if (res.mode === 'polygon-summary') {
            return renderPolygonSummaryCard(res);
        }

        return '';
    }).join('');

    return `
        <div class="analysis-sheet">
            ${heroHtml}

            ${aggregationsHtml}

            <div class="analysis-sections">
                ${sectionsHtml}
            </div>
        </div>
    `;
}

export function renderPointIdentifyTemplate({
                                                results,
                                                latlng,
                                                aggregations = [],
                                                formatAreaUnit,
                                                formatDensityLabel
                                            }) {
    const lat = typeof latlng?.lat === 'number' ? latlng.lat.toFixed(5) : '';
    const lng = typeof latlng?.lng === 'number' ? latlng.lng.toFixed(5) : '';
    const metricValue = lat && lng ? `${lat}, ${lng}` : '';

    const heroHtml = renderHero({
        eyebrow: 'Пространственный анализ',
        title: 'Данные по точке',
        metricLabel: metricValue ? 'Координаты' : '',
        metricValue
    });

    const aggregationsHtml = renderAggregations(aggregations, {
        showMapActions: false
    });

    if (!results.length && !aggregations.length) {
        return `
            <div class="analysis-sheet">
                ${heroHtml}

                <div class="analysis-card analysis-card--empty">
                    ${renderEmpty('В выбранной точке данные не найдены.')}
                </div>
            </div>
        `;
    }

    const sectionsHtml = results.map((res) => {
        if (res.mode === 'heatmap') {
            return renderPointHeatmapCard(res, formatAreaUnit, formatDensityLabel);
        }

        return renderThemeMatchesCard(res);
    }).join('');

    return `
        <div class="analysis-sheet">
            ${heroHtml}

            ${aggregationsHtml}

            <div class="analysis-sections analysis-sections--point">
                ${sectionsHtml}
            </div>
        </div>
    `;
}

function getScoreTone(score) {
    const value = Number(score);
    if (!Number.isFinite(value)) return 'is-unknown';
    if (value < 1.5) return 'is-poor';
    if (value < 2.5) return 'is-low';
    if (value < 3.5) return 'is-mid';
    if (value < 4.5) return 'is-good';
    return 'is-great';
}

export function renderAggregations(aggregations = [], options = {}) {
    if (!aggregations.length) return '';

    const {
        showMapActions = false
    } = options || {};

    return `
        <section class="analysis-section analysis-section--aggregations">
            <div class="analysis-section__head">
                <div>
                    <div class="analysis-section__eyebrow">Интегральная оценка</div>
                    <h3 class="analysis-section__title">Агрегационные метрики</h3>
                </div>
            </div>

            <div class="analysis-aggregation-grid">
                ${aggregations.map((metric) => {
        const metricTone = getScoreTone(metric.score);

        return `
                        <article class="analysis-aggregation-card ${metricTone}">
                            <div class="analysis-aggregation-card__hero">
                                <div class="analysis-aggregation-card__meta">
                                    <h4 class="analysis-aggregation-card__title">${h(metric.title)}</h4>
                                    <p class="analysis-aggregation-card__description">${h(metric.description || '')}</p>
                                </div>

                                <div class="analysis-score-orb ${metricTone}">
                                    <div class="analysis-score-orb__value">${h(String(metric.score))}</div>
                                    <div class="analysis-score-orb__scale">из 5</div>
                                </div>
                            </div>

                            <div class="analysis-score-band">
                                <div
                                    class="analysis-score-band__fill ${metricTone}"
                                    style="width:${Math.max(0, Math.min(100, (Number(metric.score) || 0) * 20))}%"
                                ></div>
                            </div>

                            <div class="analysis-aggregation-card__footer">
                                <span class="analysis-badge analysis-badge--score ${metricTone}">
                                    ${h(metric.scoreLabel || '')}
                                </span>
                                <span class="analysis-badge analysis-badge--count">
                                    Факторов: ${h(String(metric.branches?.length || 0))}
                                </span>

                                ${showMapActions ? `
                                    <button
                                        type="button"
                                        class="analysis-badge analysis-badge--action"
                                        data-show-aggregation-on-map="${h(metric.id)}"
                                    >
                                        <span class="analysis-action-button__text">Показать на карте</span>
                                    </button>
                                ` : ''}
                            </div>

                            <div class="analysis-branch-list">
                                ${(metric.branches || []).map((branch) => {
            const branchTone = getScoreTone(branch.score);

            return `
                                        <section class="analysis-branch-card ${branchTone}">
                                            <div class="analysis-branch-card__top">
                                                <div>
                                                    <div class="analysis-branch-card__title">${h(branch.title)}</div>
                                                    <div class="analysis-branch-card__weight">
                                                        Вес: ${h(String(branch.weight ?? '—'))}
                                                    </div>
                                                </div>
                                                <div class="analysis-branch-card__score ${branchTone}">
                                                    ${h(String(branch.score))}
                                                </div>
                                            </div>

                                            <div class="analysis-branch-progress">
                                                <div
                                                    class="analysis-branch-progress__fill ${branchTone}"
                                                    style="width:${Math.max(0, Math.min(100, (Number(branch.score) || 0) * 20))}%"
                                                ></div>
                                            </div>

                                            <details class="analysis-factor-disclosure">
                                                <summary class="analysis-factor-disclosure__summary">
                                                    <span class="analysis-factor-disclosure__title">
                                                        Факторы: ${h(String(branch.items?.length || 0))}
                                                    </span>
                                                </summary>

                                                <div class="analysis-factor-list">
                                                    ${(branch.items || []).map((item) => {
                const itemTone = getScoreTone(item.score);

                const matchedItemsHtml = Array.isArray(item.matchedItems) && item.matchedItems.length
                    ? `
                    <div class="analysis-factor__parts">
                        ${item.matchedItems.map((part) => `
                            <div class="analysis-factor-part">
                                <div class="analysis-factor-part__top">
                                    <div class="analysis-factor-part__title">
                                        ${h(part.matchedLabel || 'Без названия')}
                                    </div>
                                    <div class="analysis-factor-part__score">
                                        ${h(String(part.score ?? '—'))}
                                    </div>
                                </div>

                                <div class="analysis-factor-part__meta">
                                    <span>
                                        доля ${h(Number.isFinite(part.sharePercent) ? part.sharePercent.toFixed(1) : '0')}%
                                    </span>
                                    ${Number.isFinite(part.areaSqMeters) && part.areaSqMeters > 0
                        ? `<span>· ${(part.areaSqMeters / 1000000).toFixed(2)} км²</span>`
                        : ''}
                                    ${Number.isFinite(part.count) && part.count > 0
                        ? `<span>· фрагментов ${h(String(part.count))}</span>`
                        : ''}
                                    ${part.fragmentationLabel
                        ? `<span>· ${h(part.fragmentationLabel)}</span>`
                        : ''}
                                    ${part.matchedPrefix
                        ? `<span>· префикс ${h(part.matchedPrefix)}</span>`
                        : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `
                    : `
                    <div class="analysis-factor__hint">
                        ${h(item.matchedLabel || item.matchedId || 'Нет данных')}
                    </div>
                `;

                return `
                <div class="analysis-factor ${itemTone}">
                    <div class="analysis-factor__main">
                        <div class="analysis-factor__title">${h(item.title)}</div>
                        ${matchedItemsHtml}
                    </div>
                    <div class="analysis-factor__side">
                        <div class="analysis-factor__score ${itemTone}">
                            ${h(String(item.score))}
                        </div>
                        <div class="analysis-factor__weight">
                            вес ${h(String(item.weight ?? '—'))}
                        </div>
                    </div>
                </div>
            `;
            }).join('')}
                                                </div>
                                            </details>
                                        </section>
                                    `;
        }).join('')}
                            </div>
                        </article>
                    `;
    }).join('')}
            </div>
        </section>
    `;
}

export function renderAggregationMatchedItems(items = []) {
    if (!Array.isArray(items) || !items.length) return '';

    return `
        <div class="analysis-list">
            ${items.map((entry) => {
        const rows = [];

        if (Number.isFinite(entry.score)) {
            rows.push({ key: 'Балл', value: String(entry.score) });
        }

        if (Number.isFinite(entry.sharePercent)) {
            rows.push({ key: 'Доля', value: `${entry.sharePercent.toFixed(1)}%` });
        }

        if (Number.isFinite(entry.areaSqMeters) && entry.areaSqMeters > 0) {
            rows.push({ key: 'Площадь', value: `${(entry.areaSqMeters / 1000000).toFixed(2)} км²` });
        }

        if (Number.isFinite(entry.count) && entry.count > 0) {
            rows.push({ key: 'Фрагментов', value: String(entry.count) });
        }

        if (entry.fragmentationLabel) {
            rows.push({ key: 'Структура', value: entry.fragmentationLabel });
        }

        if (entry.matchedPrefix) {
            rows.push({ key: 'Префикс', value: entry.matchedPrefix });
        }

        return renderLegendListItem({
            color: '#e2e8f0',
            border: '#94a3b8',
            title: entry.matchedLabel || 'Без названия',
            rows
        });
    }).join('')}
        </div>
    `;
}

export function renderAggregationItem(item) {
    const rows = [
        { key: 'Вес', value: String(item.weight ?? '—') },
        { key: 'Балл', value: Number.isFinite(item.score) ? String(item.score) : '—' }
    ];

    if (item.matchedLabel && !item.matchedItems?.length) {
        rows.push({ key: 'Источник', value: item.matchedLabel });
    }

    const detailsHtml = item.matchedItems?.length
        ? renderAggregationMatchedItems(item.matchedItems)
        : renderKeyValueRows(rows);

    return `
        <div class="analysis-aggregation-item">
            <div class="analysis-aggregation-item__head">
                <div class="analysis-aggregation-item__title">${h(item.title)}</div>
                <div class="analysis-aggregation-item__score">${Number.isFinite(item.score) ? h(String(item.score)) : '—'}</div>
            </div>
            ${!item.matchedItems?.length ? `<div class="analysis-aggregation-item__meta">${renderKeyValueRows(rows)}</div>` : ''}
            ${detailsHtml}
        </div>
    `;
}

export function renderAggregationBranch(branch) {
    const itemsHtml = Array.isArray(branch.items)
        ? branch.items.map((item) => renderAggregationItem(item)).join('')
        : renderEmpty('Нет данных', true);

    return `
        <section class="analysis-card analysis-card--aggregation">
            <div class="analysis-card__header">
                <h3 class="analysis-card__title">${h(branch.title)}</h3>
            </div>
            <div class="analysis-stats-grid">
                ${renderStat('Вес', String(branch.weight ?? '—'))}
                ${renderStat('Балл', Number.isFinite(branch.score) ? String(branch.score) : '—')}
                ${renderStat('Уровень', branch.scoreLabel || 'Нет данных')}
            </div>
            <div class="analysis-aggregation-items">
                ${itemsHtml}
            </div>
        </section>
    `;
}

export function renderAggregationProfile(profile) {
    const branchesHtml = Array.isArray(profile.branches)
        ? profile.branches.map((branch) => renderAggregationBranch(branch)).join('')
        : '';

    return `
        <section class="analysis-card analysis-card--profile">
            <div class="analysis-card__header">
                <h3 class="analysis-card__title">${h(profile.title)}</h3>
            </div>
            <div class="analysis-stats-grid">
                ${renderStat('Итоговый балл', profile.score ?? '—')}
                ${renderStat('Уровень', profile.scoreLabel || 'Нет данных')}
            </div>
            ${profile.description ? `<div class="analysis-card__description">${h(profile.description)}</div>` : ''}
            <div class="analysis-aggregation-branches">
                ${branchesHtml}
            </div>
        </section>
    `;
}