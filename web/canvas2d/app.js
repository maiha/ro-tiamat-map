// Canvas 2D グローバル変数
let canvas;
let ctx;
let mapData = window.MAP_DATA || MAP_DATA;
let currentMapId = 'gate1_1f';
let currentFloor = 'all';
let buildingMode = false;
let viewMode = 'cabinet'; // 'cabinet', 'flat2d', 'isometric', 'top'
let connectionMode = 'arrow'; // 'arrow', 'plane', 'line'
let textureMode = 'texture'; // 'texture', 'color'

// 縮尺設定の初期値（HTMLの初期値と一致させる）
const DEFAULT_SCALE_X = 72;
const DEFAULT_SCALE_Y = 72;
const DEFAULT_SCALE_Z = 72;
const DEFAULT_ZOOM_LEVEL = 100;

// 縮尺設定（config.jsから読み込み - init()で初期化）
let scaleX = DEFAULT_SCALE_X;
let scaleY = DEFAULT_SCALE_Y;  // Y軸（奥行き）
let scaleZ = DEFAULT_SCALE_Z;  // Z軸（高さ）
let zoomLevel = DEFAULT_ZOOM_LEVEL; // パーセント

// パン（表示位置移動）設定（config.jsから読み込み - init()で初期化）
let panOffsetX = 0;
let panOffsetY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let hasDragged = false;  // ドラッグしたかどうかを記録

// 画像キャッシュ
const imageCache = new Map();

// 編集モード用変数
let editMode = false;
let draggedBuilding = null;
let dragStartMouseX = 0;
let dragStartMouseY = 0;
let dragStartGridX = 0;
let dragStartGridY = 0;
let previousViewMode = 'cabinet'; // 編集前のビューモードを保存

// 編集モード用固定グリッド設定
// グリッド範囲: 10×12、キャンバス: 1200×800px
// 高さ制約: (800 - 100) / 12 = 58.3px → 58px
// 幅: 10×58 = 580px、中央配置: (1200 - 580) / 2 = 310px
const EDIT_GRID_SIZE = 58;   // 固定グリッドサイズ（px）
const EDIT_OFFSET_X = 310;   // キャンバス左からのオフセット（中央配置）
const EDIT_OFFSET_Y = 50;    // キャンバス上からのオフセット

// 建物グループ定義（編集モード用）
const BUILDING_GROUPS = {
    "gate1": { name: "城門①", color: "#9a8650" },
    "tower_south1": { name: "塔・南①", color: "#9a8650" },
    "tower_southwest": { name: "塔・南西", color: "#9a8650" },
    "tower_west": { name: "塔・西", color: "#9a8650" },
    "tower_northwest": { name: "塔・北西", color: "#5a7a5a" },
    "tower_north1": { name: "塔・北①", color: "#5a7a5a" },
    "wall_route01": { name: "城壁通路01", color: "#5a7a5a" },
    "wall_route02": { name: "城壁通路02", color: "#5a7a5a" },
    "wall_route05": { name: "城壁通路05", color: "#5a7a5a" },
    "wall_route07": { name: "城壁通路07", color: "#5a7a5a" },
    "wall2f": { name: "城壁2F", color: "#5a7a5a" },
    "courtyard": { name: "中庭", color: "#9a8650" },
    "well": { name: "井戸", color: "#9a8650" }
};

// 建物の代表座標を計算
let buildingPositions = {};

// 定数
const BASE_GRID_SIZE = 72;  // 基準グリッドサイズ
const CELL_MARGIN_RATIO = 0.1;  // セル描画時のマージン比率（10%の隙間）
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// 動的グリッドサイズ計算
function getGridSizeX() {
    return scaleX * (zoomLevel / 100);
}

function getGridSizeY() {
    return scaleY * (zoomLevel / 100);
}

function getGridSizeZ() {
    return scaleZ * (zoomLevel / 100);
}

// マップの3D座標は外部ファイル (map-positions.js) から読み込み

// キャビネット斜投影の座標変換
// 座標系: x=横, y=奥行き, floor(内部的にz)=高さ
// Cabinet投影: x軸は水平、y軸は45度斜め右上、奥行き50%縮小、z軸は垂直
function toCabinetProjection(x, y, floor) {
    const scaleX = getGridSizeX();
    const scaleY = getGridSizeY();  // Y軸（奥行き）のスケール
    const scaleZ = getGridSizeZ();  // Z軸（高さ）のスケール
    const z = floor;  // floorを高さ(z)として扱う

    let screenX, screenY;

    switch (viewMode) {
        case 'cabinet':
            // キャビネット斜投影: x軸水平、y軸45度右上
            // y=0が南（手前）、y=12が北（奥）
            screenX = x * scaleX + y * scaleY * 0.5;  // x軸水平 + y軸右方向へ50%
            screenY = y * scaleY * 0.5 + z * scaleZ;  // y軸上方向へ50% + 高さ(z)
            break;

        case 'isometric':
            // 真アイソメトリック（菱形）
            // y=0が南（手前）、y=12が北（奥）
            screenX = (x - y) * scaleX * 0.5;
            screenY = (x + y) * scaleY * 0.25 + z * scaleZ;
            break;

        default:
            screenX = x * scaleX;
            screenY = y * scaleY;
    }

    // マップ全体の範囲を計算して中央に配置
    // マップ座標の範囲: x: 0-9, y: 0-12 (前後マージン含む), floor(z): 0-5
    const minX = 0, maxX = 9;
    const minY = 0, maxY = 12;
    const minFloor = 0, maxFloor = 5;

    // 各ビューモードでの実際の範囲を計算
    let boundsMinX, boundsMaxX, boundsMinY, boundsMaxY;

    switch (viewMode) {
        case 'flat2d':
            boundsMinX = minX * scaleX;
            boundsMaxX = maxX * scaleX;
            boundsMinY = minY * scaleY;
            boundsMaxY = maxY * scaleY;
            break;

        case 'cabinet':
            // x軸とy軸の影響を考慮
            // y=0が南（手前・下）、y=12が北（奥・上）
            boundsMinX = minX * scaleX + minY * scaleY * 0.5;
            boundsMaxX = maxX * scaleX + maxY * scaleY * 0.5;
            boundsMinY = minY * scaleY * 0.5 + minFloor * scaleZ;
            boundsMaxY = maxY * scaleY * 0.5 + maxFloor * scaleZ;
            break;

        case 'isometric':
            // y=0が南、y=12が北
            boundsMinX = (minX - maxY) * scaleX * 0.5;
            boundsMaxX = (maxX - minY) * scaleX * 0.5;
            boundsMinY = (minX + minY) * scaleY * 0.25 + minFloor * scaleZ;
            boundsMaxY = (maxX + maxY) * scaleY * 0.25 + maxFloor * scaleZ;
            break;

        case 'top':
            boundsMinX = minX * scaleX;
            boundsMaxX = maxX * scaleX;
            boundsMinY = minY * scaleY - maxFloor * scaleZ * 0.3;
            boundsMaxY = maxY * scaleY - minFloor * scaleZ * 0.3;
            break;

        default:
            boundsMinX = minX * scaleX;
            boundsMaxX = maxX * scaleX;
            boundsMinY = minY * scaleY;
            boundsMaxY = maxY * scaleY;
    }

    // コンテンツの幅と高さ
    const contentWidth = boundsMaxX - boundsMinX;
    const contentHeight = boundsMaxY - boundsMinY;

    // マージンを考慮して中央に配置
    const margin = 50;
    const availableWidth = CANVAS_WIDTH - margin * 2;
    const availableHeight = CANVAS_HEIGHT - margin * 2;

    // 中心点を計算
    const centerX = (boundsMinX + boundsMaxX) / 2;
    const centerY = (boundsMinY + boundsMaxY) / 2;

    // オフセット（画面中央に配置）
    const offsetX = CANVAS_WIDTH / 2 - centerX;
    const offsetY = CANVAS_HEIGHT / 2 - centerY;

    // y座標を反転（原点を左下に）
    const finalY = CANVAS_HEIGHT - (screenY + offsetY);

    return {
        x: screenX + offsetX + panOffsetX,
        y: finalY + panOffsetY
    };
}

// 画像プリロード
function preloadImages() {
    mapData.maps.forEach(map => {
        // マップテクスチャ
        if (map.image) {
            const img = new Image();
            img.onload = () => {
                render(); // 画像が読み込まれたら再描画
            };
            img.onerror = (e) => {
                console.error(`✗ テクスチャ読み込み失敗: ${map.id} (${map.image})`);
            };
            img.src = map.image;
            imageCache.set(map.id, img);
        }

        // ボス画像
        if (map.bossImage) {
            const bossImg = new Image();
            bossImg.onload = () => {
                render();
            };
            bossImg.onerror = (e) => {
                console.error(`✗ ボス画像読み込み失敗: ${map.id} (${map.bossImage})`);
            };
            bossImg.src = map.bossImage;
            imageCache.set(`${map.id}_boss`, bossImg);
        }
    });
}

