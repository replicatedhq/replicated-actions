.PHONY: package-all
package-all: package-archive-channel package-archive-customer package-create-cluster package-create-customer \
			 package-create-release package-install-chart package-kots-install package-promote-release package-remove-cluster

.PHONY: package-archive-channel
package-archive-channel:
	rm -rf ./archive-channel/build ./archive-channel/dist ./archive-channel/node_modules
	cd ./archive-channel && npm install && npm run build && npm run package

.PHONY: package-archive-customer
package-archive-customer:
	rm -rf ./archive-customer/build ./archive-customer/dist ./archive-customer/node_modules
	cd ./archive-customer && npm install && npm run build && npm run package

.PHONY: package-create-cluster
package-create-cluster:
	rm -rf ./create-cluster/build ./create-cluster/dist ./create-cluster/node_modules
	cd ./create-cluster && npm install && npm run build && npm run package

.PHONY: package-create-customer
package-create-customer:
	rm -rf ./create-customer/build ./create-customer/dist ./create-customer/node_modules
	cd ./create-customer && npm install && npm run build && npm run package

.PHONY: package-create-release
package-create-release:
	rm -rf ./create-release/build ./create-release/dist ./create-release/node_modules
	cd ./create-release && npm install && npm run build && npm run package

.PHONY: package-install-chart
package-install-chart:
	rm -rf ./install-chart/build ./install-chart/dist ./install-chart/node_modules
	@$(MAKE) -C install-chart package

.PHONY: package-kots-install
package-kots-install:
	rm -rf ./kots-install/build ./kots-install/dist ./kots-install/node_modules
	@$(MAKE) -C kots-install package

.PHONY: package-promote-release
package-promote-release:
	rm -rf ./promote-release/build ./promote-release/dist ./promote-release/node_modules
	cd ./promote-release && npm install && npm run build && npm run package

.PHONY: package-remove-cluster
package-remove-cluster:
	rm -rf ./remove-cluster/build ./remove-cluster/dist ./remove-cluster/node_modules
	cd ./remove-cluster && npm install && npm run build && npm run package


.PHONY: readme-all
readme-all: readme-archive-channel readme-archive-customer readme-create-cluster readme-create-customer \
			 readme-create-release readme-install-chart readme-kots-install readme-promote-release readme-remove-cluster

.PHONY: readme-archive-channel
readme-archive-channel:
	python3 docs/generate-readme/action-to-mermaid.py ./archive-channel/action.yml > ./archive-channel/README.md

.PHONY: readme-archive-customer
readme-archive-customer:
	python3 docs/generate-readme/action-to-mermaid.py ./archive-customer/action.yml > ./archive-customer/README.md

.PHONY: readme-create-cluster
readme-create-cluster:
	python3 docs/generate-readme/action-to-mermaid.py ./create-cluster/action.yml > ./create-cluster/README.md

.PHONY: readme-create-customer
readme-create-customer:
	python3 docs/generate-readme/action-to-mermaid.py ./create-customer/action.yml > ./create-customer/README.md

.PHONY: readme-create-release
readme-create-release:
	python3 docs/generate-readme/action-to-mermaid.py ./create-release/action.yml > ./create-release/README.md

.PHONY: readme-install-chart
readme-install-chart:
	python3 docs/generate-readme/action-to-mermaid.py ./install-chart/action.yml > ./install-chart/README.md

.PHONY: readme-kots-install
readme-kots-install:
	python3 docs/generate-readme/action-to-mermaid.py ./kots-install/action.yml > ./kots-install/README.md

.PHONY: readme-promote-release
readme-promote-release:
	python3 docs/generate-readme/action-to-mermaid.py ./promote-release/action.yml > ./promote-release/README.md

.PHONY: readme-remove-cluster
readme-remove-cluster:
	python3 docs/generate-readme/action-to-mermaid.py ./remove-cluster/action.yml > ./remove-cluster/README.md