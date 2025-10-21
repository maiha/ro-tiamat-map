# テクスチャ画像生成
# 使い方: make

SRC_DIR = source-images
DST_DIR = images
SCRIPT = ./convert-texture.sh

# source-images内の全画像ファイル
SOURCES := $(wildcard $(SRC_DIR)/*.png $(SRC_DIR)/*.jpg $(SRC_DIR)/*.jpeg)

# 出力ファイル（拡張子を.pngに変換）
TARGETS := $(patsubst $(SRC_DIR)/%,$(DST_DIR)/%,$(SOURCES))
TARGETS := $(addsuffix .png,$(basename $(TARGETS)))

all: $(TARGETS)

# 変換ルール（拡張子に関わらず）
$(DST_DIR)/%.png: $(SRC_DIR)/%.png $(SCRIPT)
	@mkdir -p $(DST_DIR)
	@echo "Converting: $< -> $@"
	@$(SCRIPT) "$<" "$@"

$(DST_DIR)/%.png: $(SRC_DIR)/%.jpg $(SCRIPT)
	@mkdir -p $(DST_DIR)
	@echo "Converting: $< -> $@"
	@$(SCRIPT) "$<" "$@"

$(DST_DIR)/%.png: $(SRC_DIR)/%.jpeg $(SCRIPT)
	@mkdir -p $(DST_DIR)
	@echo "Converting: $< -> $@"
	@$(SCRIPT) "$<" "$@"

clean:
	rm -f $(DST_DIR)/*.png

public:
	@echo "Creating public directory..."
	@rm -rf public
	@mkdir -p public
	@cp index.html public/
	@cp style.css public/
	@cp app.js public/
	@cp map-data.js public/
	@cp config.js public/
	@cp -r images public/
	@echo "public directory created successfully"

.PHONY: all clean public
