// services/GridService.js
export class GridService {
    constructor(state, L) {
        this.state = state;
        this.L = L;
    }

    updateGrid(color) {
        if (this.state.grid) {
            this.state.map.removeLayer(this.state.grid);
        }

        this.state.grid = this.L.latlngGraticule({
            sides: [' с.ш.', ' ю.ш.', ' в.д.', ' з.д.'],
            color,
            showLabel: true,
            dashArray: [5, 5],
            zoomInterval: [
                { start: 2, end: 3, interval: 30 },
                { start: 4, end: 4, interval: 10 },
                { start: 5, end: 7, interval: 5 },
                { start: 8, end: 10, interval: 1 }
            ]
        });

        this.state.grid.addTo(this.state.map);
    }
}