// 初期化
function init() {
    canvas = document.getElementById('main-canvas');
    ctx = canvas.getContext('2d');

    // config.jsから設定を読み込み（必須）
    if (!window.SCALE_SETTINGS) {
        const errorMsg = '❌ SCALE_SETTINGS が定義されていません。config.js を確認してください。';
        console.error('利用可能なグローバル変数:', Object.keys(window).filter(k => k.includes('SCALE') || k.includes('AREA')));

        // Web画面にエラー表示
        const status = document.getElementById('loading-status');
        if (status) {
            status.textContent = errorMsg;
            status.style.color = '#ff6666';
        }

        throw new Error(errorMsg);
    }
    if (SCALE_SETTINGS.scaleX === undefined) {
        throw new Error('SCALE_SETTINGS.scaleX が定義されていません。');
    }
    if (SCALE_SETTINGS.scaleY === undefined) {
        throw new Error('SCALE_SETTINGS.scaleY が定義されていません。');
    }
    if (SCALE_SETTINGS.scaleZ === undefined) {
        throw new Error('SCALE_SETTINGS.scaleZ が定義されていません。');
    }
    if (SCALE_SETTINGS.zoom === undefined) {
        throw new Error('SCALE_SETTINGS.zoom が定義されていません。');
    }
    if (SCALE_SETTINGS.panX === undefined) {
        throw new Error('SCALE_SETTINGS.panX が定義されていません。');
    }
    if (SCALE_SETTINGS.panY === undefined) {
        throw new Error('SCALE_SETTINGS.panY が定義されていません。');
    }

    scaleX = SCALE_SETTINGS.scaleX;
    scaleY = SCALE_SETTINGS.scaleY;
    scaleZ = SCALE_SETTINGS.scaleZ;
    zoomLevel = SCALE_SETTINGS.zoom;
    panOffsetX = SCALE_SETTINGS.panX;
    panOffsetY = SCALE_SETTINGS.panY;

    // Web画面に成功メッセージ表示
    const status = document.getElementById('loading-status');
    if (status) {
        status.textContent = `✓ 設定読込完了 (X:${scaleX}, Y:${scaleY}, Z:${scaleZ}, zoom:${zoomLevel}%)`;
    }

    // UIコントロールの初期値を設定
    document.getElementById('scale-x').value = scaleX;
    document.getElementById('scale-x-num').value = scaleX;
    document.getElementById('scale-y').value = scaleY;
    document.getElementById('scale-y-num').value = scaleY;
    document.getElementById('scale-z').value = scaleZ;
    document.getElementById('scale-z-num').value = scaleZ;
    document.getElementById('scale-zoom').value = zoomLevel;
    document.getElementById('scale-zoom-num').value = zoomLevel;

    // 画像プリロード
    preloadImages();

    // イベントリスナー
    setupEventListeners();

    // 初回レンダリング
    render();

    // マップリストを生成
    updateMapList();
}

// イベントリスナーの設定
function setupEventListeners() {
    // ビュータブ
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            viewMode = e.target.dataset.view;
            render();
        });
    });

    // フロアタブ
    document.querySelectorAll('.floor-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.floor-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const floor = e.target.dataset.floor;
            if (floor === 'building') {
                buildingMode = true;
                currentFloor = 'all';
            } else {
                buildingMode = false;
                currentFloor = floor;
            }
            render();
        });
    });

    // 接続表示モードタブ
    document.querySelectorAll('.connection-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.connection-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            connectionMode = e.target.dataset.connection;
            render();
        });
    });

    // テクスチャモードタブ
    document.querySelectorAll('.texture-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.texture-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            textureMode = e.target.dataset.texture;
            render();
        });
    });

    // 縮尺コントロール
    const scaleXRange = document.getElementById('scale-x');
    const scaleXNum = document.getElementById('scale-x-num');
    const scaleYRange = document.getElementById('scale-y');
    const scaleYNum = document.getElementById('scale-y-num');
    const scaleZRange = document.getElementById('scale-z');
    const scaleZNum = document.getElementById('scale-z-num');
    const scaleZoomRange = document.getElementById('scale-zoom');
    const scaleZoomNum = document.getElementById('scale-zoom-num');
    const scaleReset = document.getElementById('scale-reset');

    function syncScale() {
        scaleX = parseInt(scaleXRange.value);
        scaleY = parseInt(scaleYRange.value);  // Y軸（奥行き）
        scaleZ = parseInt(scaleZRange.value);  // Z軸（高さ）
        zoomLevel = parseInt(scaleZoomRange.value);
        scaleXNum.value = scaleX;
        scaleYNum.value = scaleY;
        scaleZNum.value = scaleZ;
        scaleZoomNum.value = zoomLevel;
        render();
    }

    scaleXRange.addEventListener('input', syncScale);
    scaleXNum.addEventListener('input', () => {
        scaleXRange.value = scaleXNum.value;
        syncScale();
    });

    scaleYRange.addEventListener('input', syncScale);
    scaleYNum.addEventListener('input', () => {
        scaleYRange.value = scaleYNum.value;
        syncScale();
    });

    scaleZRange.addEventListener('input', syncScale);
    scaleZNum.addEventListener('input', () => {
        scaleZRange.value = scaleZNum.value;
        syncScale();
    });

    scaleZoomRange.addEventListener('input', syncScale);
    scaleZoomNum.addEventListener('input', () => {
        scaleZoomRange.value = scaleZoomNum.value;
        syncScale();
    });

    scaleReset.addEventListener('click', () => {
        // config.jsの初期値に戻す
        scaleX = window.SCALE_SETTINGS.scaleX;
        scaleY = window.SCALE_SETTINGS.scaleY;
        scaleZ = window.SCALE_SETTINGS.scaleZ;
        zoomLevel = window.SCALE_SETTINGS.zoom;
        panOffsetX = window.SCALE_SETTINGS.panX;
        panOffsetY = window.SCALE_SETTINGS.panY;
        scaleXRange.value = scaleX;
        scaleXNum.value = scaleX;
        scaleYRange.value = scaleY;
        scaleYNum.value = scaleY;
        scaleZRange.value = scaleZ;
        scaleZNum.value = scaleZ;
        scaleZoomRange.value = zoomLevel;
        scaleZoomNum.value = zoomLevel;
        render();
    });

    // Canvas クリック
    canvas.addEventListener('click', handleCanvasClick);

    // マウスホイール + Ctrlでズーム
    canvas.addEventListener('wheel', (e) => {
        // Ctrlキーが押されている時のみズーム
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();

            const delta = e.deltaY > 0 ? -5 : 5;
            let newZoom = zoomLevel + delta;

            // 範囲制限
            newZoom = Math.max(50, Math.min(200, newZoom));

            zoomLevel = newZoom;
            scaleZoomRange.value = zoomLevel;
            scaleZoomNum.value = zoomLevel;

            render();
        }
        // Ctrlなしの場合は通常のスクロール（preventDefaultしない）
    }, { passive: false });

    // マウスドラッグ用のイベントリスナーは、ファイル末尾の
    // handleEditMouseDown/Move/Up関数と統合されています
    // （編集モードと通常モードの両方に対応）
}

