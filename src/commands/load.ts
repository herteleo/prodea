import { basename, join } from 'node:path'
import { defineCommand } from 'citty'
import consola from 'consola'
import { simpleGit } from 'simple-git'
import { getProjectBranches, whatNext } from '../utils'
import { getResolvedConfig } from '../config'

export const load = defineCommand({
  meta: {
    description: 'Load a (remote) project branch as worktree',
  },
  async run() {
    const { config, cwd: repoBasePath } = await getResolvedConfig()
    const git = simpleGit({ baseDir: repoBasePath })

    await git.fetch()
    await git.raw(['worktree', 'prune'])

    const list = await git.branch()

    const unlinkedBranches = Object.values(list.branches).filter(b => !b.linkedWorkTree).map(b => b.name)
    const projectBranches = getProjectBranches(unlinkedBranches)

    if (!projectBranches.length) {
      consola.info('No projects to load.')
      return
    }

    const selectedProject = await consola.prompt('Which project?', { type: 'select', options: projectBranches })

    const repoDirName = basename(repoBasePath)
    const worktreePath = join(repoBasePath, '..', `${repoDirName}-worktrees`, selectedProject)

    await git.raw(['worktree', 'add', worktreePath, selectedProject])

    await whatNext({ config, projectPath: worktreePath })

    consola.box(`cd ${worktreePath}`)

    consola.success(`Project \`${selectedProject}\` successfully loaded.`)
  },
})
