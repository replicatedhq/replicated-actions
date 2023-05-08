import * as core from '@actions/core';
import { archiveCustomer } from 'replicated-lib';


async function run() {
  try {
    await archiveCustomer(core.getInput('customer-id'))

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()