// Canvas クリックハンドラ
function handleCanvasClick(e) {
    // ドラッグした場合は選択しない
    if (hasDragged) {
        hasDragged = false;
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // クリック位置のマップを探す（床面と壁面の両方を判定）
    // 手前→奥、上→下の順でソート（最後にヒットしたものが採用される）
    let clickedMap = null;

    const sortedMaps = [...mapData.maps].sort((a, b) => {
        const posA = AREA_POSITIONS[a.area];
        const posB = AREA_POSITIONS[b.area];
        if (!posA || !posB) return 0;

        // まずy座標で比較（奥→手前：手前のものを後で判定）
        if (posA.y !== posB.y) return posB.y - posA.y;

        // 同じy座標なら階数で比較（下→上：上の階を後で判定）
        if (a.floor !== b.floor) return a.floor - b.floor;

        // 最後にx座標
        return posA.x - posB.x;
    });

    sortedMaps.forEach(map => {
        const pos = AREA_POSITIONS[map.area];
        if (!pos) return;

        // フロアフィルタ
        if (currentFloor !== 'all' && map.floor !== parseInt(currentFloor)) {
            return;
        }

        const margin = CELL_MARGIN_RATIO;

        // 1. 床面の判定（従来通り）
        const floorCorner1 = toCabinetProjection(pos.x + margin, pos.y + margin, map.floor);
        const floorCorner2 = toCabinetProjection(pos.x + 1 - margin, pos.y + margin, map.floor);
        const floorCorner3 = toCabinetProjection(pos.x + 1 - margin, pos.y + 1 - margin, map.floor);
        const floorCorner4 = toCabinetProjection(pos.x + margin, pos.y + 1 - margin, map.floor);

        const isInsideFloor = pointInPolygon(clickX, clickY, [
            floorCorner1, floorCorner2, floorCorner3, floorCorner4
        ]);

        if (isInsideFloor) {
            clickedMap = map;
            // 上書き可能（後続のより手前・より上のマップが優先される）
        }

        // 2. 壁面の判定（北側の垂直面）
        const wallTopLeft = toCabinetProjection(pos.x + margin, pos.y + 1 - margin, map.floor + 1);
        const wallTopRight = toCabinetProjection(pos.x + 1 - margin, pos.y + 1 - margin, map.floor + 1);
        const wallBottomRight = toCabinetProjection(pos.x + 1 - margin, pos.y + 1 - margin, map.floor);
        const wallBottomLeft = toCabinetProjection(pos.x + margin, pos.y + 1 - margin, map.floor);

        const isInsideWall = pointInPolygon(clickX, clickY, [
            wallTopLeft, wallTopRight, wallBottomRight, wallBottomLeft
        ]);

        if (isInsideWall) {
            clickedMap = map;
            // 上書き可能（後続のより手前・より上のマップが優先される）
        }
    });

    if (clickedMap) {
        currentMapId = clickedMap.id;
        render();
    }
}

// 点が多角形内にあるか判定
function pointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// WP管理
function getUnlockedWarps() {
    const saved = localStorage.getItem('unlockedWarps');
    return new Set(saved ? JSON.parse(saved) : []);
}

function isWarpUnlocked(warp) {
    const unlockedWarps = getUnlockedWarps();
    const warpIndex = mapData.warps.indexOf(warp);
    return unlockedWarps.has(warpIndex);
}

function getAccessibleMaps() {
    const accessibleMaps = new Set([currentMapId]);
    const unlockedWarps = getUnlockedWarps();

    mapData.warps.forEach((warp, index) => {
        if (unlockedWarps.has(index)) {
            if (warp.from === currentMapId) {
                accessibleMaps.add(warp.to);
            } else if (warp.to === currentMapId) {
                accessibleMaps.add(warp.from);
            }
        }
    });

    return accessibleMaps;
}

// 色の取得
function getMapColor(map) {
    const accessibleMaps = getAccessibleMaps();

    // activeマップは枠だけ赤にするので、床色はenemyTypeベースで返す
    if (accessibleMaps.has(map.id)) {
        return '#4a8a4a'; // 移動可能：落ち着いた緑
    } else if (map.enemyType === 'yellow') {
        return '#9a8650'; // 祭祀系：落ち着いた黄
    } else if (map.enemyType === 'green') {
        return '#5a7a5a'; // 森林系：落ち着いた緑
    }
    return '#4a4a4a'; // デフォルト：グレー
}

// テクスチャ分割比率を計算（床面と壁面の画像分割）
// Z軸（高さ）とY軸（奥行き）のスケール比率に基づいて動的に計算
function getTextureSplitRatio() {
    // 壁の高さと床の奥行きの視覚的な比率から画像分割比を計算
    const total = scaleZ + scaleY;
    const wallRatio = scaleZ / total;   // 壁面（画像上部）の比率
    const floorRatio = scaleY / total;  // 床面（画像下部）の比率

    return {
        wallRatio: wallRatio,   // 画像の上部が壁面用（高さに比例）
        floorRatio: floorRatio  // 画像の下部が床面用（奥行きに比例）
    };
}

// 背景グリッドを描画（空間モデルのワイヤーフレーム表示）
function drawBackgroundGrid() {
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;

    // 常に1Fのみ描画
    const floor = 1;

    {
        ctx.strokeStyle = '#2a2a2a';

        // Cabinet + 全体表示の場合のみ外枠表示
        if (viewMode === 'cabinet' && currentFloor === 'all') {
            // 全体表示：外枠 + 薄い塗りつぶし
            const corner1 = toCabinetProjection(0, 0, floor);
            const corner2 = toCabinetProjection(10, 0, floor);
            const corner3 = toCabinetProjection(10, 12, floor);
            const corner4 = toCabinetProjection(0, 12, floor);

            // 薄い塗りつぶし
            ctx.fillStyle = 'rgba(42, 42, 42, 0.1)';
            ctx.beginPath();
            ctx.moveTo(corner1.x, corner1.y);
            ctx.lineTo(corner2.x, corner2.y);
            ctx.lineTo(corner3.x, corner3.y);
            ctx.lineTo(corner4.x, corner4.y);
            ctx.closePath();
            ctx.fill();

            // 枠線
            ctx.strokeStyle = '#2a2a2a';
            ctx.stroke();
        } else {
            // その他すべて：内部グリッドを表示
            // x軸方向の線（水平）
            for (let z = 0; z <= 12; z++) {
                ctx.beginPath();
                const start = toCabinetProjection(0, z, floor);
                const end = toCabinetProjection(10, z, floor);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }

            // y軸方向の線（奥行き）
            for (let x = 0; x <= 10; x++) {
                ctx.beginPath();
                const start = toCabinetProjection(x, 0, floor);
                const end = toCabinetProjection(x, 12, floor);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }

        // Cabinet + 全体表示の時もグリッドを描画
        if (viewMode === 'cabinet' && currentFloor === 'all') {
            ctx.strokeStyle = '#2a2a2a';

            // x軸方向の線（横）
            for (let y = 0; y <= 12; y++) {
                ctx.beginPath();
                const start = toCabinetProjection(0, y, floor);
                const end = toCabinetProjection(10, y, floor);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }

            // y軸方向の線（奥行き）
            for (let x = 0; x <= 10; x++) {
                ctx.beginPath();
                const start = toCabinetProjection(x, 0, floor);
                const end = toCabinetProjection(x, 12, floor);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }
    }
}

// マップブロックを描画
function drawMapBlock(map) {
    const pos = AREA_POSITIONS[map.area];
    if (!pos) return;

    // フロアフィルタ（map.floorを使用）
    if (currentFloor !== 'all' && map.floor !== parseInt(currentFloor)) {
        return;
    }

    const mapColor = getMapColor(map);
    const accessibleMaps = getAccessibleMaps();
    const isCurrent = map.id === currentMapId;
    const isAccessible = accessibleMaps.has(map.id);

    if (viewMode === 'cabinet' || viewMode === 'isometric') {
        // キャビネット投影：立方体として描画
        // 同じ座標の全MAPを取得して、実際に存在する階を特定
        const mapsAtSameLocation = mapData.maps.filter(m => {
            const mPos = AREA_POSITIONS[m.area];
            if (!mPos || mPos.x !== pos.x || mPos.y !== pos.y) return false;

            // フロアフィルタを適用
            if (currentFloor !== 'all' && m.floor !== parseInt(currentFloor)) return false;

            return true;
        });

        // 実際にMAPが存在する階のセット（map.floorを使用）
        const existingFloors = new Set(mapsAtSameLocation.map(m => m.floor));
        const maxFloor = Math.max(...existingFloors);
        const actualMinFloor = Math.min(...existingFloors);
        // 建物として1F（または地下がある場合は0F）から描画
        const minFloor = Math.min(actualMinFloor, 1);

        ctx.strokeStyle = isCurrent ? '#ff6666' : (isAccessible ? '#6aaa6a' : '#666');
        ctx.lineWidth = isCurrent ? 3 : (isAccessible ? 2 : 1);

        // 建物の4隅（x,y座標）にマージンを適用
        const margin = CELL_MARGIN_RATIO;
        const corners2D = [
            { x: pos.x + margin, y: pos.y + margin },
            { x: pos.x + 1 - margin, y: pos.y + margin },
            { x: pos.x + 1 - margin, y: pos.y + 1 - margin },
            { x: pos.x + margin, y: pos.y + 1 - margin }
        ];

        // 4本の垂直エッジを描画（1Fから最上階まで）- 常にグレー
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const bottom = toCabinetProjection(corners2D[i].x, corners2D[i].y, minFloor);
            const top = toCabinetProjection(corners2D[i].x, corners2D[i].y, maxFloor);
            ctx.beginPath();
            ctx.moveTo(bottom.x, bottom.y);
            ctx.lineTo(top.x, top.y);
            ctx.stroke();
        }

        // 北側の垂直面にテクスチャを描画（試験的）
        for (let floor = minFloor; floor < maxFloor + 1; floor++) {
            if (existingFloors.has(floor)) {
                const mapAtFloor = mapsAtSameLocation.find(m => m.floor === floor);
                const img = imageCache.get(mapAtFloor.id);

                if (img && img.complete && img.naturalWidth > 0) {
                    // 北側の面（奥側）：左奥(3)→右奥(2)の垂直面
                    const topLeft = toCabinetProjection(corners2D[3].x, corners2D[3].y, floor + 1);
                    const topRight = toCabinetProjection(corners2D[2].x, corners2D[2].y, floor + 1);
                    const bottomRight = toCabinetProjection(corners2D[2].x, corners2D[2].y, floor);
                    const bottomLeft = toCabinetProjection(corners2D[3].x, corners2D[3].y, floor);

                    // 矩形を描画
                    ctx.save();
                    ctx.globalAlpha = 1.0; // 壁面も完全不透明（Z-order修正により、奥の線を完全に隠す）

                    // 画像の幅と高さ
                    const wallWidth = bottomRight.x - bottomLeft.x;
                    const wallHeight = bottomLeft.y - topLeft.y;

                    // テクスチャ分割：画像の上半分を壁面に使用
                    const ratio = getTextureSplitRatio();
                    const sourceY = 0;
                    const sourceHeight = img.height * ratio.wallRatio;

                    // 画像を直接描画（変形なし）
                    ctx.drawImage(
                        img,
                        0, sourceY, img.width, sourceHeight,  // 元画像の上半分を切り出し
                        bottomLeft.x, topLeft.y, wallWidth, wallHeight  // 描画先
                    );
                    ctx.restore();

                    // 壁面単独の枠線は描かない（後で床面と統合した6角形外周を描く）
                }
            }
        }

        // 各階の水平枠線を描画
        for (let floor = minFloor; floor <= maxFloor + 1; floor++) {
            const floorCorners = corners2D.map(c => toCabinetProjection(c.x, c.y, floor));

            // この階にMAPが実際に存在するか確認
            if (existingFloors.has(floor)) {
                // MAPが存在する階：床面を描画
                // この階のMAPを取得（色と状態を判定）
                const mapAtFloor = mapsAtSameLocation.find(m => m.floor === floor);
                const floorMapColor = getMapColor(mapAtFloor);
                const isFloorCurrent = mapAtFloor.id === currentMapId;
                const isFloorAccessible = accessibleMaps.has(mapAtFloor.id);

                // 床の描画（テクスチャモードに応じて切り替え）
                ctx.beginPath();
                ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
                ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
                ctx.lineTo(floorCorners[2].x, floorCorners[2].y);
                ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
                ctx.closePath();

                if (textureMode === 'texture') {
                    // 画像テクスチャモード
                    const img = imageCache.get(mapAtFloor.id);

                    if (img && img.complete && img.naturalWidth > 0) {
                        // まず通常の色塗り（下地）
                        ctx.fillStyle = floorMapColor;
                        ctx.fill();

                        // 斜投影変形して画像を描画
                        // floorCorners: [0]=南西, [1]=南東, [2]=北東, [3]=北西
                        const x0 = floorCorners[0].x, y0 = floorCorners[0].y;  // 原点（南西）
                        const x1 = floorCorners[1].x, y1 = floorCorners[1].y;  // X方向ベクトル終点（南東）
                        const x3 = floorCorners[3].x, y3 = floorCorners[3].y;  // Y方向ベクトル終点（北西）

                        // テクスチャ分割：画像の下半分を床面全体に使用
                        const ratio = getTextureSplitRatio();
                        const floorSourceY = img.height * ratio.wallRatio;  // 切り出し開始Y座標
                        const floorSourceH = img.height * ratio.floorRatio; // 切り出し高さ

                        // 一時キャンバスに画像の下半分を切り出し（上下反転してvalley fold効果）
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = img.width;
                        tempCanvas.height = floorSourceH;
                        const tempCtx = tempCanvas.getContext('2d');

                        // 上下反転して描画（valley foldで壁から連続するように）
                        tempCtx.save();
                        tempCtx.scale(1, -1);  // Y軸反転
                        tempCtx.drawImage(img, 0, floorSourceY, img.width, floorSourceH,
                            0, -floorSourceH, img.width, floorSourceH);
                        tempCtx.restore();

                        // 変換行列を計算（アフィン変換）
                        const dx1 = x1 - x0;  // X方向ベクトル（画像の幅方向）
                        const dy1 = y1 - y0;
                        const dx2 = x3 - x0;  // Y方向ベクトル（画像の高さ方向）
                        const dy2 = y3 - y0;

                        // 画像描画用に変換行列を保存・適用
                        ctx.save();
                        ctx.globalAlpha = 1.0; // 完全不透明（Z-order修正により、奥の線を完全に隠す）
                        ctx.setTransform(dx1 / tempCanvas.width, dy1 / tempCanvas.width, dx2 / tempCanvas.height, dy2 / tempCanvas.height, x0, y0);
                        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
                        ctx.restore();
                    } else {
                        // 画像がない、または読み込み中は色塗りのみ
                        ctx.fillStyle = floorMapColor;
                        ctx.fill();
                    }
                } else {
                    // 色塗りモード
                    ctx.fillStyle = floorMapColor;
                    ctx.fill();
                }

                // 谷折り2面（壁+床）の完全な外周を描画
                // 6角形：壁の上辺4点 + 床の手前辺2点
                const wallTopLeft = toCabinetProjection(corners2D[3].x, corners2D[3].y, floor + 1);
                const wallTopRight = toCabinetProjection(corners2D[2].x, corners2D[2].y, floor + 1);
                const wallBottomRight = toCabinetProjection(corners2D[2].x, corners2D[2].y, floor);
                const wallBottomLeft = toCabinetProjection(corners2D[3].x, corners2D[3].y, floor);

                // 枠線の色と太さ：current > boss > accessible > default
                const isBoss = mapAtFloor.boss;
                if (isFloorCurrent) {
                    ctx.strokeStyle = '#ff6666';
                    ctx.lineWidth = 4;
                } else if (isBoss) {
                    ctx.strokeStyle = '#ffdd00';  // 黄色
                    ctx.lineWidth = 3;
                } else if (isFloorAccessible) {
                    ctx.strokeStyle = '#6aaa6a';
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 1;
                }
                ctx.beginPath();
                // 壁面の上辺（左→右）
                ctx.moveTo(wallTopLeft.x, wallTopLeft.y);
                ctx.lineTo(wallTopRight.x, wallTopRight.y);
                // 壁面の右辺（上→下）
                ctx.lineTo(wallBottomRight.x, wallBottomRight.y);
                // 床面の右辺（奥→手前） [2]→[1]
                ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
                // 床面の手前辺（右→左） [1]→[0]
                ctx.lineTo(floorCorners[0].x, floorCorners[0].y);
                // 床面の左辺（手前→奥） [0]→[3]
                ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
                // 壁面の左辺（下→上） 戻る
                ctx.closePath();
                ctx.stroke();
            } else if (floor < maxFloor + 1) {
                // MAPが存在しない中間階：枠線のみ（薄く、常にグレー）
                ctx.strokeStyle = '#444';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
                ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
                ctx.lineTo(floorCorners[2].x, floorCorners[2].y);
                ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
                ctx.closePath();
                ctx.stroke();
            }
        }

        // 第1パス：ボス画像/マークを先に描画（背景レイヤー）
        mapsAtSameLocation.forEach(mapAtLoc => {
            if (mapAtLoc.boss) {
                const mapFloorCorners = corners2D.map(c => toCabinetProjection(c.x, c.y, mapAtLoc.floor));
                const bossImg = imageCache.get(`${mapAtLoc.id}_boss`);

                if (bossImg && bossImg.complete && bossImg.naturalWidth > 0) {
                    // ボス画像がある場合：床面に立っているように描画
                    // 壁面の高さを基準にサイズを決定
                    const wallBottom = toCabinetProjection(corners2D[2].x, corners2D[2].y, mapAtLoc.floor);
                    const wallTop = toCabinetProjection(corners2D[2].x, corners2D[2].y, mapAtLoc.floor + 1);
                    const wallHeight = wallBottom.y - wallTop.y;

                    // アスペクト比を保持して幅を計算（壁面の2倍のサイズ）
                    const aspectRatio = bossImg.naturalWidth / bossImg.naturalHeight;
                    const imgHeight = wallHeight * 2;
                    const imgWidth = imgHeight * aspectRatio;

                    // 赤丸の位置（右下コーナー）を起点に、z座標を15%手前にずらす
                    // corners2D: [0]=南西, [1]=南東, [2]=北東, [3]=北西
                    const baseX = corners2D[2].x;  // 右下コーナー（北東）のx座標
                    const baseZ = corners2D[2].y;  // 右下コーナーのz座標（y）

                    // 床面の奥行きを計算（手前から奥まで）
                    const frontZ = (corners2D[0].y + corners2D[1].y) / 2;  // 手前辺
                    const backZ = (corners2D[2].y + corners2D[3].y) / 2;   // 奥辺
                    const depthZ = backZ - frontZ;

                    // 赤丸位置
                    const bossZ = baseZ;
                    const bossScreen = toCabinetProjection(baseX, bossZ, mapAtLoc.floor);

                    // 画像の下端を床面（手前側）の下のラインに合わせる
                    // corners: [0]=南西（左手前）, [1]=南東（右手前）, [2]=北東（右奥）, [3]=北西（左奥）
                    const floorBottomY = (mapFloorCorners[0].y + mapFloorCorners[1].y) / 2;  // 手前側の床面ライン
                    const imgX = bossScreen.x - imgWidth / 2;
                    const imgY = floorBottomY - imgHeight;  // 画像の下端を床面の下ラインに配置

                    ctx.save();
                    ctx.drawImage(bossImg, imgX, imgY, imgWidth, imgHeight);
                    ctx.restore();
                } else {
                    // ボス画像がない場合：従来の王冠マーク
                    const rightBottomX = mapFloorCorners[2].x;
                    const rightBottomY = mapFloorCorners[2].y;

                    ctx.save();
                    // 背景円
                    ctx.fillStyle = '#ff6666';
                    ctx.beginPath();
                    ctx.arc(rightBottomX - 10, rightBottomY - 10, 8, 0, Math.PI * 2);
                    ctx.fill();

                    // 王冠記号
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('👑', rightBottomX - 10, rightBottomY - 10);
                    ctx.restore();
                }
            }
        });

        // 第2パス：MAP名を後に描画（前景レイヤー）
        mapsAtSameLocation.forEach(mapAtLoc => {
            const mapFloorCorners = corners2D.map(c => toCabinetProjection(c.x, c.y, mapAtLoc.floor));
            const centerX = (mapFloorCorners[0].x + mapFloorCorners[1].x + mapFloorCorners[2].x + mapFloorCorners[3].x) / 4;
            const centerY = (mapFloorCorners[0].y + mapFloorCorners[1].y + mapFloorCorners[2].y + mapFloorCorners[3].y) / 4;

            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 白い縁取り（極細）
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeText(mapAtLoc.name, centerX, centerY);
            // 黒い文字（太字）
            ctx.fillStyle = '#000000';
            ctx.fillText(mapAtLoc.name, centerX, centerY);
        });
    }
}

// WP接続線を描画
function drawWarpConnections(sideFilter = 'all') {
    mapData.warps.forEach(warp => {
        const fromMap = mapData.maps.find(m => m.id === warp.from);
        const toMap = mapData.maps.find(m => m.id === warp.to);

        if (!fromMap || !toMap) return;

        const fromPos = AREA_POSITIONS[fromMap.area];
        const toPos = AREA_POSITIONS[toMap.area];

        if (!fromPos || !toPos) return;

        // フロアフィルタ：選択された階層に関連する接続のみ表示
        if (currentFloor !== 'all') {
            const selectedFloor = parseInt(currentFloor);
            // どちらかのマップが選択階層にあれば表示
            if (fromMap.floor !== selectedFloor && toMap.floor !== selectedFloor) {
                return;
            }
        }

        const unlocked = isWarpUnlocked(warp);

        if (connectionMode === 'plane') {
            // 平面塗りつぶし
            drawConnectionPlane(fromPos, toPos, fromMap, toMap, unlocked, sideFilter);
        } else {
            // 実線（デフォルト）
            drawConnectionLine(fromPos, toPos, fromMap.floor, toMap.floor, unlocked);
        }
    });
}

// 実線で接続を描画
function drawConnectionLine(fromPos, toPos, fromFloor, toFloor, unlocked) {
    const fromScreen = toCabinetProjection(fromPos.x + 0.5, fromPos.y + 0.5, fromFloor);
    const toScreen = toCabinetProjection(toPos.x + 0.5, toPos.y + 0.5, toFloor);

    // 線の色とスタイル
    ctx.strokeStyle = unlocked ? '#88aa88' : '#aa6666';
    ctx.lineWidth = 2;

    // 実線を描画
    ctx.beginPath();
    ctx.moveTo(fromScreen.x, fromScreen.y);
    ctx.lineTo(toScreen.x, toScreen.y);
    ctx.stroke();
}

// 平面（グリッド塗り）で接続を描画
function drawConnectionPlane(fromPos, toPos, fromMap, toMap, unlocked, sideFilter = 'all') {
    const fromFloor = fromMap.floor;
    const toFloor = toMap.floor;

    // 同一座標・同一エリアで階層が異なる場合は、建物側面を描画
    if (fromPos.x === toPos.x && fromPos.y === toPos.y && fromMap.area === toMap.area && fromFloor !== toFloor) {
        drawVerticalConnectionSide(fromPos, fromFloor, toFloor, unlocked, sideFilter);
        return;
    }

    // 水平接続はsideFilterが'west'の時のみ描画（1回だけ描画すればいい）
    if (sideFilter !== 'west') {
        return;
    }

    // 2つのMAPセルの中心を求める
    const fromCenterX = fromPos.x + 0.5;
    const fromCenterY = fromPos.y + 0.5;
    const toCenterX = toPos.x + 0.5;
    const toCenterY = toPos.y + 0.5;

    // 接続方向のベクトル
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    // 接続方向のベクトルを正規化
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // 固定幅（0.2グリッド幅）
    const width = 0.2;
    const perpX = -normalizedDy * width;
    const perpY = normalizedDx * width;

    // 平行四辺形の4つの頂点
    const corners = [
        toCabinetProjection(fromCenterX - perpX, fromCenterY - perpY, fromFloor),
        toCabinetProjection(fromCenterX + perpX, fromCenterY + perpY, fromFloor),
        toCabinetProjection(toCenterX + perpX, toCenterY + perpY, toFloor),
        toCabinetProjection(toCenterX - perpX, toCenterY - perpY, toFloor)
    ];

    ctx.fillStyle = unlocked ? 'rgba(136, 170, 136, 0.2)' : 'rgba(170, 102, 102, 0.2)';
    ctx.strokeStyle = unlocked ? '#88aa88' : '#aa6666';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 垂直方向の接続（建物側面）を描画
function drawVerticalConnectionSide(pos, fromFloor, toFloor, unlocked, sideFilter = 'all') {
    const minFloor = Math.min(fromFloor, toFloor);
    const maxFloor = Math.max(fromFloor, toFloor);

    // 階段のように交互に側面を選択（下から西→東→西→東...）
    for (let floor = minFloor; floor < maxFloor; floor++) {
        const isEven = floor % 2 === 0;
        const isWestSide = isEven;

        // sideFilterでフィルタリング
        if (sideFilter === 'west' && !isWestSide) continue;
        if (sideFilter === 'east' && isWestSide) continue;

        // 建物の4つの辺から1つを選択（東西で交互に変える）
        let corners;
        if (isWestSide) {
            // 西側の辺（x方向の最小側）
            corners = [
                toCabinetProjection(pos.x, pos.y, floor),
                toCabinetProjection(pos.x, pos.y + 1, floor),
                toCabinetProjection(pos.x, pos.y + 1, floor + 1),
                toCabinetProjection(pos.x, pos.y, floor + 1)
            ];
        } else {
            // 東側の辺（x方向の最大側）
            corners = [
                toCabinetProjection(pos.x + 1, pos.y, floor),
                toCabinetProjection(pos.x + 1, pos.y + 1, floor),
                toCabinetProjection(pos.x + 1, pos.y + 1, floor + 1),
                toCabinetProjection(pos.x + 1, pos.y, floor + 1)
            ];
        }

        // 垂直接続は青系の色で区別
        ctx.fillStyle = unlocked ? 'rgba(136, 170, 204, 0.3)' : 'rgba(170, 136, 170, 0.3)';
        ctx.strokeStyle = unlocked ? '#88aacc' : '#aa88aa';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

// 建物を箱として描画（純粋な立方体、MAPデータに依存しない）
function drawBuildingBox(minX, maxX, minY, maxY, minFloor, maxFloor, color) {
    // 建物の4隅の座標（x,y平面）にマージンを適用
    const margin = CELL_MARGIN_RATIO;
    const corners2D = [
        { x: minX + margin, y: minY + margin },  // 南西
        { x: maxX - margin, y: minY + margin },  // 南東
        { x: maxX - margin, y: maxY - margin },  // 北東
        { x: minX + margin, y: maxY - margin }   // 北西
    ];

    // 1. 4本の垂直エッジを描画（最低階から最高階まで）
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const bottom = toCabinetProjection(corners2D[i].x, corners2D[i].y, minFloor);
        const top = toCabinetProjection(corners2D[i].x, corners2D[i].y, maxFloor);
        ctx.beginPath();
        ctx.moveTo(bottom.x, bottom.y);
        ctx.lineTo(top.x, top.y);
        ctx.stroke();
    }

    // 2. 各階の水平枠線を描画
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    for (let floor = minFloor; floor <= maxFloor; floor++) {
        const floorCorners = corners2D.map(c => toCabinetProjection(c.x, c.y, floor));

        // 底面（最低階）のみ塗りつぶし
        if (floor === minFloor) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
            ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
            ctx.lineTo(floorCorners[2].x, floorCorners[2].y);
            ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            // それ以外の階：枠線のみ
            ctx.beginPath();
            ctx.moveTo(floorCorners[0].x, floorCorners[0].y);
            ctx.lineTo(floorCorners[1].x, floorCorners[1].y);
            ctx.lineTo(floorCorners[2].x, floorCorners[2].y);
            ctx.lineTo(floorCorners[3].x, floorCorners[3].y);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

// 建物を描画
function drawBuildings() {
    // エリアごとにマップをグループ化
    const areaGroups = {};
    mapData.maps.forEach(map => {
        const pos = AREA_POSITIONS[map.area];
        if (!pos) return;

        // すべてのマップをarea単位でグループ化
        if (!areaGroups[map.area]) {
            areaGroups[map.area] = [];
        }
        areaGroups[map.area].push(map);
    });

    // エリアの色
    const areaColors = {
        'tower_south1': 'rgba(255, 136, 136, 0.3)',
        'tower_southwest': 'rgba(255, 136, 255, 0.3)',
        'tower_west': 'rgba(136, 136, 255, 0.3)',
        'tower_northwest': 'rgba(136, 255, 255, 0.3)',
        'tower_north1': 'rgba(136, 255, 136, 0.3)',
        'gate1': 'rgba(255, 255, 136, 0.3)',
        'wall2f': 'rgba(255, 170, 136, 0.3)',
        'wall_route': 'rgba(170, 255, 170, 0.3)',
        'courtyard': 'rgba(170, 170, 255, 0.3)',
        'well': 'rgba(255, 170, 255, 0.3)'
    };

    // 各エリアの建物を描画（奥から手前へ：Y座標降順でソート）
    const sortedAreaEntries = Object.entries(areaGroups).sort(([areaA], [areaB]) => {
        const posA = AREA_POSITIONS[areaA];
        const posB = AREA_POSITIONS[areaB];
        // Y座標が大きい（奥）ものを先に描画
        return (posB?.y || 0) - (posA?.y || 0);
    });

    sortedAreaEntries.forEach(([areaName, maps]) => {
        if (maps.length === 0) return;

        // エリアの境界を計算
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minFloor = Infinity, maxFloor = -Infinity;

        maps.forEach(map => {
            const pos = AREA_POSITIONS[map.area];
            if (pos) {
                minX = Math.min(minX, pos.x);
                maxX = Math.max(maxX, pos.x);
                minY = Math.min(minY, pos.y);
                maxY = Math.max(maxY, pos.y);
                minFloor = Math.min(minFloor, map.floor);
                maxFloor = Math.max(maxFloor, map.floor);
            }
        });

        // 建物のワイヤーフレームは必ず1F（または0F）から開始し、最高階まで描画
        const buildingMinFloor = Math.min(minFloor, 1); // 地下があれば0Fから、なければ1Fから
        const buildingMaxFloor = Math.max(maxFloor, 3); // 最低でも3Fまで表示

        const colorKey = maps[0].area;
        const buildingColor = areaColors[colorKey] || 'rgba(204, 204, 204, 0.3)';

        // 建物を純粋な箱として描画（最低階から最高階まで連続）
        // マップは1x1のグリッドなので、maxX+1, maxY+1 まで描画
        drawBuildingBox(minX, maxX + 1, minY, maxY + 1,
            buildingMinFloor, buildingMaxFloor, buildingColor);
    });
}

// レンダリング
function render() {
    // キャンバスクリア
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (editMode) {
        // 編集モード: 建物ノードを描画（独自のグリッドを含む）
        drawBuildingNodes();
    } else {
        // 通常モードと建物モード：背景グリッドを描画
        drawBackgroundGrid();

        if (buildingMode) {
            // 建物表示モード
            drawBuildings();
        } else {
            // 通常モード：シンプルな2パス描画
            // 1. 先に接続線を全部描画
            if (connectionMode === 'plane') {
                // 平面モード：西側の垂直接続を先に描画
                drawWarpConnections('west');
            } else {
                // 線モード：接続線を描画
                drawWarpConnections();
            }

            // 2. 後から床面を描画（完全不透明なので線を隠す）
            // マップを座標でソート（奥→手前）して描画
            const sortedMaps = [...mapData.maps].sort((a, b) => {
                const posA = AREA_POSITIONS[a.area];
                const posB = AREA_POSITIONS[b.area];
                if (!posA || !posB) return 0;

                // まずy座標で比較（北→南：奥から手前へ）
                if (posA.y !== posB.y) return posB.y - posA.y;

                // 同じy座標なら階数で比較（下の階から先に描画）
                if (a.floor !== b.floor) return a.floor - b.floor;

                // 最後にx座標で比較（西→東）
                return posA.x - posB.x;
            });

            const drawnLocations = new Set();
            sortedMaps.forEach(map => {
                const pos = AREA_POSITIONS[map.area];
                if (pos) {
                    // 階層フィルタ使用時は階層も含めてキーにする
                    const locationKey = currentFloor === 'all'
                        ? `${pos.x},${pos.y}`
                        : `${pos.x},${pos.y},${map.floor}`;

                    if (!drawnLocations.has(locationKey)) {
                        drawnLocations.add(locationKey);
                        drawMapBlock(map);
                    }
                }
            });

            if (connectionMode === 'plane') {
                // 平面モード：東側の垂直接続を床の後に描画
                drawWarpConnections('east');
            }
        }
    }

    // 情報パネル更新
    if (currentMapId) {
        const currentMap = mapData.maps.find(m => m.id === currentMapId);
        if (currentMap) {
            showMapInfo(currentMap);
        }
    }

    // マップリスト更新
    updateMapList();
}

// マップリストを更新
function updateMapList() {
    const mapListDiv = document.getElementById('map-list');
    let html = '';

    mapData.maps.forEach(map => {
        // フロアフィルタを適用
        if (currentFloor !== 'all' && map.floor !== parseInt(currentFloor)) {
            return;
        }

        const isCurrent = map.id === currentMapId;
        const className = isCurrent ? 'map-list-item current' : 'map-list-item';
        html += `<div class="${className}" data-map-id="${map.id}">${map.name}</div>`;
    });

    mapListDiv.innerHTML = html;

    // マップリストのクリックイベント
    document.querySelectorAll('.map-list-item').forEach(item => {
        item.addEventListener('click', (e) => {
            currentMapId = e.target.dataset.mapId;
            render();
            updateMapList();
        });
    });
}

// マップ情報表示
function showMapInfo(map) {
    const infoContent = document.getElementById('info-content');

    // マップテクスチャ画像の準備
    let mapImageHtml = '';
    if (map.image) {
        const img = imageCache.get(map.id);
        if (img && img.complete && img.naturalWidth > 0) {
            mapImageHtml = `<img src="${map.image}" alt="${map.name}" class="map-preview-image">`;
        } else {
            mapImageHtml = `<div class="map-preview-placeholder">画像読込中...</div>`;
        }
    } else {
        mapImageHtml = `<div class="map-preview-placeholder">画像なし</div>`;
    }

    // ボス画像の準備
    let bossImageHtml = '';
    let bossTextHtml = '';
    if (map.boss) {
        bossTextHtml = `<div class="map-info-row"><span class="label">ボス:</span> 👑 ボスマップ</div>`;

        if (map.bossImage) {
            const bossImg = imageCache.get(`${map.id}_boss`);
            if (bossImg && bossImg.complete && bossImg.naturalWidth > 0) {
                bossImageHtml = `
                    <div class="map-info-boss-image">
                        <img src="${map.bossImage}" alt="ボス画像" class="boss-preview-image">
                    </div>
                `;
            }
        }
    }

    let html = `
        <div class="map-info-layout ${map.boss && map.bossImage ? 'with-boss' : ''}">
            <div class="map-info-image">
                ${mapImageHtml}
            </div>
            <div class="map-info-details">
                <div class="map-info-title">${map.name}</div>
                <div class="map-info-row"><span class="label">階層:</span> ${map.floor}F</div>
                <div class="map-info-row"><span class="label">エリア:</span> ${mapData.metadata.areas[map.area] || map.area}</div>
                <div class="map-info-row"><span class="label">敵タイプ:</span> ${mapData.metadata.enemyTypes[map.enemyType] || '-'}</div>
                ${bossTextHtml}
                <div class="map-info-row"><span class="label">説明:</span> ${map.description || '-'}</div>
                <div class="map-info-ids">
                    <div class="map-info-id"><span class="label">MAP ID:</span> <code>${map.id}</code></div>
                    <div class="map-info-id"><span class="label">Area ID:</span> <code>${map.area}</code></div>
                    <div class="map-info-id"><span class="label">画像:</span> <code>${map.image || 'なし'}</code></div>
                </div>
            </div>
            ${bossImageHtml}
        </div>
    `;

    infoContent.innerHTML = html;
}

// ============================================
// 編集モード機能
// ============================================

// 建物の代表座標を計算
function calculateBuildingPositions() {
    buildingPositions = {};

    // 各建物について、そのarea属性を持つ全MAPの座標から代表座標を計算
    Object.keys(BUILDING_GROUPS).forEach(buildingId => {
        const mapsInBuilding = mapData.maps.filter(m => m.area === buildingId);

        if (mapsInBuilding.length > 0) {
            // 最も低いフロアのMAPの座標を使用
            let lowestFloorMap = mapsInBuilding[0];
            mapsInBuilding.forEach(m => {
                if (m.floor < lowestFloorMap.floor) {
                    lowestFloorMap = m;
                }
            });

            const pos = AREA_POSITIONS[buildingId];
            if (pos) {
                buildingPositions[buildingId] = { x: pos.x, y: pos.y };
            }
        }
    });
}

// 建物ノードを描画（編集モード専用）
function drawBuildingNodes() {
    calculateBuildingPositions();

    // 背景グリッドを描画（10x12のモデルグリッド）
    // 数学的座標系：原点は左下、Y軸は上向き
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;

    const GRID_WIDTH = 10;   // X軸のグリッド数
    const GRID_HEIGHT = 12;  // Y軸のグリッド数

    // 縦線（x軸方向）
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(EDIT_OFFSET_X + x * EDIT_GRID_SIZE, EDIT_OFFSET_Y);
        ctx.lineTo(EDIT_OFFSET_X + x * EDIT_GRID_SIZE, EDIT_OFFSET_Y + GRID_HEIGHT * EDIT_GRID_SIZE);
        ctx.stroke();
    }

    // 横線（y軸方向）
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(EDIT_OFFSET_X, EDIT_OFFSET_Y + y * EDIT_GRID_SIZE);
        ctx.lineTo(EDIT_OFFSET_X + GRID_WIDTH * EDIT_GRID_SIZE, EDIT_OFFSET_Y + y * EDIT_GRID_SIZE);
        ctx.stroke();
    }

    // 各建物をグリッドに配置
    Object.entries(buildingPositions).forEach(([buildingId, pos]) => {
        const building = BUILDING_GROUPS[buildingId];
        if (!building) return;

        // 固定グリッド上の位置を計算（数学的座標系：Y軸は上向き）
        const x = EDIT_OFFSET_X + pos.x * EDIT_GRID_SIZE;
        const y = EDIT_OFFSET_Y + (GRID_HEIGHT - 1 - pos.y) * EDIT_GRID_SIZE;  // Y軸反転
        const margin = CELL_MARGIN_RATIO * EDIT_GRID_SIZE;

        // セルの四隅（マージン適用）
        const x1 = x + margin;
        const y1 = y + margin;
        const x2 = x + EDIT_GRID_SIZE - margin;
        const y2 = y + EDIT_GRID_SIZE - margin;

        // セル中心
        const centerX = x + EDIT_GRID_SIZE / 2;
        const centerY = y + EDIT_GRID_SIZE / 2;

        // セルを描画（四角形）
        ctx.fillStyle = building.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        // 建物名を表示
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(building.name, centerX, centerY);

        // 座標情報を小さく表示
        ctx.font = '10px sans-serif';
        ctx.fillText(`(${pos.x}, ${pos.y})`, centerX, centerY + 20);
    });
}

// 編集モード切り替え
function toggleEditMode() {
    editMode = !editMode;
    const toggleBtn = document.getElementById('edit-mode-toggle');

    if (editMode) {
        toggleBtn.classList.add('active');
        canvas.classList.add('edit-mode');

        // 座標出力ボタンを表示
        document.getElementById('export-coords-inline').style.display = 'inline-block';

        // 現在のビューを保存して2Dビューに切り替え
        previousViewMode = viewMode;
        if (viewMode !== 'flat2d') {
            viewMode = 'flat2d';
            document.querySelectorAll('.view-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.view === 'flat2d') {
                    tab.classList.add('active');
                }
            });
            render();
        }
    } else {
        // 編集モード終了時の処理
        toggleBtn.classList.remove('active');
        canvas.classList.remove('edit-mode');
        draggedBuilding = null;

        // 座標出力ボタンを非表示
        document.getElementById('export-coords-inline').style.display = 'none';

        // 元のビューモードに戻す
        if (viewMode !== previousViewMode) {
            viewMode = previousViewMode;
            document.querySelectorAll('.view-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.view === viewMode) {
                    tab.classList.add('active');
                }
            });
            render();
        }
    }
}

