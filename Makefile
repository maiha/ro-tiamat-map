# ro-tiamat-map project

public:
	@echo "Building public directory..."
	@cd web/canvas2d && $(MAKE) public
	@echo "Copying to root public directory..."
	@rm -rf public
	@cp -r web/canvas2d/public public
	@echo "Public directory ready for GitHub Pages"

clean:
	@rm -rf public
	@cd web/canvas2d && $(MAKE) clean

.PHONY: public clean
