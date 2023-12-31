# Prodea

[![npm version](https://img.shields.io/npm/v/prodea?style=flat)](https://npmjs.com/package/prodea)
[![npm downloads](https://img.shields.io/npm/dm/prodea?style=flat)](https://npmjs.com/package/prodea)
[![bundle size](https://img.shields.io/bundlephobia/minzip/prodea?style=flat)](https://bundlephobia.com/result?p=prodea)
[![license](https://img.shields.io/github/license/prodea?style=flat)](https://github.com/herteleo/prodea/blob/main/LICENSE)

> Manage multiple projects within a single git repository using worktrees. Designed for prototyping, learning and private projects.

[Why?](#why)

- Keep all your prototypes in a single git repository and the list of abandoned repositories dry.
- Create a new branch instead of a new repository to start prototyping a new project.
- Find the perfect project name later.
- Commit & Push early and often, without regrets.
- Tinker in private and release a clean project afterwards.

## Usage

Create one or multiple git repositories, like "private-prototypes" or "business-prototypes". Have at least one commit in your repository.

### Local Install

If the root of your repository is always your current working directory.

```sh
npm i prodea
npx prodea --help
```

No further configuration needed.

### Global Install

Recommended. If you wish to access your prototypes from anywhere or manage multiple Prodea-flavored repositories.

```sh
npm i -g prodea
prodea --help
```

`cd` into your Prodea-managed git repositories to add them to the `~/.prodearc` config:

```sh
prodea init
```

### Commands

Excerpt of `prodea --help`

```txt
  create    Create a new project branch (with a leading project-id)
    init    Register a git repo in the ~/.prodearc config
    list    List all project branches, select and manage a project
    load    Load a (remote) project branch as worktree
  unload    Unload a project (remove the local worktree branch)
```

### Example: Register git repository in Prodea

Note: Prodea is installed globally.

```sh
> cd /home/username/git/my-prototypes
> prodea init
✔ Added repository to prodea.
```

### Example: Create a Project Branch

Note: Prodea is installed globally and multiple repositories are registered in Prodea.

```sh
> prodea create

✔ Which Repo?
/home/username/git/my-prototypes

✔ Project name
todo-list-with-js

✔ Create initial commit?
Yes

✔ Commit message
chore: init project `001-todo-list-with-js`

✔ What next?
Run command

✔ Select command
code "/home/username/git/my-prototypes-worktrees/001-todo-list-with-js"
```

### Example: Open a project in VSCode (or any other IDE)

Note: VSCode is registered as [custom command](#custom-commands).

```sh
> prodea list

✔ Select project
001-todo-list-with-js

✔ What next?
Run command

✔ Select command
code "/home/username/git/my-prototypes-worktrees/001-todo-list-with-js"
```

## Configuration

### Global

```
repos.0.path=/home/username/git/my-prototypes
repos.1.path=/home/username/git/business-prototypes
commands.0.path=code
commands.1.path=idea.sh
```

The global config file `~/.prodearc` contains the repository paths registered using `prodea init`.

#### Custom Commands

You can extend the file with `commands` which you can run within the `prodea create|list` commands ([see example above](#example-open-a-project-in-vscode-or-any-other-ide)).

**Example: Open with VSCode**

```
commands.0.path=code
```

**Example: Open with IntelliJ**

```
commands.0.path=idea # macOS
commands.0.path=idea.sh # Linux
commands.0.path=idea64.exe # Windows
```

## Local

Create a `prodea.config.{json,ts,js,mjs,cjs}`, or `.prodearc` file in the root of your git repository or use the `prodea` field in `package.json` to add repository-specific configuration. Example in js/ts:

<!-- eslint-skip -->
```ts
export default {
  commands: [
    { path: 'code' },
    { path: 'idea' },
    { path: 'idea.sh' },
    { path: 'idea64.exe' },
    { path: 'open' },
  ],
}
```

## Why?

I like prototyping and tinkering. But I don't like to have hundreds of discontinued/abandoned repositories with draft-names or naming collisions because I already used the name for another unmaintained project. And I don't like to show off the messy beginnings of a project. For a long time I just did not push my projects for weeks to remote. Prodea is my solution to these problems.

Prodea is the successor to two earlier approaches. My first idea was to host all my projects in a common monorepo. Advantages have been shared node_modules, unified configurations and more. *For a very short time.* Disadvantages have been the shared node_modules (dependency version issues) and the unified configurations in legacy and newer projects, plus the whole js overhead when working in non-js projects, like go. My second approach was basically an early implementation of Prodea with some edges and limitations I try to solve with the new Prodea. The Prodea prototype, beside many other projects, was build within that setup.

Usually my prototypes and projects are not *that* complex. So I had the idea to host multiple projects in a single repository. Each project has its own independant branch without the history and files from the main or other project branches. These branches live in parallel and will never be merged. This gives me the freedom to host projects with diverse technics in a single repository. Every project branch is checked out as git worktree, so I don't need to switch branches to work in different projects.

And that's where Prodea comes into play. While I could achieve all this without any extra tool, the Prodea CLI assists me in managing the worktrees, creating project branches, and find and open projects quickly. Prodea prepends an ascending three digit number to project branch names, inspired by Johnny Decimal, so I can have multiple branches with the same project name (to keep projects in sequence and to prevend naming collisions when I revisit the idea after some time and technic/tool switches).

Now every time I have an idea I `prodea create` a new project branch, start tinkering and commit & push without regrets. *It's super handy to host tutorial related learning projects, too.* After some time, refinement, and if I decide to convert my project into a real one, I had enough time to cleanup the code and think about a *good* name. Then I just create a fresh repository, copy the files into it, hit push and call it a day. With Prodea I have a clean*ish* project start, don't loose any prototyping history, have no fear to commit mistakes or unfinished work, and have a more or less clean repository list.

Maybe you'll find it useful too.
