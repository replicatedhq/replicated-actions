# deploy-helm-preview

A composite GitHub Action that manages ephemeral Helm preview environments on [Replicated CMX](https://docs.replicated.com/vendor/testing-how-to) clusters for pull requests.

On each PR push it:
1. Posts a sticky comment ("🟡 Deploying…") on the PR
2. Creates a [GitHub deployment](https://docs.github.com/en/rest/deployments) with status `in_progress`
3. Reuses an existing running CMX cluster (extending its TTL) or creates a new one
4. Exposes port 443 and captures the ingress hostname (`*.ingress.replicatedcluster.com`)
5. Fetches the cluster kubeconfig and runs `helm upgrade --install --wait`
6. Updates the sticky comment with "🟢 Deployed at https://…" and the GitHub deployment to `success`
7. On failure: updates the sticky comment with "🔴 Failed" and the GitHub deployment to `failure`

When the PR is closed the teardown mode removes the cluster and posts a final "⬛ Torn down" comment.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `replicated-api-token` | ✅ | — | Replicated Vendor Portal API token |
| `chart` | ✅ | — | Helm OCI chart URL (e.g. `oci://registry.replicated.com/myapp/stable/myapp`) |
| `chart-version` | ✅ | — | Chart version to install |
| `release-name` | ✅ | — | Helm release name |
| `namespace` | | `default` | Kubernetes namespace |
| `values` | | — | Inline YAML Helm values (mutually exclusive with `values-file`) |
| `values-file` | | — | Path to a values file (mutually exclusive with `values`) |
| `cluster-name` | ✅ | — | CMX cluster name, e.g. `pr-123` |
| `cluster-distribution` | | `k3s` | Kubernetes distribution |
| `cluster-version` | | `1.32` | Kubernetes version |
| `cluster-ttl` | | `24h` | Cluster TTL (Go duration, max 48h) |
| `port` | | `443` | Port to expose for the ingress hostname |
| `github-token` | ✅ | — | GitHub token (needs `deployments: write`, `pull-requests: write`) |
| `pr-number` | ✅ | — | Pull request number |
| `environment-prefix` | | `pr` | GitHub deployment environment prefix |
| `teardown` | | `false` | Set to `true` to tear down instead of deploy |
| `cluster-id` | | — | Cluster ID to remove (required when `teardown=true`) |

## Outputs

| Output | Description |
|---|---|
| `cluster-id` | The CMX cluster ID |
| `cluster-hostname` | The ingress hostname exposed for the deployment |

## Usage

### Full PR preview workflow

```yaml
name: Helm PR Preview

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

permissions:
  contents: read
  deployments: write
  pull-requests: write

jobs:
  deploy-preview:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    outputs:
      cluster-id: ${{ steps.preview.outputs.cluster-id }}
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Helm preview
        id: preview
        uses: replicatedhq/replicated-actions/deploy-helm-preview@v1
        with:
          replicated-api-token: ${{ secrets.REPLICATED_API_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          pr-number: ${{ github.event.pull_request.number }}
          cluster-name: pr-${{ github.event.pull_request.number }}
          chart: oci://registry.replicated.com/my-app/stable/my-app
          chart-version: 1.2.3
          release-name: my-app
          namespace: my-app
          values: |
            replicaCount: 1
            ingress:
              enabled: true

  teardown-preview:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      # cluster-id should be stored in a previous deployment or passed via env/artifact
      - name: Tear down Helm preview
        uses: replicatedhq/replicated-actions/deploy-helm-preview@v1
        with:
          replicated-api-token: ${{ secrets.REPLICATED_API_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          pr-number: ${{ github.event.pull_request.number }}
          cluster-name: pr-${{ github.event.pull_request.number }}
          # Required fields (not used during teardown but still declared as required):
          chart: oci://registry.replicated.com/my-app/stable/my-app
          chart-version: unused
          release-name: my-app
          teardown: "true"
          cluster-id: ${{ needs.deploy-preview.outputs.cluster-id }}
```

### Persisting the cluster ID for teardown

The cluster ID produced by the deploy job needs to be available to the teardown job. Common approaches:

**Using a GitHub Actions cache or artifact:**
```yaml
      - name: Save cluster ID
        run: echo "${{ steps.preview.outputs.cluster-id }}" > cluster-id.txt

      - uses: actions/upload-artifact@v4
        with:
          name: cluster-id-pr-${{ github.event.pull_request.number }}
          path: cluster-id.txt
          retention-days: 30
```

**Using a repository variable (via `gh` CLI):**
```yaml
      - name: Save cluster ID to repo variable
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh variable set "CLUSTER_ID_PR_${{ github.event.pull_request.number }}" \
            --body "${{ steps.preview.outputs.cluster-id }}" \
            --repo ${{ github.repository }}
```

## Required GitHub token permissions

```yaml
permissions:
  contents: read       # checkout
  deployments: write   # gh api deployments
  pull-requests: write # sticky comment
```

## Sticky comment header

This action uses the header `cmx-helm-preview` for the sticky PR comment. This value is unique to this action and avoids conflicts with other actions that also use `marocchino/sticky-pull-request-comment`.