// スクリーン座標からグリッド座標への逆変換（2D専用）
function screenToGrid(screenX, screenY) {
    const rect = canvas.getBoundingClientRect();
    const scale = getGridSizeX();  // 動的グリッドサイズを使用

    // センター計算（toCabinetProjectionと同じロジック）
    const minX = 0, maxX = 10;
    const minY = 0, maxY = 12;
    const viewMinX = minX * scale;
    const viewMaxX = maxX * scale;
    const viewMinY = minY * scale;
    const viewMaxY = maxY * scale;
    const viewWidth = viewMaxX - viewMinX;
    const viewHeight = viewMaxY - viewMinY;
    const offsetX = (CANVAS_WIDTH - viewWidth) / 2;
    const offsetY = (CANVAS_HEIGHT - viewHeight) / 2;

    // スクリーン座標をキャンバス座標に変換
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    // グリッド座標に変換（中央オフセットを考慮）
    const gridX = Math.round((canvasX - offsetX) / scale);
    const gridZ = Math.round((canvasY - offsetY) / scale);

    return { x: gridX, z: gridZ };
}

// マウスダウン: ドラッグ開始（編集モード：建物単位、通常モード：パン）
function handleEditMouseDown(e) {
    if (editMode) {
        // 編集モード：建物ドラッグ（固定グリッド）
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // クリック位置にある建物を検索（矩形判定、マージンを適用）
        const GRID_HEIGHT = 12;
        const margin = CELL_MARGIN_RATIO * EDIT_GRID_SIZE;
        for (const [buildingId, pos] of Object.entries(buildingPositions)) {
            const x = EDIT_OFFSET_X + pos.x * EDIT_GRID_SIZE;
            const y = EDIT_OFFSET_Y + (GRID_HEIGHT - 1 - pos.y) * EDIT_GRID_SIZE;  // Y軸反転

            const x1 = x + margin;
            const y1 = y + margin;
            const x2 = x + EDIT_GRID_SIZE - margin;
            const y2 = y + EDIT_GRID_SIZE - margin;

            // 矩形内かチェック
            if (clickX >= x1 && clickX <= x2 && clickY >= y1 && clickY <= y2) {
                draggedBuilding = buildingId;
                // ドラッグ開始時のマウス位置とグリッド座標を保存
                dragStartMouseX = clickX;
                dragStartMouseY = clickY;
                dragStartGridX = pos.x;
                dragStartGridY = pos.y;
                canvas.classList.add('dragging');
                break;
            }
        }
    } else {
        // 通常モード：パン（マップ全体移動）
        // 左クリックでパン開始（ShiftとCtrlは将来の回転機能用に予約）
        if (e.button === 0 && !e.shiftKey && !e.ctrlKey) {
            isPanning = true;
            hasDragged = false;  // リセット
            panStartX = e.clientX - panOffsetX;
            panStartY = e.clientY - panOffsetY;
        }
    }
}

