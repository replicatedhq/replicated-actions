.PHONY: package-all
package-all: package-archive-channel package-archive-customer package-create-cluster package-create-customer \
			 package-create-release package-helm-install package-kots-install package-promote-release \
			 package-remove-cluster package-get-customer-instances package-report-compatibility-result

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

.PHONY: package-helm-install
package-helm-install:
	rm -rf ./helm-install/build ./helm-install/dist ./helm-install/node_modules
	@$(MAKE) -C helm-install package

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

.PHONY: package-get-customer-instances
package-get-customer-instances:
	rm -rf ./get-customer-instances/build ./get-customer-instances/dist ./get-customer-instances/node_modules
	cd ./get-customer-instances && npm install && npm run build && npm run package

.PHONY: package-report-compatibility-result
package-report-compatibility-result:
	rm -rf ./report-compatibility-result/build ./report-compatibility-result/dist ./report-compatibility-result/node_modules
	cd ./report-compatibility-result && npm install && npm run build && npm run package

.PHONY: readme-all
readme-all: pip-install readme-archive-channel readme-archive-customer readme-create-cluster readme-create-customer \
			 readme-create-release readme-helm-install readme-kots-install readme-promote-release \
			 readme-remove-cluster readme-prepare-cluster readme-get-customer-instances readme-report-compatibility-result

.PHONE: pip-install
pip-install:
	pip3 install -r docs/generate-readme/requirements.txt
	
.PHONY: readme-archive-channel
readme-archive-channel: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./archive-channel/action.yml > ./archive-channel/README.md

.PHONY: readme-archive-customer
readme-archive-customer: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./archive-customer/action.yml > ./archive-customer/README.md

.PHONY: readme-create-cluster
readme-create-cluster: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./create-cluster/action.yml > ./create-cluster/README.md

.PHONY: readme-create-customer
readme-create-customer: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./create-customer/action.yml > ./create-customer/README.md

.PHONY: readme-create-release
readme-create-release: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./create-release/action.yml > ./create-release/README.md

.PHONY: readme-helm-install
readme-helm-install: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./helm-install/action.yml > ./helm-install/README.md

.PHONY: readme-kots-install
readme-kots-install: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./kots-install/action.yml > ./kots-install/README.md

.PHONY: readme-promote-release
readme-promote-release: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./promote-release/action.yml > ./promote-release/README.md

.PHONY: readme-remove-cluster
readme-remove-cluster: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./remove-cluster/action.yml > ./remove-cluster/README.md

.PHONY: readme-prepare-cluster
readme-prepare-cluster: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./prepare-cluster/action.yml > ./prepare-cluster/README.md

.PHONY: readme-get-customer-instances
readme-get-customer-instances: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./get-customer-instances/action.yml > ./get-customer-instances/README.md

.PHONY: readme-report-compatibility-result
readme-report-compatibility-result: pip-install
	python3 docs/generate-readme/action-to-mermaid.py ./report-compatibility-result/action.yml > ./report-compatibility-result/README.md