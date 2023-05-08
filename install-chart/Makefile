

.PHONY: deps
deps:
	npm i

.PHONY: build
build: deps
	npx swc ./src --out-dir ./lib

.PHONY: package
package: build
	npx ncc build --source-map ./lib/index.js --out ./dist/run

