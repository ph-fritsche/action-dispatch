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
