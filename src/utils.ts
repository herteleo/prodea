import { execSync } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import consola from 'consola'
import type { Configuration } from './config'

export async function whatNext({ projectPath, config }: { projectPath: string, config: Configuration }) {
  const optionCommand = 'Run command'
  const optionExit = 'Exit'
  const nextSelection = await consola.prompt('What next?', { type: 'select', options: [optionExit, optionCommand] })

  switch (nextSelection) {
    case optionExit:
      break
    case optionCommand: {
      if (!config.commands.length) {
        consola.warn('No command defined.')
        break
      }

      const commands = Array.from(new Set(config.commands.map(c => `${c.path} "${projectPath}"`))).sort()

      const command = await consola.prompt('Select command', { type: 'select', options: commands })
      if (typeof command !== 'string')
        break

      execSync(command, { encoding: 'utf8', stdio: 'inherit' })

      break
    }
  }
}

export const identifyProjectBranchRegex = /^[0-9]{3,}-/

export function getProjectBranches(branches: Array<string>) {
  return branches.filter(b => b.match(identifyProjectBranchRegex))
}

export async function isGitDir({ cwd }: { cwd: string }) {
  const dir = await readdir(cwd)
  return dir.includes('.git')
}
