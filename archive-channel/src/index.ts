import * as core from '@actions/core';
import { archiveChannel } from 'replicated-lib';


async function run() {
  try {
    await archiveChannel(core.getInput('replicated-app'), core.getInput('channel-name'))

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()