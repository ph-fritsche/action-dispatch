[![action-release](https://img.shields.io/static/v1?logo=github-actions&logoColor=cyan&label=%F0%9F%9A%80&message=action-release&color=cyan)](https://github.com/ph-fritsche/action-release/)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/ph-fritsche/action-dispatch/Build?label=Build&logo=github-actions&logoColor=cyan)](https://github.com/ph-fritsche/action-release/blob/master/.github/workflows/build.yml)

# action-dispatch

Trigger `workflow_dispatch` and `repository_dispatch` events from a workflow.

This requires a personal access token with the `repo` scope.

## workflow_dispatch

```yml
// some-workflow.yml
jobs:
  some-job:
    - name: Dispatch workflow_dispatch event
      uses: ph-fritsche/action-dispatch
      with:
        token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
        ident: example-workflow.yml # refer to the filename
        payload: '{"foo":"bar"}' # json
```

```yml
// example-workflow.yml
on:
  workflow_dispatch:
    inputs:
      foo:
        description: Some input
        required: true

// ${{github.event.inputs.foo}} will be "bar"
```

## repository_dispatch

```yml
// some-workflow.yml
jobs:
  some-job:
    - name: Dispatch repository_dispatch event
      uses: ph-fritsche/action-dispatch
      with:
        token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
        type: repository
        ident: example-repository # refer to on.repository_dispatch.types.*
        payload: '{"foo":"bar"}' # json
```

```yml
// example-repository.yml
on:
  repository_dispatch:
    types: [example-repository] # the name here is referred to by the dispatch

// ${{github.event.client_payload.foo}} will be bar
```