// マウスムーブ: ドラッグ中（編集モード：建物単位、通常モード：パン）
function handleEditMouseMove(e) {
    if (editMode && draggedBuilding) {
        // 編集モード：建物ドラッグ（固定グリッド）
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // マウスの移動量を計算
        const deltaX = mouseX - dragStartMouseX;
        const deltaY = mouseY - dragStartMouseY;

        // 移動量をグリッド単位に変換
        // 数学的座標系：Y軸は上向き（画面下=Y減少、画面上=Y増加）
        const deltaGridX = Math.round(deltaX / EDIT_GRID_SIZE);
        const deltaGridY = Math.round(-deltaY / EDIT_GRID_SIZE);  // Y軸反転

        // 新しいグリッド座標 = 開始座標 + 移動量
        const gridX = dragStartGridX + deltaGridX;
        const gridY = dragStartGridY + deltaGridY;

        // グリッド範囲内に制限
        // セル(x,y)は交点(x,y)から(x+1,y+1)の範囲を占めるため
        // x: 0-9 (右端x=10まで), y: 0-11 (下端y=12まで)
        const clampedX = Math.max(0, Math.min(9, gridX));
        const clampedY = Math.max(0, Math.min(11, gridY));

        // 建物に属する全てのMAPの座標を更新
        // エリア座標を更新
        if (AREA_POSITIONS[draggedBuilding]) {
            AREA_POSITIONS[draggedBuilding].x = clampedX;
            AREA_POSITIONS[draggedBuilding].y = clampedY;
        }

        // 建物座標も更新
        buildingPositions[draggedBuilding] = { x: clampedX, y: clampedY };

        render();
    } else if (!editMode && isPanning) {
        // 通常モード：パン（マップ全体移動）
        const newOffsetX = e.clientX - panStartX;
        const newOffsetY = e.clientY - panStartY;

        // 5px以上動いたらドラッグと判定
        if (Math.abs(newOffsetX - panOffsetX) > 5 || Math.abs(newOffsetY - panOffsetY) > 5) {
            hasDragged = true;
            canvas.style.cursor = 'grabbing';
        }

        panOffsetX = newOffsetX;
        panOffsetY = newOffsetY;
        render();
    }
}

