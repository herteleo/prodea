import { cwd as processCwd } from 'node:process'
import { defineCommand } from 'citty'
import consola from 'consola'
import { writeUser } from 'rc9'
import { isGitDir } from '../utils'
import type { Configuration } from '../config'
import { getConfig } from '../config'
import { name } from '../../package.json'

export const init = defineCommand({
  meta: {
    description: `Register a git repo in the ~/.${name}rc config`,
  },
  async run() {
    const cwd = processCwd()
    if (!await isGitDir({ cwd })) {
      consola.warn('Current dir is not a git repository.')
      return
    }
    const { config } = await getConfig({ cwd })

    if (config.repos.map(r => r.path).includes(cwd)) {
      consola.info('Repository is already initialized.')
      return
    }

    config.repos.push({ path: cwd })
    config.repos.sort()

    writeUser<Configuration>(config, `.${name}rc`)
    consola.success(`Added repository to ${name}.`)
  },
})
