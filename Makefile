all: docs lint

docs:
	./node_modules/.bin/jsdoc \
		src/cscheid/*.js \
		src/cscheid/classify/*.js \
		src/cscheid/datasets/*.js \
		src/cscheid/geometry/*.js \
		src/cscheid/ml/*.js \
	-c jsdoc-conf.json \
	-d doc

lint:
	./node_modules/.bin/eslint ./src/

lint-fix:
	./node_modules/.bin/eslint --fix ./src/

install-deps:
	npm install jsdoc eslint eslint-config-google


