// ui/bindUiControls.js
export function bindUiControls({
                                   identifyService,
                                   polygonAnalysisService,
                                   sentinelIndexService,
                                   $,
                                   windowObj = window,
                                   documentObj = document
                               }) {


    const slideout = new Slideout({
        panel: document.getElementById('panel'),
        menu: document.getElementById('menu'),
        padding: 300,
        tolerance: 70,
        touch: false,
        side: 'left'
    });

    const identifyButton = documentObj.getElementById('identify-toggle');

    if (identifyButton) {
        identifyButton.addEventListener('click', (e) => {
            e.preventDefault();
            identifyService.toggle();
        });
    }

    const polygonBtn = document.getElementById('polygon-analysis-toggle');
    if (polygonBtn) {
        polygonBtn.addEventListener('click', () => {
            polygonAnalysisService.toggle();
        });
    }

    const menuOpeners = documentObj.getElementsByClassName('filters-open');
    for (let i = 0; i < menuOpeners.length; i++) {
        menuOpeners[i].addEventListener('click', () => {
            slideout.toggle();
        });
    }

    const sentinelBtn = documentObj.getElementById('sentinel-index-toggle');
    if (sentinelBtn && sentinelIndexService) {
        sentinelBtn.addEventListener('click', () => {
            sentinelIndexService.toggle();
        });
    }

    const sentinelClearBtn = documentObj.getElementById('sentinel-index-clear');
    if (sentinelClearBtn && sentinelIndexService) {
        sentinelClearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            sentinelIndexService.clearAll();
        });
    }

    $(documentObj).ready(() => {
        $('#menu').show();

        if ($(windowObj).width() > 1140) {
            $('.filter-button').trigger('click');
        }
    });
}