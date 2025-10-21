// ティアマト攻城戦 西ルート - 表示設定
// このファイルは編集モードの「座標コピー」ボタンで自動生成できます

// エリア座標（x=横, y=奥行き, floor=高さ）
// 論理的に隣接するエリアは座標も隣接（視覚的な隙間は描画時のマージンで表現）
const AREA_POSITIONS = {
    // 塔
    "tower_north1": {x: 4, y: 11},
    "tower_northwest": {x: 2, y: 11},
    "tower_south1": {x: 4, y: 0},
    "tower_southwest": {x: 2, y: 0},
    "tower_west": {x: 2, y: 6},

    // 城門
    "gate1": {x: 6, y: 0},

    // 城壁通路
    "wall_route01": {x: 3, y: 0},
    "wall_route02": {x: 2, y: 3},
    "wall_route05": {x: 2, y: 9},
    "wall_route07": {x: 3, y: 11},

    // その他
    "courtyard": {x: 5, y: 8},
};

// スケール・ズーム・パン設定
const SCALE_SETTINGS = {
    // 基準スケール（px単位）
    scaleX: 266,  // X軸（横）
    scaleY: 148,  // Y軸（奥行き）
    scaleZ: 81,  // Z軸（高さ）

    // ズーム（パーセント）
    zoom: 55,

    // パンオフセット（px単位）
    panX: 109,
    panY: 38
};

// windowオブジェクトに明示的に代入（グローバルアクセス用）
window.AREA_POSITIONS = AREA_POSITIONS;
window.SCALE_SETTINGS = SCALE_SETTINGS;
