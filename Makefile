VERSION := $(shell python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
ZIP = playback-rate-controller-$(VERSION).zip
EXCLUDE = '*.zip' '.git/*' '.idea/*' '.claude/*' '*/.DS_Store' '.DS_Store' 'Makefile' 'README.md'

.PHONY: all pack clean

all: pack

pack:
	rm -f $(ZIP)
	zip -r $(ZIP) . -x $(EXCLUDE)
	@echo "Created $(ZIP)"
	@echo "Contents:"
	@unzip -l $(ZIP)

clean:
	rm -f playback-rate-controller-*.zip
