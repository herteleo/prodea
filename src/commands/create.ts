import { basename, join } from 'node:path'
import { defineCommand } from 'citty'
import consola from 'consola'
import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
import { kebabCase } from 'scule'
import { getProjectBranches, identifyProjectBranchRegex, whatNext } from '../utils'
import { getResolvedConfig } from '../config'

async function getNextProjectNumber(git: SimpleGit) {
  const list = await git.branch()

  const projectBranches = getProjectBranches(list.all)

  const currentProjectNumber = projectBranches.map(b => Number(b.match(identifyProjectBranchRegex)?.at(3))).sort().at(-1) ?? 0
  return String(currentProjectNumber + 1).padStart(3, '0')
}

async function createInitialCommit(git: SimpleGit, projectName: string) {
  if (!await consola.prompt('Create initial commit?', { type: 'confirm' }))
    return

  const commitMsg = await consola.prompt('Commit message', { type: 'text', initial: `chore: init project \`${projectName}\`` })
  if (!commitMsg?.length)
    return consola.info('Skipped commit.')

  await git.raw(['commit', '--allow-empty', '--message', commitMsg])
}

export const create = defineCommand({
  meta: {
    description: 'Create a new project branch (with a leading project-id)',
  },
  args: {
    name: {
      description: 'Project name',
      type: 'positional',
      required: false,
    },
  },
  async run(context) {
    const { config, cwd: repoBasePath } = await getResolvedConfig()

    const git = simpleGit({ baseDir: repoBasePath })

    await git.fetch()

    const repoDirName = basename(repoBasePath)

    const projectName = kebabCase(context.args.name || await consola.prompt('Project name', { type: 'text' }))
    if (!projectName.length)
      return consola.error('Project name is required.')

    const projectNumber = await getNextProjectNumber(git)

    const worktreeName = `${projectNumber}-${projectName}`
    const worktreePath = join(repoBasePath, '..', `${repoDirName}-worktrees`, worktreeName)

    await git.raw(['worktree', 'prune'])
    await git.raw(['worktree', 'add', '--detach', worktreePath])

    const worktreeGit = simpleGit({ baseDir: worktreePath })

    await worktreeGit.raw(['switch', '--orphan', worktreeName])

    await createInitialCommit(worktreeGit, worktreeName)

    await whatNext({ config, projectPath: worktreePath })

    consola.box(`cd ${worktreePath}`)

    consola.success(`New project \`${worktreeName}\` successfully created.`)
  },
})
