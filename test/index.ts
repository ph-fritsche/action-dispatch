import { run } from '../src/index'

let coreInput: {[k: string]: string | undefined} = {}

let setFailed: (msg: string) => void
let info: (msg: string) => void
let request: (action: string, params: {[k: string]: unknown}) => Promise<unknown>

jest.mock('@actions/core', () => ({
    getInput(k: string, {required}: {required: boolean}) {
        if (required && !coreInput[k]) {
            throw `Missing input`
        }
        return coreInput[k] ?? ''
    },
    info: (msg: string) => info(msg),
    setFailed: (msg: string) => setFailed(msg),
}))

jest.mock('@actions/github', () => ({
    context: {
        ref: 'refs/heads/exampleBranch',
        repo: {
            owner: 'example',
            repo: 'example-repository',
        },
    },
    getOctokit() {
        return {
            request: (action: string, params: { [k: string]: unknown }) => request(action, params),
        }
    },
}))

function setup() {
    setFailed = jest.fn()
    info = jest.fn()
    request = jest.fn(() => Promise.resolve())

    const exec = (input = {}) => {
        coreInput = input
        return run()
    }

    return { exec }
}

it('dispatch workflow event', async () => {
    const { exec } = setup()

    const run = exec({
        token: 'myToken',
        ident: 'foo',
        payload: '{"bar":"baz"}',
    })

    expect(request).toBeCalledWith(
        'POST /repos/example/example-repository/actions/workflows/foo/dispatches',
        {
            ref: 'refs/heads/exampleBranch',
            inputs: {
                bar: 'baz',
            },
        },
    )

    return run.finally(() => expect(setFailed).not.toHaveBeenCalled())
})

it('dispatch repository event', async () => {
    const { exec } = setup()

    const run = exec({
        token: 'myToken',
        type: 'repository',
        ident: 'foo',
        payload: '{"bar":"baz"}',
    })

    expect(request).toBeCalledWith(
        'POST /repos/example/example-repository/dispatches',
        {
            event_type: 'foo',
            client_payload: {
                bar: 'baz',
            },
        },
    )
    return run.finally(() => expect(setFailed).not.toHaveBeenCalled())
})

it('fail if request fails', async () => {
    const { exec } = setup()

    ;(request as jest.MockedFunction<typeof request>).mockRejectedValueOnce(undefined)

    const run = exec({
        token: 'myToken',
        ident: 'foo',
        payload: '{"bar":"baz"}',
    })

    expect(request).toBeCalledWith(
        'POST /repos/example/example-repository/actions/workflows/foo/dispatches',
        {
            ref: 'refs/heads/exampleBranch',
            inputs: {
                bar: 'baz',
            },
        },
    )
    return run.finally(() => expect(setFailed).toBeCalled())
})

it('fail for invalid event type', async () => {
    const { exec } = setup()

    const run = exec({
        token: 'myToken',
        type: 'foo',
        ident: 'foo',
        payload: '{"bar":"baz"}',
    })

    return run.finally(() => expect(setFailed).toBeCalled())
})

it('fail for missing parameter', async () => {
    const { exec } = setup()

    const run = exec({
        ident: 'foo',
        payload: '{"bar":"baz"}',
    })

    return run.finally(() => expect(setFailed).toBeCalled())
})
