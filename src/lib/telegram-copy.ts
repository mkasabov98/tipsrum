import { InlineKeyboard } from "grammy";

import { SOCIAL } from "@/lib/site";
import { appOrigin } from "@/lib/stripe";

/** Everything the bot says, in one place. */

type Reply = { text: string; reply_markup?: InlineKeyboard };

/**
 * A button to a page on the site. Telegram refuses URL buttons that point at
 * localhost, so in development the address is written into the message instead.
 */
function withSiteButton(text: string, label: string, path: string): Reply {
  const url = `${appOrigin()}${path}`;
  if (!url.startsWith("https://")) return { text: `${text}\n\n${url}` };
  return { text, reply_markup: new InlineKeyboard().url(label, url) };
}

export function welcomeReply(): Reply {
  return withSiteButton(
    "Здравей! Това е ботът на Tipsrum Премиум.\n\n" +
      "За да влезеш в Премиум канала, влез в профила си на сайта и натисни бутона „Отвори Telegram бот“. " +
      "Така ботът те разпознава автоматично и не е нужно да въвеждаш имейл.",
    "Към профила",
    "/my_account",
  );
}

export function staleLinkReply(): Reply {
  return withSiteButton(
    "Този линк вече е използван или е изтекъл. " +
      "Влез в профила си на сайта и натисни бутона за Telegram отново, за да получиш нов.",
    "Към профила",
    "/my_account",
  );
}

export function takenReply(): Reply {
  return {
    text:
      "Този Telegram акаунт вече е свързан с друг профил в Tipsrum. " +
      `Ако смяташ, че това е грешка, пиши ни: ${SOCIAL.telegram}`,
  };
}

export function notPremiumReply(): Reply {
  return withSiteButton(
    "Telegram акаунтът ти е свързан с профила в Tipsrum. " +
      "В момента нямаш активен Премиум абонамент, затова не можем да ти дадем достъп до канала.",
    "Стани Премиум",
    "/premium_checkout",
  );
}

export function alreadyMemberReply(): Reply {
  return { text: "Ти вече си в Премиум канала. Успех!" };
}

export function inviteText(): string {
  return (
    "Готово! Ето личния ти линк за Премиум канала.\n\n" +
    "Валиден е 24 часа и може да се използва само веднъж, затова не го споделяй."
  );
}

export function inviteKeyboard(link: string): InlineKeyboard {
  return new InlineKeyboard().url("Влез в Премиум канала", link);
}

export function errorReply(): Reply {
  return {
    text:
      "Нещо се обърка от наша страна. Опитай отново след минута с бутона от сайта. " +
      `Ако проблемът продължи, пиши ни: ${SOCIAL.telegram}`,
  };
}
