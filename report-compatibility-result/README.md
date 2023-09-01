## Report Compatibility Result

```mermaid
---
title: Report Compatibility Result
---
graph LR
report_compatibility_result["Report Compatibility Result"]
app_slug ---> report_compatibility_result
api_token ---> report_compatibility_result
release_sequence ---> report_compatibility_result
kubernetes_distribution ---> report_compatibility_result
kubernetes_version ---> report_compatibility_result
success_at ---> report_compatibility_result
success_notes ---> report_compatibility_result
failure_at ---> report_compatibility_result
failure_notes ---> report_compatibility_result
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| release-sequence |  | True | The release sequence number to report compatibility result for. |
| kubernetes-distribution |  | True | Kubernetes distribution of the cluster to report on. |
| kubernetes-version |  | True | Kubernetes version to report on (format is distribution dependent). |
| success-at |  | False | Timestamp for when the success compatibility result was reported (only success or failure can be used).  |
| success-notes |  | False | Notes for the success compatibility result (only success or failure can be used). |
| failure-at |  | False | Timestamp for when the failure compatibility result was reported (only success or failure can be used). |
| failure-notes |  | False | Notes for the failure compatibility result (only success or failure can be used). |

## Outputs
| Name | Description |
| --- | --- |

