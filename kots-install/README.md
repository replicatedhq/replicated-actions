## KOTS Install

```mermaid
---
title: KOTS Install
---
graph LR
kots_install["KOTS Install"]
kubeconfig ---> kots_install
kots_version ---> kots_install
app_slug ---> kots_install
app_version_label ---> kots_install
shared_password ---> kots_install
license_file ---> kots_install
config_values ---> kots_install
namespace ---> kots_install
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| kubeconfig |  | True | A valid kubeconfig to connect to |
| kots-version | latest | True | The version of KOTS to use |
| app-slug |  | True | Name of the application |
| app-version-label |  | False | The application version label to install. If not specified, the latest version is installed. |
| shared-password |  | False | Shared password to use when deploying the admin console. If not specified, a random password is generated. |
| license-file |  | True | A license.yaml to use |
| config-values |  | False | The config values to use |
| namespace | default | False | The namespace to install the application to |

## Outputs
| Name | Description |
| --- | --- |

