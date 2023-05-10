# reliability-actions


## Examples

### Development
The development workflow will run the workflow on every push to a branch that is not the main branch. It will create a new release that is promoted to a channel with the same name as the branch.
The next job will setup a reliability matrix of clusters, deploy the app and execute some tests. Once everything is successful the created clusters and customers will be removed again.

See the [example workflow](example-workflows/development.yaml) for more details.

TODO insert permalink.

### Releasing
The releasing workflow will run the workflow each time a tag is being placed on the repository. It will create a new release that is promoted to a channel with the same name as the tag.
The next job will setup a reliability matrix of clusters, deploy the app and execute some tests. Once everything is successful the release will be promoted to the stable channel. And the created clusters and customers for the reliability matrix will be removed again.

See the [example workflow](example-workflows/development.yaml) for more details.

TODO insert permalink.

### Feature Branch Cleanup
When following a development workflow that uses feature branches, it is often desirable to clean up the feature branch after it has been merged into the main branch. This workflow will delete the feature branch from the remote repository. 

See the [example workflow](example-workflows/delete.yaml) for more details.

https://github.com/replicatedhq/reliability-actions/blob/3ed6bba6560db668e6d2469de2f5687830b72bb1/example-workflows/delete.yaml#L1-L21