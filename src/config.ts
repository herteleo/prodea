import { cwd as processCwd } from 'node:process'
import { loadConfig } from 'c12'
import consola from 'consola'
import { name } from '../package.json'
import { isGitDir } from './utils'

interface ConfigurationRepo {
  path: string
}

interface ConfigurationCommand {
  path: string
}

export interface Configuration {
  repos: Array<ConfigurationRepo>
  commands: Array<ConfigurationCommand>
}

function defaultConfig() {
  return {
    repos: [],
    commands: [],
  } satisfies Configuration
}

export async function getConfig({ cwd }: { cwd?: string }) {
  const { config, cwd: configCwd, ...rest } = await loadConfig<Configuration>({
    name,
    cwd,
    defaults: defaultConfig(),
    globalRc: true,
  })

  if (!config)
    throw new Error('Config not found.')

  if (!configCwd)
    throw new Error('Current workdir not found.')

  return { config, cwd: configCwd, ...rest }
}

async function resolveRepoPath() {
  const cwd = processCwd()
  if (await isGitDir({ cwd })) {
    consola.log(`Using ${cwd}`)
    return cwd
  }

  const { config } = await getConfig({ cwd })

  const repos = config.repos.map(r => r.path)

  if (!repos.length)
    throw new Error('No repo defined.')

  const firstRepo = repos.at(0)
  if (repos.length === 1 && firstRepo) {
    consola.log(`Using ${firstRepo}`)
    return firstRepo
  }

  const repoBasePath = await consola.prompt('Which Repo?', { type: 'select', options: repos })
  if (typeof repoBasePath !== 'string' || !repoBasePath.length)
    throw new Error('Repo path not defined.')

  return repoBasePath
}

export async function getResolvedConfig() {
  const repoBasePath = await resolveRepoPath()

  return await getConfig({ cwd: repoBasePath })
}
