install:
	npm install
install-ci:
	npm ci
lint:
	npx eslint src
test:
	npm test
test-watch:
	npx -n --experimental-vm-modules jest --watch
test-coverage:
	npx -n --experimental-vm-modules jest --collectCoverage
develop:
	npx webpack serve --mode development --env development --progress --config ./config/webpack/webpack.config.dev.cjs
build:
	npx webpack --mode production --env production --config ./config/webpack/webpack.config.prod.cjs

.PHONY: build test