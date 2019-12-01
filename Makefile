install-deps:
	npm install jsdoc eslint

docs:
	./node_modules/.bin/jsdoc \
		src/cscheid/approximation.js \
		src/cscheid/array.js \
		src/cscheid/basis.js \
		src/cscheid/blas.js \
	-c jsdoc-conf.json \
	-d doc

lint:
	./node_modules/.bin/eslint ./src/
