import { defineCommand } from 'citty'
import consola from 'consola'
import { simpleGit } from 'simple-git'
import { getProjectBranches } from '../utils'
import { getResolvedConfig } from '../config'

export const unload = defineCommand({
  meta: {
    description: 'Unload a project (remove the local worktree branch)',
  },
  args: {
    reverse: {
      type: 'boolean',
      description: 'Reverse project order. By default new projects will be on top.',
    },
  },
  async run({ args }) {
    const { cwd: repoBasePath } = await getResolvedConfig()
    const git = simpleGit({ baseDir: repoBasePath })

    await git.raw(['worktree', 'prune'])

    const list = await git.branch()

    const linkedBranches = Object.values(list.branches).filter(b => b.linkedWorkTree).map(b => b.name)
    const projectBranches = getProjectBranches(linkedBranches)

    if (!projectBranches.length) {
      consola.info('No projects to unload.')
      return
    }

    if (!args.reverse)
      projectBranches.reverse()

    const selectedProject = await consola.prompt('Which project?', { type: 'select', options: projectBranches })
    if (typeof selectedProject !== 'string' || !selectedProject.length)
      return

    await git.raw(['worktree', 'remove', selectedProject])

    consola.success(`Project \`${selectedProject}\` successfully unloaded.`)
  },
})
