import { basename, join } from 'node:path'
import { defineCommand } from 'citty'
import consola from 'consola'
import { simpleGit } from 'simple-git'
import { getProjectBranches, identifyProjectBranchRegex, whatNext } from '../utils'
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

    const projectBranches = getProjectBranches(list.all)
    const unlinkedBranches = Object.values(list.branches)
      .filter(b => projectBranches.includes(b.name))
      .filter(b => !b.linkedWorkTree)
      .map(b => b.name)

    if (!unlinkedBranches.length) {
      consola.info('No projects to load.')
      return
    }

    const selectedProject = await consola.prompt('Which project?', { type: 'select', options: unlinkedBranches })
    const selectedProjectLocalName = selectedProject.match(identifyProjectBranchRegex)?.at(2)
    if (!selectedProjectLocalName) {
      consola.error('Project name not readable.')
      return
    }

    const repoDirName = basename(repoBasePath)
    const worktreePath = join(repoBasePath, '..', `${repoDirName}-worktrees`, selectedProjectLocalName)

    await git.raw(['worktree', 'add', worktreePath, selectedProjectLocalName])

    await whatNext({ config, projectPath: worktreePath })

    consola.box(`cd ${worktreePath}`)

    consola.success(`Project \`${selectedProjectLocalName}\` successfully loaded.`)
  },
})
