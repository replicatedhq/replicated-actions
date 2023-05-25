# Compatibility Actions


## Examples

### Development
The development workflow will run the workflow on every push to a branch that is not the main branch. It will create a new release that is promoted to a channel with the same name as the branch.
The next job will setup a compatibility matrix of clusters, deploy the app and execute some tests. Once everything is successful the created clusters and customers will be removed again.

### Installation with Helm
See the [example workflow](example-workflows/development-helm.yaml) for more details.

https://github.com/replicatedhq/compatibility-actions/blob/b3c56a9ce74b61dc3e883f768db1a3ce14322739/example-workflows/development-helm.yaml#L1-L138

### Installation with KOTS
See the [example workflow](example-workflows/development-kots.yaml) for more details.

https://github.com/replicatedhq/compatibility-actions/blob/b3c56a9ce74b61dc3e883f768db1a3ce14322739/example-workflows/development-kots.yaml#L1-L134

### Releasing
The releasing workflow will run the workflow each time a tag is being placed on the repository. It will create a new release that is promoted to a channel with the same name as the tag.
The next job will setup a compatibility matrix of clusters, deploy the app and execute some tests. Once everything is successful the release will be promoted to the stable channel. And the created clusters and customers for the compatibility matrix will be removed again.

See the [example workflow](example-workflows/release.yaml) for more details.

https://github.com/replicatedhq/compatibility-actions/blob/b3c56a9ce74b61dc3e883f768db1a3ce14322739/example-workflows/release.yaml#L1-L148