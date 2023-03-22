import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  App
} from './app';

createRoot(
  document.getElementById('application')!
).render((<App />))

export default '';