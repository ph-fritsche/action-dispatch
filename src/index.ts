import * as core from '@actions/core'
import * as github from '@actions/github'
import { dispatchGithubEvent } from './dispatchGithubEvent'

export async function run(): Promise<void> {
    try {
        const {
            repository,
            token,
            type,
            identifier,
            payload,
        } = getParams()

        return dispatchGithubEvent(repository, token, type, identifier, payload)
            .then(
                () => core.info(`Dispatched ${type} event "${identifier}" on ${repository}`),
                e => core.setFailed(e?.message),
            )
    } catch(e) {
        core.setFailed(e?.message)
    }
}

function verifyType(type = 'workflow') {
    if (!['workflow', 'repository'].includes(type)) {
        throw { message: `Invalid dispatch type "${type}"` }
    }
    return type as 'workflow' | 'repository'
}

function getParams() {
    return {
        repository: core.getInput('repo', { required: false }) || github.context.repo.owner + '/' + github.context.repo.repo,
        token: core.getInput('token', { required: true }),
        type: verifyType(core.getInput('type', { required: false }) || 'workflow'),
        identifier: core.getInput('ident', { required: true }),
        payload: JSON.parse(core.getInput('payload', { required: false })),
    }
}
