/* =========================================
   🚀 NOVADROP
   Telegram Mini App
   Referral + TON Wallet + Tasks
========================================= */

const SUPABASE_URL =
  "https://amtabsacamnfzikwmfxr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_i-DXZ0D1j1kn1PxnCggsRA_TjWRDeuP";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================
   TELEGRAM
========================================= */

const tg =
  window.Telegram &&
  window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

if (tg) {
  tg.ready();
  tg.expand();
}


const telegramUser =
  tg &&
  tg.initDataUnsafe
    ? tg.initDataUnsafe.user
    : null;


console.log(
  "🚀 NovaDrop Telegram version loaded!"
);

if (telegramUser) {

  console.log(
    "Telegram User ID:",
    telegramUser.id
  );

  console.log(
    "Telegram Username:",
    telegramUser.username || "No username"
  );

}


/* =========================================
   REFERRAL
========================================= */

const BOT_USERNAME =
  "NovaDropCoinBot";

const REFERRAL_REWARD_XP =
  50;

const REFERRAL_REWARD_COINS =
  50;


function getReferralCode() {

  if (!telegramUser) {
    return null;
  }

  return String(
    telegramUser.id
  );

}


function getStartParameter() {

  if (
    !tg ||
    !tg.initDataUnsafe
  ) {
    return null;
  }

  return (
    tg.initDataUnsafe.start_param ||
    null
  );

}


function getReferralLink() {

  const code =
    getReferralCode();

  if (!code) {
    return "";
  }

  return (
    "https://t.me/" +
    BOT_USERNAME +
    "?start=" +
    code
  );

}


/* =========================================
   TASKS
========================================= */

const TASKS = {

  wallet: {
    title: "Connect TON Wallet",
    xp: 100,
    coins: 100
  },

  channel: {
    title: "Join Channel",
    xp: 100,
    coins: 100
  },

  invite: {
    title: "Invite Friends",
    xp: 50,
    coins: 50
  },

  daily: {
    title: "Daily Check-in",
    xp: 10,
    coins: 10
  }

};


/* =========================================
   DEFAULT DATA
========================================= */

const DEFAULT_DATA = {

  coins: 0,

  xp: 0,

  level: 1,

  streak: 0,

  lastStreakDate: null,

  completedTasks: [],

  transactions: [],

  purchases: [],

  walletAddress: null,

  referralCount: 0,

  referredBy: null

};


let data;

try {

  data =
    JSON.parse(
      localStorage.getItem(
        "novadrop_data"
      )
    ) ||
    JSON.parse(
      JSON.stringify(
        DEFAULT_DATA
      )
    );

} catch {

  data =
    JSON.parse(
      JSON.stringify(
        DEFAULT_DATA
      )
    );

}


/* =========================================
   MAKE SURE NEW FIELDS EXIST
========================================= */

if (
  typeof data.referralCount !==
  "number"
) {

  data.referralCount = 0;

}

if (
  !Object.prototype.hasOwnProperty.call(
    data,
    "referredBy"
  )
) {

  data.referredBy = null;

}


/* =========================================
   SAVE
========================================= */

function save() {

  localStorage.setItem(
    "novadrop_data",
    JSON.stringify(data)
  );

}


/* =========================================
   LEVEL
========================================= */

function calculateLevel() {

  let level = 1;

  let remainingXP =
    data.xp;

  let xpNeeded = 100;


  while (
    remainingXP >= xpNeeded
  ) {

    remainingXP -=
      xpNeeded;

    level++;

    xpNeeded =
      level * 100;

  }


  return {

    level,

    currentXP:
      remainingXP,

    neededXP:
      xpNeeded

  };

}


/* =========================================
   UPDATE UI
========================================= */

