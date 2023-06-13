## Matrix Generator

```mermaid
---
title: Matrix Generator
---
graph LR
matrix_generator["Matrix Generator"]
app_slug ---> matrix_generator
api_token ---> matrix_generator
matrix_generator ---> matrix
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |

## Outputs
| Name | Description |
| --- | --- |
| matrix | Matrix to test with (json). |

