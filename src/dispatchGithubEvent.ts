import * as core from '@actions/core'
import * as github from '@actions/github'

type Octokit = ReturnType<typeof github.getOctokit>
type OctokitResponse = ReturnType<Octokit['request']>

export async function dispatchGithubEvent(
    repository: string,
    token: string,
    type: 'workflow' | 'repository',
    identifier: string,
    payload: unknown,
): Promise<OctokitResponse> {
    const octokit = github.getOctokit(token)

    const request = type === 'workflow'
        ? {
            action: `POST /repos/${repository}/actions/workflows/${identifier}/dispatches`,
            params: {
                ref: github.context.ref,
                inputs: typeof (payload) === 'object' ? payload : {},
            },
        }
        : {
            action: `POST /repos/${repository}/dispatches`,
            params: {
                event_type: identifier,
                client_payload: typeof (payload) === 'object' ? payload : {},
            },
        }

    core.info(`Request:\n${JSON.stringify(request, null, 2)}`)
    return octokit.request(request.action, request.params)
}