function updateUI() {

  const levelData =
    calculateLevel();

  data.level =
    levelData.level;


  const elements = {

    coins:
      data.coins,

    xp:
      data.xp,

    level:
      data.level,

    streak:
      data.streak,

    walletCoins:
      data.coins,

    shopCoins:
      data.coins,

    levelLabel:
      data.level,

    dailyStreak:
      data.streak,

    leaderXP:
      data.xp + " XP",

    profileLevel:
      data.level,

    profileStreak:
      data.streak,

    xpText:
      levelData.currentXP +
      " / " +
      levelData.neededXP +
      " XP",

    referralCount:
      data.referralCount

  };


  Object.keys(elements)
    .forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.textContent =
          elements[id];

      }

    });


  const progress =
    document.getElementById(
      "levelProgress"
    );


  if (progress) {

    progress.style.width =
      Math.min(
        100,
        (
          levelData.currentXP /
          levelData.neededXP
        ) * 100
      ) +
      "%";

  }


  const walletStatus =
    document.getElementById(
      "walletStatus"
    );


  const connectedWallet =
    document.getElementById(
      "connectedWallet"
    );


  if (data.walletAddress) {

    if (walletStatus) {

      walletStatus.textContent =
        "✅ Wallet Connected";

    }

    if (connectedWallet) {

      connectedWallet.textContent =
        shortenAddress(
          data.walletAddress
        );

    }

  } else {

    if (walletStatus) {

      walletStatus.textContent =
        "Connect your TON wallet";

    }

    if (connectedWallet) {

      connectedWallet.textContent =
        "";

    }

  }


  const referralLink =
    document.getElementById(
      "referralLink"
    );


  if (referralLink) {

    referralLink.value =
      getReferralLink();

  }


  renderTasks();

  renderTransactions();

  save();

}


/* =========================================
   COPY REFERRAL LINK
========================================= */

async function copyReferralLink() {

  const link =
    getReferralLink();


  if (!link) {

    alert(
      "Telegram user not detected."
    );

    return;

  }


  try {

    await navigator.clipboard.writeText(
      link
    );

    alert(
      "✅ Referral link copied!"
    );

  } catch {

    const input =
      document.getElementById(
        "referralLink"
      );

    if (input) {

      input.select();

      document.execCommand(
        "copy"
      );

      alert(
        "✅ Referral link copied!"
      );

    }

  }

}


/* =========================================
   SHARE REFERRAL
========================================= */

function shareReferral() {

  const link =
    getReferralLink();


  if (!link) {

    alert(
      "Telegram user not detected."
    );

    return;

  }


  const text =
    "🚀 Join NovaDrop and earn Coins + XP!";


  if (
    tg &&
    typeof tg.openTelegramLink ===
      "function"
  ) {

    tg.openTelegramLink(
      "https://t.me/share/url?url=" +
      encodeURIComponent(link) +
      "&text=" +
      encodeURIComponent(text)
    );

    return;

  }


  window.open(
    "https://t.me/share/url?url=" +
    encodeURIComponent(link) +
    "&text=" +
    encodeURIComponent(text),
    "_blank"
  );

}


/* =========================================
   SHORTEN ADDRESS
========================================= */

function shortenAddress(address) {

  if (!address) {
    return "";
  }

  if (address.length < 15) {
    return address;
  }

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-6)
  );

}


/* =========================================
   COMPLETE TASK
========================================= */

