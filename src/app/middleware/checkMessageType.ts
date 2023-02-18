import { Context, Next } from '@artus/pipeline';
import { EventMessagePayload } from '../trigger/event';

export default async function checkMessageType(ctx: Context, next: Next) {
  const { type, payload } = ctx.input.params;

  const {
    out,
    isPrivate,
    isChannel,
    isGroup,
    chatId,
    id: messageId,
    message: messageContent,
  } = (payload as EventMessagePayload)?.event.message;

  if (type !== 'message' || isGroup || isChannel || !isPrivate || out) {
    await next();
    return;
  }

  const { data } = ctx.output;

  data.type = type;
  data.payload = payload;
  data.result = {
    chatIdStr: chatId?.toString(),
    messageId,
    messageContent,
  };
}
