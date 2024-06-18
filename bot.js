const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
require("dotenv").config();

const bot = new Telegraf(process.env.TG_BOT_API_TOKEN);

const infoMessage = (ctx) =>
  `Hello, ${ctx.from.first_name}!\nI'm Baristica Admin Bot. I notify my admins about new orders. Also I can filter orders based on certain features. E.g. Latest Orders, All Orders, etc.`;

const getOrders = async (status) => {
  const query = mongoose.connection.db
    .collection("orders")
    .find({ status })
    .sort({ createdAt: -1 });

  return await query.toArray();
};

/**
 *
 * @param {Telegraf.Context} ctx
 * @param {Array} orders
 */
const sendOrdersMessage = (ctx, orders) => {
  const orderStrings = orders.map((order) => {
    const message = `Order ID: ${order._id}\nStatus: ${
      order.status
    }\nTotal Cost: ${(order.totalCost / 100).toFixed(2)} AZN\nDelivery Fee: ${(
      order.deliveryFee / 100
    ).toFixed(2)} AZN\nNotes: ${order.notes || "No notes"}\n\n`;

    ctx.reply(message);
  });
};
if (process.env.NODE_ENV === "production") {
  bot.telegram.sendMessage(
    -1002214706890,
    "Hi, I'm Baristica Admin Bot. I'll notify you about new orders.",
    {
      reply_markup: {
        keyboard: [["Latest Orders", "All Orders"]],
        resize_keyboard: true,
      },
    }
  );
}

bot.start((ctx) =>
  ctx.reply("Hi, I'm Baristica Admin Bot. I'll guide you through the orders.", {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  })
);

bot.hears("Latest Orders", (ctx) =>
  ctx.reply("Latest Orders (not implemented)")
);

bot.hears("All Orders", (ctx) => ctx.reply("All Orders (not implemented)"));

bot.hears(["hello", "Hello"], (ctx) => {
  console.log(ctx.chat.id);
  const message = `Hello, ${ctx.from.first_name}!
    Here are the available commands:
    /start - Start the bot
    /info - Get information about the bot
    /latest - Get latest orders
    /all - Get all orders`;
  ctx.reply(message, {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  });
});

bot.hears(["info", "bot", "Bot", "Info"], (ctx) => {
  ctx.reply(infoMessage(ctx), {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  });
});

bot.command("latest", async (ctx) => {
  /// get all orders that status = paid

  const orders = await getOrders("paid");

  sendOrdersMessage(ctx, orders);
});

bot.command("all", async (ctx) => {
  const orders = await getOrders({
    $ne: "initiated",
  });

  sendOrdersMessage(ctx, orders);
});

bot.command(["info", "bot"], (ctx) => {
  ctx.reply(infoMessage(ctx), {
    reply_markup: {
      keyboard: [["Latest Orders", "All Orders"]],
      resize_keyboard: true,
    },
  });
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
