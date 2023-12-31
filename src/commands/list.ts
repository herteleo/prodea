import { basename, join } from 'node:path'
import { defineCommand } from 'citty'
import consola from 'consola'
import { simpleGit } from 'simple-git'
import { getProjectBranches, whatNext } from '../utils'
import { getResolvedConfig } from '../config'

export const list = defineCommand({
  meta: {
    description: 'List all project branches, select and manage a project',
  },
  args: {
    reverse: {
      type: 'boolean',
      description: 'Reverse project order. By default new projects will be on top.',
    },
  },
  async run({ args }) {
    const { config, cwd: repoBasePath } = await getResolvedConfig()

    const git = simpleGit({ baseDir: repoBasePath })

    await git.fetch()
    const projectBranches = getProjectBranches((await git.branch()).all)

    if (!projectBranches.length) {
      consola.info('No projects found.')
      return
    }

    if (!args.reverse)
      projectBranches.reverse()

    const selectedProject = await consola.prompt('Select project', { type: 'select', options: projectBranches })
    if (typeof selectedProject !== 'string' || !selectedProject.length)
      return

    const repoDirName = basename(repoBasePath)
    const worktreePath = join(repoBasePath, '..', `${repoDirName}-worktrees`, selectedProject)

    await whatNext({ config, projectPath: worktreePath })

    consola.box(`cd ${worktreePath}`)
  },
})
