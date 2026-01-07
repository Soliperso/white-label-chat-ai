import { widgetHandlers } from './widgets';
import { chatHandlers } from './chat';
import { teamHandlers } from './team';
import { billingHandlers } from './billing';

export const handlers = [...widgetHandlers, ...chatHandlers, ...teamHandlers, ...billingHandlers];
