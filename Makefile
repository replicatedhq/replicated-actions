.PHONY: package-all
package-all: package-archive-channel package-archive-customer package-create-cluster package-create-customer package-create-release package-install-chart package-promote-release package-remove-cluster

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

.PHONY: package-promote-release
package-promote-release:
	rm -rf ./promote-release/build ./promote-release/dist ./promote-release/node_modules
	cd ./promote-release && npm install && npm run build && npm run package

.PHONY: package-remove-cluster
package-remove-cluster:
	rm -rf ./remove-cluster/build ./remove-cluster/dist ./remove-cluster/node_modules
	cd ./remove-cluster && npm install && npm run build && npm run package