function completeTask(taskId) {

  const task =
    TASKS[taskId];


  if (!task) {
    return;
  }


  if (
    data.completedTasks
      .includes(taskId)
  ) {

    alert(
      "This task is already completed ✓"
    );

    return;

  }


  /* CHANNEL */

  if (
    taskId === "channel"
  ) {

    window.open(
      "https://t.me/NovaDropOfficial",
      "_blank"
    );

  }


  /* WALLET */

  if (
    taskId === "wallet"
  ) {

    if (
      !data.walletAddress
    ) {

      alert(
        "Please connect your TON Wallet first."
      );

      return;

    }

  }


  data.xp +=
    task.xp;

  data.coins +=
    task.coins;


  data.completedTasks.push(
    taskId
  );


  data.transactions.unshift({

    type:
      "earn",

    amount:
      task.coins,

    description:
      task.title,

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();

  saveToSupabase();


  alert(
    task.title +
    " completed!\n\n+" +
    task.xp +
    " XP\n+" +
    task.coins +
    " Coins"
  );

}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

  Object.keys(TASKS)
    .forEach(taskId => {

      const element =
        document.getElementById(
          "task-" +
          taskId
        );


      if (!element) {
        return;
      }


      const button =
        element.querySelector(
          "button"
        );


      if (
        data.completedTasks
          .includes(taskId)
      ) {

        element.classList.add(
          "completed"
        );


        if (button) {

          button.textContent =
            "✓ Done";

          button.disabled =
            true;

        }

      } else {

        element.classList.remove(
          "completed"
        );


        if (button) {

          button.textContent =
            "+" +
            TASKS[taskId].xp;

          button.disabled =
            false;

        }

      }

    });

}


/* =========================================
   DAILY STREAK
========================================= */

function claimStreak() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  if (
    data.lastStreakDate ===
    today
  ) {

    alert(
      "Today's reward is already claimed 🔥"
    );

    return;

  }


  if (
    !data.lastStreakDate
  ) {

    data.streak = 1;

  } else {

    const previous =
      new Date(
        data.lastStreakDate
      );

    const current =
      new Date(today);


    const difference =
      Math.floor(
        (
          current -
          previous
        ) / 86400000
      );


    if (
      difference === 1
    ) {

      data.streak++;

    } else {

      data.streak = 1;

    }

  }


  data.lastStreakDate =
    today;


  const reward =
    Math.min(
      500,
      data.streak * 25
    );


  data.coins +=
    reward;


  data.transactions.unshift({

    type:
      "earn",

    amount:
      reward,

    description:
      "Daily Streak Reward",

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();

  saveToSupabase();


  alert(
    "🔥 " +
    data.streak +
    " Day Streak!\n\n+" +
    reward +
    " Coins"
  );

}


/* =========================================
   SHOP
========================================= */

function buyItem(
  name,
  price
) {

  if (
    data.coins < price
  ) {

    alert(
      "Not enough Coins 🪙"
    );

    return;

  }


  data.coins -=
    price;


  data.purchases.push({

    name,

    price,

    date:
      new Date()
        .toLocaleString()

  });


  data.transactions.unshift({

    type:
      "spend",

    amount:
      price,

    description:
      "Shop: " +
      name,

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();

  saveToSupabase();


  alert(
    name +
    " purchased successfully! 🛍️"
  );

}


/* =========================================
   TRANSACTIONS
========================================= */

function renderTransactions() {

  const container =
    document.getElementById(
      "transactions"
    );


  if (!container) {
    return;
  }


  if (
    !data.transactions.length
  ) {

    container.innerHTML =
      '<p style="color:#8f9aaa;">No transactions yet.</p>';

    return;

  }


  container.innerHTML =
    data.transactions
      .slice(0, 20)
      .map(transaction => {

        const sign =
          transaction.type ===
          "earn"
            ? "+"
            : "-";


        return `
          <div style="
            padding:10px 0;
            border-bottom:1px solid #202b3d;
          ">

            <strong>
              ${transaction.description}
            </strong>

            <span style="
              float:right;
              color:#00eaff;
            ">
              ${sign}${transaction.amount} 🪙
            </span>

            <small style="
              display:block;
              color:#8f9aaa;
              margin-top:4px;
            ">
              ${transaction.date}
            </small>

          </div>
        `;

      })
      .join("");

}


/* =========================================
   SUPABASE SAVE
========================================= */

async function saveToSupabase() {

  try {

    if (
      !telegramUser ||
      !telegramUser.id
    ) {

      console.log(
        "No Telegram user."
      );

      return;

    }


    const profile = {

      id:
        String(
          telegramUser.id
        ),

      username:
        telegramUser.username ||
        telegramUser.first_name ||
        "NovaPlayer",

      coins:
        data.coins,

      xp:
        data.xp,

      level:
        data.level,

      streak:
        data.streak,

      completed_tasks:
        data.completedTasks,

      updated_at:
        new Date()
          .toISOString()

    };


    const { error } =
      await supabaseClient
        .from("profiles")
        .upsert(
          profile
        );


    if (error) {

      console.error(
        "Supabase save error:",
        error
      );

      return;

    }


    console.log(
      "✅ Data saved to Supabase!"
    );

  } catch (error) {

    console.error(
      "Supabase error:",
      error
    );

  }

}


/* =========================================
   SUPABASE LOAD
========================================= */

async function loadFromSupabase() {

  try {

    if (
      !telegramUser ||
      !telegramUser.id
    ) {

      console.log(
        "No Telegram user."
      );

      return;

    }


    const { data: profile, error } =
      await supabaseClient
        .from("profiles")
        .select(
          "coins, xp, level, streak, completed_tasks"
        )
        .eq(
          "id",
          String(
            telegramUser.id
          )
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Supabase load error:",
        error
      );

      return;

    }


    if (!profile) {

      await saveToSupabase();

      return;

    }


    data.coins =
      Number(
        profile.coins
      ) || 0;


    data.xp =
      Number(
        profile.xp
      ) || 0;


    data.level =
      Number(
        profile.level
      ) || 1;


    data.streak =
      Number(
        profile.streak
      ) || 0;


    if (
      Array.isArray(
        profile.completed_tasks
      )
    ) {

      data.completedTasks =
        profile.completed_tasks;

    }


    save();

    updateUI();


  } catch (error) {

    console.error(
      "Supabase load error:",
      error
    );

  }

}


/* =========================================
   TON CONNECT
========================================= */

let tonConnectUI =
  null;


function initTONConnect() {

  if (
    typeof TON_CONNECT_UI ===
    "undefined"
  ) {

    console.error(
      "TON Connect library not loaded."
    );

    return;

  }


  const button =
    document.getElementById(
      "ton-connect"
    );


  if (!button) {

    console.error(
      "TON Connect container not found."
    );

    return;

  }


  try {

    tonConnectUI =
      new TON_CONNECT_UI.TonConnectUI({

        manifestUrl:
          window.location.origin +
          "/tonconnect-manifest.json",

        buttonRootId:
          "ton-connect"

      });


    tonConnectUI.onStatusChange(
      async wallet => {

        if (wallet) {

          await onWalletConnected(
            wallet
          );

        } else {

          onWalletDisconnected();

        }

      }
    );


    console.log(
      "💎 TON Connect initialized!"
    );


  } catch (error) {

    console.error(
      "TON Connect error:",
      error
    );

  }

}


/* =========================================
   WALLET CONNECTED
========================================= */

async function onWalletConnected(
  wallet
) {

  const address =
    wallet.account &&
    wallet.account.address
      ? wallet.account.address
      : null;


  if (!address) {
    return;
  }


  const wasAlreadyConnected =
    data.walletAddress ===
    address;


  data.walletAddress =
    address;


  updateUI();


  if (
    !wasAlreadyConnected &&
    !data.completedTasks.includes(
      "wallet"
    )
  ) {

    data.xp += 100;

    data.coins += 100;


    data.completedTasks.push(
      "wallet"
    );


    data.transactions.unshift({

      type:
        "earn",

      amount:
        100,

      description:
        "Connect TON Wallet",

      date:
        new Date()
          .toLocaleString()

    });


    updateUI();

    await saveToSupabase();


    alert(
      "💎 TON Wallet Connected!\n\n" +
      "+100 XP\n" +
      "+100 Coins"
    );

  }

}


/* =========================================
   WALLET DISCONNECTED
========================================= */

function onWalletDisconnected() {

  data.walletAddress =
    null;

  updateUI();

}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateUI();

    initTONConnect();

    await loadFromSupabase();

    console.log(
      "🚀 NovaDrop JavaScript loaded!"
    );

  }
);
