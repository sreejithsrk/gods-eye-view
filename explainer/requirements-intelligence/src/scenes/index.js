// Scene registry, in timeline order. Each scene draws itself from the
// global time and may overlap its neighbours (pre/post) so that objects
// hand off and morph instead of cutting.

import intro from './intro.js';
import project from './project.js';
import knowledge from './knowledge.js';
import requirement from './requirement.js';
import orchestration from './orchestration.js';
import clarification from './clarification.js';
import generation from './generation.js';
import approval from './approval.js';
import ado from './ado.js';
import development from './development.js';
import traceability from './traceability.js';
import dashboard from './dashboard.js';
import architecture from './architecture.js';
import outro from './outro.js';

export const SCENES = [
  intro,
  project,
  knowledge,
  requirement,
  orchestration,
  clarification,
  generation,
  approval,
  ado,
  development,
  traceability,
  dashboard,
  architecture,
  outro,
];
