VERSION := $(shell python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
ZIP = playback-rate-controller-$(VERSION).zip
FILES = content_main.js popup.js popup.html manifest.json icon-16x16.png icon-48x48.png icon-128x128.png

.PHONY: all pack clean

all: pack

pack: $(ZIP)

$(ZIP): $(FILES)
	zip $(ZIP) $(FILES)
	@echo "Created $(ZIP)"

clean:
	rm -f playback-rate-controller-*.zip