// マウスアップ: ドラッグ終了（編集モード：建物、通常モード：パン）
function handleEditMouseUp(e) {
    if (editMode) {
        // 編集モード：建物ドラッグ終了
        draggedBuilding = null;
        canvas.classList.remove('dragging');
    } else if (isPanning) {
        // 通常モード：パン終了
        isPanning = false;
        canvas.style.cursor = 'default';
    }
}

// 座標データをエクスポート
function exportCoordinates() {
    const modal = document.getElementById('export-modal');
    const textarea = document.getElementById('export-textarea');

    let output = 'const AREA_POSITIONS = {\n';

    // エリアをアルファベット順にソートして出力
    const sortedAreas = Object.keys(AREA_POSITIONS).sort();

    output += '    // 塔\n';
    sortedAreas.filter(a => a.startsWith('tower_')).forEach(area => {
        const pos = AREA_POSITIONS[area];
        const buildingInfo = BUILDING_GROUPS[area];
        const name = buildingInfo ? buildingInfo.name : area;
        output += `    "${area}": {x: ${pos.x}, y: ${pos.y}}, // ${name}\n`;
    });

    output += '\n    // 城門\n';
    sortedAreas.filter(a => a.startsWith('gate')).forEach(area => {
        const pos = AREA_POSITIONS[area];
        const buildingInfo = BUILDING_GROUPS[area];
        const name = buildingInfo ? buildingInfo.name : area;
        output += `    "${area}": {x: ${pos.x}, y: ${pos.y}}, // ${name}\n`;
    });

    output += '\n    // 城壁通路\n';
    sortedAreas.filter(a => a.startsWith('wall_route')).forEach(area => {
        const pos = AREA_POSITIONS[area];
        const buildingInfo = BUILDING_GROUPS[area];
        const name = buildingInfo ? buildingInfo.name : area;
        output += `    "${area}": {x: ${pos.x}, y: ${pos.y}}, // ${name}\n`;
    });

    output += '\n    // その他\n';
    sortedAreas.filter(a => !a.startsWith('tower_') && !a.startsWith('gate') && !a.startsWith('wall_route')).forEach(area => {
        const pos = AREA_POSITIONS[area];
        const buildingInfo = BUILDING_GROUPS[area];
        const name = buildingInfo ? buildingInfo.name : area;
        output += `    "${area}": {x: ${pos.x}, y: ${pos.y}}, // ${name}\n`;
    });

    output = output.trim().replace(/,\n$/, '\n') + '\n};\n';

    textarea.value = output;
    modal.style.display = 'block';
}

