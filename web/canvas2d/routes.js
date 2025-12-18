// ティアマト攻城戦 西ルート - ルート定義
// このファイルに攻略ルートを追加できます

// ルートデータ（MD/YE別）
const ROUTE_DATA = {

  // MD（メモリアルダンジョン版）のルートデータ
  MD: {
    items: {
      "tower_west_roof": "天文台の鍵",
      "wall2f_04": "水門の鍵",
      "tower_north1_observatory": "水門①",
      "gate1_3f": "9603",
      "tower_south1_3f": "ソード",
      "tower_southwest_3f": "ワンド",
      "tower_northwest_3f": "コイン",
      "tower_north1_3f": "カップ",
      "wall2f_03": "イフリート",
      "tower_northwest_1f": "地下宝物庫の鍵",
    },
    routes: {
      "observatory_key": {
        name: "天文台の鍵",
        color: "#9C27B0",
        description: "天文台の鍵を入手",
        path: [
          "gate1_1f",
          "courtyard_west",
          "tower_west_1f",
          "tower_west_2f",
          "tower_west_3f",
          "tower_west_roof"
        ]
      },
      "floodgate_key": {
        name: "水門の鍵",
        color: "#00CED1",
        description: "水門の鍵を入手",
        path: [
          "tower_west_3f",
          "wall_route05",
          "tower_northwest_3f",
          "tower_northwest_roof",
          "tower_northwest_3f",
          "wall_route07",
          "tower_north1_3f",
          "tower_north1_4f",
          "tower_north1_observatory",
          "tower_north1_4f",
          "tower_north1_3f",
          "tower_north1_2f",
          "tower_north1_1f",
          "tower_north1_2f",
          "wall2f_04"
        ]
      },
      "floodgate1": {
        name: "水門①",
        color: "#00CED1",
        description: "水門①を開く",
        path: [
          "wall2f_04",
          "tower_north1_2f",
          "tower_north1_3f",
          "tower_north1_4f",
          "tower_north1_observatory"
        ]
      },
      "gimmick_start": {
        name: "グローザ",
        color: "#9C27B0",
        description: "4将ギミック始動まで",
        path: [
          "tower_north1_observatory",
          "tower_north1_4f",
          "tower_north1_3f",
          "wall_route07",
          "tower_northwest_3f",
          "wall_route05",
          "tower_west_3f",
          "wall_route03",
          "tower_southwest_3f",
          "tower_southwest_roof",
          "tower_southwest_2f",
          "tower_southwest_1f",
          "tower_southwest_2f",
          "wall2f_02",
          "tower_southwest_2f",
          "tower_southwest_3f",
          "wall_route01",
          "tower_south1_3f",
          "tower_south1_roof",
          "gate1_roof",
          "gate1_3f"
        ]
      },
      "sword": {
        name: "ソード",
        color: "#8B4513",
        description: "デヒョン（ソード）",
        path: [
          "gate1_3f",
          "gate1_roof",
          "tower_south1_roof",
          "tower_south1_3f"
        ]
      },
      "wand": {
        name: "ワンド",
        color: "#FF0000",
        description: "ヒュリエル（ワンド）",
        path: [
          "tower_south1_3f",
          "tower_south1_2f",
          "wall2f_01",
          "tower_southwest_2f",
          "tower_southwest_3f"
        ]
      },
      "coin": {
        name: "コイン",
        color: "#FFFF00",
        description: "ジオイア（コイン）",
        path: [
          "tower_southwest_3f",
          "wall_route03",
          "tower_west_3f",
          "wall_route05",
          "tower_northwest_3f"
        ]
      },
      "cup": {
        name: "カップ",
        color: "#555555",
        description: "カデス（カップ）",
        path: [
          "tower_northwest_3f",
          "wall_route07",
          "tower_north1_3f"
        ]
      },
      "quiz": {
        name: "クイズ",
        color: "#9C27B0",
        description: "グローザクイズ",
        path: [
          "gate1_1f",
          "tower_south1_1f",
          "tower_south1_2f",
          "tower_south1_3f",
          "tower_south1_roof",
          "gate1_roof",
          "gate1_3f"
        ]
      },
      "deep_vault_key": {
        name: "地下宝物庫の鍵",
        color: "#edff7bff",
        description: "地下宝物庫の鍵を入手",
        path: [
          "gate1_1f",
          "courtyard_west",
          "tower_west_1f",
          "tower_west_2f",
          "wall2f_03",
          "tower_northwest_2f",
          "tower_northwest_1f"
        ]
      },
      "ifrit": {
        name: "イフリート",
        color: "#FF0000",
        description: "イフリート戦",
        path: [
          "tower_northwest_1f",
          "tower_northwest_2f",
          "wall2f_03"
        ]
      }
    },
    order: [
      "observatory_key",  // 天文台の鍵
      "floodgate_key",    // 水門の鍵
      "floodgate1",       // 水門①
      "gimmick_start",    // ギミック開始
      "sword",            // ソード
      "wand",             // ワンド
      "coin",             // コイン
      "cup",              // カップ
      "quiz",             // クイズ
      "deep_vault_key",   // 地下宝物庫の鍵
      "ifrit",            // イフリート
    ]
  },

  // YE（イベント版）のルートデータ
  YE: {
    items: {
      // マップID: "アイテム名" の形式で定義
    },
    routes: {
      "gimmick_start": {
        name: "グローザ",
        color: "#9C27B0",
        description: "4将ギミック始動まで",
        path: [
          "gate1_1f",
          "tower_south1_1f",
          "tower_south1_2f",
          "tower_south1_3f",
          "tower_south1_roof",
          "gate1_roof",
          "gate1_3f"
        ]
      },
      "daehyon": {
        name: "デヒョン",
        color: "#8B4513",
        description: "デヒョン戦（ソード）",
        path: [
          "gate1_3f",
          "gate1_roof",
          "tower_south1_roof",
          "tower_south1_3f"
        ]
      },
      "hyuriel": {
        name: "ヒュリエル",
        color: "#FF0000",
        description: "ヒュリエル戦（ワンド）",
        path: [
          "tower_south1_3f",
          "tower_south1_2f",
          "wall2f_01",
          "tower_southwest_2f",
          "tower_southwest_3f"
        ]
      },
      "gioia": {
        name: "ジオイア",
        color: "#FFFF00",
        description: "ジオイア戦（コイン）",
        path: [
          "tower_southwest_roof",
          "tower_southwest_3f",
          "tower_southwest_2f",
          "tower_southwest_1f",
          "tower_southwest_2f",
          "wall2f_02",
          "tower_west_2f",
          "tower_west_1f",
          "tower_west_2f",
          "tower_west_3f",
          "tower_west_roof",
          "tower_west_3f",
          "wall_route05",
          "tower_northwest_3f"
        ]
      },
      "kades": {
        name: "カデス",
        color: "#555555",
        description: "カデス戦（カップ）",
        path: [
          "tower_northwest_3f",
          "tower_northwest_roof",
          "tower_northwest_3f",
          "wall_route07",
          "tower_north1_3f"
        ]
      },
      "remaining": {
        name: "残り",
        color: "#00CED1",
        description: "残りルート",
        path: [
          "tower_north1_4f",
          "tower_north1_observatory",
          "tower_north1_4f",
          "tower_north1_3f",
          "tower_north1_2f",
          "tower_north1_1f",
          "tower_north1_2f",
          "wall2f_04",
          "tower_north1_2f",
          "tower_north1_3f",
          "wall_route07",
          "tower_northwest_3f",
          "wall_route05",
          "tower_west_3f",
          "wall_route03",
          "tower_southwest_3f",
          "wall_route01"
        ]
      }
    },
    order: [
      "gimmick_start",  // グローザ
      "daehyon",        // デヒョン
      "hyuriel",        // ヒュリエル
      "gioia",          // ジオイア
      "kades",          // カデス
      "remaining"       // 残り
    ]
  }
};

// 現在のルートタイプ（デフォルトはYE）
let currentRouteType = 'YE';

// ルートデータを切り替える関数
function switchRouteData(type) {
  if (!ROUTE_DATA[type]) {
    console.error('Unknown route type:', type);
    return false;
  }
  currentRouteType = type;
  window.ROUTES = ROUTE_DATA[type].routes;
  window.ROUTE_ORDER = ROUTE_DATA[type].order;
  window.ROUTE_ITEMS = ROUTE_DATA[type].items || {};
  return true;
}

// 初期化（デフォルトはMD）
switchRouteData('MD');

// windowオブジェクトに明示的に代入（グローバルアクセス用）
window.ROUTE_DATA = ROUTE_DATA;
window.switchRouteData = switchRouteData;
window.getCurrentRouteType = () => currentRouteType;
