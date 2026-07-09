// core/AppState.js
export class AppState {
    constructor() {
        this.map = null;
        this.baseURL = "https://storage.yandexcloud.net/metageo/";
        this.baseMaps = {
            'hybrid': {'selected':false,    'key': 'hybrid',     'title': 'Гибрид',  'url': 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', 'subdomains': ['mt0','mt1','mt2','mt3'], 'maxNativeZoom': 18},
            'satellite': {'selected':false,  'key': 'satellite',  'title': 'Спутник', 'url': 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 'subdomains': ['mt0','mt1','mt2','mt3'], 'maxNativeZoom': 18},
            'street': {'selected':true,    'key': 'street',     'title': 'Улицы',   'url': 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', 'subdomains': ['mt0','mt1','mt2','mt3'], 'maxNativeZoom': 18},
            'OSM': {'selected':false,       'key': 'OSM',        'title': 'OSM',     'url': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 'subdomains': false, 'maxNativeZoom': 18},
            'dem': {'selected':false,       'key': 'dem',        'gridColor': '#000',   'title': 'Рельеф',     'url': 'https://maps-for-free.com/layer/relief/z{z}/row{y}/{z}_{x}-{y}.jpg', 'subdomains': false, 'maxNativeZoom': 11},
            'gen': {'selected':false,       'key': 'gen',        'gridColor': '#000',   'title': 'Генштаб ГГЦ',     'url': 'http://mbt2.huntlands.ru/data/topo_ggc/{z}/{x}/{y}.jpg', 'subdomains': false, 'maxNativeZoom': 15},
            'forest_loss': {'selected':false,       'key': 'forest_loss',        'gridColor': '#000',   'title': 'Утрата леса (2000-2021 гг.)',     'url': 'https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.7/loss_year_alpha/{z}/{x}/{y}.png', 'subdomains': false, 'maxNativeZoom': 18, 'backend': 'hybrid'},
        };
        this.tiles = [
            {'key': 't_map1984', 'title': '1984 - Саранск (снимок)', 'url': 'https://meta.rgo.life/gis/image?uri=/8/14198417/Z{z}/{y}/{x}.jpg', 'maxNativeZoom': 16},
            {'key': 't_map1975', 'title': '1975 - Саранск-Пенза (снимок)', 'url': 'https://meta.rgo.life/gis/image?uri=/7/14197522/Z{z}/{y}/{x}.jpg', 'maxNativeZoom': 14},
            {'key': 't_penza',   'title': '1832 - Специальная карта запада Российской Империи', 'url': 'https://meta.rgo.life/gis/image?uri=/3/1418321/Z{z}/{y}/{x}.jpg', 'maxNativeZoom': 11},
            {'key': 't_rm_1931', 'title': '1931 - Карта Мордовской автономной области 1:400 000', 'url': 'https://meta.rgo.life/gis/image?uri=/3/14193113/Z{z}/{y}/{x}.jpg', 'maxNativeZoom': 11},
        ];
        this.identifyConfig = {

            'landscape': { enabled: true },
            'bedrock': { enabled: true },
            'quater': { enabled: true },
            'litology': { enabled: true },
            'soil': { enabled: true },
            'soil-resist': { enabled: true },
            'ground_water': { enabled: true },
            'water_depth': { enabled: true },
            'water-type': { enabled: true },
            'water-class': { enabled: true },
            'ch_clorid': { enabled: true },
            'ch_ferrum': { enabled: true },
            'ch_ftorid': { enabled: true },
            'ch_sulfat': { enabled: true },
            'resources_gis_rm': { enabled: true },
            'resources': { enabled: true,
                properties: [
                    "alias"
                ] },
            'agro': { enabled: true },
            'hunt': { enabled: true,
                properties: [
                    "title"
                ] },


            'rodniki-density': { enabled: true },
            'opolzni-density': { enabled: true },

        };

        this.baseTiles = null;
        this.backendTiles = null;
        this.grid = null;

        this.parentGroup = null;
        this.subGroupsPolygons = {};
        this.thematicLayers = {};

        this.numberOfLayers = 0;
        this.uploadedLayers = 0;

        this.identifyMode = false;
        this.identifyClickHandler = null;

        this.polygonAnalysisMode = false;
        this.analysisPolygonGroup = null;
        this.aggregationOverlayGroup = null;
        this.analysisDrawHandler = null;
        this.activeResultPopup = null;

        this.sentinelIndexResult = null;

        this.sentinelIndex = {
            enabled: false,
            drawing: false,
            lastParams: null,
            lastResult: null,
            tempLayer: null
        };

        this.legend = [
            {
                'id': 'polygons',
                'visible': false,
                'opacity': true,
                'title': 'Полигоны',
                'source': this.baseURL + "polygons.pbf",
                'attribute': 'title',

                'properties': [
                    'title',
                    'description'
                ],
                'aliases': {
                    'title': 'Название',
                    'description': 'Описание'
                },

                'layers': [
                    {
                        'id': 'polygon-1',
                        'title': 'Нуя',
                        'color': 'rgba(32,76,219,0.8)',
                        'method': 'set',
                        'value': ['Полигон «Нуя»'],
                        'front': true
                    },
                    {
                        'id': 'polygon-2',
                        'title': 'Мокша–Темников',
                        'color': 'rgba(182,21,21,0.8)',
                        'method': 'set',
                        'value': ['Полигон «Мокша–Темников»'],
                        'front': true
                    },
                    {
                        'id': 'polygon-3',
                        'title': 'Алатырь–Смольный',
                        'color': 'rgba(182,86,21,0.8)',
                        'method': 'set',
                        'value': ['Полигон «Алатырь–Смольный»'],
                        'front': true
                    },
                    {
                        'id': 'polygon-4',
                        'title': 'Саранск',
                        'color': 'rgba(200,193,14,0.8)',
                        'method': 'set',
                        'value': ['Полигон «Саранск»'],
                        'front': true
                    },
                    {
                        'id': 'polygon-5',
                        'title': 'Мокша',
                        'color': 'rgba(114,184,15,0.8)',
                        'method': 'set',
                        'value': ['Полигон «Мокша»'],
                        'front': true
                    },
                    {
                        'id': 'polygon-6',
                        'title': 'Инерка',
                        'color': 'rgba(185,22,204,0.8)',
                        'method': 'set',
                        'value': ['Полигон «Инерка»'],
                        'front': true
                    }
                ]
            },
            {
                'id': 'bedrock',
                'visible': true,
                'opacity': true,
                'title': 'Коренные породы',
                'source': this.baseURL + "bedrock.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'bedrock-1',
                        'title': 'НЕОГЕНОВАЯ СИСТЕМА. Плиоцен. Пески, алевролиты, прослои глин',
                        'color': '#fefbc3',
                        'method': 'set',
                        'value': [100]
                    },
                    {
                        'id': 'bedrock-2',
                        'title': 'НЕОГЕНОВАЯ СИСТЕМА. Миоцен. Глины с линзами песков и алевритов',
                        'color': '#fefa53',
                        'method': 'interval',
                        'value': [200, 500]
                    },
                    {
                        'id': 'bedrock-3',
                        'title': 'ПАЛЕОГЕНОВАЯ СИСТЕМА. ПАЛЕОЦЕН. Опоки, трепелы, диатомиты, мергели, песчаники, пески, глины',
                        'color': '#f5c24e',
                        'method': 'interval',
                        'value': [600, 900]
                    },
                    {
                        'id': 'bedrock-4',
                        'title': 'МЕЛОВАЯ СИСТЕМА. ВЕРХНИЙ ОТДЕЛ. Мел, мергели, пески, песчаники, опоки',
                        'color': '#a4fca5',
                        'method': 'set',
                        'value': [1000, 1100, 1200, 1300, 1400, 1500, 1600, 3800]
                    },
                    {
                        'id': 'bedrock-5',
                        'title': 'МЕЛОВАЯ СИСТЕМА. НИЖНИЙ ОТДЕЛ. Глины, пески, песчаники, алевриты',
                        'color': '#65dc41',
                        'method': 'interval',
                        'value': [1700, 2400]
                    },
                    {
                        'id': 'bedrock-6',
                        'title': 'ЮРСКАЯ СИСТЕМА. ВЕРХНИЙ ОТДЕЛ. Глины, пески с конкрециями фосфоритов',
                        'color': '#a5fafd',
                        'method': 'interval',
                        'value': [2500, 3100]
                    },
                    {
                        'id': 'bedrock-7',
                        'title': 'ЮРСКАЯ СИСТЕМА. СРЕДНИЙ ОТДЕЛ. Глины, пески, песчаники, сланцы, мергели',
                        'color': '#60d1dd',
                        'method': 'set',
                        'value': [3200, 3300]
                    },
                    {
                        'id': 'bedrock-8',
                        'title': 'ПЕРМСКАЯ СИСТЕМА. НИЖНИЙ ОТДЕЛ. Нерасчлененные отложения. Доломиты, известняки, гипсы с прослоями ангидритов',
                        'color': '#d48c31',
                        'method': 'set',
                        'value': [3400]
                    },
                    {
                        'id': 'bedrock-9',
                        'title': 'КАМЕННОУГОЛЬНАЯ СИСТЕМА. ВЕРХНИЙ ОТДЕЛ. Известняки, доломиты с прослоями глин',
                        'color': '#d2d2d2',
                        'method': 'interval',
                        'value': [3500, 3600]
                    },
                    {
                        'id': 'bedrock-10',
                        'title': 'КАМЕННОУГОЛЬНАЯ СИСТЕМА. СРЕДНИЙ ОТДЕЛ. Доломиты, известняки',
                        'color': '#d2d2d2',
                        'method': 'set',
                        'value': [3700]
                    }
                ]
            },
            {
                'id': 'quater',
                'visible': false,
                'opacity': true,
                'title': 'Четвертичные отложения',
                'source': this.baseURL + "quater.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'quater-1',
                        'title': 'СОВРЕМЕННЫЕ ОТЛОЖЕНИЯ. Болотные  отложения. Торф, суглинки, пески, глины',
                        'color': '#baa500',
                        'method': 'set',
                        'value': [100]
                    },
                    {
                        'id': 'quater-2',
                        'title': 'СОВРЕМЕННЫЕ ОТЛОЖЕНИЯ.  Аллювиальные отложения пойм. Пески, глины, суглинки, гравий, галечники',
                        'color': '#c3ffc3',
                        'method': 'set',
                        'value': [200]
                    },
                    {
                        'id': 'quater-3',
                        'title': 'ВЕРХНЕЧЕТВЕРТИЧНОЕ И СОВРЕМЕННОЕ ЗВЕНО. Аллювиально-эоловые отложения первой надпойменной террасы с переотложенными песками, супесями, суглинками',
                        'color': '#80de7f',
                        'method': 'set',
                        'value': [300]
                    },
                    {
                        'id': 'quater-4',
                        'title': 'ВЕРХНЕЧЕТВЕРТИЧНОЕ И СОВРЕМЕННОЕ ЗВЕНО. Пролювиальные отложения. Суглинки с прослоями и линзами супесей, песков',
                        'color': '#ea5cb6',
                        'method': 'set',
                        'value': [400]
                    },
                    {
                        'id': 'quater-5',
                        'title': 'ВЕРХНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Аллювиальные отложения первой надпойменной террасы. Пески, глины, суглинки, торф, галечники, гравий',
                        'color': '#02db00',
                        'method': 'set',
                        'value': [500, 600]
                    },                {
                        'id': 'quater-6',
                        'title': 'СРЕДНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Аллювиально-флювиогляциальные отложения долинно-зандрового уровня. Пески с гравием, валунами, галькой, суглинки',
                        'color': '#608100',
                        'method': 'set',
                        'value': [700]
                    },
                    {
                        'id': 'quater-7',
                        'title': 'СРЕДНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Аллювиальные отложения третьей надпойменной террасы. Пески, глины, суглинки, пески с гравием, галькой',
                        'color': '#008200',
                        'method': 'set',
                        'value': [800]
                    },
                    {
                        'id': 'quater-8',
                        'title': 'СРЕДНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Аллювиально-озерные отложения. Пески, алевриты, глины, суглинки, пески с гравием, галькой',
                        'color': '#0eb70e',
                        'method': 'set',
                        'value': [900]
                    },
                    {
                        'id': 'quater-9',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ СОВРЕМЕННОЕ ЗВЕНО. Делювиально-солифлюкционные отложения. Суглинки, глины',
                        'color': '#fee1b4',
                        'method': 'set',
                        'value': [1000]
                    },
                    {
                        'id': 'quater-10',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ СОВРЕМЕННОЕ ЗВЕНО. Элювиально-делювиальные отложения. Суглинки, глины, пески, дресва, щебень',
                        'color': '#feeaa6',
                        'method': 'set',
                        'value': [1001]
                    },
                    {
                        'id': 'quater-11',
                        'title': 'НИЖНЕ-СРЕДНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Озерные, аллювиальные и ффлювиогляциальные отложения. Пески, суглинки, глины, пески с гравием, галькой',
                        'color': '#88d2bc',
                        'method': 'set',
                        'value': [1100]
                    },
                    {
                        'id': 'quater-12',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Ледниковые отложения. Суглинки с гравием, галькой',
                        'color': '#7b1409',
                        'method': 'set',
                        'value': [1200]
                    },
                    {
                        'id': 'quater-13',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Аллювиально-флювиогляциальные отложения долинно-зандрового уровня. Пески, пески с галькой и гравием',
                        'color': '#fced96',
                        'method': 'set',
                        'value': [1300]
                    },
                    {
                        'id': 'quater-14',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Флювиогляциальные отложения. Пески, пески с гравием, галькой, суглинки',
                        'color': '#b0cd76',
                        'method': 'set',
                        'value': [1400]
                    },
                    {
                        'id': 'quater-15',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Озерно-ледниковые отложения. Пески, суглинки, глины',
                        'color': '#9cb596',
                        'method': 'set',
                        'value': [1500]
                    },
                    {
                        'id': 'quater-16',
                        'title': 'НИЖНЕЧЕТВЕРТИЧНОЕ ЗВЕНО. Ледниковые отложения. Суглинки, глины, валуны, галька',
                        'color': '#c16d15',
                        'method': 'set',
                        'value': [1600]
                    },
                    {
                        'id': 'quater-17',
                        'title': 'Дочетвертичные отложения',
                        'color': '#b09294',
                        'method': 'set',
                        'value': [1700]
                    },
                    {
                        'id': 'quater-18',
                        'title': 'Эоловые отложения',
                        'color': '#d6db00',
                        'method': 'set',
                        'value': [1800]
                    },
                    {
                        'id': 'quater-19',
                        'title': 'Отложения мощностью менее двух метров',
                        'color': '#d5d5d5',
                        'method': 'set',
                        'value': [1900]
                    },
                    {
                        'id': 'quater-20',
                        'title': 'Аллювиальные отложения. Пески, супеси',
                        'color': '#0b4a31',
                        'method': 'set',
                        'value': [2000]
                    },


                ]
            },
            {
                'id': 'litology',
                'visible': false,
                'opacity': true,
                'title': 'Литологический состав поверхностных отложений',
                'source': this.baseURL + "litology.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'litology-1',
                        'title': 'Аллювиальный комплекс.Современные отложения русел и пойменных террас. Глина с прослоями песка',
                        'color': '#4bafbf',
                        'method': 'set',
                        'value': [10]
                    },
                    {
                        'id': 'litology-2',
                        'title': 'Аллювиальный комплекс.Средне-верхнечетвертичные отложения надпойменных террас. Суглинок с прослоями песка, песок',
                        'color': '#6ae9dc',
                        'method': 'set',
                        'value': [20]
                    },
                    {
                        'id': 'litology-3',
                        'title': 'Элювиально-делювиальный комплекс средне-, верхне-, современночетвертичных отложений.Отложения в зоне распространения днепровского оледенения. Суглинок',
                        'color': '#a3f585',
                        'method': 'set',
                        'value': [30]
                    },
                    {
                        'id': 'litology-4',
                        'title': 'Элювиально-делювиальный комплекс средне-, верхне-, современночетвертичных отложений. Глина',
                        'color': '#d2f585',
                        'method': 'set',
                        'value': [35]
                    },
                    {
                        'id': 'litology-5',
                        'title': 'Элювиально-делювиальный комплекс средне-, верхне-, современночетвертичных отложений.Отложения внеледниковой зоны. Суглинок с щебнем и гравием опоки, мергеля, песчаника',
                        'color': '#f5df85',
                        'method': 'set',
                        'value': [40]
                    },
                    {
                        'id': 'litology-6',
                        'title': 'Формация днепровского оледенения. Днепровские флювиогляциальные отложения. Песок',
                        'color': '#fba8a8',
                        'method': 'set',
                        'value': [50]
                    },
                    {
                        'id': 'litology-7',
                        'title': 'Формация днепровского оледенения. Днепровские моренные отложения. Суглинок, глина с гравием и валунами',
                        'color': '#d4a8fb',
                        'method': 'set',
                        'value': [60]
                    }
                ]
            },
            {
                'id': 'soil',
                'visible': false,
                'opacity': true,
                'title': 'Почвы',
                'source': this.baseURL + "Soil.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'soil-1',
                        'title': 'Дерново-подзолистые',
                        'color': '#fff8a5',
                        'method': 'set',
                        'value': [10, 20, 30]
                    },
                    {
                        'id': 'soil-2',
                        'title': 'Светло-серые лесные',
                        'color': '#e8ddfe',
                        'method': 'set',
                        'value': [40]
                    },
                    {
                        'id': 'soil-3',
                        'title': 'Серые лесные',
                        'color': '#e6aefe',
                        'method': 'set',
                        'value': [50]
                    },
                    {
                        'id': 'soil-4',
                        'title': 'Темно-серые',
                        'color': '#f155fe',
                        'method': 'set',
                        'value': [60]
                    },
                    {
                        'id': 'soil-5',
                        'title': 'Черноземы луговые',
                        'color': '#000000',
                        'method': 'set',
                        'value': [70, 80]
                    },
                    {
                        'id': 'soil-6',
                        'title': 'Алювиальные',
                        'color': '#8dfe50',
                        'method': 'set',
                        'value': [90]
                    },
                    {
                        'id': 'soil-7',
                        'title': 'Черноземы оподзоленные',
                        'color': '#a16532',
                        'method': 'set',
                        'value': [100, 110, 120]
                    },
                    {
                        'id': 'soil-8',
                        'title': 'Черноземы выщелоченные',
                        'color': '#974649',
                        'method': 'interval',
                        'value': [130, 200]
                    },
                    {
                        'id': 'soil-9',
                        'title': 'Торфяно-болотные',
                        'color': '#a4a5a5',
                        'method': 'set',
                        'value': [210, 220]
                    },
                    {
                        'id': 'soil-10',
                        'title': 'Слабогумусированные',
                        'color': '#d4d624',
                        'method': 'set',
                        'value': [230]
                    },
                    {
                        'id': 'soil-11',
                        'title': 'Овражно-балочные',
                        'color': '#dc0000',
                        'method': 'set',
                        'value': [240]
                    },
                    {
                        'id': 'soil-12',
                        'title': 'Черноземы карбонатные',
                        'color': '#640000',
                        'method': 'set',
                        'value': [250]
                    },
                    {
                        'id': 'soil-13',
                        'title': 'Дерново-глеевые',
                        'color': '#feac00',
                        'method': 'set',
                        'value': [260]
                    },
                ]
            },
            {
                'id': 'soil-resist',
                'visible': false,
                'opacity': true,
                'title': 'Эколого-геохимическая устойчивость почв к поступлению тяжелых металлов',
                'source': this.baseURL + "Soil.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'soil-resist-1',
                        'title': 'Очень низкая',
                        'color': '#ddc800',
                        'method': 'set',
                        'value': [230]
                    },
                    {
                        'id': 'soil-resist-2',
                        'title': 'Низкая',
                        'color': '#fff8a5',
                        'method': 'set',
                        'value': [10,20,30,40,90,240]
                    },
                    {
                        'id': 'soil-resist-3',
                        'title': 'Средняя',
                        'color': '#f7a5ff',
                        'method': 'set',
                        'value': [50,60,100,110,120,130,140,150,160,170,180,190,200,210,220,260]
                    },
                    {
                        'id': 'soil-resist-4',
                        'title': 'Выше среднего',
                        'color': '#d08142',
                        'method': 'set',
                        'value': [250]
                    },
                    {
                        'id': 'soil-resist-5',
                        'title': 'Высокая',
                        'color': '#7b3a3d',
                        'method': 'set',
                        'value': [70, 80]
                    }
                ]
            },
            {
                'id': 'ground_water',
                'visible': false,
                'opacity': true,
                'title': 'Водоносный горизонт',
                'source': this.baseURL + "Water.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'ground_water-1',
                        'title': 'Нет информации',
                        'color': '#85a69a',
                        'method': 'set',
                        'value': [0]
                    },
                    {
                        'id': 'ground_water-2',
                        'title': 'Слабоводоносный современный болотный',
                        'color': '#787878',
                        'method': 'set',
                        'value': [100]
                    },
                    {
                        'id': 'ground_water-3',
                        'title': 'Проницаемый локальноводоносный четвертичный эллювиально-делювиальный',
                        'color': '#d9ce44',
                        'method': 'set',
                        'value': [1400]
                    },
                    {
                        'id': 'ground_water-4',
                        'title': 'Водоносный четвертичный аллювиальный',
                        'color': '#ebebeb',
                        'method': 'set',
                        'value': [200]
                    },
                    {
                        'id': 'ground_water-5',
                        'title': 'Водоносный среднечетвертично-современный аллювиальный',
                        'color': '#cef8fd',
                        'method': 'set',
                        'value': [300]
                    },
                    {
                        'id': 'ground_water-6',
                        'title': 'Водоупорный нижне-среднечетвертичный озерно-флювиогляциальный',
                        'color': '#80865d',
                        'method': 'set',
                        'value': [800]
                    },
                    {
                        'id': 'ground_water-7',
                        'title': 'Водоносный нижне-среднечетвертичный аллювиально-флювиогляциальный',
                        'color': '#388022',
                        'method': 'set',
                        'value': [400]
                    },
                    {
                        'id': 'ground_water-8',
                        'title': 'Проницаемый локально-водоносный донской флювиогляциальный горизонт',
                        'color': '#f5c5c4',
                        'method': 'set',
                        'value': [500]
                    },
                    {
                        'id': 'ground_water-9',
                        'title': 'Водоупорный донской ледниковый',
                        'color': '#cf8581',
                        'method': 'set',
                        'value': [1500]
                    },
                    {
                        'id': 'ground_water-10',
                        'title': 'Водоносный донской водно-ледниковый',
                        'color': '#aa8157',
                        'method': 'set',
                        'value': [600]
                    },
                    {
                        'id': 'ground_water-11',
                        'title': 'Слабоводоносный нижнечетвертичный озерно-ледниковый',
                        'color': '#f4c2fb',
                        'method': 'set',
                        'value': [1600]
                    },
                    {
                        'id': 'ground_water-12',
                        'title': 'Слабоводоносный нижнечетвертичный озерно-аллювиальный',
                        'color': '#4d0af3',
                        'method': 'set',
                        'value': [700]
                    },
                    {
                        'id': 'ground_water-13',
                        'title': 'Слабоводоносный нижнечетвертичный сезонно-водоносный флювиогляциальный',
                        'color': '#c1a181',
                        'method': 'set',
                        'value': [1700]
                    },
                    {
                        'id': 'ground_water-14',
                        'title': 'Водоносный верхнеплиоценово-нижнечетвертичный фллювиальный',
                        'color': '#4558a0',
                        'method': 'set',
                        'value': [900]
                    },
                    {
                        'id': 'ground_water-15',
                        'title': 'Водоносный миоценовый',
                        'color': '#cdbf4b',
                        'method': 'set',
                        'value': [1000]
                    },
                    {
                        'id': 'ground_water-16',
                        'title': 'Водоносный сысранский терригенный',
                        'color': '#f2b03d',
                        'method': 'set',
                        'value': [1800]
                    },
                    {
                        'id': 'ground_water-17',
                        'title': 'Водоносная верхнемеловая терригенно-карбонатная свита',
                        'color': '#b8a535',
                        'method': 'set',
                        'value': [1100]
                    },
                    {
                        'id': 'ground_water-18',
                        'title': 'Водоносный нижнемеловой терригенный',
                        'color': '#75fbbc',
                        'method': 'set',
                        'value': [1200]
                    },
                    {
                        'id': 'ground_water-19',
                        'title': 'Водоупорный средне-верхнеюрский терригенный',
                        'color': '#bdbdd7',
                        'method': 'set',
                        'value': [1300]
                    },
                ]
            },
            {
                'id': 'water_depth',
                'visible': false,
                'opacity': true,
                'title': 'Глубина залегания грунтовых вод',
                'source': this.baseURL + "WaterDepth.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'water_depth-1',
                        'title': 'до 0.5 м.',
                        'color': '#0c0083',
                        'method': 'set',
                        'value': [10]
                    },
                    {
                        'id': 'water_depth-2',
                        'title': 'до 2.0 м.',
                        'color': '#1701db',
                        'method': 'set',
                        'value': [20]
                    },
                    {
                        'id': 'water_depth-3',
                        'title': '2.0-5.0 м.',
                        'color': '#0000f4',
                        'method': 'set',
                        'value': [30]
                    },
                    {
                        'id': 'water_depth-4',
                        'title': '5.0-10.0 м.',
                        'color': '#ada4f9',
                        'method': 'set',
                        'value': [40]
                    },
                    {
                        'id': 'water_depth-5',
                        'title': 'более 10.0 м.',
                        'color': '#cac2fa',
                        'method': 'set',
                        'value': [50]
                    },
                    {
                        'id': 'water_depth-6',
                        'title': 'низкая пойма (до 2.0 м.)',
                        'color': '#2b651a',
                        'method': 'set',
                        'value': [60]
                    },
                    /*
                    {
                        'id': 'water_depth-7',
                        'title': 'средняя пойма (до 2.0 м.)',
                        'color': '#65dc41',
                        'method': 'set',
                        'value': [70]
                    },
                    */
                    {
                        'id': 'water_depth-8',
                        'title': 'высокая пойма (2-3 м.)',
                        'color': '#c2fcc3',
                        'method': 'set',
                        'value': [80]
                    },


                    {
                        'id': 'water_depth-9',
                        'title': 'овражно-балочные системы',
                        'color': '#fdf8a4',
                        'method': 'set',
                        'value': [90]
                    }
                ]
            },
            {
                'id': 'water-type',
                'visible': false,
                'opacity': true,
                'title': 'Тип вод',
                'source': this.baseURL + "water_type.pbf",
                'attribute': 'TIP_VOD',
                'layers': [
                    {
                        'id': 'water-type-1',
                        'title': 'Гидрокарбонатные',
                        'color': '#8ad6e9',
                        'method': 'set',
                        'value': [1]
                    },
                    {
                        'id': 'water-type-2',
                        'title': 'Сульфатно-гидрокарбонатные',
                        'color': '#92fdd8',
                        'method': 'set',
                        'value': [2]
                    },
                    {
                        'id': 'water-type-3',
                        'title': 'Гидрокарбонатно-сульфатные',
                        'color': '#a5ffa5',
                        'method': 'set',
                        'value': [3]
                    },
                    {
                        'id': 'water-type-4',
                        'title': 'Разного анионного состава',
                        'color': '#f7a5ff',
                        'method': 'set',
                        'value': [4]
                    },
                    {
                        'id': 'water-type-5',
                        'title': 'Сульфатно-хлоридные',
                        'color': '#ffa4a5',
                        'method': 'set',
                        'value': [5]
                    },
                    {
                        'id': 'water-type-6',
                        'title': 'Сульфатные',
                        'color': '#fff8a5',
                        'method': 'set',
                        'value': [6]
                    },
                    {
                        'id': 'water-type-7',
                        'title': 'Хлоридно-сульфатные',
                        'color': '#febf00',
                        'method': 'set',
                        'value': [7]
                    },
                ]
            },
            {
                'id': 'water-class',
                'visible': false,
                'opacity': true,
                'title': 'Класс вод',
                'source': this.baseURL + "water_class.pbf",
                'attribute': 'KLASS_VOD',
                'layers': [
                    {
                        'id': 'water-class-1',
                        'title': 'Натриевые',
                        'color': '#e3f572',
                        'method': 'set',
                        'value': [1]
                    },
                    {
                        'id': 'water-class-2',
                        'title': 'Магниево-натриевые',
                        'color': '#f5d272',
                        'method': 'set',
                        'value': [2]
                    },
                    {
                        'id': 'water-class-3',
                        'title': 'Натриево-кальциевые',
                        'color': '#f5ad72',
                        'method': 'set',
                        'value': [3]
                    },
                    {
                        'id': 'water-class-4',
                        'title': 'Кальциево-магниевые',
                        'color': '#eb8383',
                        'method': 'set',
                        'value': [4]
                    },
                    {
                        'id': 'water-class-5',
                        'title': 'Кальциевые',
                        'color': '#99f572',
                        'method': 'set',
                        'value': [5]
                    },
                    {
                        'id': 'water-class-6',
                        'title': 'Магниево-кальциевые',
                        'color': '#72f5b8',
                        'method': 'set',
                        'value': [6]
                    },
                    {
                        'id': 'water-class-7',
                        'title': 'Разного катионного состава',
                        'color': '#84dcf7',
                        'method': 'set',
                        'value': [7]
                    }
                ]
            },
            {
                'id': 'ch_clorid',
                'visible': false,
                'opacity': true,
                'title': 'Подземные воды. Содержание хлоридов, мг/дм<sup>3</sup>',
                'source': this.baseURL + "ch_clorid.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'ch_clorid-1',
                        'title': '< 50',
                        'color': '#cbebff',
                        'method': 'set',
                        'value': [1]
                    },
                    {
                        'id': 'ch_clorid-2',
                        'title': '50 - 100',
                        'color': '#75b5dc',
                        'method': 'set',
                        'value': [2]
                    },
                    {
                        'id': 'ch_clorid-3',
                        'title': '100 - 350',
                        'color': '#3c8ab9',
                        'method': 'set',
                        'value': [3]
                    },
                    {
                        'id': 'ch_clorid-4',
                        'title': '> 350',
                        'color': '#0d5987',
                        'method': 'set',
                        'value': [4]
                    },
                ]
            },
            {
                'id': 'ch_ferrum',
                'visible': false,
                'opacity': true,
                'title': 'Подземные воды. Содержание железа общего, мг/дм<sup>3</sup>',
                'source': this.baseURL + "ch_ferrum.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'ch_ferrum-1',
                        'title': '< 1',
                        'color': '#ffebcb',
                        'method': 'set',
                        'value': [1]
                    },
                    {
                        'id': 'ch_ferrum-2',
                        'title': '≥ 1',
                        'color': '#7c5009',
                        'method': 'set',
                        'value': [2]
                    },
                ]
            },
            {
                'id': 'ch_ftorid',
                'visible': false,
                'opacity': true,
                'title': 'Подземные воды. Содержание фторидов, мг/дм<sup>3</sup>',
                'source': this.baseURL + "ch_ftorid.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'ch_ftorid-1',
                        'title': '< 0.7',
                        'color': '#cff1ae',
                        'method': 'set',
                        'value': [1]
                    },
                    {
                        'id': 'ch_ftorid-2',
                        'title': '0.7 - 1.5',
                        'color': '#7abe39',
                        'method': 'set',
                        'value': [2]
                    },
                    {
                        'id': 'ch_ftorid-3',
                        'title': '> 1.5',
                        'color': '#4b8a0e',
                        'method': 'set',
                        'value': [3]
                    },
                ]
            },
            {
                'id': 'ch_sulfat',
                'visible': false,
                'opacity': true,
                'title': 'Подземные воды. Содержание сульфатов, мг/дм<sup>3</sup>',
                'source': this.baseURL + "ch_sulfat.pbf",
                'attribute': 'L_CODE',
                'layers': [
                    {
                        'id': 'ch_sulfat-1',
                        'title': '< 100',
                        'color': '#ecd9ff',
                        'method': 'set',
                        'value': [1]
                    },
                    {
                        'id': 'ch_sulfat-2',
                        'title': '100 - 250',
                        'color': '#c19ae9',
                        'method': 'set',
                        'value': [2]
                    },
                    {
                        'id': 'ch_sulfat-3',
                        'title': '250 - 500',
                        'color': '#9f5fe2',
                        'method': 'set',
                        'value': [3]
                    },
                    {
                        'id': 'ch_sulfat-4',
                        'title': '> 500',
                        'color': '#560fa0',
                        'method': 'set',
                        'value': [4]
                    },
                ]
            },
            {
                'id': 'landscape',
                'visible': false,
                'opacity': true,
                'title': 'Ландшафты',
                'source': this.baseURL + "Landscapes5.pbf",
                'attribute': 'INDEX_N',
                'layers': [
                    {
                        'id': 'landscape-1',
                        'title': 'А1 - Останцово-водораздельные массивы, сложенные элювием кремнисто-карбонатных пород со светло-серыми и серыми лесными щебнистыми почвами под широколиственными лесами, выборочно распаханные',
                        'color': '#f5ceb0',
                        'method': 'interval',
                        'value': [1010000,1019999]
                    },
                    {
                        'id': 'landscape-2',
                        'title': 'А2 - Волнистые, пологоволнистые поверхности водораздельных пространств, сложенные элювием терригенных пород со светло-серыми лесными почвами под широколиственными лесами, выборочно распаханные',
                        'color': '#daa79d',
                        'method': 'interval',
                        'value': [1020000,1039999]
                    },
                    {
                        'id': 'landscape-3',
                        'title': 'А3 - Волнистые поверхности средних участков склонов, сложенные элювиально-делювиальными отложениями терригенных пород с темно-серыми лесными почвами и оподзоленными черноземами под широколиственными лесами, преимущественно распаханные',
                        'color': '#ca7e74',
                        'method': 'interval',
                        'value': [1030000,1039999]
                    },
                    {
                        'id': 'landscape-4',
                        'title': 'А4 - Волнистые поверхности придолинных склонов, сложенные делювием терригенных пород с выщелоченными и луговыми черноземами под луговыми степями, значительно распаханные',
                        'color': '#a96248',
                        'method': 'interval',
                        'value': [1040000,1049999]
                    },
                    {
                        'id': 'landscape-5',
                        'title': 'В1 - Волнистые и пологоволнистые поверхности водораздельных пространств, сложенные гляциальными отложениями со светло-серыми и серыми лесными почвами под широколиственными лесами, выборочно распаханные.',
                        'color': '#f6d780',
                        'method': 'interval',
                        'value': [3010000,3019999]
                    },
                    {
                        'id': 'landscape-6',
                        'title': 'В2 - Волнистые поверхности средних участков склонов, сложенные моренными и делювиальными суглинками с темно-серыми лесными почвами и оподзоленными черноземами под широколиственными лесами, преимущественно распаханные',
                        'color': '#d2a73f',
                        'method': 'interval',
                        'value': [3020000,3029999]
                    },
                    {
                        'id': 'landscape-7',
                        'title': 'В3 - Волнистые поверхности придолинных склонов, сложенных делювиальными суглинками с выщелоченными и луговыми черноземами под луговыми степями',
                        'color': '#9a7325',
                        'method': 'interval',
                        'value': [3030000,3039999]
                    },
                    {
                        'id': 'landscape-8',
                        'title': 'П0д - пойма на терригенных породах',
                        'color': '#d2d2d2',
                        'method': 'set',
                        'value': [16000500]
                    },
                    {
                        'id': 'landscape-9',
                        'title': 'П0к - низкая и средняя пойма с развитием карстовых процессов',
                        'color': '#d1f8fe',
                        'method': 'set',
                        'value': [16001100]
                    },
                    {
                        'id': 'landscape-10',
                        'title': 'П0я - средняя пойма с развитием суффозионных процессов',
                        'color': '#75fbfd',
                        'method': 'set',
                        'value': [16003200]
                    },
                    {
                        'id': 'landscape-11',
                        'title': 'Д1 - Надпойменно-террасовые волнистые поверхности с эоловыми формами рельефа, сложенные древнеаллювиальными отложениями со слаборазвитыми песчаными почвами под смешанными лесами',
                        'color': '#b8fa84',
                        'method': 'interval',
                        'value': [5010000,5019999]
                    },
                    {
                        'id': 'landscape-12',
                        'title': 'Д2 - Надпойменно-террасовые поверхности с эоловыми формами рельефа и дерново-слабоподзолистыми почвами под смешанными лесами, ограниченно распаханные',
                        'color': '#7fe28f',
                        'method': 'interval',
                        'value': [5020000,5029999]
                    },
                    {
                        'id': 'landscape-13',
                        'title': 'Д3 - Надпойменно-террасовые волнистые поверхности, сложенные древнеаллювиальными отложениями с дерново-подзолистыми, светло-серыми и серыми лесными почвами под смешанными лесами',
                        'color': '#61c36b',
                        'method': 'interval',
                        'value': [5030000,5039999]
                    },
                    {
                        'id': 'landscape-14',
                        'title': 'Д4 - Надпойменно-террасовые слабоволнистые поверхности, сложенные древнеаллювиальными отложениями с темно-серыми лесными почвами и оподзоленными черноземами под широколиственными лесами',
                        'color': '#4fa853',
                        'method': 'interval',
                        'value': [5040000,5049999]
                    },
                    {
                        'id': 'landscape-15',
                        'title': 'Д5 - Надпойменно-террасовые слабоволнистые поверхности, сложенные древнеаллювиальными отложениями с черноземно-луговыми почвами и выщелоченными черноземами под лугами и луговыми степями',
                        'color': '#47774e',
                        'method': 'interval',
                        'value': [5050000,5059999]
                    },
                    {
                        'id': 'landscape-16',
                        'title': 'С1 - Местность слабоволнистых междуречных пространств, сложенная мощной толщей флювиогляциальных отложений, залегающих на днепровской морене с дерново-средне- и сильноподзолистыми почвами под смешанными лесами, ограниченно распаханных',
                        'color': '#fafbb6',
                        'method': 'interval',
                        'value': [18010000,18019999]
                    },
                    {
                        'id': 'landscape-17',
                        'title': 'С2 - Плоские, слабоволнистые междуречные пространства, сложенные флювиогляциальными отложениями на моренных и коренных суглинках и глинах с дерново-слабоподзолистыми почвами под смешанными лесами, выборочно распаханные',
                        'color': '#e0de86',
                        'method': 'interval',
                        'value': [18020000,18029999]
                    },
                    {
                        'id': 'landscape-18',
                        'title': 'С3 - Плоские, изредка слабоволнистые междуречные пространства, сложенные флювиогляциальными отложениями на моренных и коренных суглинках и глинах со светло-серыми и серыми лесными почвами под широколиственными лесами, выборочно распаханные',
                        'color': '#a4a233',
                        'method': 'interval',
                        'value': [18030000,18039999]
                    }
                ]
            },
            {
                'id': 'settlements',
                'visible': false,
                'title': 'Населенные пункты',
                'source': this.baseURL + "Settlements.pbf",
                'attribute': 'Тип населенного пункта',
                'properties': [
                    "Наименование населенного пункта",
                    //"Тип населенного пункта",
                    "Муниципальный район",
                    "Административный центр сельского/городского поселения (да/нет)",
                    "Административный центр муниципального района (да/нет)",
                    "Дата основания",
                    "Численность населения, чел.",
                    "Основной национальный состав",
                    "Топонимическая информация (по И. К. Инжеватову)",
                    "Источник информации о топонимике",
                    "Историческая информация об объектах религиозного наследия (по С. Б. Бахмустову)",
                    "Источник информации об объектах религиозного наследия",
                    "Краткая геоэкологическая информация",
                    "Сельское/городское поселение"
                ],
                'layers': [
                    {
                        'id': 'settlements-1',
                        'title': 'Город',
                        'icon': 'fa fa-building',
                        'color': '#a3032c',
                        'method': 'set',
                        'value': ['Город']
                    },
                    {
                        'id': 'settlements-2',
                        'title': 'Деревня',
                        'icon': 'fa fa-home',
                        'color': '#0cb527',
                        'method': 'set',
                        'value': ['Деревня']
                    },
                    {
                        'id': 'settlements-3',
                        'title': 'Поселок',
                        'icon': 'far fa-hospital',
                        'color': '#329ce2',
                        'method': 'set',
                        'value': ['Поселок']
                    },
                    {
                        'id': 'settlements-4',
                        'title': 'Рабочий поселок',
                        'icon': 'fa fa-gavel',
                        'color': '#f0dc49',
                        'method': 'set',
                        'value': ['Рабочий поселок']
                    },
                    {
                        'id': 'settlements-5',
                        'title': 'Село',
                        'icon': 'fa fa-users',
                        'color': '#e6ff92',
                        'method': 'set',
                        'value': ['Село']
                    },
                ]
            },
            {
                'id': 'oopt',
                'visible': false,
                'title': 'ООПТ',
                'source': this.baseURL + "OOPT.pbf",
                'attribute': 'Категория ООПТ',
                'properties': [
                    "Наименование",
                    "Муниципальный район",
                    "Краткое описание местоположения" ,
                    "Дата основания" ,
                    "Значение" ,
                    //"Категория ООПТ" ,
                    "Площадь, га" ,
                    "Основное назначение ООПТ" ,
                    "Основные объекты охраны" ,
                    "Краткая справочная информация"
                ],
                'layers': [
                    {
                        'id': 'oopt-1',
                        'title': 'Национальный парк',
                        'icon': 'fa-solid fa-house-tree',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Национальный парк']
                    },
                    {
                        'id': 'oopt-2',
                        'title': 'Государственный природный заповедник',
                        'icon': 'fa-solid fa-trees',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Государственный природный заповедник']
                    },
                    {
                        'id': 'oopt-3',
                        'title': 'Ботанический памятник природы',
                        'icon': 'fas fa-tree',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Ботанический памятник природы']
                    },
                    {
                        'id': 'oopt-4',
                        'title': 'Геологический памятник природы',
                        'icon': 'fas fa-chart-area',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Геологический памятник природы']
                    },
                    {
                        'id': 'oopt-5',
                        'title': 'Гидрологический памятник природы',
                        'icon': 'fas fa-tint',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Гидрологический памятник природы']
                    },
                    {
                        'id': 'oopt-6',
                        'title': 'Дендрологический парк и ботанический сад',
                        'icon': 'fab fa-pagelines',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Дендрологический парк и ботанический сад']
                    },
                    {
                        'id': 'oopt-7',
                        'title': 'Зоологический памятник природы',
                        'icon': 'fas fa-paw',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Зоологический памятник природы']
                    },
                    {
                        'id': 'oopt-8',
                        'title': 'Комплексный памятник природы',
                        'icon': 'fab fa-empire',
                        'color': '#189104',
                        'method': 'set',
                        'value': ['Комплексный памятник природы']
                    }
                ]
            },
            {
                'id': 'rivers',
                'visible': false,
                'title': 'Реки и ручьи',
                'source': this.baseURL + "rivers.pbf",
                'attribute': 'Тип',
                'properties': [
                    "Наименование",
                    "Краткая информация",
                    //"Тип",
                    "Протяженность, км",
                    "Водосборная площадь, км²",
                    "Устье",
                    "Тип притока",
                    "Бассейновый округ",
                    "Речной бассейн",
                    "Речной подбассейн",
                    "Водохозяйственный участок",
                    "Населенные пункты на реке",
                    "Основные притоки"
                ],
                'layers': [
                    {
                        'id': 'rivers-1',
                        'title': 'Река',
                        'icon': 'fas fa-tint',
                        'color': '#1c7fc1',
                        'method': 'set',
                        'value': ['Реки']
                    },
                    {
                        'id': 'rivers-2',
                        'title': 'Ручей',
                        'icon': 'fas fa-tint',
                        'color': '#00bfff',
                        'method': 'set',
                        'value': ['Ручьи']
                    },

                ]
            },
            {
                'id': 'opolzni',
                'visible': false,
                'title': 'Оползни',
                'source': this.baseURL + "opolzni.pbf",
                'attribute': 'глубина',
                'properties': [
                    'абс_отм',
                    'длина_м',
                    'ширина',
                    'глубина',
                    'экспоз_',
                    'дол_реки',
                ],
                'aliases': {
                    'абс_отм': 'Абсолютная отметка, м.',
                    'длина_м': 'Длина, м.',
                    'ширина': 'Ширина, м.',
                    'глубина': 'Глубина, м.',
                    'экспоз_': 'Экспозиция',
                    'дол_реки': 'Долина реки',
                },
                'layers': [
                    {
                        'id': 'opolzni-1',
                        'title': 'Глубина менее 5 м.',
                        'icon': 'fa-solid fa-hill-rockslide',
                        'color': '#d9a586',
                        'method': 'interval',
                        'value': [0, 5]
                    },

                    {
                        'id': 'opolzni-2',
                        'title': 'Глубина 5-10 м.',
                        'icon': 'fa-solid fa-hill-rockslide',
                        'color': '#ce5b17',
                        'method': 'interval',
                        'value': [5, 10]
                    },

                    {
                        'id': 'opolzni-3',
                        'title': 'Глубина более 10 м.',
                        'icon': 'fa-solid fa-hill-rockslide',
                        'color': '#86380a',
                        'method': 'interval',
                        'value': [10, 50]
                    }


                ]
            },
            {
                'id': 'rodniki',
                'visible': false,
                'title': 'Водопроявления',
                'source': this.baseURL + "rodniki.pbf",
                'attribute': 'Z2',
                'properties': [
                    'Z2',
                    'Z5',
                ],
                'aliases': {
                    'Z2': 'Тип',
                    'Z5': 'Абсолютная отметка, м.'
                },

                'layers': [
                    {
                        'id': 'rodniki-1',
                        'title': 'Копань',
                        'icon': 'fa-solid fa-droplet',
                        'color': '#b9dcea',
                        'method': 'set',
                        'value': ['копань', 'копань-оз.', 'копань-озе', 'копань-оз', 'копать-озе']
                    },
                    {
                        'id': 'rodniki-2',
                        'title': 'Мочажина',
                        'icon': 'fa-solid fa-droplet',
                        'color': '#bde5bd',
                        'method': 'set',
                        'value': ['мочажина']
                    },
                    {
                        'id': 'rodniki-3',
                        'title': 'Исток',
                        'icon': 'fa-solid fa-droplet',
                        'color': '#63c3eb',
                        'method': 'set',
                        'value': ['исток']
                    },
                    {
                        'id': 'rodniki-4',
                        'title': 'Родник, ключ',
                        'icon': 'fa-solid fa-droplet',
                        'color': '#037bb0',
                        'method': 'set',
                        'value': ['родник', 'ключ', null, '185.0']
                    },
                    {
                        'id': 'rodniki-5',
                        'title': 'Колодец',
                        'icon': 'fa-solid fa-droplet',
                        'color': '#8764db',
                        'method': 'set',
                        'value': ['колодец', 'колодец-ар']
                    },
                    {
                        'id': 'rodniki-6',
                        'title': 'Озера',
                        'icon': 'fa-solid fa-droplet',
                        'color': '#cac1f2',
                        'method': 'set',
                        'value': ['озера', 'озеро', 'оз. Исток']
                    }
                ]

            },
            {
                id: 'rodniki-density',
                visible: false,
                opacity: true,
                title: 'Водопроявления: плотность',
                source: this.baseURL + 'rodniki.pbf',
                geometryType: 'point',
                renderMode: 'heatmap',
                heatmap: {
                    radius: 24,
                    blur: 18,
                    minOpacity: 0.85,
                    maxOpacity: 0.85,
                    scaleRadius: false,
                    useLocalExtrema: false,
                    max: 60,
                    gradient: {
                        0.00: '#60a5fa',
                        0.20: '#22c55e',
                        0.45: '#facc15',
                        0.65: '#fb923c',
                        0.82: '#ef4444',
                        1.00: '#b91c1c'
                    }
                },
                identify: {
                    radiusMeters: 1000,
                    areaUnit: 'km2',
                    decimals: 2,
                    showCount: true
                }
            },
            {
                id: 'opolzni-density',
                visible: false,
                opacity: true,
                title: 'Оползни: плотность',
                source: this.baseURL + 'opolzni.pbf',
                geometryType: 'point',
                renderMode: 'heatmap',
                heatmap: {
                    radius: 24,
                    blur: 18,
                    minOpacity: 0.85,
                    maxOpacity: 0.85,
                    scaleRadius: false,
                    useLocalExtrema: false,
                    max: 60,
                    gradient: {
                        0.00: '#60a5fa',
                        0.20: '#22c55e',
                        0.45: '#facc15',
                        0.65: '#fb923c',
                        0.82: '#ef4444',
                        1.00: '#b91c1c'
                    },
                    identify: {
                        radiusMeters: 1000,
                        areaUnit: 'km2',
                        decimals: 2,
                        showCount: true
                    }
                }
            },
            {
                'id': 'resources_gis_rm',
                'visible': false,
                'title': 'Полезные ископаемые и ресурсы (ГИС "Мордовия")',
                'source': this.baseURL + "resource_gis_rm.pbf",
                'attribute': 'N_ISK',
                'properties': [
                    'POL_ISK',
                    'YEAR_REG'
                ],
                'aliases': {
                    'POL_ISK': 'Ресурс',
                    'YEAR_REG': 'Год регистрации',
                },
                'layers': [
                    {
                        'id': 'resources_gis_rm-1',
                        'title': 'Глина',
                        'icon': 'fa-regular fa-square',
                        'color': '#a96224',
                        'method': 'set',
                        'value': [100]
                    },
                    {
                        'id': 'resources_gis_rm-2',
                        'title': 'Глина, алеврит',
                        'icon': 'fa-regular fa-square',
                        'color': '#a4896e',
                        'method': 'set',
                        'value': [103]
                    },
                    {
                        'id': 'resources_gis_rm-3',
                        'title': 'Глина, суглинки',
                        'icon': 'fa-regular fa-square',
                        'color': '#bda401',
                        'method': 'set',
                        'value': [102]
                    },
                    {
                        'id': 'resources_gis_rm-4',
                        'title': 'Суглинки, глина',
                        'icon': 'fa-regular fa-square',
                        'color': '#f2d900',
                        'method': 'set',
                        'value': [201]
                    },
                    {
                        'id': 'resources_gis_rm-5',
                        'title': 'Суглинки',
                        'icon': 'fa-regular fa-square',
                        'color': '#ffff04',
                        'method': 'set',
                        'value': [200]
                    },
                    {
                        'id': 'resources_gis_rm-6',
                        'title': 'Диатомит',
                        'icon': 'fa-regular fa-circle',
                        'color': '#eaeaea',
                        'method': 'set',
                        'value': [400]
                    },
                    {
                        'id': 'resources_gis_rm-7',
                        'title': 'Доломит',
                        'icon': 'fa-regular fa-square',
                        'color': '#e0e0e0',
                        'method': 'set',
                        'value': [500]
                    },
                    {
                        'id': 'resources_gis_rm-8',
                        'title': 'Известняк',
                        'icon': 'fa-solid fa-circle-caret-down',
                        'color': '#eeeeee',
                        'method': 'set',
                        'value': [506]
                    },
                    {
                        'id': 'resources_gis_rm-9',
                        'title': 'Мел',
                        'icon': 'fa-solid fa-circle-dot',
                        'color': '#e6e6e6',
                        'method': 'set',
                        'value': [700]
                    },
                    {
                        'id': 'resources_gis_rm-10',
                        'title': 'Мел, опока',
                        'icon': 'fa-solid fa-circle-dot',
                        'color': '#fcfc00',
                        'method': 'set',
                        'value': [708]
                    },
                    {
                        'id': 'resources_gis_rm-11',
                        'title': 'Мергель',
                        'icon': 'fa-light fa-hexagon',
                        'color': '#d7d7d7',
                        'method': 'set',
                        'value': [900]
                    },
                    {
                        'id': 'resources_gis_rm-12',
                        'title': 'Мумие',
                        'icon': 'fa-light fa-hexagon',
                        'color': '#ff57c4',
                        'method': 'set',
                        'value': [1000]
                    },
                    {
                        'id': 'resources_gis_rm-13',
                        'title': 'Охра',
                        'icon': 'fa-regular fa-circle-xmark',
                        'color': '#ffa803',
                        'method': 'set',
                        'value': [1100]
                    },
                    {
                        'id': 'resources_gis_rm-14',
                        'title': 'Песок',
                        'icon': 'fa-regular fa-triangle',
                        'color': '#fbfd02',
                        'method': 'set',
                        'value': [1200]
                    },
                    {
                        'id': 'resources_gis_rm-15',
                        'title': 'Песок, ПГС',
                        'icon': 'fa-regular fa-triangle',
                        'color': '#ffa0ff',
                        'method': 'set',
                        'value': [1213]
                    },
                    {
                        'id': 'resources_gis_rm-16',
                        'title': 'Песчаник',
                        'icon': 'fa-regular fa-triangle',
                        'color': '#02fca3',
                        'method': 'set',
                        'value': [1400]
                    },
                    {
                        'id': 'resources_gis_rm-17',
                        'title': 'Песчаник, песок',
                        'icon': 'fa-regular fa-triangle',
                        'color': '#8baa29',
                        'method': 'set',
                        'value': [1412]
                    },
                    {
                        'id': 'resources_gis_rm-0',
                        'title': 'Кирпично-черепичное',
                        'icon': 'fa-regular fa-block-brick',
                        'color': '#92450d',
                        'method': 'set',
                        'value': [0]
                    },

                ]
            },
            {
                'id': 'resources',
                'visible': false,
                'title': 'Полезные ископаемые и ресурсы (по данным Государственного реестра участков недр, предоставленных в пользование (rfgf.ru)',
                'source': this.baseURL + "resources2.pbf",
                'attribute': 'mtype',
                'properties': [
                    'alias',
                    'user',
                    'status',
                    'mtype',
                    'code',
                    'lic_url',
                    'lic_auth',
                    'lic_purpose',
                    'lic_rereg',
                    'lic_date',
                    'lic_expires',
                    'cancel_doc',
                    'cancel_date',
                ],
                'aliases': {
                    'alias': 'Наименование',
                    'user': 'Пользователь',
                    'status': 'Статус',
                    'mtype': 'Тип',
                    'lic_url': 'Ссылка на государственный реестр участков недр',
                    'lic_auth': 'Наименование органа, выдавшего лицензию',
                    'lic_purpose': 'Целевое назначение',
                    'lic_rereg': 'Сведения о переоформлении лицензии на пользование недрами',
                    'lic_date': 'Дата присвоения государственного регистрационного номера лицензии',
                    'cancel_doc': 'Реквизиты приказа о прекращении права пользования недрами, приостановлении или ограничении права пользования недрами',
                    'cancel_date': 'Дата прекращения права пользования недрами',
                    'code': 'Государственный регистрационный номер',
                    'lic_expires': 'Дата окончания срока действия лицензии',
                },
                'layers': [
                    {
                        'id': 'resources-1',
                        'title': 'Песок',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#ffe5b4',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Песок']
                    },
                    {
                        'id': 'resources-2',
                        'title': 'Глина',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#e5bc70',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Глина', 'глина']
                    },
                    {
                        'id': 'resources-3',
                        'title': 'Суглинок',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#d19b37',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Суглинок']
                    },
                    {
                        'id': 'resources-4',
                        'title': 'Минеральные воды',
                        'icon': 'fa-light fa-bottle-water',
                        'color': '#14adbe',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Минеральные воды']
                    },
                    {
                        'id': 'resources-5',
                        'title': 'Диатомит',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#b25ff8',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Диатомит']
                    },
                    {
                        'id': 'resources-6',
                        'title': 'Карбонатные породы, мел',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#d5d5d5',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Мел', 'Карбонатные породы']
                    },
                    {
                        'id': 'resources-7',
                        'title': 'Мореный дуб',
                        'icon': 'fa-regular fa-acorn',
                        'color': '#323232',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Мореный дуб']
                    },
                    {
                        'id': 'resources-8',
                        'title': 'Газ',
                        'icon': 'fa-solid fa-gas-pump',
                        'color': '#b25ff8',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Газ']
                    },
                    {
                        'id': 'resources-9',
                        'title': 'Опока',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#187f32',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Опока']
                    },
                    {
                        'id': 'resources-10',
                        'title': 'Цеолит',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#80de7f',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Цеолит']
                    },
                    {
                        'id': 'resources-11',
                        'title': "Торф",
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#2da240',
                        'border': '#962020',
                        'method': 'set',
                        'value': ["Торф"]
                    },
                    {
                        'id': 'resources-12',
                        'title': 'Другое',
                        'icon': 'fa-brands fa-sourcetree',
                        'color': '#eebebe',
                        'border': '#962020',
                        'method': 'set',
                        'value': ['Другое']
                    },
                ]
            },
            {
                'id': 'agro',
                'visible': false,
                'opacity': true,
                'title': 'Потенциально пригодные земли (agrogis.e-mordovia.ru)',
                'source': this.baseURL + "agro.pbf",
                'attribute': 'NEISP_SOST',
                'properties': [
                    "REG_NAME",
                    "SP",
                    "ID_SUB",
                    "AREA",
                    "TLU",
                    "STATUS",
                    "NEISP_SOST",
                    "S_WALD",
                    "PH",
                    "P2O5",
                    "K2O",
                    "S",
                    "GUMUS"
                ],
                'aliases': {
                    "REG_NAME":"Район",
                    "SP":"Поселение",
                    "ID_SUB":"№",
                    "AREA":"Площадь, га",
                    "TLU":"Вид угодья",
                    "STATUS":"Статус",
                    "NEISP_SOST":"Состояние",
                    "S_WALD":"Процент залесенности",
                    "PH":"Кислотность",
                    "P2O5":"Фосфор",
                    "K2O":"Калий",
                    "S":"Сера",
                    "GUMUS":"Гумус"
                },
                'layers': [
                    {
                        'id': 'agro-1',
                        'title': 'Залесенная',
                        'color': 'rgba(32,76,219,0.8)',
                        'method': 'set',
                        'value': ['Залесенная']
                    },
                    {
                        'id': 'agro-2',
                        'title': 'Засоренная',
                        'color': 'rgba(182,21,21,0.8)',
                        'method': 'set',
                        'value': ['Засоренная']
                    },
                ]
            },
            {
                'id': 'hunt',
                'visible': false,
                'opacity': true,
                'title': 'Охотничьи угодья (huntmap.ru)',
                'source': this.baseURL + "hunt2.pbf",
                'attribute': 'type',
                'properties': [
                    "title",
                    "district",
                    "user",
                    "address",
                    "phone",
                    "type"
                ],
                'aliases': {
                    "title":"Название",
                    "district":"Район",
                    "user":"Пользователь",
                    "address":"Адрес",
                    "phone":"Контакты",
                    "type":"Тип"
                },
                'layers': [
                    {
                        'id': 'hunt-1',
                        'title': 'Закрепленные охотничьи угодья',
                        'color': 'rgba(229,200,27,0.8)',
                        'method': 'set',
                        'value': ['Закрепленные охотничьи угодья РМор']
                    },
                    {
                        'id': 'hunt-2',
                        'title': 'Общедоступные охотничьи угодья',
                        'color': 'rgba(17,170,21,0.8)',
                        'method': 'set',
                        'value': ['Общедоступные охотничьи угодья РМор']
                    },
                ]
            },
            {
                'id': 'houses',
                'visible': false,
                'opacity': true,
                'title': 'Многоквартирные дома - этажность (фрт.рф)',
                'source': this.baseURL + "houses.pbf",
                'attribute': 'LEVELS',
                'properties': [
                    "HOUSE_ID",
                    "ADDRESS",
                    "YEAR_BLD",
                    "YEAR_EXPL",
                    "SERIE",
                    "HOUSE_TYPE",
                    "CAPFOND",
                    "MGMT",
                    "MGMT_LINK",
                    "AVAR",
                    "LEVELS",
                    "DOORS",
                    "LIFTS",
                    "RMC",
                    "RMC_LIVE",
                    "RMC_NLIVE",
                    "INHAB",
                    "AREA",
                    "AREA_LIVE",
                    "AREA_NLIVE",
                    "AREA_GEN",
                    "AREA_LAND",
                    "AREA_PARK",
                    "CADNO",
                    "ENRG_CLASS",
                    "BLAG_PLAY",
                    "BLAG_SPORT",
                    "BLAG_OTHER",
                    "OTHER",
                    "COLD_WATER",
                    "HOT_WATER",
                    "FUNDAMENT",
                    "PEREKRYT",
                    "MAT_NES",
                    "ELECT_TYPE",
                    "TEPLO_TYPE",
                    "GORVODA_TY",
                    "HOLVODA_TY",
                    "VOTV_TYPE",
                    "VOTV_YAM",
                    "GAZ_TYPE",
                    "VSTK_TYPE"
                ],
                'aliases': {
                    "HOUSE_ID": "Идентификационный номер дома",
                    "ADDRESS": "Почтовый адрес, без индекса",
                    "YEAR_BLD": "год постройки",
                    "YEAR_EXPL": "год ввода дома в эксплуатацию",
                    "SERIE": "серия, тип постройки здания",
                    "HOUSE_TYPE": "тип дома",
                    "CAPFOND": "способ формирования фонда капитального ремонта",
                    "MGMT": "управляющая компания",
                    "MGMT_LINK": "ссылка на анкету управляющей компании на сайте",
                    "AVAR": "дом признан аварийным (да/нет)",
                    "LEVELS": "количество этажей",
                    "DOORS": "кол-во подъездов",
                    "LIFTS": "кол-во лифтов",
                    "RMC": "кол-во помещений всего",
                    "RMC_LIVE": "кол-во жилых помещений",
                    "RMC_NLIVE": "кол-во нежилых помещений",
                    "INHAB": "Численность жителей, чел.",
                    "AREA": "общая площадь, кв.м",
                    "AREA_LIVE": "общая площадь жилых помещений, кв.м",
                    "AREA_NLIVE": "общая площадь нежилых помещений, кв.м",
                    "AREA_GEN": "общая площадь помещений, входящих в состав общего имущества, кв.м.",
                    "AREA_LAND": "площадь земельного участка по государственному кадастру, кв.м.",
                    "AREA_PARK": "площадь парковки в границах земельного участка, кв.м",
                    "CADNO": "кадастровый номер земельного участка",
                    "ENRG_CLASS":"класс энергоэффективности дома",
                    "BLAG_PLAY": "элементы благоустройства: детская площадка",
                    "BLAG_SPORT": "элементы благоустройства: спортивная площадка",
                    "BLAG_OTHER": "элементы благоустройства: другое",
                    "OTHER": "дополнительная информация",
                    "COLD_WATER": "наличие счетчика холодного водоснабжения",
                    "HOT_WATER": "наличие счетчика горячего водоснабжения",
                    "FUNDAMENT": "Тип фундамента",
                    "PEREKRYT": "Тип перекрытий",
                    "MAT_NES": "Материал несущих стен",
                    "ELECT_TYPE": "Тип системы электроснабжения",
                    "TEPLO_TYPE": "Тип системы теплоснабжения",
                    "GORVODA_TY": "Тип системы горячего водоснабжения",
                    "HOLVODA_TY": "Тип системы холодного водоснабжения",
                    "VOTV_TYPE": "Система водоотведения: тип системы водоотведения",
                    "VOTV_YAM": "Система водоотведения:объем выгребных ям, куб.м.",
                    "GAZ_TYPE": "Тип системы газоснабжения",
                    "VSTK_TYPE": "Тип системы водостоков"
                },
                'layers': [
                    {
                        'id': 'houses-1',
                        'title': '1-5 этаж',
                        'color': 'rgba(60,135,13,0.8)',
                        'method': 'interval',
                        'value': [1,5]
                    },
                    {
                        'id': 'houses-2',
                        'title': '6-10 этажей',
                        'color': 'rgba(240,180,40,0.8)',
                        'method': 'interval',
                        'value': [6,10]
                    },
                    {
                        'id': 'houses-3',
                        'title': '11-20 этажей',
                        'color': 'rgba(220,105,16,0.8)',
                        'method': 'interval',
                        'value': [11,20]
                    },
                    {
                        'id': 'houses-4',
                        'title': 'более 20 этажей',
                        'color': 'rgba(200,18,14,0.8)',
                        'method': 'interval',
                        'value': [21,99]
                    },

                ]
            },
            {
                'id': 'houses-2',
                'visible': false,
                'opacity': true,
                'title': 'Многоквартирные дома - год ввода в эксплуатацию (фрт.рф)',
                'source': this.baseURL + "houses.pbf",
                'attribute': 'YEAR_EXPL',
                'properties': [
                    "HOUSE_ID",
                    "ADDRESS",
                    "YEAR_BLD",
                    "YEAR_EXPL",
                    "SERIE",
                    "HOUSE_TYPE",
                    "CAPFOND",
                    "MGMT",
                    "MGMT_LINK",
                    "AVAR",
                    "LEVELS",
                    "DOORS",
                    "LIFTS",
                    "RMC",
                    "RMC_LIVE",
                    "RMC_NLIVE",
                    "INHAB",
                    "AREA",
                    "AREA_LIVE",
                    "AREA_NLIVE",
                    "AREA_GEN",
                    "AREA_LAND",
                    "AREA_PARK",
                    "CADNO",
                    "ENRG_CLASS",
                    "BLAG_PLAY",
                    "BLAG_SPORT",
                    "BLAG_OTHER",
                    "OTHER",
                    "COLD_WATER",
                    "HOT_WATER",
                    "FUNDAMENT",
                    "PEREKRYT",
                    "MAT_NES",
                    "ELECT_TYPE",
                    "TEPLO_TYPE",
                    "GORVODA_TY",
                    "HOLVODA_TY",
                    "VOTV_TYPE",
                    "VOTV_YAM",
                    "GAZ_TYPE",
                    "VSTK_TYPE"
                ],
                'aliases': {
                    "HOUSE_ID": "Идентификационный номер дома",
                    "ADDRESS": "Почтовый адрес, без индекса",
                    "YEAR_BLD": "год постройки",
                    "YEAR_EXPL": "год ввода дома в эксплуатацию",
                    "SERIE": "серия, тип постройки здания",
                    "HOUSE_TYPE": "тип дома",
                    "CAPFOND": "способ формирования фонда капитального ремонта",
                    "MGMT": "управляющая компания",
                    "MGMT_LINK": "ссылка на анкету управляющей компании на сайте",
                    "AVAR": "дом признан аварийным (да/нет)",
                    "LEVELS": "количество этажей",
                    "DOORS": "кол-во подъездов",
                    "LIFTS": "кол-во лифтов",
                    "RMC": "кол-во помещений всего",
                    "RMC_LIVE": "кол-во жилых помещений",
                    "RMC_NLIVE": "кол-во нежилых помещений",
                    "INHAB": "Численность жителей, чел.",
                    "AREA": "общая площадь, кв.м",
                    "AREA_LIVE": "общая площадь жилых помещений, кв.м",
                    "AREA_NLIVE": "общая площадь нежилых помещений, кв.м",
                    "AREA_GEN": "общая площадь помещений, входящих в состав общего имущества, кв.м.",
                    "AREA_LAND": "площадь земельного участка по государственному кадастру, кв.м.",
                    "AREA_PARK": "площадь парковки в границах земельного участка, кв.м",
                    "CADNO": "кадастровый номер земельного участка",
                    "ENRG_CLASS":"класс энергоэффективности дома",
                    "BLAG_PLAY": "элементы благоустройства: детская площадка",
                    "BLAG_SPORT": "элементы благоустройства: спортивная площадка",
                    "BLAG_OTHER": "элементы благоустройства: другое",
                    "OTHER": "дополнительная информация",
                    "COLD_WATER": "наличие счетчика холодного водоснабжения",
                    "HOT_WATER": "наличие счетчика горячего водоснабжения",
                    "FUNDAMENT": "Тип фундамента",
                    "PEREKRYT": "Тип перекрытий",
                    "MAT_NES": "Материал несущих стен",
                    "ELECT_TYPE": "Тип системы электроснабжения",
                    "TEPLO_TYPE": "Тип системы теплоснабжения",
                    "GORVODA_TY": "Тип системы горячего водоснабжения",
                    "HOLVODA_TY": "Тип системы холодного водоснабжения",
                    "VOTV_TYPE": "Система водоотведения: тип системы водоотведения",
                    "VOTV_YAM": "Система водоотведения:объем выгребных ям, куб.м.",
                    "GAZ_TYPE": "Тип системы газоснабжения",
                    "VSTK_TYPE": "Тип системы водостоков"
                },
                'layers': [
                    {
                        'id': 'houses-2-1',
                        'title': 'до 1917 года',
                        'color': 'rgba(180,60,60,0.8)',
                        'method': 'interval',
                        'value': [1700,1916]
                    },
                    {
                        'id': 'houses-2-2',
                        'title': '1917 - 1945 годы',
                        'color': 'rgba(210,105,65,0.8)',
                        'method': 'interval',
                        'value': [1917,1945]
                    },
                    {
                        'id': 'houses-2-3',
                        'title': '1946 - 1956 годы',
                        'color': 'rgba(250,150,50,0.8)',
                        'method': 'interval',
                        'value': [1946,1956]
                    },
                    {
                        'id': 'houses-2-4',
                        'title': '1957 - 1964 годы',
                        'color': 'rgba(200,190,100,0.8)',
                        'method': 'interval',
                        'value': [1957,1964]
                    },
                    {
                        'id': 'houses-2-5',
                        'title': '1965 - 1982 годы',
                        'color': 'rgba(80,120,75,0.8)',
                        'method': 'interval',
                        'value': [1965,1982]
                    },
                    {
                        'id': 'houses-2-6',
                        'title': '1983 - 1991 годы',
                        'color': 'rgba(3,85,85,0.8)',
                        'method': 'interval',
                        'value': [1983,1991]
                    },
                    {
                        'id': 'houses-2-7',
                        'title': '1992 - 2010 годы',
                        'color': 'rgba(5,110,160,0.8)',
                        'method': 'interval',
                        'value': [1992,2010]
                    },
                    {
                        'id': 'houses-2-8',
                        'title': 'после 2010',
                        'color': 'rgba(144,160,220,0.8)',
                        'method': 'interval',
                        'value': [2011,2050]
                    },

                ]
            },
            {
                'id': 'highway',
                'visible': false,
                'opacity': true,
                'title': 'Дорожная сеть (OSM)',
                'source': this.baseURL + "highway2.pbf",
                'attribute': 'HIGHWAY',
                'deny_attr': 'HIGHWAY',
                'deny_list': ['footway', 'bridleway', 'cycleway', 'pedestrian', 'path', 'steps', /*'residential', 'living_street', 'service', 'track',*/ 'unclassified','construction','proposed'],
                'properties': [
                    "NAME",
                    "REF",
                    //"HIGHWAY", // primary, trunk, secondary, tertiary, footway, residential, etc
                    //"BRIDGE",
                    //"TUNNEL",
                    "MAXSPEED",
                    "LANES",
                    "WIDTH",
                    "SURFACE" // asphalt, gravel, paved, unpaved, pebblestone, ground, etc
                ],
                'aliases': {
                    "NAME": "Название",
                    "REF": "Официальное название",
                    //"HIGHWAY": "Класс дороги",
                    //"BRIDGE": "Мост",
                    //"TUNNEL": "Туннель",
                    "MAXSPEED": "Максимальная скорость",
                    "LANES": "Количество полос",
                    "WIDTH": "Ширина проезжей части",
                    "SURFACE": "Покрытие"
                },
                'layers': [
                    {
                        'id': 'highway-2',
                        'title': 'федерального значения',
                        'color': 'rgba(210,105,65,0.8)',
                        'border-width': 4,
                        'method': 'set',
                        'value': ['trunk', 'trunk_link']
                    },
                    {
                        'id': 'highway-1',
                        'title': 'регионального значения',
                        'color': 'rgba(180,60,60,0.8)',
                        'border-width': 3,
                        'method': 'set',
                        'value': ['primary', 'primary_link']
                    },

                    {
                        'id': 'highway-3',
                        'title': 'районного значения',
                        'color': 'rgba(250,150,50,0.8)',
                        'border-width': 2,
                        'method': 'set',
                        'value': ['secondary', 'tertiary', 'road', 'tertiary_link', 'secondary_link']
                    },

                    {
                        'id': 'highway-5',
                        'title': 'местного значения',
                        'color': 'rgba(234,234,150,0.8)',
                        'border-width': 2,
                        'method': 'set',
                        'value': ['residential', 'living_street', 'service', 'track' ]
                    },
                    /*
                    {
                        'id': 'highway-4',
                        'title': 'пешеходные',
                        'color': 'rgba(200,190,100,0.8)',
                        'border-width': 2,
                        'method': 'set',
                        'value': ['footway', 'bridleway', 'cycleway', 'pedestrian', 'path', 'steps']
                    },

                    {
                        'id': 'highway-6',
                        'title': 'прочее',
                        'color': 'rgba(1,120,75,0.8)',
                        'border-width': 2,
                        'method': 'set',
                        'value': ['unclassified','construction','proposed']
                    }
                    */




                ]
            },
            {
                'id': 'mordovia',
                'visible': false,
                'opacity': true,
                'title': 'Границы',
                'source': this.baseURL + "mordovia_new.pbf",
                'attribute': 'type',
                'properties': [
                    "district"
                ],
                'aliases': {
                    "district":"Название",
                    "type":"Район"
                },
                'layers': [
                    {
                        'id': 'mordovia-1',
                        'border-width': 2,
                        'title': 'Районы',
                        'opacity': 0,
                        'color': 'rgb(0,0,0)',
                        'method': 'set',
                        'value': ['region']
                    },
                    {
                        'id': 'mordovia-2',
                        'border-width': 4,
                        'title': 'Регион',
                        'opacity': 0,
                        'color': 'rgb(200,0,0)',
                        'method': 'set',
                        'value': ['respublic']
                    },
                ]
            },
        ];

        this.aggregationProfiles = [
            {
                id: 'hydrogeo-chem-quality',
                title: 'Гидрогеохимическое качество среды',
                description: 'Интегральная оценка условий водообеспечения и качества подземных вод.',
                target: ['point', 'polygon'],
                scoreRange: [0, 5],
                formula: 'min',

                visualization: {
                    polygonOverlay: {
                        enabled: true,
                        priority: 100,
                        weight: 3,
                        opacity: 0.95,
                        fillOpacity: 0.28,
                        showLabel: true,
                        noDataColor: '#6b7280',
                        palette: [
                            { min: 4.5, color: '#1a9850' },
                            { min: 3.5, color: '#66bd63' },
                            { min: 2.5, color: '#fdae61' },
                            { min: 1.5, color: '#f46d43' },
                            { min: 0, color: '#d73027' }
                        ]
                    }
                },

                branches: [
                    {
                        id: 'water_availability',
                        title: 'Водообеспеченность',
                        weight: 0.35,
                        formula: 'weighted_mean',
                        items: [
                            {
                                layerId: 'ground_water',
                                title: 'Водоносный горизонт',
                                weight: 0.60,
                                scoring: {
                                    'ground_water-4': 5,
                                    'ground_water-5': 5,
                                    'ground_water-7': 5,
                                    'ground_water-10': 4,
                                    'ground_water-14': 4,
                                    'ground_water-15': 4,
                                    'ground_water-16': 4,
                                    'ground_water-17': 4,
                                    'ground_water-18': 4,
                                    'ground_water-3': 3,
                                    'ground_water-8': 3,
                                    'ground_water-2': 2,
                                    'ground_water-11': 2,
                                    'ground_water-12': 2,
                                    'ground_water-13': 2,
                                    'ground_water-6': 1,
                                    'ground_water-9': 1,
                                    'ground_water-19': 1,
                                    'ground_water-1': null
                                }
                            },
                            {
                                layerId: 'water_depth',
                                title: 'Глубина залегания грунтовых вод',
                                weight: 0.40,
                                scoring: {
                                    'water_depth-3': 5,
                                    'water_depth-4': 5,
                                    'water_depth-5': 4,
                                    'water_depth-8': 4,
                                    'water_depth-2': 3,
                                    'water_depth-9': 2,
                                    'water_depth-6': 2,
                                    'water_depth-1': 1
                                }
                            }
                        ]
                    },
                    {
                        id: 'water_chemistry',
                        title: 'Гидрохимическое качество',
                        weight: 0.65,
                        formula: 'weighted_mean',
                        items: [
                            {
                                layerId: 'water-type',
                                title: 'Тип вод',
                                weight: 0.10,
                                scoring: {
                                    'water-type-1': 5,
                                    'water-type-2': 4,
                                    'water-type-3': 4,
                                    'water-type-4': 3,
                                    'water-type-6': 3,
                                    'water-type-5': 2,
                                    'water-type-7': 2
                                }
                            },
                            {
                                layerId: 'water-class',
                                title: 'Класс вод',
                                weight: 0.10,
                                scoring: {
                                    'water-class-5': 5,
                                    'water-class-6': 4,
                                    'water-class-4': 4,
                                    'water-class-7': 3,
                                    'water-class-3': 3,
                                    'water-class-2': 2,
                                    'water-class-1': 2
                                }
                            },
                            {
                                layerId: 'ch_clorid',
                                title: 'Хлориды',
                                weight: 0.25,
                                scoring: {
                                    'ch_clorid-1': 5,
                                    'ch_clorid-2': 4,
                                    'ch_clorid-3': 2,
                                    'ch_clorid-4': 1
                                }
                            },
                            {
                                layerId: 'ch_ferrum',
                                title: 'Железо общее',
                                weight: 0.20,
                                scoring: {
                                    'ch_ferrum-1': 5,
                                    'ch_ferrum-2': 2
                                }
                            },
                            {
                                layerId: 'ch_ftorid',
                                title: 'Фториды',
                                weight: 0.20,
                                scoring: {
                                    'ch_ftorid-2': 5,
                                    'ch_ftorid-1': 3,
                                    'ch_ftorid-3': 1
                                }
                            },
                            {
                                layerId: 'ch_sulfat',
                                title: 'Сульфаты',
                                weight: 0.15,
                                scoring: {
                                    'ch_sulfat-1': 5,
                                    'ch_sulfat-2': 4,
                                    'ch_sulfat-3': 2,
                                    'ch_sulfat-4': 1
                                }
                            }
                        ]
                    }
                ]
            },

            {
                id: 'agro-ecological-potential',
                title: 'Агроэкологический потенциал',
                description: 'Интегральная оценка почвенно-ландшафтных условий и ограничений для сельскохозяйственного использования.',
                target: ['point', 'polygon'],
                scoreRange: [0, 5],
                formula: 'weighted_mean',

                visualization: {
                    polygonOverlay: {
                        enabled: true,
                        priority: 90,
                        weight: 3,
                        opacity: 0.95,
                        fillOpacity: 0.28,
                        showLabel: true,
                        noDataColor: '#6b7280',
                        palette: [
                            { min: 4.5, color: '#1a9850' },
                            { min: 3.5, color: '#66bd63' },
                            { min: 2.5, color: '#fdae61' },
                            { min: 1.5, color: '#f46d43' },
                            { min: 0, color: '#d73027' }
                        ]
                    }
                },

                branches: [
                    {
                        id: 'soil_productivity',
                        title: 'Почвенное плодородие',
                        weight: 0.45,
                        formula: 'weighted_mean',
                        items: [
                            {
                                layerId: 'soil',
                                title: 'Тип почв',
                                weight: 0.75,
                                scoring: {
                                    'soil-8': 5,
                                    'soil-7': 5,
                                    'soil-12': 5,
                                    'soil-5': 4,
                                    'soil-4': 4,
                                    'soil-3': 3,
                                    'soil-2': 3,
                                    'soil-6': 3,
                                    'soil-1': 2,
                                    'soil-10': 2,
                                    'soil-13': 2,
                                    'soil-9': 1,
                                    'soil-11': 1
                                }
                            },
                            {
                                layerId: 'agro',
                                title: 'Состояние потенциально пригодных земель',
                                weight: 0.25,
                                scoring: {
                                    'agro-1': 1,
                                    'agro-2': 2
                                }
                            }
                        ]
                    },
                    {
                        id: 'soil_stability',
                        title: 'Устойчивость среды',
                        weight: 0.30,
                        formula: 'weighted_mean',
                        items: [
                            {
                                layerId: 'soil-resist',
                                title: 'Устойчивость почв к поступлению тяжелых металлов',
                                weight: 0.70,
                                scoring: {
                                    'soil-resist-5': 5,
                                    'soil-resist-4': 4,
                                    'soil-resist-3': 3,
                                    'soil-resist-2': 2,
                                    'soil-resist-1': 1
                                }
                            },
                            {
                                layerId: 'litology',
                                title: 'Литологические условия',
                                weight: 0.30,
                                scoring: {
                                    'litology-3': 4,
                                    'litology-4': 4,
                                    'litology-5': 4,
                                    'litology-2': 3,
                                    'litology-7': 3,
                                    'litology-1': 2,
                                    'litology-6': 2
                                }
                            }
                        ]
                    },
                    {
                        id: 'landscape_constraints',
                        title: 'Ландшафтные ограничения',
                        weight: 0.25,
                        formula: 'weighted_mean',
                        items: [
                            {
                                layerId: 'landscape',
                                title: 'Ландшафт',
                                weight: 0.60,
                                scoringGroups: {
                                    high: ['А4', 'В3', 'Д4', 'Д5'],
                                    medium: ['А2', 'А3', 'В1', 'В2', 'Д2', 'Д3', 'С3'],
                                    low: ['А1', 'Д1', 'С1', 'С2', 'П0д', 'П0к', 'П0я']
                                },
                                scores: {
                                    high: 5,
                                    medium: 3,
                                    low: 1
                                },
                                scoringMode: 'by-title-prefix'
                            },
                            {
                                layerId: 'water_depth',
                                title: 'Ограничения по увлажнению',
                                weight: 0.25,
                                scoring: {
                                    'water_depth-5': 5,
                                    'water_depth-4': 4,
                                    'water_depth-3': 4,
                                    'water_depth-8': 3,
                                    'water_depth-2': 2,
                                    'water_depth-6': 1,
                                    'water_depth-1': 1,
                                    'water_depth-9': 1
                                }
                            },
                            {
                                layerId: 'opolzni-density',
                                title: 'Оползневая опасность',
                                weight: 0.15,
                                scoringMode: 'density-inverted',
                                bins: [
                                    { max: 0.1, score: 5 },
                                    { max: 0.3, score: 4 },
                                    { max: 0.6, score: 3 },
                                    { max: 1.0, score: 2 },
                                    { max: null, score: 1 }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

    }
}