// モーダルを閉じる
function closeModal() {
    const modal = document.getElementById('export-modal');
    modal.style.display = 'none';
}

// クリップボードにコピー
function copyToClipboard() {
    const textarea = document.getElementById('export-textarea');
    textarea.select();
    document.execCommand('copy');

    const copyBtn = document.getElementById('copy-coords');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'コピー完了！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// 設定を直接クリップボードにコピー（config.js形式）
function copyCoordinatesToClipboard() {
    const configText = generateConfigText();

    navigator.clipboard.writeText(configText).then(() => {
        // 成功フィードバック
        const btn = document.getElementById('export-coords-inline');
        const originalText = btn.textContent;
        btn.textContent = 'コピー完了！';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('クリップボードへのコピーに失敗:', err);
        alert('クリップボードへのコピーに失敗しました');
    });
}

// 統合設定ファイル（config.js）のテキストを生成
function generateConfigText() {
    const lines = [
        '// ティアマト攻城戦 西ルート - 表示設定',
        '// このファイルは編集モードの「座標コピー」ボタンで自動生成できます',
        '',
        '// エリア座標（x=横, y=奥行き, floor=高さ）',
        '// 論理的に隣接するエリアは座標も隣接（視覚的な隙間は描画時のマージンで表現）',
        'const AREA_POSITIONS = {'
    ];

    // エリアをカテゴリ別にソート
    const sortedEntries = Object.entries(AREA_POSITIONS).sort((a, b) => {
        const getCategory = (area) => {
            if (area.startsWith('tower_')) return 0;
            if (area.startsWith('gate')) return 1;
            if (area.startsWith('wall_route')) return 2;
            return 3;
        };
        const catDiff = getCategory(a[0]) - getCategory(b[0]);
        if (catDiff !== 0) return catDiff;
        return a[0].localeCompare(b[0]);
    });

    let currentCategory = -1;
    sortedEntries.forEach(([area, pos]) => {
        const category = area.startsWith('tower_') ? 0 :
            area.startsWith('gate') ? 1 :
                area.startsWith('wall_route') ? 2 : 3;

        if (category !== currentCategory) {
            if (currentCategory !== -1) lines.push('');
            currentCategory = category;
            const categoryName = ['塔', '城門', '城壁通路', 'その他'][category];
            lines.push(`    // ${categoryName}`);
        }
        lines.push(`    "${area}": {x: ${pos.x}, y: ${pos.y}},`);
    });

    lines.push('};');
    lines.push('');
    lines.push('// スケール・ズーム・パン設定');
    lines.push('const SCALE_SETTINGS = {');
    lines.push('    // 基準スケール（px単位）');
    lines.push(`    scaleX: ${scaleX},  // X軸（横）`);
    lines.push(`    scaleY: ${scaleY},  // Y軸（奥行き）`);
    lines.push(`    scaleZ: ${scaleZ},  // Z軸（高さ）`);
    lines.push('');
    lines.push('    // ズーム（パーセント）');
    lines.push(`    zoom: ${zoomLevel},`);
    lines.push('');
    lines.push('    // パンオフセット（px単位）');
    lines.push(`    panX: ${panOffsetX},`);
    lines.push(`    panY: ${panOffsetY}`);
    lines.push('};');
    lines.push('');
    lines.push('// windowオブジェクトに明示的に代入（グローバルアクセス用）');
    lines.push('window.AREA_POSITIONS = AREA_POSITIONS;');
    lines.push('window.SCALE_SETTINGS = SCALE_SETTINGS;');

    return lines.join('\n');
}

// 座標データのテキストを生成（後方互換用）
function generateCoordinatesText() {
    const lines = ['const AREA_POSITIONS = {'];

    // エリアをソート
    const sortedEntries = Object.entries(AREA_POSITIONS).sort((a, b) => {
        // カテゴリ別にソート
        const getCategory = (area) => {
            if (area.startsWith('tower_')) return 0;
            if (area.startsWith('gate')) return 1;
            if (area.startsWith('wall_route')) return 2;
            return 3;
        };
        const catDiff = getCategory(a[0]) - getCategory(b[0]);
        if (catDiff !== 0) return catDiff;
        return a[0].localeCompare(b[0]);
    });

    let currentCategory = -1;
    sortedEntries.forEach(([area, pos]) => {
        const category = area.startsWith('tower_') ? 0 :
            area.startsWith('gate') ? 1 :
                area.startsWith('wall_route') ? 2 : 3;

        if (category !== currentCategory) {
            if (currentCategory !== -1) lines.push('');
            currentCategory = category;
            const categoryName = ['塔', '城門', '城壁通路', 'その他'][category];
            lines.push(`    // ${categoryName}`);
        }
        lines.push(`    "${area}": {x: ${pos.x}, y: ${pos.y}},`);
    });

    lines.push('};');
    return lines.join('\n');
}

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', init);

// 編集モードイベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('edit-mode-toggle').addEventListener('click', toggleEditMode);
    document.getElementById('export-coords-inline').addEventListener('click', copyCoordinatesToClipboard);
    document.getElementById('copy-coords').addEventListener('click', copyToClipboard);
    document.getElementById('close-modal').addEventListener('click', closeModal);

    // モーダル外クリックで閉じる
    const modal = document.getElementById('export-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    canvas = document.getElementById('main-canvas');
    canvas.addEventListener('mousedown', handleEditMouseDown);
    canvas.addEventListener('mousemove', handleEditMouseMove);
    canvas.addEventListener('mouseup', handleEditMouseUp);
    canvas.addEventListener('mouseleave', handleEditMouseUp);
});
