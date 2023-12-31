#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { description, name, version } from '../package.json'
import { create } from './commands/create'
import { init } from './commands/init'
import { list } from './commands/list'
import { load } from './commands/load'
import { unload } from './commands/unload'

const main = defineCommand({
  meta: {
    name,
    description,
    version,
  },
  subCommands: {
    create,
    init,
    list,
    load,
    unload,
  },
})

void runMain(main)
