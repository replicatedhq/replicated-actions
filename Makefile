SHELL := /bin/bash

.PHONY: all
all: package-all readme-all

.PHONY: package-all
package-all: package-all-new \
			 package-archive-channel package-archive-customer package-create-object-store \
			 package-create-postgres package-expose-port package-promote-release \
			 package-get-customer-instances package-report-compatibility-result package-upgrade-cluster

.PHONY: package-all-new
package-all-new: package-create-customer package-create-release \
				 package-helm-install package-kots-install \
				 package-create-cluster package-remove-cluster package-prepare-cluster

.PHONY: package-main
package-main:
	rm -rf ./build ./dist
	npm i && npm run build && npm run package

.PHONY: package-prepare-cluster
package-prepare-cluster: package-main
	rm -rf ./prepare-cluster/dist
	cp -r dist prepare-cluster/

.PHONY: package-archive-channel
package-archive-channel:
	rm -rf ./archive-channel/build ./archive-channel/dist ./archive-channel/node_modules
	cd ./archive-channel && npm install && npm run build && npm run package

.PHONY: package-archive-customer
package-archive-customer:
	rm -rf ./archive-customer/build ./archive-customer/dist ./archive-customer/node_modules
	cd ./archive-customer && npm install && npm run build && npm run package

.PHONY: package-create-cluster
package-create-cluster: package-main
	rm -rf ./create-cluster/dist
	cp -r dist create-cluster/

.PHONY: package-create-object-store
package-create-object-store:
	rm -rf ./create-object-store/build ./create-object-store/dist ./create-object-store/node_modules
	cd ./create-object-store && npm install && npm run build && npm run package

.PHONY: package-create-postgres
package-create-postgres:
	rm -rf ./create-postgres/build ./create-postgres/dist ./create-postgres/node_modules
	cd ./create-postgres && npm install && npm run build && npm run package

.PHONY: package-expose-port
package-expose-port:
	rm -rf ./expose-port/build ./expose-port/dist ./expose-port/node_modules
	cd ./expose-port && npm install && npm run build && npm run package

.PHONY: package-create-customer
package-create-customer: package-main
	rm -rf ./create-customer/dist
	cp -r dist create-customer/

.PHONY: package-create-release
package-create-release: package-main
	rm -rf ./create-release/dist
	cp -r dist create-release/

.PHONY: package-helm-install
package-helm-install: package-main
	rm -rf ./helm-install/dist
	cp -r dist helm-install/

.PHONY: package-kots-install
package-kots-install: package-main
	rm -rf ./kots-install/dist
	cp -r dist kots-install/

.PHONY: package-promote-release
package-promote-release:
	rm -rf ./promote-release/build ./promote-release/dist ./promote-release/node_modules
	cd ./promote-release && npm install && npm run build && npm run package

.PHONY: package-remove-cluster
package-remove-cluster: package-main
	rm -rf ./remove-cluster/dist
	cp -r dist remove-cluster/

.PHONY: package-get-customer-instances
package-get-customer-instances:
	rm -rf ./get-customer-instances/build ./get-customer-instances/dist ./get-customer-instances/node_modules
	cd ./get-customer-instances && npm install && npm run build && npm run package

.PHONY: package-report-compatibility-result
package-report-compatibility-result:
	rm -rf ./report-compatibility-result/build ./report-compatibility-result/dist ./report-compatibility-result/node_modules
	cd ./report-compatibility-result && npm install && npm run build && npm run package

.PHONY: package-upgrade-cluster
package-upgrade-cluster:
	rm -rf ./upgrade-cluster/build ./upgrade-cluster/dist ./upgrade-cluster/node_modules
	cd ./upgrade-cluster && npm install && npm run build && npm run package

.PHONY: readme-all
readme-all: pip-install readme-archive-channel readme-archive-customer readme-create-cluster readme-create-object-store \
			 readme-create-postgres readme-expose-port readme-create-customer readme-create-release readme-helm-install \
			 readme-kots-install readme-promote-release readme-remove-cluster readme-prepare-cluster \
			 readme-get-customer-instances readme-report-compatibility-result \
			 readme-upgrade-cluster

.PHONY: pip-install
pip-install:
	pip install -Ur docs/generate-readme/requirements.txt

.PHONY: readme-archive-channel
readme-archive-channel: pip-install
	python docs/generate-readme/action-to-mermaid.py ./archive-channel/action.yml > ./archive-channel/README.md

.PHONY: readme-archive-customer
readme-archive-customer: pip-install
	python docs/generate-readme/action-to-mermaid.py ./archive-customer/action.yml > ./archive-customer/README.md

.PHONY: readme-create-cluster
readme-create-cluster: pip-install
	python docs/generate-readme/action-to-mermaid.py ./create-cluster/action.yml > ./create-cluster/README.md

.PHONY: readme-create-object-store
readme-create-object-store: pip-install
	python docs/generate-readme/action-to-mermaid.py ./create-object-store/action.yml > ./create-object-store/README.md

.PHONY: readme-create-postgres
readme-create-postgres: pip-install
	python docs/generate-readme/action-to-mermaid.py ./create-postgres/action.yml > ./create-postgres/README.md

.PHONY: readme-expose-port
readme-expose-port: pip-install
	python docs/generate-readme/action-to-mermaid.py ./expose-port/action.yml > ./expose-port/README.md

.PHONY: readme-create-customer
readme-create-customer: pip-install
	python docs/generate-readme/action-to-mermaid.py ./create-customer/action.yml > ./create-customer/README.md

.PHONY: readme-create-release
readme-create-release: pip-install
	python docs/generate-readme/action-to-mermaid.py ./create-release/action.yml > ./create-release/README.md

.PHONY: readme-helm-install
readme-helm-install: pip-install
	python docs/generate-readme/action-to-mermaid.py ./helm-install/action.yml > ./helm-install/README.md

.PHONY: readme-kots-install
readme-kots-install: pip-install
	python docs/generate-readme/action-to-mermaid.py ./kots-install/action.yml > ./kots-install/README.md

.PHONY: readme-promote-release
readme-promote-release: pip-install
	python docs/generate-readme/action-to-mermaid.py ./promote-release/action.yml > ./promote-release/README.md

.PHONY: readme-remove-cluster
readme-remove-cluster: pip-install
	python docs/generate-readme/action-to-mermaid.py ./remove-cluster/action.yml > ./remove-cluster/README.md

.PHONY: readme-prepare-cluster
readme-prepare-cluster: pip-install
	python docs/generate-readme/action-to-mermaid.py ./prepare-cluster/action.yml > ./prepare-cluster/README.md

.PHONY: readme-get-customer-instances
readme-get-customer-instances: pip-install
	python docs/generate-readme/action-to-mermaid.py ./get-customer-instances/action.yml > ./get-customer-instances/README.md

.PHONY: readme-report-compatibility-result
readme-report-compatibility-result: pip-install
	python docs/generate-readme/action-to-mermaid.py ./report-compatibility-result/action.yml > ./report-compatibility-result/README.md

.PHONY: readme-upgrade-cluster
readme-upgrade-cluster: pip-install
	python docs/generate-readme/action-to-mermaid.py ./upgrade-cluster/action.yml > ./upgrade-cluster/README.md