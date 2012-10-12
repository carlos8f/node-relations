all: build

build:
	./node_modules/.bin/pegjs parser.pegjs

test: build
	@./node_modules/.bin/mocha --reporter spec --timeout 2s --require test/common.js --bail

.PHONY: build test
